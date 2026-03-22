import type { NextRequest } from "next/server"
import { db } from "@/db/drizzle"
import { trades, monthlyPlans, riskManagementProfiles } from "@/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import { getUserDek, decryptTradeFields, decryptMonthlyPlanFields } from "@/lib/user-crypto"
import { resolveLiveStatus } from "@/lib/live-trading-status"
import { fromCents } from "@/lib/money"
import { archAuth } from "../_lib/auth"
import { archSuccess, archError } from "../_lib/helpers"
import type { DecisionTreeConfig } from "@/types/risk-profile"
import type { TradeSummary } from "@/types/live-trading-status"

/**
 * GET /api/arch/live-status
 *
 * Returns the live trading status for the current day, including
 * the resolved decision tree state and trade summaries.
 *
 * Query params:
 * - date (optional): ISO date string, defaults to today
 */
const GET = async (request: NextRequest) => {
	const authResult = await archAuth(request)
	if (!authResult.success) return authResult.response

	const { userId, accountId } = authResult.auth

	try {
		const dateParam = request.nextUrl.searchParams.get("date")
		const today = dateParam ? new Date(dateParam) : new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		const currentYear = today.getFullYear()
		const currentMonth = today.getMonth() + 1

		// Fetch current month's plan
		const rawMonthlyPlan = await db.query.monthlyPlans.findFirst({
			where: and(
				eq(monthlyPlans.accountId, accountId),
				eq(monthlyPlans.year, currentYear),
				eq(monthlyPlans.month, currentMonth)
			),
		})

		// Decrypt monthly plan fields if DEK is available
		const dek = await getUserDek(userId)
		const monthlyPlan = rawMonthlyPlan && dek
			? decryptMonthlyPlanFields(rawMonthlyPlan as unknown as Record<string, unknown>, dek) as unknown as typeof rawMonthlyPlan
			: rawMonthlyPlan

		if (!monthlyPlan?.riskProfileId) {
			return archSuccess("No risk profile linked", {
				hasProfile: false,
				fallbackRiskCents: monthlyPlan?.riskPerTradeCents
					? Number(monthlyPlan.riskPerTradeCents)
					: null,
			})
		}

		// Fetch the linked risk profile directly
		const [profileRow] = await db
			.select()
			.from(riskManagementProfiles)
			.where(eq(riskManagementProfiles.id, monthlyPlan.riskProfileId))
			.limit(1)

		if (!profileRow) {
			return archSuccess("Risk profile not found", {
				hasProfile: false,
				fallbackRiskCents: monthlyPlan.riskPerTradeCents
					? Number(monthlyPlan.riskPerTradeCents)
					: null,
			})
		}

		const profile = {
			...profileRow,
			decisionTree: JSON.parse(profileRow.decisionTree) as DecisionTreeConfig,
		}

		// The monthly plan is the single source of truth for computed values
		const planRiskPerTradeCents = Number(monthlyPlan.riskPerTradeCents) || profile.decisionTree.baseTrade.riskCents
		const planDailyLossCents = Number(monthlyPlan.dailyLossCents) || profile.dailyLossCents
		const planDailyProfitTargetCents = Number(monthlyPlan.dailyProfitTargetCents) || profile.dailyProfitTargetCents

		// Override the decision tree's static base risk with the plan-derived value
		const decisionTree = {
			...profile.decisionTree,
			baseTrade: {
				...profile.decisionTree.baseTrade,
				riskCents: planRiskPerTradeCents,
			},
		}

		// Fetch today's trades
		const rawTodaysTrades = await db.query.trades.findMany({
			where: and(
				eq(trades.accountId, accountId),
				gte(trades.entryDate, today),
				lte(trades.entryDate, tomorrow),
				eq(trades.isArchived, false)
			),
			orderBy: (t, { asc }) => [asc(t.entryDate)],
		})

		// Decrypt trade fields
		const todaysTrades = dek
			? rawTodaysTrades.map((t) => decryptTradeFields(t as unknown as Record<string, unknown>, dek) as unknown as typeof t)
			: rawTodaysTrades

		// Map trades to the lightweight input shape
		const tradeInputs = todaysTrades.map((trade) => ({
			pnlCents: Number(trade.pnl) || 0,
			outcome: trade.outcome as "win" | "loss" | "breakeven" | null,
		}))

		// Resolve max trades from explicit plan value or derived fallback
		const maxTrades = monthlyPlan.maxDailyTrades ?? monthlyPlan.derivedMaxDailyTrades ?? null

		const status = resolveLiveStatus({
			trades: tradeInputs,
			decisionTree,
			profileName: profile.name,
			dailyLossCents: planDailyLossCents,
			dailyProfitTargetCents: planDailyProfitTargetCents,
			maxTrades,
		})

		// Build trade summaries by zipping decrypted trades with step numbers
		const tradeSummaries: TradeSummary[] = todaysTrades.map((trade, index) => ({
			tradeStepNumber: status.tradeStepNumbers[index] ?? index + 1,
			pnlCents: Number(trade.pnl) || 0,
			outcome: trade.outcome as "win" | "loss" | "breakeven" | null,
			direction: trade.direction,
			asset: trade.asset,
			positionSize: Number(trade.positionSize) || 0,
			riskAmountCents: trade.plannedRiskAmount ? Number(trade.plannedRiskAmount) : null,
		}))

		return archSuccess("Live trading status resolved", {
			hasProfile: true,
			status,
			tradeSummaries,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error"
		return archError("Failed to get live trading status", [
			{ code: "FETCH_FAILED", detail: message },
		], 500)
	}
}

export { GET }
