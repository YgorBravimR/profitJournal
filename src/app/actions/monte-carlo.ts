"use server"

import { db } from "@/db/drizzle"
import { trades, strategies } from "@/db/schema"
import type { ActionResponse } from "@/types"
import type {
	DataSource,
	SourceStats,
	MonteCarloResult,
	SimulationParams,
	DataSourceOption,
	StrategyComparisonResult,
	ComparisonRecommendation,
	SimulationParamsV2,
	MonteCarloResultV2,
} from "@/types/monte-carlo"
import { eq, and, inArray, isNotNull, desc } from "drizzle-orm"
import { z } from "zod"
import {
	simulationParamsSchema,
	dataSourceSchema,
	simulationParamsV2Schema,
} from "@/lib/validations/monte-carlo"
import { runMonteCarloSimulation } from "@/lib/monte-carlo"
import { runMonteCarloV2 } from "@/lib/monte-carlo-v2"
import { requireAuth } from "@/app/actions/auth"
import { toSafeErrorMessage } from "@/lib/error-utils"
import { getUserDek, decryptTradeFields } from "@/lib/user-crypto"

export const getDataSourceOptions = async (): Promise<
	ActionResponse<DataSourceOption[]>
> => {
	try {
		const { accountId, userId, showAllAccounts, allAccountIds } = await requireAuth()

		const options: DataSourceOption[] = []

		// Get strategies for current user (strategies are user-level, not account-level)
		const accountStrategies = await db.query.strategies.findMany({
			where: and(
				eq(strategies.userId, userId),
				eq(strategies.isActive, true)
			),
			orderBy: [desc(strategies.name)],
		})

		// Add individual strategy options
		for (const strategy of accountStrategies) {
			const tradesCount = await db
				.select()
				.from(trades)
				.where(
					and(eq(trades.strategyId, strategy.id), isNotNull(trades.outcome))
				)
				.then((rows) => rows.length)

			options.push({
				type: "strategy",
				strategyId: strategy.id,
				label: strategy.name,
				description: strategy.description || undefined,
				tradesCount,
				disabled: tradesCount < 10,
				disabledReason:
					tradesCount < 10 ? "Need at least 10 trades" : undefined,
			})
		}

		// Add "All Strategies" option
		const allAccountTrades = await db
			.select()
			.from(trades)
			.where(and(eq(trades.accountId, accountId), isNotNull(trades.outcome)))
			.then((rows) => rows.length)

		options.push({
			type: "all_strategies",
			label: "All Strategies",
			description: "Combined metrics from all strategies",
			tradesCount: allAccountTrades,
			disabled: allAccountTrades < 10,
			disabledReason:
				allAccountTrades < 10 ? "Need at least 10 trades" : undefined,
		})

		// Add "Universal" option if show all accounts is enabled
		if (showAllAccounts && allAccountIds.length > 1) {
			const universalTrades = await db
				.select()
				.from(trades)
				.where(
					and(
						inArray(trades.accountId, allAccountIds),
						isNotNull(trades.outcome)
					)
				)
				.then((rows) => rows.length)

			options.push({
				type: "universal",
				label: "All Accounts + All Strategies",
				description: "Universal metrics across all accounts",
				tradesCount: universalTrades,
				disabled: universalTrades < 10,
				disabledReason:
					universalTrades < 10 ? "Need at least 10 trades" : undefined,
			})
		}

		return {
			status: "success",
			message: "Data sources retrieved",
			data: options,
		}
	} catch (error) {
		return {
			status: "error",
			message: "Failed to get data sources",
			errors: [{ code: "FETCH_ERROR", detail: toSafeErrorMessage(error, "getDataSourceOptions") }],
		}
	}
}

export const getSimulationStats = async (
	source: DataSource
): Promise<ActionResponse<SourceStats>> => {
	try {
		const validated = dataSourceSchema.parse(source)
		const { accountId, userId, showAllAccounts, allAccountIds } = await requireAuth()

		// After decryption, pnl/plannedRiskAmount/commission/fees are numbers (from decryptNumericField)
		// For non-encrypted users, these come back as strings from text columns and need Number() conversion
		let tradesList: Array<{
			outcome: string | null
			pnl: number | string | null
			realizedRMultiple: string | null
			plannedRiskAmount: number | string | null
			commission: number | string | null
			fees: number | string | null
			strategyId: string | null
			entryDate: Date
		}> = []
		let sourceName = ""
		let strategiesCount = 0
		let accountsCount = 1

		// Get DEK for decryption
		const dek = await getUserDek(userId)

		if (validated.type === "strategy") {
			const strategy = await db.query.strategies.findFirst({
				where: and(eq(strategies.id, validated.strategyId), eq(strategies.userId, userId)),
			})
			if (!strategy) {
				return {
					status: "error",
					message: "Strategy not found",
					errors: [{ code: "NOT_FOUND", detail: "Strategy not found" }],
				}
			}
			sourceName = strategy.name
			strategiesCount = 1

			const rawTrades = await db.query.trades.findMany({
				where: and(
					eq(trades.strategyId, validated.strategyId),
					isNotNull(trades.outcome)
				),
				orderBy: [desc(trades.entryDate)],
				columns: {
					outcome: true,
					pnl: true,
					realizedRMultiple: true,
					plannedRiskAmount: true,
					commission: true,
					fees: true,
					strategyId: true,
					entryDate: true,
				},
			})
			tradesList = dek ? rawTrades.map((t) => decryptTradeFields(t, dek)) : rawTrades
		} else if (validated.type === "all_strategies") {
			sourceName = "All Strategies"

			const accountStrategies = await db.query.strategies.findMany({
				where: eq(strategies.userId, userId),
			})
			strategiesCount = accountStrategies.length

			const rawTrades = await db.query.trades.findMany({
				where: and(eq(trades.accountId, accountId), isNotNull(trades.outcome)),
				orderBy: [desc(trades.entryDate)],
				columns: {
					outcome: true,
					pnl: true,
					realizedRMultiple: true,
					plannedRiskAmount: true,
					commission: true,
					fees: true,
					strategyId: true,
					entryDate: true,
				},
			})
			tradesList = dek ? rawTrades.map((t) => decryptTradeFields(t, dek)) : rawTrades
		} else if (validated.type === "universal") {
			if (!showAllAccounts) {
				return {
					status: "error",
					message: 'Universal mode requires "show all accounts" to be enabled',
					errors: [
						{
							code: "NOT_ALLOWED",
							detail: "Enable show all accounts in settings",
						},
					],
				}
			}
			sourceName = "All Accounts + All Strategies"
			accountsCount = allAccountIds.length

			const allStrategies = await db.query.strategies.findMany({
				where: eq(strategies.userId, userId),
			})
			strategiesCount = allStrategies.length

			const rawTrades = await db.query.trades.findMany({
				where: and(
					inArray(trades.accountId, allAccountIds),
					isNotNull(trades.outcome)
				),
				orderBy: [desc(trades.entryDate)],
				columns: {
					outcome: true,
					pnl: true,
					realizedRMultiple: true,
					plannedRiskAmount: true,
					commission: true,
					fees: true,
					strategyId: true,
					entryDate: true,
				},
			})
			tradesList = dek ? rawTrades.map((t) => decryptTradeFields(t, dek)) : rawTrades
		}

		if (tradesList.length === 0) {
			return {
				status: "error",
				message: `No trades found for ${sourceName}`,
				errors: [{ code: "NO_TRADES", detail: "No completed trades found" }],
			}
		}

		const wins = tradesList.filter((t) => t.outcome === "win")
		const losses = tradesList.filter((t) => t.outcome === "loss")
		const decidedCount = wins.length + losses.length
		// Win rate excludes breakeven trades from denominator (consistent with dashboard)
		const winRate = decidedCount > 0 ? (wins.length / decidedCount) * 100 : 0

		// Avg R:R stays R-multiple-based (ratio of avg winning R to avg losing R)
		const tradesWithR = tradesList.filter(
			(t) => t.realizedRMultiple !== null && t.realizedRMultiple !== undefined
		)
		const winningR = tradesWithR
			.filter((t) => parseFloat(t.realizedRMultiple!) > 0)
			.map((t) => parseFloat(t.realizedRMultiple!))
		const losingR = tradesWithR
			.filter((t) => parseFloat(t.realizedRMultiple!) < 0)
			.map((t) => Math.abs(parseFloat(t.realizedRMultiple!)))

		const avgWinR =
			winningR.length > 0
				? winningR.reduce((a, b) => a + b, 0) / winningR.length
				: 1
		const avgLossR =
			losingR.length > 0
				? losingR.reduce((a, b) => a + b, 0) / losingR.length
				: 1
		const avgRewardRiskRatio = avgWinR / avgLossR || 1

		const totalCommission = tradesList.reduce(
			(sum, t) => sum + (Number(t.commission) || 0) + (Number(t.fees) || 0),
			0
		)
		const avgCommissionPerTradeCents =
			tradesList.length > 0
				? Math.round(totalCommission / tradesList.length)
				: 0
		const breakevenCount = tradesList.length - wins.length - losses.length
		const breakevenRate =
			tradesList.length > 0 ? (breakevenCount / tradesList.length) * 100 : 0
		const totalRisk = tradesList.reduce(
			(sum, t) => sum + (Number(t.plannedRiskAmount) || 0),
			0
		)
		const commissionImpactR =
			totalRisk > 0 ? (totalCommission / totalRisk) * 100 : 0

		// Profit factor uses PnL values (consistent with dashboard), not R-multiples
		const grossProfit = wins.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
		const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0))
		const profitFactor =
			grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

		const allR = tradesWithR.map((t) => parseFloat(t.realizedRMultiple!))
		const avgR =
			allR.length > 0 ? allR.reduce((a, b) => a + b, 0) / allR.length : 0

		let strategiesBreakdown: SourceStats["strategiesBreakdown"]
		if (validated.type !== "strategy") {
			const breakdown = new Map<
				string,
				{ name: string; tradesCount: number; wins: number; losses: number }
			>()
			const strategyIds = [
				...new Set(tradesList.map((t) => t.strategyId).filter(Boolean)),
			] as string[]
			const strategiesMap = new Map<string, string>()

			if (strategyIds.length > 0) {
				const strategyRecords = await db.query.strategies.findMany({
					where: inArray(strategies.id, strategyIds),
					columns: { id: true, name: true },
				})
				for (const s of strategyRecords) {
					strategiesMap.set(s.id, s.name)
				}
			}

			for (const trade of tradesList) {
				const name = trade.strategyId
					? strategiesMap.get(trade.strategyId) || "No Strategy"
					: "No Strategy"
				if (!breakdown.has(name)) {
					breakdown.set(name, { name, tradesCount: 0, wins: 0, losses: 0 })
				}
				const entry = breakdown.get(name)!
				entry.tradesCount++
				if (trade.outcome === "win") entry.wins++
				if (trade.outcome === "loss") entry.losses++
			}

			// Win rate excludes breakeven trades from denominator (consistent with dashboard)
			strategiesBreakdown = Array.from(breakdown.values()).map((s) => {
				const decided = s.wins + s.losses
				return {
					name: s.name,
					tradesCount: s.tradesCount,
					winRate: decided > 0 ? (s.wins / decided) * 100 : 0,
				}
			})
		}

		const dates = tradesList.map((t) => new Date(t.entryDate))
		const dateRange = {
			from: new Date(Math.min(...dates.map((d) => d.getTime()))),
			to: new Date(Math.max(...dates.map((d) => d.getTime()))),
		}

		const roundTo2 = (n: number) => Math.round(n * 100) / 100

		return {
			status: "success",
			message: "Stats retrieved",
			data: {
				sourceType: validated.type,
				sourceName,
				totalTrades: tradesList.length,
				winRate: roundTo2(winRate),
				avgRewardRiskRatio: roundTo2(avgRewardRiskRatio),
				avgRiskPerTrade: 1,
				avgCommissionImpact: roundTo2(commissionImpactR),
				dateRange,
				profitFactor: roundTo2(profitFactor),
				avgR: roundTo2(avgR),
				avgWinR: roundTo2(avgWinR),
				avgLossR: roundTo2(avgLossR),
				commissionImpactR: roundTo2(commissionImpactR),
				avgCommissionPerTradeCents,
				breakevenRate: roundTo2(breakevenRate),
				strategiesCount,
				accountsCount:
					validated.type === "universal" ? accountsCount : undefined,
				strategiesBreakdown,
			},
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				status: "error",
				message: "Validation failed",
				errors: error.issues.map((e) => ({
					code: "VALIDATION_ERROR",
					detail: `${e.path.join(".")}: ${e.message}`,
				})),
			}
		}

		return {
			status: "error",
			message: "Failed to get simulation stats",
			errors: [{ code: "FETCH_ERROR", detail: toSafeErrorMessage(error, "getSimulationStats") }],
		}
	}
}

export const runSimulation = async (
	params: SimulationParams
): Promise<ActionResponse<MonteCarloResult>> => {
	try {
		await requireAuth()
		const validated = simulationParamsSchema.parse(params)
		const result = runMonteCarloSimulation(validated)

		return {
			status: "success",
			message: "Simulation completed",
			data: result,
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				status: "error",
				message: "Validation failed",
				errors: error.issues.map((e) => ({
					code: "VALIDATION_ERROR",
					detail: `${e.path.join(".")}: ${e.message}`,
				})),
			}
		}

		return {
			status: "error",
			message: "Failed to run simulation",
			errors: [{ code: "SIMULATION_ERROR", detail: toSafeErrorMessage(error, "runSimulation") }],
		}
	}
}

export const runComparisonSimulation = async (
	baseParams: Omit<SimulationParams, "winRate" | "rewardRiskRatio">
): Promise<
	ActionResponse<{
		results: StrategyComparisonResult[]
		recommendations: ComparisonRecommendation
	}>
> => {
	try {
		const { userId } = await requireAuth()

		const allStrategies = await db.query.strategies.findMany({
			where: and(
				eq(strategies.userId, userId),
				eq(strategies.isActive, true)
			),
		})

		const results: StrategyComparisonResult[] = []

		for (const strategy of allStrategies) {
			const statsResponse = await getSimulationStats({
				type: "strategy",
				strategyId: strategy.id,
			})
			if (statsResponse.status !== "success" || !statsResponse.data) continue

			const stats = statsResponse.data
			const params: SimulationParams = {
				...baseParams,
				winRate: stats.winRate,
				rewardRiskRatio: stats.avgRewardRiskRatio,
			}

			const simResult = runMonteCarloSimulation(params)

			results.push({
				strategyId: strategy.id,
				strategyName: strategy.name,
				tradesCount: stats.totalTrades,
				winRate: stats.winRate,
				rewardRiskRatio: stats.avgRewardRiskRatio,
				medianFinalR: simResult.statistics.medianFinalR,
				profitablePct: simResult.statistics.profitablePct,
				maxRDrawdown: simResult.statistics.medianMaxRDrawdown,
				sharpeRatio: simResult.statistics.sharpeRatio,
				rank: 0,
				result: simResult,
			})
		}

		const sortedResults = results.toSorted(
			(a, b) => b.profitablePct - a.profitablePct
		)
		for (let i = 0; i < sortedResults.length; i++) {
			sortedResults[i].rank = i + 1
		}

		const topPerformers = sortedResults
			.filter((r) => r.profitablePct >= 70)
			.map((r) => r.strategyName)
		const needsImprovement = sortedResults
			.filter((r) => r.profitablePct < 50)
			.map((r) => r.strategyName)
		const totalScore = sortedResults.reduce(
			(sum, r) => sum + Math.max(0, r.profitablePct - 30),
			0
		)
		const getAllocationReason = (pct: number): string => {
			if (pct >= 80) return "Excellent statistical robustness"
			if (pct >= 70) return "Good statistical performance"
			return "Moderate reliability"
		}

		const suggestedAllocations = sortedResults
			.filter((r) => r.profitablePct >= 50)
			.map((r) => {
				const score = Math.max(0, r.profitablePct - 30)
				return {
					strategyName: r.strategyName,
					allocationPct:
						totalScore > 0 ? Math.round((score / totalScore) * 100) : 0,
					reason: getAllocationReason(r.profitablePct),
				}
			})

		for (const strategyName of needsImprovement) {
			suggestedAllocations.push({
				strategyName,
				allocationPct: 0,
				reason: "Pause until improved",
			})
		}

		return {
			status: "success",
			message: "Comparison completed",
			data: {
				results: sortedResults,
				recommendations: {
					topPerformers,
					needsImprovement,
					suggestedAllocations,
				},
			},
		}
	} catch (error) {
		return {
			status: "error",
			message: "Failed to run comparison",
			errors: [{ code: "COMPARISON_ERROR", detail: toSafeErrorMessage(error, "runComparisonSimulation") }],
		}
	}
}

// ==========================================
// V2 — DAY-AWARE SIMULATION ACTIONS
// ==========================================

/**
 * Run V2 Monte Carlo simulation with a risk management profile.
 */
export const runSimulationV2 = async (
	params: SimulationParamsV2
): Promise<ActionResponse<MonteCarloResultV2>> => {
	try {
		await requireAuth()
		const validated = simulationParamsV2Schema.parse(params)
		const result = runMonteCarloV2(validated)

		return {
			status: "success",
			message: "V2 simulation completed",
			data: result,
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				status: "error",
				message: "Validation failed",
				errors: error.issues.map((e) => ({
					code: "VALIDATION_ERROR",
					detail: `${e.path.join(".")}: ${e.message}`,
				})),
			}
		}

		return {
			status: "error",
			message: "Failed to run V2 simulation",
			errors: [{ code: "SIMULATION_V2_ERROR", detail: toSafeErrorMessage(error, "runSimulationV2") }],
		}
	}
}
