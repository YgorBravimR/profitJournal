"use server"

import { db } from "@/db/drizzle"
import { trades, tags, tradeTags } from "@/db/schema"
import { eq, and, gte, lte, desc, sql, inArray } from "drizzle-orm"
import {
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	format,
	subWeeks,
	subMonths,
} from "date-fns"
import { fromCents } from "@/lib/money"

// ============================================================================
// TYPES
// ============================================================================

export interface DailyBreakdown {
	date: string
	tradeCount: number
	winCount: number
	lossCount: number
	pnl: number
	winRate: number
}

export interface WeeklyReport {
	weekStart: string
	weekEnd: string
	summary: {
		totalTrades: number
		winCount: number
		lossCount: number
		breakevenCount: number
		netPnl: number
		winRate: number
		avgWin: number
		avgLoss: number
		profitFactor: number
		avgR: number
		bestTrade: number
		worstTrade: number
	}
	dailyBreakdown: DailyBreakdown[]
	topWins: Array<{
		id: string
		asset: string
		pnl: number
		r: number | null
		direction: string
		date: string
	}>
	topLosses: Array<{
		id: string
		asset: string
		pnl: number
		r: number | null
		direction: string
		date: string
	}>
}

export interface MonthlyReport {
	monthStart: string
	monthEnd: string
	summary: {
		totalTrades: number
		winCount: number
		lossCount: number
		breakevenCount: number
		netPnl: number
		winRate: number
		avgWin: number
		avgLoss: number
		profitFactor: number
		avgR: number
		bestDay: { date: string; pnl: number } | null
		worstDay: { date: string; pnl: number } | null
	}
	weeklyBreakdown: Array<{
		weekStart: string
		weekEnd: string
		tradeCount: number
		pnl: number
		winRate: number
	}>
	assetBreakdown: Array<{
		asset: string
		tradeCount: number
		pnl: number
		winRate: number
	}>
}

export interface MistakeCostAnalysis {
	mistakes: Array<{
		tagId: string
		tagName: string
		color: string | null
		tradeCount: number
		totalLoss: number
		avgLoss: number
	}>
	totalMistakeCost: number
	mostCostlyMistake: string | null
}

// ============================================================================
// WEEKLY REPORT
// ============================================================================

export const getWeeklyReport = async (
	weekOffset = 0
): Promise<{ status: "success" | "error"; data?: WeeklyReport; message?: string }> => {
	try {
		const referenceDate = subWeeks(new Date(), weekOffset)
		const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
		const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 })

		const weekTrades = await db.query.trades.findMany({
			where: and(
				eq(trades.isArchived, false),
				gte(trades.entryDate, weekStart),
				lte(trades.entryDate, weekEnd)
			),
			orderBy: [desc(trades.entryDate)],
		})

		if (weekTrades.length === 0) {
			return {
				status: "success",
				data: {
					weekStart: format(weekStart, "yyyy-MM-dd"),
					weekEnd: format(weekEnd, "yyyy-MM-dd"),
					summary: {
						totalTrades: 0,
						winCount: 0,
						lossCount: 0,
						breakevenCount: 0,
						netPnl: 0,
						winRate: 0,
						avgWin: 0,
						avgLoss: 0,
						profitFactor: 0,
						avgR: 0,
						bestTrade: 0,
						worstTrade: 0,
					},
					dailyBreakdown: [],
					topWins: [],
					topLosses: [],
				},
			}
		}

		// Calculate summary
		const winTrades = weekTrades.filter((t) => t.outcome === "win")
		const lossTrades = weekTrades.filter((t) => t.outcome === "loss")
		const breakevenTrades = weekTrades.filter((t) => t.outcome === "breakeven")

		const netPnl = weekTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0)
		const grossProfit = winTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0)
		const grossLoss = Math.abs(
			lossTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0)
		)
		const avgWin =
			winTrades.length > 0
				? winTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0) /
					winTrades.length
				: 0
		const avgLoss =
			lossTrades.length > 0
				? lossTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0) /
					lossTrades.length
				: 0
		const avgR =
			weekTrades.filter((t) => t.realizedRMultiple).length > 0
				? weekTrades
						.filter((t) => t.realizedRMultiple)
						.reduce(
							(sum, t) =>
								sum + (t.realizedRMultiple ? parseFloat(t.realizedRMultiple) : 0),
							0
						) / weekTrades.filter((t) => t.realizedRMultiple).length
				: 0

		const pnlValues = weekTrades.map((t) => fromCents(t.pnl)).filter((p) => p !== 0)

		// Daily breakdown
		const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
		const dailyBreakdown: DailyBreakdown[] = days.map((day) => {
			const dayTrades = weekTrades.filter(
				(t) =>
					format(new Date(t.entryDate), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
			)
			const dayWins = dayTrades.filter((t) => t.outcome === "win").length
			const dayPnl = dayTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0)
			return {
				date: format(day, "yyyy-MM-dd"),
				tradeCount: dayTrades.length,
				winCount: dayWins,
				lossCount: dayTrades.filter((t) => t.outcome === "loss").length,
				pnl: dayPnl,
				winRate: dayTrades.length > 0 ? (dayWins / dayTrades.length) * 100 : 0,
			}
		})

		// Top wins/losses - pnl is stored in cents, convert to dollars
		const sortedByPnl = [...weekTrades]
			.filter((t) => t.pnl)
			.sort((a, b) => fromCents(b.pnl) - fromCents(a.pnl))

		const topWins = sortedByPnl
			.filter((t) => fromCents(t.pnl) > 0)
			.slice(0, 3)
			.map((t) => ({
				id: t.id,
				asset: t.asset,
				pnl: fromCents(t.pnl),
				r: t.realizedRMultiple ? parseFloat(t.realizedRMultiple) : null,
				direction: t.direction,
				date: format(new Date(t.entryDate), "yyyy-MM-dd"),
			}))

		const topLosses = sortedByPnl
			.filter((t) => fromCents(t.pnl) < 0)
			.slice(-3)
			.reverse()
			.map((t) => ({
				id: t.id,
				asset: t.asset,
				pnl: fromCents(t.pnl),
				r: t.realizedRMultiple ? parseFloat(t.realizedRMultiple) : null,
				direction: t.direction,
				date: format(new Date(t.entryDate), "yyyy-MM-dd"),
			}))

		return {
			status: "success",
			data: {
				weekStart: format(weekStart, "yyyy-MM-dd"),
				weekEnd: format(weekEnd, "yyyy-MM-dd"),
				summary: {
					totalTrades: weekTrades.length,
					winCount: winTrades.length,
					lossCount: lossTrades.length,
					breakevenCount: breakevenTrades.length,
					netPnl,
					winRate:
						weekTrades.length > 0
							? (winTrades.length / weekTrades.length) * 100
							: 0,
					avgWin,
					avgLoss,
					profitFactor: grossLoss > 0 ? grossProfit / grossLoss : 0,
					avgR,
					bestTrade: pnlValues.length > 0 ? Math.max(...pnlValues) : 0,
					worstTrade: pnlValues.length > 0 ? Math.min(...pnlValues) : 0,
				},
				dailyBreakdown,
				topWins,
				topLosses,
			},
		}
	} catch (error) {
		console.error("Error fetching weekly report:", error)
		return { status: "error", message: "Failed to fetch weekly report" }
	}
}

// ============================================================================
// MONTHLY REPORT
// ============================================================================

export const getMonthlyReport = async (
	monthOffset = 0
): Promise<{ status: "success" | "error"; data?: MonthlyReport; message?: string }> => {
	try {
		const referenceDate = subMonths(new Date(), monthOffset)
		const monthStart = startOfMonth(referenceDate)
		const monthEnd = endOfMonth(referenceDate)

		const monthTrades = await db.query.trades.findMany({
			where: and(
				eq(trades.isArchived, false),
				gte(trades.entryDate, monthStart),
				lte(trades.entryDate, monthEnd)
			),
			orderBy: [desc(trades.entryDate)],
		})

		if (monthTrades.length === 0) {
			return {
				status: "success",
				data: {
					monthStart: format(monthStart, "yyyy-MM-dd"),
					monthEnd: format(monthEnd, "yyyy-MM-dd"),
					summary: {
						totalTrades: 0,
						winCount: 0,
						lossCount: 0,
						breakevenCount: 0,
						netPnl: 0,
						winRate: 0,
						avgWin: 0,
						avgLoss: 0,
						profitFactor: 0,
						avgR: 0,
						bestDay: null,
						worstDay: null,
					},
					weeklyBreakdown: [],
					assetBreakdown: [],
				},
			}
		}

		// Calculate summary
		const winTrades = monthTrades.filter((t) => t.outcome === "win")
		const lossTrades = monthTrades.filter((t) => t.outcome === "loss")
		const breakevenTrades = monthTrades.filter((t) => t.outcome === "breakeven")

		const netPnl = monthTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0)
		const grossProfit = winTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0)
		const grossLoss = Math.abs(
			lossTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0)
		)
		const avgWin =
			winTrades.length > 0
				? winTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0) /
					winTrades.length
				: 0
		const avgLoss =
			lossTrades.length > 0
				? lossTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0) /
					lossTrades.length
				: 0
		const avgR =
			monthTrades.filter((t) => t.realizedRMultiple).length > 0
				? monthTrades
						.filter((t) => t.realizedRMultiple)
						.reduce(
							(sum, t) =>
								sum + (t.realizedRMultiple ? parseFloat(t.realizedRMultiple) : 0),
							0
						) / monthTrades.filter((t) => t.realizedRMultiple).length
				: 0

		// Daily P&L for best/worst day
		const dailyPnl = new Map<string, number>()
		for (const trade of monthTrades) {
			const day = format(new Date(trade.entryDate), "yyyy-MM-dd")
			const currentPnl = dailyPnl.get(day) || 0
			dailyPnl.set(day, currentPnl + (fromCents(trade.pnl)))
		}

		let bestDay: { date: string; pnl: number } | null = null
		let worstDay: { date: string; pnl: number } | null = null

		for (const [date, pnl] of dailyPnl) {
			if (!bestDay || pnl > bestDay.pnl) {
				bestDay = { date, pnl }
			}
			if (!worstDay || pnl < worstDay.pnl) {
				worstDay = { date, pnl }
			}
		}

		// Weekly breakdown - calculate 4-5 weeks in the month
		const weeklyBreakdown: MonthlyReport["weeklyBreakdown"] = []
		let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 })

		while (currentWeekStart <= monthEnd) {
			const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
			const weekTrades = monthTrades.filter((t) => {
				const entryDate = new Date(t.entryDate)
				return entryDate >= currentWeekStart && entryDate <= currentWeekEnd
			})

			if (weekTrades.length > 0) {
				const weekWins = weekTrades.filter((t) => t.outcome === "win").length
				const weekPnl = weekTrades.reduce((sum, t) => sum + fromCents(t.pnl), 0)

				weeklyBreakdown.push({
					weekStart: format(currentWeekStart, "yyyy-MM-dd"),
					weekEnd: format(currentWeekEnd, "yyyy-MM-dd"),
					tradeCount: weekTrades.length,
					pnl: weekPnl,
					winRate:
						weekTrades.length > 0 ? (weekWins / weekTrades.length) * 100 : 0,
				})
			}

			currentWeekStart = new Date(currentWeekStart)
			currentWeekStart.setDate(currentWeekStart.getDate() + 7)
		}

		// Asset breakdown
		const assetMap = new Map<
			string,
			{ tradeCount: number; pnl: number; winCount: number }
		>()
		for (const trade of monthTrades) {
			const current = assetMap.get(trade.asset) || {
				tradeCount: 0,
				pnl: 0,
				winCount: 0,
			}
			assetMap.set(trade.asset, {
				tradeCount: current.tradeCount + 1,
				pnl: current.pnl + (fromCents(trade.pnl)),
				winCount:
					current.winCount + (trade.outcome === "win" ? 1 : 0),
			})
		}

		const assetBreakdown = Array.from(assetMap.entries())
			.map(([asset, data]) => ({
				asset,
				tradeCount: data.tradeCount,
				pnl: data.pnl,
				winRate:
					data.tradeCount > 0 ? (data.winCount / data.tradeCount) * 100 : 0,
			}))
			.sort((a, b) => b.pnl - a.pnl)

		return {
			status: "success",
			data: {
				monthStart: format(monthStart, "yyyy-MM-dd"),
				monthEnd: format(monthEnd, "yyyy-MM-dd"),
				summary: {
					totalTrades: monthTrades.length,
					winCount: winTrades.length,
					lossCount: lossTrades.length,
					breakevenCount: breakevenTrades.length,
					netPnl,
					winRate:
						monthTrades.length > 0
							? (winTrades.length / monthTrades.length) * 100
							: 0,
					avgWin,
					avgLoss,
					profitFactor: grossLoss > 0 ? grossProfit / grossLoss : 0,
					avgR,
					bestDay,
					worstDay,
				},
				weeklyBreakdown,
				assetBreakdown,
			},
		}
	} catch (error) {
		console.error("Error fetching monthly report:", error)
		return { status: "error", message: "Failed to fetch monthly report" }
	}
}

// ============================================================================
// MISTAKE COST ANALYSIS
// ============================================================================

export const getMistakeCostAnalysis = async (): Promise<{
	status: "success" | "error"
	data?: MistakeCostAnalysis
	message?: string
}> => {
	try {
		// Get all mistake tags
		const mistakeTags = await db.query.tags.findMany({
			where: eq(tags.type, "mistake"),
		})

		if (mistakeTags.length === 0) {
			return {
				status: "success",
				data: {
					mistakes: [],
					totalMistakeCost: 0,
					mostCostlyMistake: null,
				},
			}
		}

		// Get all trade-tag associations for mistake tags
		const tagIds = mistakeTags.map((t) => t.id)
		const tradeTagAssociations = await db.query.tradeTags.findMany({
			where: inArray(tradeTags.tagId, tagIds),
			with: {
				trade: true,
				tag: true,
			},
		})

		// Calculate cost per mistake
		const mistakeStats = new Map<
			string,
			{ tagName: string; color: string | null; totalLoss: number; tradeCount: number }
		>()

		for (const association of tradeTagAssociations) {
			const pnl = fromCents(association.trade.pnl)

			// Only count losses (negative P&L)
			if (pnl < 0) {
				const current = mistakeStats.get(association.tagId) || {
					tagName: association.tag.name,
					color: association.tag.color,
					totalLoss: 0,
					tradeCount: 0,
				}
				mistakeStats.set(association.tagId, {
					...current,
					totalLoss: current.totalLoss + Math.abs(pnl),
					tradeCount: current.tradeCount + 1,
				})
			}
		}

		const mistakes = Array.from(mistakeStats.entries())
			.map(([tagId, data]) => ({
				tagId,
				tagName: data.tagName,
				color: data.color,
				tradeCount: data.tradeCount,
				totalLoss: data.totalLoss,
				avgLoss: data.tradeCount > 0 ? data.totalLoss / data.tradeCount : 0,
			}))
			.sort((a, b) => b.totalLoss - a.totalLoss)

		const totalMistakeCost = mistakes.reduce((sum, m) => sum + m.totalLoss, 0)
		const mostCostlyMistake =
			mistakes.length > 0 ? mistakes[0].tagName : null

		return {
			status: "success",
			data: {
				mistakes,
				totalMistakeCost,
				mostCostlyMistake,
			},
		}
	} catch (error) {
		console.error("Error fetching mistake cost analysis:", error)
		return { status: "error", message: "Failed to fetch mistake cost analysis" }
	}
}
