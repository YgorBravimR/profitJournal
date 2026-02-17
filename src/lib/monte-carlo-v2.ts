import type {
	RiskManagementProfileForSim,
	SimulationParamsV2,
	SimulatedTradeV2,
	SimulatedDay,
	SimulationRunV2,
	SimulationStatisticsV2,
	MonteCarloResultV2,
	DistributionBucket,
	TradeMode,
} from "@/types/monte-carlo"

// ==========================================
// MONTE CARLO V2 — DAY-AWARE SIMULATION
// ==========================================

/** Cents → display string, e.g. 50000 → "R$500.00" */
const c = (cents: number): string => {
	const sign = cents >= 0 ? "+" : ""
	return `${sign}R$${(cents / 100).toFixed(2)}`
}

/**
 * Runs the full V2 Monte Carlo simulation: N simulated months,
 * each respecting the decision tree (loss recovery, gain compounding,
 * cascading weekly/monthly limits).
 *
 * Key difference from V1: V1 treats trades as independent coin flips.
 * V2 simulates **days** — each day follows the decision tree to determine
 * how many trades to take and at what risk, producing a daily P&L that
 * accumulates into weekly and monthly results.
 */
const runMonteCarloV2 = (params: SimulationParamsV2): MonteCarloResultV2 => {
	const runs: SimulationRunV2[] = []

	// Log first run for debugging
	const LOG_FIRST_RUN = true

	for (let i = 0; i < params.simulationCount; i++) {
		const log = LOG_FIRST_RUN && i === 0
		if (log) {
			const p = params.profile
			console.log(`\n[MC-V2] ════════════════════════════════════════════`)
			console.log(`[MC-V2] SIMULATION SAMPLE (Run 1/${params.simulationCount})`)
			console.log(`[MC-V2] Profile: ${p.name} | WR: ${p.winRate}% | R:R: ${p.rewardRiskRatio} | BE: ${p.breakevenRate}%`)
			console.log(`[MC-V2] Implied PF: ${((p.winRate / 100 * p.rewardRiskRatio) / (1 - p.winRate / 100)).toFixed(2)}`)
			console.log(`[MC-V2] Base Risk: ${c(p.baseRiskCents).replace("+", "")} | Daily Limit: ${c(p.dailyLossLimitCents).replace("+", "")} | Recovery: ${p.lossRecoverySteps.length} steps [${p.lossRecoverySteps.map((s) => c(s.riskCents).replace("+", "")).join(", ")}]`)
			console.log(`[MC-V2] executeAllRegardless: ${p.executeAllRegardless} | stopAfterSequence: ${p.stopAfterSequence}`)
			console.log(`[MC-V2] Compounding: ${p.compoundingRiskPercent}% | stopOnFirstLoss: ${p.stopOnFirstLoss} | Target: ${p.dailyTargetCents ? c(p.dailyTargetCents).replace("+", "") : "none"}`)
			console.log(`[MC-V2] ────────────────────────────────────────────`)
		}
		runs.push(simulateMonth(params.profile, params.initialBalance, log))
	}

	const statistics = aggregateStatisticsV2(runs, params)
	const distributionBuckets = calculateDistributionV2(runs)

	// Find median run by total P&L
	const sortedByPnl = runs.toSorted((a, b) => a.totalPnl - b.totalPnl)
	const medianIndex = Math.floor(sortedByPnl.length / 2)
	const sampleRun = sortedByPnl[medianIndex]

	return { params, statistics, distributionBuckets, sampleRun }
}

// ==========================================
// MONTH SIMULATION
// ==========================================

const simulateMonth = (
	profile: RiskManagementProfileForSim,
	initialBalance: number,
	log = false
): SimulationRunV2 => {
	let balance = initialBalance
	let peakBalance = balance
	let monthlyPnl = 0
	let weeklyPnl = 0
	let maxDrawdown = 0
	let maxDrawdownPercent = 0

	const days: SimulatedDay[] = []
	let daysInLossRecovery = 0
	let daysInGainCompounding = 0
	let daysSkippedWeeklyLimit = 0
	let daysSkippedMonthlyLimit = 0
	let daysTargetHit = 0
	let timesWeeklyLimitHit = 0
	let monthlyLimitHit = false
	let totalTrades = 0

	for (let dayNum = 1; dayNum <= profile.tradingDaysPerMonth; dayNum++) {
		const weekNumber = Math.ceil(dayNum / profile.tradingDaysPerWeek)

		// Reset weekly P&L on week boundary
		if ((dayNum - 1) % profile.tradingDaysPerWeek === 0) {
			weeklyPnl = 0
		}

		// Check monthly loss limit
		if (monthlyPnl <= -profile.monthlyLossLimitCents) {
			monthlyLimitHit = true
			days.push(makeSkippedDay(dayNum, weekNumber, "monthlyLimit"))
			daysSkippedMonthlyLimit++
			if (log) console.log(`[MC-V2] Day ${dayNum} (W${weekNumber}): SKIPPED — monthly limit (${c(monthlyPnl)})`)
			continue
		}

		// Check weekly loss limit
		if (
			profile.weeklyLossLimitCents !== null &&
			weeklyPnl <= -profile.weeklyLossLimitCents
		) {
			days.push(makeSkippedDay(dayNum, weekNumber, "weeklyLimit"))
			daysSkippedWeeklyLimit++
			if (log) console.log(`[MC-V2] Day ${dayNum} (W${weekNumber}): SKIPPED — weekly limit (${c(weeklyPnl)})`)
			continue
		}

		// Simulate the day
		const day = simulateDay(profile, balance, dayNum, weekNumber, log)
		days.push(day)

		// Update accumulators
		balance += day.dayPnl
		monthlyPnl += day.dayPnl
		weeklyPnl += day.dayPnl
		totalTrades += day.trades.length

		// Track mode distribution
		if (day.mode === "lossRecovery") daysInLossRecovery++
		if (day.mode === "gainCompounding") daysInGainCompounding++
		if (day.targetHit) daysTargetHit++

		// Drawdown tracking
		peakBalance = Math.max(peakBalance, balance)
		const drawdown = peakBalance - balance
		const drawdownPct = peakBalance > 0 ? (drawdown / peakBalance) * 100 : 0
		if (drawdownPct > maxDrawdownPercent) {
			maxDrawdown = drawdown
			maxDrawdownPercent = drawdownPct
		}

		// Re-check weekly limit after day completes (for counting purposes)
		if (
			profile.weeklyLossLimitCents !== null &&
			weeklyPnl <= -profile.weeklyLossLimitCents
		) {
			timesWeeklyLimitHit++
		}
	}

	if (log) {
		console.log(`[MC-V2] ────────────────────────────────────────────`)
		console.log(`[MC-V2] MONTH TOTAL: ${c(monthlyPnl)} | Trades: ${totalTrades} | Trading Days: ${days.filter((d) => !d.skipped).length}`)
		console.log(`[MC-V2] Recovery: ${daysInLossRecovery}d | Compounding: ${daysInGainCompounding}d | Target Hit: ${daysTargetHit}d | Skipped(W): ${daysSkippedWeeklyLimit}d | Skipped(M): ${daysSkippedMonthlyLimit}d`)
		console.log(`[MC-V2] ════════════════════════════════════════════\n`)
	}

	return {
		days,
		totalPnl: monthlyPnl,
		totalTrades,
		totalTradingDays: days.filter((d) => !d.skipped).length,
		daysInLossRecovery,
		daysInGainCompounding,
		daysSkippedWeeklyLimit,
		daysSkippedMonthlyLimit,
		daysTargetHit,
		timesWeeklyLimitHit,
		monthlyLimitHit,
		maxDrawdown,
		maxDrawdownPercent,
		finalBalance: balance,
		totalReturnPercent: ((balance - initialBalance) / initialBalance) * 100,
	}
}

// ==========================================
// DAY SIMULATION
// ==========================================

/**
 * Simulates a single trading day following the decision tree:
 *
 * 1. Take T1 (base trade) at base risk
 * 2. If T1 LOSES → enter loss recovery mode (T2, T3, T4... at decreasing risk)
 * 3. If T1 WINS → enter gain compounding mode (reinvest % of gain, repeat until loss or target)
 *
 * The daily loss limit acts as a circuit breaker regardless of mode.
 */
const simulateDay = (
	profile: RiskManagementProfileForSim,
	currentBalance: number,
	dayNumber: number,
	weekNumber: number,
	log = false
): SimulatedDay => {
	const trades: SimulatedTradeV2[] = []
	let dayPnl = 0
	let targetHit = false
	let dayMode: SimulatedDay["mode"] = "lossRecovery" // will be overwritten

	// T1 — base trade
	const t1 = simulateTrade({
		profile,
		riskAmount: profile.baseRiskCents,
		dayNumber,
		tradeNumberInDay: 1,
		mode: "base",
		dayPnl: 0,
		currentBalance,
	})
	trades.push(t1)
	dayPnl += t1.pnl

	const tradeLabel = (t: { isWin: boolean; isBreakeven: boolean }): string =>
		t.isBreakeven ? "BE" : t.isWin ? "WIN" : "LOSS"
	const t1RiskLabel = c(profile.baseRiskCents).replace("+", "")
	const t1WinAmount = c(Math.round(profile.baseRiskCents * profile.rewardRiskRatio))

	if (log) {
		console.log(
			`[MC-V2] Day ${dayNumber} (W${weekNumber}): T1 ${tradeLabel(t1)} | risk: ${t1RiskLabel} | R:R win: ${t1WinAmount} | pnl: ${c(t1.pnl)} | dayPnl: ${c(dayPnl)}`
		)
	}

	if (t1.isBreakeven) {
		// ── BREAKEVEN — day ends with just T1 ──
		dayMode = "gainCompounding" // no recovery needed
		if (log) console.log(`[MC-V2]   ○ Breakeven — day ends`)
	} else if (!t1.isWin) {
		// ── LOSS RECOVERY MODE ──
		dayMode = "lossRecovery"

		for (let i = 0; i < profile.lossRecoverySteps.length; i++) {
			// Check daily loss limit before each recovery trade
			if (dayPnl <= -profile.dailyLossLimitCents) {
				if (log) console.log(`[MC-V2]   ⛔ Daily limit reached (${c(dayPnl)}), stop recovery`)
				break
			}

			const step = profile.lossRecoverySteps[i]
			// Cap risk to remaining budget before hitting daily loss limit
			const remainingBudget = profile.dailyLossLimitCents + dayPnl // dayPnl is negative
			const cappedRisk = Math.min(step.riskCents, Math.max(0, remainingBudget))

			if (log && cappedRisk < step.riskCents) {
				console.log(`[MC-V2]   ⚠ T${i + 2} risk capped: ${c(step.riskCents).replace("+", "")} → ${c(cappedRisk).replace("+", "")} (remaining budget: ${c(remainingBudget).replace("+", "")})`)
			}

			const recoveryTrade = simulateTrade({
				profile,
				riskAmount: cappedRisk,
				dayNumber,
				tradeNumberInDay: trades.length + 1,
				mode: "lossRecovery",
				dayPnl,
				currentBalance: currentBalance + dayPnl,
			})
			trades.push(recoveryTrade)
			dayPnl += recoveryTrade.pnl

			if (log) {
				const winAmount = c(Math.round(cappedRisk * profile.rewardRiskRatio))
				console.log(
					`[MC-V2]   T${i + 2} ${tradeLabel(recoveryTrade)} | risk: ${c(cappedRisk).replace("+", "")} | R:R win: ${winAmount} | pnl: ${c(recoveryTrade.pnl)} | dayPnl: ${c(dayPnl)}`
				)
			}

			// If the recovery trade won and profile does NOT require executing all
			// remaining steps regardless, stop the recovery sequence early
			if (recoveryTrade.isWin && !profile.executeAllRegardless) {
				if (log) console.log(`[MC-V2]   ✓ Recovery win — stop (executeAllRegardless=${profile.executeAllRegardless})`)
				break
			}
		}
	} else {
		// ── GAIN COMPOUNDING MODE ──
		dayMode = "gainCompounding"

		// Single target mode: first win = done
		if (profile.compoundingRiskPercent === 0) {
			// Check if daily target met
			if (profile.dailyTargetCents !== null && dayPnl >= profile.dailyTargetCents) {
				targetHit = true
				if (log) console.log(`[MC-V2]   🎯 Single target hit: ${c(dayPnl)}`)
			}
		} else {
			// Compounding: risk % of accumulated gains
			let accumulatedGain = dayPnl
			const MAX_COMPOUNDING_TRADES = 50 // safety valve

			for (let ci = 0; ci < MAX_COMPOUNDING_TRADES; ci++) {
				// Check daily target
				if (profile.dailyTargetCents !== null && dayPnl >= profile.dailyTargetCents) {
					targetHit = true
					if (log) console.log(`[MC-V2]   🎯 Daily target hit: ${c(dayPnl)} >= ${c(profile.dailyTargetCents)}`)
					break
				}

				// Calculate compounding risk
				const compoundingRisk = Math.round(
					accumulatedGain * (profile.compoundingRiskPercent / 100)
				)

				// Need meaningful risk to continue
				if (compoundingRisk <= 0) {
					if (log) console.log(`[MC-V2]   ⛔ Compounding risk = 0, stop`)
					break
				}

				// Check daily loss limit (protect against giving back more than limit)
				if (dayPnl - compoundingRisk < -profile.dailyLossLimitCents) {
					if (log) console.log(`[MC-V2]   ⛔ Compounding would breach daily limit, stop`)
					break
				}

				const compoundTrade = simulateTrade({
					profile,
					riskAmount: compoundingRisk,
					dayNumber,
					tradeNumberInDay: trades.length + 1,
					mode: "gainCompounding",
					dayPnl,
					currentBalance: currentBalance + dayPnl,
				})
				trades.push(compoundTrade)
				dayPnl += compoundTrade.pnl

				if (log) {
					const winAmount = c(Math.round(compoundingRisk * profile.rewardRiskRatio))
					console.log(
						`[MC-V2]   C${ci + 1} ${tradeLabel(compoundTrade)} | risk: ${c(compoundingRisk).replace("+", "")} (${profile.compoundingRiskPercent}% of ${c(accumulatedGain)}) | R:R win: ${winAmount} | pnl: ${c(compoundTrade.pnl)} | dayPnl: ${c(dayPnl)}`
					)
				}

				if (compoundTrade.isBreakeven) {
					// Breakeven in compounding: no gain to compound, but not a "loss"
					// Accumulated gain doesn't change, compound off same base next iteration
					if (log) console.log(`[MC-V2]   ○ Compound breakeven — continue`)
					continue
				} else if (compoundTrade.isWin) {
					accumulatedGain = dayPnl
				} else if (profile.stopOnFirstLoss) {
					if (log) console.log(`[MC-V2]   ✗ Compound loss — stop (stopOnFirstLoss=true)`)
					break
				} else {
					// Loss in compounding: recalculate accumulated gain from current day P&L
					accumulatedGain = Math.max(0, dayPnl)
					if (accumulatedGain <= 0) break
				}
			}

			// Check target one more time after loop
			if (!targetHit && profile.dailyTargetCents !== null && dayPnl >= profile.dailyTargetCents) {
				targetHit = true
			}
		}
	}

	if (log) {
		const modeLabel = dayMode === "lossRecovery" ? "RECOVERY" : "COMPOUNDING"
		const targetLabel = targetHit ? " 🎯" : ""
		console.log(`[MC-V2]   → Day ${dayNumber} end: ${modeLabel} | ${trades.length} trades | dayPnl: ${c(dayPnl)}${targetLabel}`)
	}

	return {
		dayNumber,
		weekNumber,
		mode: dayMode,
		trades,
		dayPnl,
		targetHit,
		skipped: false,
		skipReason: null,
	}
}

// ==========================================
// SINGLE TRADE SIMULATION
// ==========================================

interface SimulateTradeParams {
	profile: RiskManagementProfileForSim
	riskAmount: number
	dayNumber: number
	tradeNumberInDay: number
	mode: TradeMode
	dayPnl: number
	currentBalance: number
}

const simulateTrade = ({
	profile,
	riskAmount,
	dayNumber,
	tradeNumberInDay,
	mode,
	dayPnl,
	currentBalance,
}: SimulateTradeParams): SimulatedTradeV2 => {
	const commission = profile.commissionPerTradeCents

	// Three-outcome roll: breakeven first, then win/loss among decisive trades
	// breakevenRate is % of ALL trades; winRate is % of decisive (non-BE) trades
	const roll = Math.random() * 100
	const isBreakeven = roll < profile.breakevenRate
	const isWin = !isBreakeven && (roll - profile.breakevenRate) / (100 - profile.breakevenRate) * 100 < profile.winRate

	const pnl = isBreakeven
		? -commission // breakeven: no gain/loss, just commission
		: isWin
			? Math.round(riskAmount * profile.rewardRiskRatio) - commission
			: -riskAmount - commission

	return {
		dayNumber,
		tradeNumberInDay,
		mode,
		riskAmount,
		isWin,
		isBreakeven,
		pnl,
		commission,
		accumulatedDayPnl: dayPnl + pnl,
		balanceAfter: currentBalance + pnl,
	}
}

// ==========================================
// HELPERS
// ==========================================

const makeSkippedDay = (
	dayNumber: number,
	weekNumber: number,
	reason: "weeklyLimit" | "monthlyLimit"
): SimulatedDay => ({
	dayNumber,
	weekNumber,
	mode: "lossRecovery",
	trades: [],
	dayPnl: 0,
	targetHit: false,
	skipped: true,
	skipReason: reason,
})

// ==========================================
// STATISTICS AGGREGATION
// ==========================================

const aggregateStatisticsV2 = (
	runs: SimulationRunV2[],
	params: SimulationParamsV2
): SimulationStatisticsV2 => {
	const pnls = runs.map((r) => r.totalPnl).toSorted((a, b) => a - b)
	const returns = runs.map((r) => r.totalReturnPercent).toSorted((a, b) => a - b)
	const drawdowns = runs.map((r) => r.maxDrawdownPercent).toSorted((a, b) => a - b)

	const median = (arr: number[]): number => {
		const mid = Math.floor(arr.length / 2)
		return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2
	}

	const mean = (arr: number[]): number =>
		arr.reduce((sum, v) => sum + v, 0) / arr.length

	const percentile = (arr: number[], p: number): number => {
		const idx = Math.ceil((p / 100) * arr.length) - 1
		return arr[Math.max(0, Math.min(idx, arr.length - 1))]
	}

	const stdDev = (values: number[]): number => {
		if (values.length === 0) return 0
		const avg = mean(values)
		const squaredDiffs = values.map((v) => Math.pow(v - avg, 2))
		return Math.sqrt(mean(squaredDiffs))
	}

	const profitableRuns = runs.filter((r) => r.totalPnl > 0).length
	const limitHitRuns = runs.filter((r) => r.monthlyLimitHit).length

	const meanReturn = mean(returns)
	const returnStdDev = stdDev(returns)
	const downsideReturns = returns.filter((r) => r < 0)
	const downsideDev = downsideReturns.length > 0 ? stdDev(downsideReturns) : 1

	const sharpeRatio = returnStdDev > 0 ? meanReturn / returnStdDev : 0
	const sortinoRatio = downsideDev > 0 ? meanReturn / downsideDev : 0

	// Expected daily P&L: total P&L / total trading days across all runs
	const totalDays = runs.reduce((sum, r) => sum + r.totalTradingDays, 0)
	const totalPnl = runs.reduce((sum, r) => sum + r.totalPnl, 0)
	const expectedDailyPnl = totalDays > 0 ? totalPnl / totalDays : 0

	return {
		medianMonthlyPnl: median(pnls),
		meanMonthlyPnl: mean(pnls),
		bestCaseMonthlyPnl: percentile(pnls, 95),
		worstCaseMonthlyPnl: percentile(pnls, 5),
		medianReturnPercent: median(returns),
		profitableMonthsPct: (profitableRuns / runs.length) * 100,
		monthlyLimitHitPct: (limitHitRuns / runs.length) * 100,
		avgTradingDaysPerMonth: mean(runs.map((r) => r.totalTradingDays)),
		avgDaysInLossRecovery: mean(runs.map((r) => r.daysInLossRecovery)),
		avgDaysInGainCompounding: mean(runs.map((r) => r.daysInGainCompounding)),
		avgDaysTargetHit: mean(runs.map((r) => r.daysTargetHit)),
		avgDaysSkippedWeeklyLimit: mean(runs.map((r) => r.daysSkippedWeeklyLimit)),
		avgDaysSkippedMonthlyLimit: mean(runs.map((r) => r.daysSkippedMonthlyLimit)),
		avgTradesPerMonth: mean(runs.map((r) => r.totalTrades)),
		medianMaxDrawdownPercent: median(drawdowns),
		worstMaxDrawdownPercent: percentile(drawdowns, 95),
		sharpeRatio,
		sortinoRatio,
		expectedDailyPnl,
	}
}

// ==========================================
// DISTRIBUTION (reuse V1's bucket approach)
// ==========================================

const calculateDistributionV2 = (runs: SimulationRunV2[]): DistributionBucket[] => {
	const pnls = runs.map((r) => r.totalPnl)
	let min = Infinity
	let max = -Infinity
	for (const pnl of pnls) {
		if (pnl < min) min = pnl
		if (pnl > max) max = pnl
	}
	const bucketCount = 20
	const bucketSize = (max - min) / bucketCount || 1

	const buckets: DistributionBucket[] = []

	for (let i = 0; i < bucketCount; i++) {
		const rangeStart = min + i * bucketSize
		const rangeEnd = min + (i + 1) * bucketSize
		const isLastBucket = i === bucketCount - 1

		const count = pnls.filter(
			(p) => p >= rangeStart && (isLastBucket ? p <= rangeEnd : p < rangeEnd)
		).length

		buckets.push({
			rangeStart,
			rangeEnd,
			count,
			percentage: (count / runs.length) * 100,
		})
	}

	return buckets
}

export { runMonteCarloV2 }
