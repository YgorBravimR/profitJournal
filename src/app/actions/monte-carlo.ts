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
} from "@/types/monte-carlo"
import { eq, and, inArray, isNotNull, desc } from "drizzle-orm"
import { z } from "zod"
import {
	simulationParamsSchema,
	dataSourceSchema,
} from "@/lib/validations/monte-carlo"
import { runMonteCarloSimulation } from "@/lib/monte-carlo"
import { requireAuth } from "@/app/actions/auth"

export const getDataSourceOptions = async (): Promise<
	ActionResponse<DataSourceOption[]>
> => {
	try {
		const { accountId, showAllAccounts, allAccountIds } = await requireAuth()

		const options: DataSourceOption[] = []

		// Get strategies for current account
		const accountStrategies = await db.query.strategies.findMany({
			where: and(
				eq(strategies.accountId, accountId),
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
			errors: [{ code: "FETCH_ERROR", detail: String(error) }],
		}
	}
}

export const getSimulationStats = async (
	source: DataSource
): Promise<ActionResponse<SourceStats>> => {
	try {
		const validated = dataSourceSchema.parse(source)
		const { accountId, showAllAccounts, allAccountIds } = await requireAuth()

		let tradesList: Array<{
			outcome: string | null
			realizedRMultiple: string | null
			plannedRiskAmount: number | null
			commission: number | null
			fees: number | null
			strategyId: string | null
			entryDate: Date
		}> = []
		let sourceName = ""
		let strategiesCount = 0
		let accountsCount = 1

		if (validated.type === "strategy") {
			const strategy = await db.query.strategies.findFirst({
				where: eq(strategies.id, validated.strategyId),
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

			tradesList = await db.query.trades.findMany({
				where: and(
					eq(trades.strategyId, validated.strategyId),
					isNotNull(trades.outcome)
				),
				orderBy: [desc(trades.entryDate)],
				columns: {
					outcome: true,
					realizedRMultiple: true,
					plannedRiskAmount: true,
					commission: true,
					fees: true,
					strategyId: true,
					entryDate: true,
				},
			})
		} else if (validated.type === "all_strategies") {
			sourceName = "All Strategies"

			const accountStrategies = await db.query.strategies.findMany({
				where: eq(strategies.accountId, accountId),
			})
			strategiesCount = accountStrategies.length

			tradesList = await db.query.trades.findMany({
				where: and(eq(trades.accountId, accountId), isNotNull(trades.outcome)),
				orderBy: [desc(trades.entryDate)],
				columns: {
					outcome: true,
					realizedRMultiple: true,
					plannedRiskAmount: true,
					commission: true,
					fees: true,
					strategyId: true,
					entryDate: true,
				},
			})
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
				where: inArray(strategies.accountId, allAccountIds),
			})
			strategiesCount = allStrategies.length

			tradesList = await db.query.trades.findMany({
				where: and(
					inArray(trades.accountId, allAccountIds),
					isNotNull(trades.outcome)
				),
				orderBy: [desc(trades.entryDate)],
				columns: {
					outcome: true,
					realizedRMultiple: true,
					plannedRiskAmount: true,
					commission: true,
					fees: true,
					strategyId: true,
					entryDate: true,
				},
			})
		}

		if (tradesList.length === 0) {
			return {
				status: "error",
				message: `No trades found for ${sourceName}`,
				errors: [{ code: "NO_TRADES", detail: "No completed trades found" }],
			}
		}

		const wins = tradesList.filter((t) => t.outcome === "win")
		const winRate = (wins.length / tradesList.length) * 100

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
			(sum, t) => sum + (t.commission || 0) + (t.fees || 0),
			0
		)
		const totalRisk = tradesList.reduce(
			(sum, t) => sum + (t.plannedRiskAmount || 0),
			0
		)
		const avgCommissionImpact =
			totalRisk > 0 ? (totalCommission / totalRisk) * 100 : 0

		const grossProfit = winningR.reduce((sum, r) => sum + r, 0)
		const grossLoss = losingR.reduce((sum, r) => sum + r, 0)
		const profitFactor =
			grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

		const allR = tradesWithR.map((t) => parseFloat(t.realizedRMultiple!))
		const avgR =
			allR.length > 0 ? allR.reduce((a, b) => a + b, 0) / allR.length : 0

		let strategiesBreakdown: SourceStats["strategiesBreakdown"]
		if (validated.type !== "strategy") {
			const breakdown = new Map<
				string,
				{ name: string; tradesCount: number; wins: number }
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
					breakdown.set(name, { name, tradesCount: 0, wins: 0 })
				}
				const entry = breakdown.get(name)!
				entry.tradesCount++
				if (trade.outcome === "win") entry.wins++
			}

			strategiesBreakdown = Array.from(breakdown.values()).map((s) => ({
				name: s.name,
				tradesCount: s.tradesCount,
				winRate: (s.wins / s.tradesCount) * 100,
			}))
		}

		const dates = tradesList.map((t) => new Date(t.entryDate))
		const dateRange = {
			from: new Date(Math.min(...dates.map((d) => d.getTime()))),
			to: new Date(Math.max(...dates.map((d) => d.getTime()))),
		}

		return {
			status: "success",
			message: "Stats retrieved",
			data: {
				sourceType: validated.type,
				sourceName,
				totalTrades: tradesList.length,
				winRate: Math.round(winRate * 100) / 100,
				avgRewardRiskRatio: Math.round(avgRewardRiskRatio * 100) / 100,
				avgRiskPerTrade: 1, // Default - would need account balance history for accurate %
				avgCommissionImpact: Math.round(avgCommissionImpact * 100) / 100,
				dateRange,
				profitFactor: Math.round(profitFactor * 100) / 100,
				avgR: Math.round(avgR * 100) / 100,
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
			errors: [{ code: "FETCH_ERROR", detail: String(error) }],
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
			errors: [{ code: "SIMULATION_ERROR", detail: String(error) }],
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
		const { accountId, showAllAccounts, allAccountIds } = await requireAuth()

		const strategyIds = showAllAccounts ? allAccountIds : [accountId]
		const allStrategies = await db.query.strategies.findMany({
			where: and(
				inArray(strategies.accountId, strategyIds),
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
				medianReturn: simResult.statistics.medianReturn,
				profitablePct: simResult.statistics.profitablePct,
				maxDrawdown: simResult.statistics.medianMaxDrawdown,
				sharpeRatio: simResult.statistics.sharpeRatio,
				rank: 0, // Will be calculated below
				result: simResult,
			})
		}

		results.sort((a, b) => b.profitablePct - a.profitablePct)
		results.forEach((r, i) => (r.rank = i + 1))

		const topPerformers = results
			.filter((r) => r.profitablePct >= 70)
			.map((r) => r.strategyName)
		const needsImprovement = results
			.filter((r) => r.profitablePct < 50)
			.map((r) => r.strategyName)
		const totalScore = results.reduce(
			(sum, r) => sum + Math.max(0, r.profitablePct - 30),
			0
		)
		const getAllocationReason = (pct: number): string => {
			if (pct >= 80) return "Excellent statistical robustness"
			if (pct >= 70) return "Good statistical performance"
			return "Moderate reliability"
		}

		const suggestedAllocations = results
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
				results,
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
			errors: [{ code: "COMPARISON_ERROR", detail: String(error) }],
		}
	}
}
