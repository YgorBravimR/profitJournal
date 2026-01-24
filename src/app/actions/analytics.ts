"use server"

import { db } from "@/db/drizzle"
import { trades } from "@/db/schema"
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm"
import type {
	ActionResponse,
	OverallStats,
	DisciplineData,
	EquityPoint,
	DailyPnL,
	StreakData,
} from "@/types"
import {
	calculateWinRate,
	calculateProfitFactor,
} from "@/lib/calculations"
import { getStartOfMonth, getEndOfMonth, formatDateKey } from "@/lib/dates"

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
			const pnl = Number(trade.pnl) || 0
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

/**
 * Get equity curve data
 */
export const getEquityCurve = async (
	dateFrom?: Date,
	dateTo?: Date
): Promise<ActionResponse<EquityPoint[]>> => {
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
			orderBy: [asc(trades.entryDate)],
		})

		if (result.length === 0) {
			return {
				status: "success",
				message: "No trades found",
				data: [],
			}
		}

		// Build equity curve
		let cumulativeEquity = 0
		let peak = 0
		const equityPoints: EquityPoint[] = []

		for (const trade of result) {
			const pnl = Number(trade.pnl) || 0
			cumulativeEquity += pnl

			if (cumulativeEquity > peak) {
				peak = cumulativeEquity
			}

			const drawdown = peak > 0 ? ((peak - cumulativeEquity) / peak) * 100 : 0

			equityPoints.push({
				date: formatDateKey(trade.entryDate),
				equity: cumulativeEquity,
				drawdown,
			})
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
			existing.pnl += Number(trade.pnl) || 0
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
			dailyMap.set(dateKey, existing + (Number(trade.pnl) || 0))
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
 * Implementation in Phase 4
 */
export const getPerformanceByVariable = async (
	_groupBy: "asset" | "timeframe" | "hour" | "dayOfWeek" | "strategy",
	_dateFrom?: Date,
	_dateTo?: Date
): Promise<
	ActionResponse<
		Array<{
			group: string
			tradeCount: number
			pnl: number
			winRate: number
			avgR: number
		}>
	>
> => {
	return {
		status: "success",
		message: "Performance data retrieved",
		data: [],
	}
}

/**
 * Get expected value calculation
 * Implementation in Phase 4
 */
export const getExpectedValue = async (
	_dateFrom?: Date,
	_dateTo?: Date
): Promise<
	ActionResponse<{
		winRate: number
		avgWin: number
		avgLoss: number
		expectedValue: number
		projectedPnl100: number
	}>
> => {
	return {
		status: "success",
		message: "Expected value calculated",
		data: {
			winRate: 0,
			avgWin: 0,
			avgLoss: 0,
			expectedValue: 0,
			projectedPnl100: 0,
		},
	}
}
