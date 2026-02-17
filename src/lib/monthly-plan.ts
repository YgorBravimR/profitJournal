/**
 * Pure function to derive computed monthly plan values from user inputs.
 * Used both server-side (on save) and client-side (live preview in form).
 */

interface MonthlyPlanInputs {
	accountBalance: number // cents
	riskPerTradePercent: number // e.g. 1.00 = 1%
	dailyLossPercent: number // e.g. 3.00 = 3%
	monthlyLossPercent: number // e.g. 10.00 = 10%
	dailyProfitTargetPercent?: number | null // e.g. 5.00 = 5%
	maxDailyTrades?: number | null // user override
	weeklyLossPercent?: number | null // e.g. 4.00 = 4%
}

interface MonthlyPlanDerived {
	riskPerTradeCents: number
	dailyLossCents: number
	monthlyLossCents: number
	dailyProfitTargetCents: number | null
	derivedMaxDailyTrades: number | null
	weeklyLossCents: number | null
}

/**
 * Computes all cent values and derived fields from percentage inputs + balance.
 *
 * @param inputs - The user-provided percentage inputs and account balance (in cents)
 * @returns Computed cent values and derived max daily trades
 */
const deriveMonthlyPlanValues = (inputs: MonthlyPlanInputs): MonthlyPlanDerived => {
	const riskPerTradeCents = Math.round(inputs.accountBalance * inputs.riskPerTradePercent / 100)
	const dailyLossCents = Math.round(inputs.accountBalance * inputs.dailyLossPercent / 100)
	const monthlyLossCents = Math.round(inputs.accountBalance * inputs.monthlyLossPercent / 100)

	const dailyProfitTargetCents = inputs.dailyProfitTargetPercent
		? Math.round(inputs.accountBalance * inputs.dailyProfitTargetPercent / 100)
		: null

	// User override takes priority; otherwise auto-derive from daily loss / risk per trade
	const derivedMaxDailyTrades = inputs.maxDailyTrades
		? inputs.maxDailyTrades
		: riskPerTradeCents > 0
			? Math.floor(dailyLossCents / riskPerTradeCents)
			: null

	const weeklyLossCents = inputs.weeklyLossPercent
		? Math.round(inputs.accountBalance * inputs.weeklyLossPercent / 100)
		: null

	return {
		riskPerTradeCents,
		dailyLossCents,
		monthlyLossCents,
		dailyProfitTargetCents,
		derivedMaxDailyTrades,
		weeklyLossCents,
	}
}

export { deriveMonthlyPlanValues }
export type { MonthlyPlanInputs, MonthlyPlanDerived }
