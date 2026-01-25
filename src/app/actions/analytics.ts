"use server"

import { db } from "@/db/drizzle"
import { trades, settings } from "@/db/schema"
import { eq, and, gte, lte, desc, asc, sql, inArray } from "drizzle-orm"
import type {
	ActionResponse,
	OverallStats,
	DisciplineData,
	EquityPoint,
	DailyPnL,
	StreakData,
	PerformanceByGroup,
	ExpectedValueData,
	RDistributionBucket,
	TradeFilters,
} from "@/types"
import {
	calculateWinRate,
	calculateProfitFactor,
} from "@/lib/calculations"
import { getStartOfMonth, getEndOfMonth, formatDateKey } from "@/lib/dates"
import { fromCents } from "@/lib/money"

/**
 * Build filter conditions from TradeFilters
 */
const buildFilterConditions = (filters?: TradeFilters) => {
	const conditions = [eq(trades.isArchived, false)]

	if (filters?.dateFrom) {
		conditions.push(gte(trades.entryDate, filters.dateFrom))
	}
	if (filters?.dateTo) {
		conditions.push(lte(trades.entryDate, filters.dateTo))
	}
	if (filters?.assets && filters.assets.length > 0) {
		conditions.push(inArray(trades.asset, filters.assets))
	}
	if (filters?.directions && filters.directions.length > 0) {
		conditions.push(inArray(trades.direction, filters.directions))
	}
	if (filters?.outcomes && filters.outcomes.length > 0) {
		conditions.push(inArray(trades.outcome, filters.outcomes))
	}
	if (filters?.timeframeIds && filters.timeframeIds.length > 0) {
		conditions.push(inArray(trades.timeframeId, filters.timeframeIds))
	}

	return conditions
}

/**
 * Get overall trading statistics
 */
export const getOverallStats = async (
	dateFrom?: Date,
	dateTo?: Date
): Promise<ActionResponse<OverallStats>> => {
	try {
		const conditions = [eq(trades.isArchived, false)]

		if (dateFrom) {
			conditions.push(gte(trades.entryDate, dateFrom))
		}
		if (dateTo) {
			conditions.push(lte(trades.entryDate, dateTo))
		}

		const result = await db.query.trades.findMany({
			where: and(...conditions),
		})

		if (result.length === 0) {
			return {
				status: "success",
				message: "No trades found",
				data: {
					netPnl: 0,
					winRate: 0,
					profitFactor: 0,
					averageR: 0,
					totalTrades: 0,
					winCount: 0,
					lossCount: 0,
					avgWin: 0,
					avgLoss: 0,
				},
			}
		}

		// Calculate stats from trades
		let totalPnl = 0
		let totalR = 0
		let rCount = 0
		let winCount = 0
		let lossCount = 0
		let grossProfit = 0
		let grossLoss = 0
		const wins: number[] = []
		const losses: number[] = []

		for (const trade of result) {
			const pnl = fromCents(trade.pnl)
			totalPnl += pnl

			if (trade.realizedRMultiple) {
				totalR += Number(trade.realizedRMultiple)
				rCount++
			}

			if (trade.outcome === "win") {
				winCount++
				grossProfit += pnl
				wins.push(pnl)
			} else if (trade.outcome === "loss") {
				lossCount++
				grossLoss += Math.abs(pnl)
				losses.push(Math.abs(pnl))
			}
		}

		const totalTrades = result.length
		const winRate = calculateWinRate(winCount, winCount + lossCount)
		const profitFactor = calculateProfitFactor(grossProfit, grossLoss)
		const averageR = rCount > 0 ? totalR / rCount : 0
		const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
		const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0

		return {
			status: "success",
			message: "Stats retrieved",
			data: {
				netPnl: totalPnl,
				winRate,
				profitFactor,
				averageR,
				totalTrades,
				winCount,
				lossCount,
				avgWin,
				avgLoss,
			},
		}
	} catch (error) {
		console.error("Get overall stats error:", error)
		return {
			status: "error",
			message: "Failed to retrieve stats",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get discipline/compliance score
 */
export const getDisciplineScore = async (
	dateFrom?: Date,
	dateTo?: Date
): Promise<ActionResponse<DisciplineData>> => {
	try {
		const conditions = [eq(trades.isArchived, false)]

		if (dateFrom) {
			conditions.push(gte(trades.entryDate, dateFrom))
		}
		if (dateTo) {
			conditions.push(lte(trades.entryDate, dateTo))
		}

		const result = await db.query.trades.findMany({
			where: and(...conditions),
			orderBy: [desc(trades.entryDate)],
		})

		const tradesWithPlanData = result.filter((t) => t.followedPlan !== null)
		const followedCount = tradesWithPlanData.filter((t) => t.followedPlan === true).length
		const totalTrades = tradesWithPlanData.length
		const score = totalTrades > 0 ? (followedCount / totalTrades) * 100 : 0

		// Calculate recent compliance (last 10 trades)
		const recentTrades = tradesWithPlanData.slice(0, 10)
		const recentFollowed = recentTrades.filter((t) => t.followedPlan === true).length
		const recentCompliance = recentTrades.length > 0 ? (recentFollowed / recentTrades.length) * 100 : 0

		// Determine trend
		let trend: "up" | "down" | "stable" = "stable"
		if (recentTrades.length >= 5 && totalTrades >= 10) {
			const olderTrades = tradesWithPlanData.slice(10, 20)
			const olderFollowed = olderTrades.filter((t) => t.followedPlan === true).length
			const olderCompliance = olderTrades.length > 0 ? (olderFollowed / olderTrades.length) * 100 : 0

			if (recentCompliance > olderCompliance + 5) {
				trend = "up"
			} else if (recentCompliance < olderCompliance - 5) {
				trend = "down"
			}
		}

		return {
			status: "success",
			message: "Discipline score retrieved",
			data: {
				score,
				totalTrades,
				followedCount,
				trend,
				recentCompliance,
			},
		}
	} catch (error) {
		console.error("Get discipline score error:", error)
		return {
			status: "error",
			message: "Failed to retrieve discipline score",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

export type EquityCurveMode = "daily" | "trade"

/**
 * Get equity curve data
 * Returns both cumulative P&L (equity) and actual account value (accountEquity)
 * mode: "daily" - aggregated by day (default), "trade" - per trade
 */
export const getEquityCurve = async (
	dateFrom?: Date,
	dateTo?: Date,
	mode: EquityCurveMode = "daily"
): Promise<ActionResponse<EquityPoint[]>> => {
	try {
		// Get account balance from settings
		const accountBalanceSetting = await db.query.settings.findFirst({
			where: eq(settings.key, "account_balance"),
		})
		const initialBalance = accountBalanceSetting
			? Number(accountBalanceSetting.value) || 10000
			: 10000

		const conditions = [eq(trades.isArchived, false)]

		if (dateFrom) {
			conditions.push(gte(trades.entryDate, dateFrom))
		}
		if (dateTo) {
			conditions.push(lte(trades.entryDate, dateTo))
		}

		const result = await db.query.trades.findMany({
			where: and(...conditions),
			orderBy: [asc(trades.entryDate)],
		})

		if (result.length === 0) {
			return {
				status: "success",
				message: "No trades found",
				data: [],
			}
		}

		const equityPoints: EquityPoint[] = []

		if (mode === "trade") {
			// Per-trade equity curve
			let cumulativePnL = 0
			let peak = initialBalance

			for (let i = 0; i < result.length; i++) {
				const trade = result[i]
				const pnl = fromCents(trade.pnl)
				cumulativePnL += pnl
				const accountEquity = initialBalance + cumulativePnL

				if (accountEquity > peak) {
					peak = accountEquity
				}

				const drawdown = peak > 0 ? ((peak - accountEquity) / peak) * 100 : 0

				equityPoints.push({
					date: formatDateKey(trade.entryDate),
					equity: cumulativePnL,
					accountEquity,
					drawdown,
					tradeNumber: i + 1,
				})
			}
		} else {
			// Daily aggregated equity curve
			const dailyPnlMap = new Map<string, number>()
			for (const trade of result) {
				const dateKey = formatDateKey(trade.entryDate)
				const pnl = fromCents(trade.pnl)
				const existing = dailyPnlMap.get(dateKey) || 0
				dailyPnlMap.set(dateKey, existing + pnl)
			}

			const sortedDates = Array.from(dailyPnlMap.keys()).sort()

			let cumulativePnL = 0
			let peak = initialBalance

			for (const date of sortedDates) {
				const dailyPnl = dailyPnlMap.get(date) || 0
				cumulativePnL += dailyPnl
				const accountEquity = initialBalance + cumulativePnL

				if (accountEquity > peak) {
					peak = accountEquity
				}

				const drawdown = peak > 0 ? ((peak - accountEquity) / peak) * 100 : 0

				equityPoints.push({
					date,
					equity: cumulativePnL,
					accountEquity,
					drawdown,
				})
			}
		}

		return {
			status: "success",
			message: "Equity curve retrieved",
			data: equityPoints,
		}
	} catch (error) {
		console.error("Get equity curve error:", error)
		return {
			status: "error",
			message: "Failed to retrieve equity curve",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get daily P&L for calendar
 */
export const getDailyPnL = async (
	month: Date
): Promise<ActionResponse<DailyPnL[]>> => {
	try {
		const startOfMonth = getStartOfMonth(month)
		const endOfMonth = getEndOfMonth(month)

		const result = await db.query.trades.findMany({
			where: and(
				eq(trades.isArchived, false),
				gte(trades.entryDate, startOfMonth),
				lte(trades.entryDate, endOfMonth)
			),
			orderBy: [asc(trades.entryDate)],
		})

		// Group by date using local timezone
		const dailyMap = new Map<string, { pnl: number; count: number }>()

		for (const trade of result) {
			const dateKey = formatDateKey(trade.entryDate)
			const existing = dailyMap.get(dateKey) || { pnl: 0, count: 0 }
			existing.pnl += fromCents(trade.pnl)
			existing.count++
			dailyMap.set(dateKey, existing)
		}

		const dailyPnL: DailyPnL[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
			date,
			pnl: data.pnl,
			tradeCount: data.count,
		}))

		return {
			status: "success",
			message: "Daily P&L retrieved",
			data: dailyPnL,
		}
	} catch (error) {
		console.error("Get daily P&L error:", error)
		return {
			status: "error",
			message: "Failed to retrieve daily P&L",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get streak data
 */
export const getStreakData = async (
	dateFrom?: Date,
	dateTo?: Date
): Promise<ActionResponse<StreakData>> => {
	try {
		const conditions = [eq(trades.isArchived, false)]

		if (dateFrom) {
			conditions.push(gte(trades.entryDate, dateFrom))
		}
		if (dateTo) {
			conditions.push(lte(trades.entryDate, dateTo))
		}

		const result = await db.query.trades.findMany({
			where: and(...conditions),
			orderBy: [desc(trades.entryDate)],
		})

		if (result.length === 0) {
			return {
				status: "success",
				message: "No trades found",
				data: {
					currentStreak: 0,
					currentStreakType: "none",
					longestWinStreak: 0,
					longestLossStreak: 0,
					bestDay: null,
					worstDay: null,
				},
			}
		}

		// Calculate current streak
		let currentStreak = 0
		let currentStreakType: "win" | "loss" | "none" = "none"

		if (result.length > 0 && result[0].outcome) {
			currentStreakType = result[0].outcome === "win" ? "win" : result[0].outcome === "loss" ? "loss" : "none"
			for (const trade of result) {
				if (currentStreakType === "win" && trade.outcome === "win") {
					currentStreak++
				} else if (currentStreakType === "loss" && trade.outcome === "loss") {
					currentStreak++
				} else {
					break
				}
			}
		}

		// Calculate longest streaks (oldest to newest)
		const sortedTrades = [...result].reverse()
		let longestWinStreak = 0
		let longestLossStreak = 0
		let tempWinStreak = 0
		let tempLossStreak = 0

		for (const trade of sortedTrades) {
			if (trade.outcome === "win") {
				tempWinStreak++
				tempLossStreak = 0
				longestWinStreak = Math.max(longestWinStreak, tempWinStreak)
			} else if (trade.outcome === "loss") {
				tempLossStreak++
				tempWinStreak = 0
				longestLossStreak = Math.max(longestLossStreak, tempLossStreak)
			} else {
				tempWinStreak = 0
				tempLossStreak = 0
			}
		}

		// Calculate best and worst days using local timezone
		const dailyMap = new Map<string, number>()
		for (const trade of result) {
			const dateKey = formatDateKey(trade.entryDate)
			const existing = dailyMap.get(dateKey) || 0
			dailyMap.set(dateKey, existing + (fromCents(trade.pnl)))
		}

		let bestDay: { date: string; pnl: number } | null = null
		let worstDay: { date: string; pnl: number } | null = null

		for (const [date, pnl] of dailyMap) {
			if (!bestDay || pnl > bestDay.pnl) {
				bestDay = { date, pnl }
			}
			if (!worstDay || pnl < worstDay.pnl) {
				worstDay = { date, pnl }
			}
		}

		return {
			status: "success",
			message: "Streak data retrieved",
			data: {
				currentStreak,
				currentStreakType,
				longestWinStreak,
				longestLossStreak,
				bestDay,
				worstDay,
			},
		}
	} catch (error) {
		console.error("Get streak data error:", error)
		return {
			status: "error",
			message: "Failed to retrieve streak data",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get performance grouped by variable
 */
export const getPerformanceByVariable = async (
	groupBy: "asset" | "timeframe" | "hour" | "dayOfWeek" | "strategy",
	filters?: TradeFilters
): Promise<ActionResponse<PerformanceByGroup[]>> => {
	try {
		const conditions = buildFilterConditions(filters)

		const result = await db.query.trades.findMany({
			where: and(...conditions),
			with: {
				strategy: true,
				timeframe: true,
			},
		})

		if (result.length === 0) {
			return {
				status: "success",
				message: "No trades found",
				data: [],
			}
		}

		// Group trades by the specified variable
		const groups = new Map<
			string,
			{
				trades: typeof result
				pnl: number
				winCount: number
				lossCount: number
				totalR: number
				rCount: number
				grossProfit: number
				grossLoss: number
			}
		>()

		for (const trade of result) {
			let groupKey: string

			switch (groupBy) {
				case "asset":
					groupKey = trade.asset
					break
				case "timeframe":
					groupKey = trade.timeframe?.name || "Unknown"
					break
				case "hour": {
					const hour = trade.entryDate.getHours()
					groupKey = `${hour.toString().padStart(2, "0")}:00`
					break
				}
				case "dayOfWeek": {
					const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
					groupKey = days[trade.entryDate.getDay()]
					break
				}
				case "strategy":
					groupKey = trade.strategy?.name || "No Strategy"
					break
				default:
					groupKey = "Unknown"
			}

			const existing = groups.get(groupKey) || {
				trades: [],
				pnl: 0,
				winCount: 0,
				lossCount: 0,
				totalR: 0,
				rCount: 0,
				grossProfit: 0,
				grossLoss: 0,
			}

			const pnl = fromCents(trade.pnl)
			existing.trades.push(trade)
			existing.pnl += pnl

			if (trade.outcome === "win") {
				existing.winCount++
				existing.grossProfit += pnl
			} else if (trade.outcome === "loss") {
				existing.lossCount++
				existing.grossLoss += Math.abs(pnl)
			}

			if (trade.realizedRMultiple) {
				existing.totalR += Number(trade.realizedRMultiple)
				existing.rCount++
			}

			groups.set(groupKey, existing)
		}

		// Convert to array and calculate final stats
		const performanceData: PerformanceByGroup[] = Array.from(groups.entries())
			.map(([group, data]) => ({
				group,
				tradeCount: data.trades.length,
				pnl: data.pnl,
				winRate: calculateWinRate(data.winCount, data.winCount + data.lossCount),
				avgR: data.rCount > 0 ? data.totalR / data.rCount : 0,
				profitFactor: calculateProfitFactor(data.grossProfit, data.grossLoss),
			}))
			.sort((a, b) => b.pnl - a.pnl)

		return {
			status: "success",
			message: "Performance data retrieved",
			data: performanceData,
		}
	} catch (error) {
		console.error("Get performance by variable error:", error)
		return {
			status: "error",
			message: "Failed to retrieve performance data",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get expected value calculation
 */
export const getExpectedValue = async (
	filters?: TradeFilters
): Promise<ActionResponse<ExpectedValueData>> => {
	try {
		const conditions = buildFilterConditions(filters)

		const result = await db.query.trades.findMany({
			where: and(...conditions),
		})

		const tradesWithOutcome = result.filter((t) => t.outcome === "win" || t.outcome === "loss")

		if (tradesWithOutcome.length === 0) {
			return {
				status: "success",
				message: "No completed trades found",
				data: {
					winRate: 0,
					avgWin: 0,
					avgLoss: 0,
					expectedValue: 0,
					projectedPnl100: 0,
					sampleSize: 0,
				},
			}
		}

		const wins: number[] = []
		const losses: number[] = []

		for (const trade of tradesWithOutcome) {
			const pnl = fromCents(trade.pnl)
			if (trade.outcome === "win") {
				wins.push(pnl)
			} else if (trade.outcome === "loss") {
				losses.push(Math.abs(pnl))
			}
		}

		const winRate = wins.length / tradesWithOutcome.length
		const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
		const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0

		// EV = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
		const expectedValue = winRate * avgWin - (1 - winRate) * avgLoss

		// Project over 100 trades
		const projectedPnl100 = expectedValue * 100

		return {
			status: "success",
			message: "Expected value calculated",
			data: {
				winRate: winRate * 100,
				avgWin,
				avgLoss,
				expectedValue,
				projectedPnl100,
				sampleSize: tradesWithOutcome.length,
			},
		}
	} catch (error) {
		console.error("Get expected value error:", error)
		return {
			status: "error",
			message: "Failed to calculate expected value",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get R-multiple distribution for histogram
 */
export const getRDistribution = async (
	filters?: TradeFilters
): Promise<ActionResponse<RDistributionBucket[]>> => {
	try {
		const conditions = buildFilterConditions(filters)

		const result = await db.query.trades.findMany({
			where: and(...conditions),
		})

		// Filter trades with R-multiple data
		const tradesWithR = result.filter((t) => t.realizedRMultiple !== null)

		if (tradesWithR.length === 0) {
			return {
				status: "success",
				message: "No trades with R-multiple data",
				data: [],
			}
		}

		// Define buckets: -3R to +4R in 0.5R increments
		const buckets: RDistributionBucket[] = [
			{ range: "< -2R", rangeMin: -Infinity, rangeMax: -2, count: 0, pnl: 0 },
			{ range: "-2R to -1.5R", rangeMin: -2, rangeMax: -1.5, count: 0, pnl: 0 },
			{ range: "-1.5R to -1R", rangeMin: -1.5, rangeMax: -1, count: 0, pnl: 0 },
			{ range: "-1R to -0.5R", rangeMin: -1, rangeMax: -0.5, count: 0, pnl: 0 },
			{ range: "-0.5R to 0R", rangeMin: -0.5, rangeMax: 0, count: 0, pnl: 0 },
			{ range: "0R to 0.5R", rangeMin: 0, rangeMax: 0.5, count: 0, pnl: 0 },
			{ range: "0.5R to 1R", rangeMin: 0.5, rangeMax: 1, count: 0, pnl: 0 },
			{ range: "1R to 1.5R", rangeMin: 1, rangeMax: 1.5, count: 0, pnl: 0 },
			{ range: "1.5R to 2R", rangeMin: 1.5, rangeMax: 2, count: 0, pnl: 0 },
			{ range: "2R to 3R", rangeMin: 2, rangeMax: 3, count: 0, pnl: 0 },
			{ range: "> 3R", rangeMin: 3, rangeMax: Infinity, count: 0, pnl: 0 },
		]

		for (const trade of tradesWithR) {
			const r = Number(trade.realizedRMultiple)
			const pnl = fromCents(trade.pnl)

			for (const bucket of buckets) {
				if (r >= bucket.rangeMin && r < bucket.rangeMax) {
					bucket.count++
					bucket.pnl += pnl
					break
				}
			}
		}

		// Filter out empty buckets at the extremes
		const nonEmptyBuckets = buckets.filter((b) => b.count > 0)

		return {
			status: "success",
			message: "R-distribution calculated",
			data: nonEmptyBuckets.length > 0 ? nonEmptyBuckets : buckets.filter((b) => b.rangeMin >= -2 && b.rangeMax <= 3),
		}
	} catch (error) {
		console.error("Get R-distribution error:", error)
		return {
			status: "error",
			message: "Failed to calculate R-distribution",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}
