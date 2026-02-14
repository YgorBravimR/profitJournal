import { z } from "zod"

/**
 * Validation schema for monthly plan upsert.
 * All money amounts are in cents (integers). Percentages are decimal numbers (e.g. 1.00 = 1%).
 */
export const monthlyPlanSchema = z.object({
	year: z.coerce.number().int().min(2020).max(2100),
	month: z.coerce.number().int().min(1).max(12),

	// Required fields
	accountBalance: z.coerce
		.number()
		.int("Account balance must be in cents")
		.positive("Account balance must be positive")
		.max(100_000_000_00, "Account balance too large"), // 100M in cents
	riskPerTradePercent: z.coerce
		.number()
		.positive("Risk per trade must be positive")
		.max(100, "Risk per trade cannot exceed 100%"),
	dailyLossPercent: z.coerce
		.number()
		.positive("Daily loss limit must be positive")
		.max(100, "Daily loss limit cannot exceed 100%"),
	monthlyLossPercent: z.coerce
		.number()
		.positive("Monthly loss limit must be positive")
		.max(100, "Monthly loss limit cannot exceed 100%"),

	// Optional fields
	dailyProfitTargetPercent: z.coerce
		.number()
		.positive("Profit target must be positive")
		.max(1000, "Profit target too large")
		.optional()
		.nullable(),
	maxDailyTrades: z.coerce
		.number()
		.int("Max daily trades must be a whole number")
		.positive("Max daily trades must be positive")
		.max(1000, "Max daily trades must be 1000 or less")
		.optional()
		.nullable(),
	maxConsecutiveLosses: z.coerce
		.number()
		.int("Max consecutive losses must be a whole number")
		.positive("Max consecutive losses must be positive")
		.max(100, "Max consecutive losses must be 100 or less")
		.optional()
		.nullable(),
	allowSecondOpAfterLoss: z.boolean().default(true),
	reduceRiskAfterLoss: z.boolean().default(false),
	riskReductionFactor: z.coerce
		.number()
		.positive("Risk reduction factor must be positive")
		.max(1, "Risk reduction factor must be <= 1 (e.g. 0.50)")
		.optional()
		.nullable(),
	increaseRiskAfterWin: z.boolean().default(false),
	capRiskAfterWin: z.boolean().default(false),
	profitReinvestmentPercent: z.coerce
		.number()
		.positive("Profit reinvestment must be positive")
		.max(100, "Profit reinvestment cannot exceed 100%")
		.optional()
		.nullable(),
	notes: z
		.string()
		.max(5000, "Notes must be 5000 characters or less")
		.optional()
		.nullable(),
}).refine(
	(data) => !(data.increaseRiskAfterWin && data.capRiskAfterWin),
	{ message: "increaseRiskAfterWin and capRiskAfterWin are mutually exclusive", path: ["capRiskAfterWin"] }
)

export type MonthlyPlanInput = z.infer<typeof monthlyPlanSchema>

/**
 * Schema for rollover — only requires optional adjusted balance.
 */
export const rolloverMonthlyPlanSchema = z.object({
	adjustedBalance: z.coerce
		.number()
		.int("Balance must be in cents")
		.positive("Balance must be positive")
		.max(100_000_000_00, "Balance too large")
		.optional()
		.nullable(),
})

export type RolloverMonthlyPlanInput = z.infer<typeof rolloverMonthlyPlanSchema>
