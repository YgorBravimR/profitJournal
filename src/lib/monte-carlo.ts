import type {
	SimulationParams,
	SimulatedTrade,
	SimulationRun,
	SimulationStatistics,
	MonteCarloResult,
	DistributionBucket,
} from "@/types/monte-carlo"

export const runMonteCarloSimulation = (
	params: SimulationParams
): MonteCarloResult => {
	const runs: SimulationRun[] = []

	for (let i = 0; i < params.simulationCount; i++) {
		const run = simulateSingleRun(params, i)
		runs.push(run)
	}

	const statistics = aggregateStatistics(params, runs)
	const distributionBuckets = calculateDistribution(runs, params.initialBalance)

	// Find median run for sample display (using toSorted for immutability)
	const sortedByReturn = runs.toSorted(
		(a, b) => a.totalReturnPercent - b.totalReturnPercent
	)
	const medianIndex = Math.floor(sortedByReturn.length / 2)
	const sampleRun = sortedByReturn[medianIndex]

	return {
		params,
		statistics,
		distributionBuckets,
		sampleRun,
	}
}

const simulateSingleRun = (
	params: SimulationParams,
	runId: number
): SimulationRun => {
	let balance = params.initialBalance
	let peakBalance = balance
	const trades: SimulatedTrade[] = []
	let winCount = 0
	let lossCount = 0
	let currentWinStreak = 0
	let currentLossStreak = 0
	let maxWinStreak = 0
	let maxLossStreak = 0
	let underwaterTrades = 0
	let totalCommission = 0

	for (let t = 0; t < params.numberOfTrades; t++) {
		const riskAmount =
			params.riskType === "percentage"
				? balance * (params.riskPerTrade / 100)
				: Math.min(params.riskPerTrade, balance)

		const commission = riskAmount * (params.commissionPerTrade / 100)
		totalCommission += commission

		const isWin = Math.random() * 100 < params.winRate

		let pnl: number
		if (isWin) {
			pnl = riskAmount * params.rewardRiskRatio - commission
			winCount++
			currentWinStreak++
			currentLossStreak = 0
			maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
		} else {
			pnl = -riskAmount - commission
			lossCount++
			currentLossStreak++
			currentWinStreak = 0
			maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
		}

		balance = Math.max(0, balance + pnl)
		peakBalance = Math.max(peakBalance, balance)

		const drawdown = peakBalance - balance
		const drawdownPercent = peakBalance > 0 ? (drawdown / peakBalance) * 100 : 0

		if (balance < peakBalance) underwaterTrades++

		trades.push({
			tradeNumber: t + 1,
			isWin,
			pnl,
			commission,
			balanceAfter: balance,
			drawdown,
			drawdownPercent,
		})

		if (balance <= 0) break
	}

	const maxDrawdownTrade = trades.reduce(
		(max, t) => (t.drawdownPercent > max.drawdownPercent ? t : max),
		trades[0]
	)

	return {
		runId,
		trades,
		finalBalance: balance,
		totalReturn: balance - params.initialBalance,
		totalReturnPercent:
			((balance - params.initialBalance) / params.initialBalance) * 100,
		maxDrawdown: maxDrawdownTrade?.drawdown || 0,
		maxDrawdownPercent: maxDrawdownTrade?.drawdownPercent || 0,
		totalCommission,
		winCount,
		lossCount,
		maxWinStreak,
		maxLossStreak,
		peakBalance,
		underwaterTrades,
	}
}

const aggregateStatistics = (
	params: SimulationParams,
	runs: SimulationRun[]
): SimulationStatistics => {
	// Using toSorted for immutability in statistical calculations
	const finalBalances = runs.map((r) => r.finalBalance).toSorted((a, b) => a - b)
	const returns = runs.map((r) => r.totalReturnPercent).toSorted((a, b) => a - b)
	const maxDrawdowns = runs
		.map((r) => r.maxDrawdownPercent)
		.toSorted((a, b) => a - b)

	const percentile = (arr: number[], p: number): number => {
		const index = Math.ceil((p / 100) * arr.length) - 1
		return arr[Math.max(0, Math.min(index, arr.length - 1))]
	}

	const median = (arr: number[]): number => {
		const mid = Math.floor(arr.length / 2)
		return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2
	}

	const mean = (arr: number[]): number =>
		arr.reduce((sum, v) => sum + v, 0) / arr.length

	const profitableRuns = runs.filter((r) => r.totalReturn > 0).length
	const ruinRuns = runs.filter((r) => r.totalReturnPercent <= -50).length
	const meanReturnPct = mean(returns)
	const stdDev = calculateStdDev(returns)
	const downsideReturns = returns.filter((r) => r < 0)
	const downsideDev =
		downsideReturns.length > 0 ? calculateStdDev(downsideReturns) : 1

	const sharpeRatio = stdDev > 0 ? meanReturnPct / stdDev : 0
	const sortinoRatio = downsideDev > 0 ? meanReturnPct / downsideDev : 0
	const calmarRatio =
		mean(maxDrawdowns) > 0 ? meanReturnPct / mean(maxDrawdowns) : 0

	const winProb = params.winRate / 100
	const expectedValue =
		winProb * params.rewardRiskRatio -
		(1 - winProb) -
		params.commissionPerTrade / 100
	const totalWins = runs.reduce((sum, r) => {
		const wins = r.trades.filter((t) => t.isWin).reduce((s, t) => s + t.pnl, 0)
		return sum + wins
	}, 0)
	const totalLosses = runs.reduce((sum, r) => {
		const losses = r.trades
			.filter((t) => !t.isWin)
			.reduce((s, t) => s + Math.abs(t.pnl), 0)
		return sum + losses
	}, 0)
	const profitFactor =
		totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0
	const avgMaxWinStreak = mean(runs.map((r) => r.maxWinStreak))
	const avgMaxLossStreak = mean(runs.map((r) => r.maxLossStreak))
	const allWinStreaks: number[] = []
	const allLossStreaks: number[] = []
	for (const run of runs) {
		let currentWin = 0
		let currentLoss = 0
		for (const trade of run.trades) {
			if (trade.isWin) {
				currentWin++
				if (currentLoss > 0) {
					allLossStreaks.push(currentLoss)
					currentLoss = 0
				}
			} else {
				currentLoss++
				if (currentWin > 0) {
					allWinStreaks.push(currentWin)
					currentWin = 0
				}
			}
		}
		if (currentWin > 0) allWinStreaks.push(currentWin)
		if (currentLoss > 0) allLossStreaks.push(currentLoss)
	}

	const {
		kellyFull,
		kellyHalf,
		kellyQuarter,
		kellyRecommendation,
		kellyLevel,
	} = calculateKellyCriterion(params.winRate, params.rewardRiskRatio)

	const avgUnderwaterPct = mean(
		runs.map((r) => (r.underwaterTrades / r.trades.length) * 100)
	)
	let bestTrade = -Infinity
	let worstTrade = Infinity
	for (const run of runs) {
		for (const trade of run.trades) {
			if (trade.pnl > bestTrade) bestTrade = trade.pnl
			if (trade.pnl < worstTrade) worstTrade = trade.pnl
		}
	}

	return {
		medianFinalBalance: median(finalBalances),
		meanFinalBalance: mean(finalBalances),
		bestCaseFinalBalance: percentile(finalBalances, 95),
		worstCaseFinalBalance: percentile(finalBalances, 5),
		medianReturn: median(returns),
		meanReturn: meanReturnPct,
		bestCaseReturn: percentile(returns, 95),
		worstCaseReturn: percentile(returns, 5),
		medianMaxDrawdown: median(maxDrawdowns),
		meanMaxDrawdown: mean(maxDrawdowns),
		worstMaxDrawdown: percentile(maxDrawdowns, 95),
		profitablePct: (profitableRuns / runs.length) * 100,
		ruinPct: (ruinRuns / runs.length) * 100,
		sharpeRatio,
		sortinoRatio,
		calmarRatio,
		profitFactor,
		expectedValuePerTrade: expectedValue,
		expectedMaxWinStreak: avgMaxWinStreak,
		expectedMaxLossStreak: avgMaxLossStreak,
		avgWinStreak: allWinStreaks.length > 0 ? mean(allWinStreaks) : 0,
		avgLossStreak: allLossStreaks.length > 0 ? mean(allLossStreaks) : 0,
		kellyFull,
		kellyHalf,
		kellyQuarter,
		kellyRecommendation,
		kellyLevel,
		avgRecoveryTrades: 0,
		avgUnderwaterPercent: avgUnderwaterPct,
		bestTrade,
		worstTrade,
	}
}

/**
 * Kelly % = W - (1-W)/R where W = win probability, R = reward/risk ratio
 */
export const calculateKellyCriterion = (
	winRate: number,
	rewardRiskRatio: number
): {
	kellyFull: number
	kellyHalf: number
	kellyQuarter: number
	kellyRecommendation: string
	kellyLevel: "aggressive" | "balanced" | "conservative"
} => {
	const W = winRate / 100
	const rawKelly = W - (1 - W) / rewardRiskRatio
	const cappedKelly = Math.max(0, rawKelly) * 100

	let kellyRecommendation: string
	let kellyLevel: "aggressive" | "balanced" | "conservative"

	if (cappedKelly <= 0) {
		kellyRecommendation = "Negative edge - do not trade this strategy"
		kellyLevel = "conservative"
	} else if (cappedKelly > 25) {
		kellyRecommendation = "High potential but risky - Use Quarter Kelly"
		kellyLevel = "aggressive"
	} else if (cappedKelly > 15) {
		kellyRecommendation = "Reasonable Kelly - Consider Half Kelly for growth"
		kellyLevel = "balanced"
	} else {
		kellyRecommendation =
			"Conservative Kelly - Quarter Kelly recommended for stability"
		kellyLevel = "conservative"
	}

	return {
		kellyFull: cappedKelly,
		kellyHalf: cappedKelly / 2,
		kellyQuarter: cappedKelly / 4,
		kellyRecommendation,
		kellyLevel,
	}
}

const calculateDistribution = (
	runs: SimulationRun[],
	_initialBalance: number
): DistributionBucket[] => {
	const finalBalances = runs.map((r) => r.finalBalance)
	let min = Infinity
	let max = -Infinity
	for (const balance of finalBalances) {
		if (balance < min) min = balance
		if (balance > max) max = balance
	}
	const bucketCount = 20
	const bucketSize = (max - min) / bucketCount || 1

	const buckets: DistributionBucket[] = []

	for (let i = 0; i < bucketCount; i++) {
		const rangeStart = min + i * bucketSize
		const rangeEnd = min + (i + 1) * bucketSize
		const isLastBucket = i === bucketCount - 1

		const count = finalBalances.filter(
			(b) => b >= rangeStart && (isLastBucket ? b <= rangeEnd : b < rangeEnd)
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

const calculateStdDev = (values: number[]): number => {
	if (values.length === 0) return 0
	const avg = values.reduce((sum, v) => sum + v, 0) / values.length
	const squaredDiffs = values.map((v) => Math.pow(v - avg, 2))
	const avgSquaredDiff =
		squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length
	return Math.sqrt(avgSquaredDiff)
}

interface AnalysisInsights {
	profitabilityQuality: "robust" | "moderate" | "risky"
	riskAssessment: "excellent" | "good" | "moderate" | "concerning"
	psychologyWarning: string | null
	commissionAssessment: "good" | "moderate" | "high"
	improvementSuggestions: string[]
}

export const generateAnalysisInsights = (
	result: MonteCarloResult
): AnalysisInsights => {
	const { statistics: stats, params, sampleRun } = result

	const getProfitabilityQuality = (): "robust" | "moderate" | "risky" => {
		if (stats.profitablePct >= 70) return "robust"
		if (stats.profitablePct >= 50) return "moderate"
		return "risky"
	}

	const getRiskAssessment = ():
		| "excellent"
		| "good"
		| "moderate"
		| "concerning" => {
		if (stats.sharpeRatio >= 2 && stats.medianMaxDrawdown <= 10)
			return "excellent"
		if (stats.sharpeRatio >= 1 && stats.medianMaxDrawdown <= 20) return "good"
		if (stats.sharpeRatio >= 0.5 && stats.medianMaxDrawdown <= 30)
			return "moderate"
		return "concerning"
	}

	const getPsychologyWarning = (): string | null => {
		const streak = Math.round(stats.expectedMaxLossStreak)
		if (stats.expectedMaxLossStreak >= 7) {
			return `Can you maintain discipline during a ${streak}-trade losing streak? This is crucial for success.`
		}
		if (stats.expectedMaxLossStreak >= 5) {
			return `Prepare for potential ${streak}-trade losing streaks. Have a plan to stay disciplined.`
		}
		return null
	}

	const getCommissionAssessment = (): "good" | "moderate" | "high" => {
		const impact = sampleRun.totalCommission / sampleRun.totalReturn
		if (Number.isNaN(impact) || impact <= 0.1) return "good"
		if (impact <= 0.25) return "moderate"
		return "high"
	}

	const suggestions: string[] = []
	if (stats.avgUnderwaterPercent > 50) {
		suggestions.push(
			"Reduce Underwater Time: Look for better entry/exit criteria"
		)
	}
	if (params.rewardRiskRatio < 1.5) {
		suggestions.push("Improve Reward/Risk: Focus on letting winners run longer")
	}
	if (params.winRate < 50) {
		suggestions.push(
			"Improve Win Rate: Review entry criteria and market selection"
		)
	}
	if (stats.medianMaxDrawdown > 20) {
		suggestions.push(
			"Reduce Drawdown: Consider smaller position sizes or tighter stops"
		)
	}

	return {
		profitabilityQuality: getProfitabilityQuality(),
		riskAssessment: getRiskAssessment(),
		psychologyWarning: getPsychologyWarning(),
		commissionAssessment: getCommissionAssessment(),
		improvementSuggestions: suggestions,
	}
}
