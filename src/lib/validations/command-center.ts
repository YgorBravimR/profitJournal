import { z } from "zod"

// Checklist item schema
export const checklistItemSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1, "Item label is required").max(200, "Item label must be 200 characters or less"),
	order: z.number().int().min(0),
})

// Create checklist schema
export const createChecklistSchema = z.object({
	name: z
		.string()
		.min(1, "Checklist name is required")
		.max(100, "Name must be 100 characters or less"),
	items: z
		.array(checklistItemSchema)
		.min(1, "At least one item is required")
		.max(50, "Maximum 50 items allowed"),
	isActive: z.boolean().default(true),
})

export const updateChecklistSchema = createChecklistSchema.partial()

// Checklist completion schema
export const updateCompletionSchema = z.object({
	checklistId: z.string().uuid("Invalid checklist ID"),
	itemId: z.string().min(1),
	completed: z.boolean(),
})

// Mood options
export const moodOptions = ["great", "good", "neutral", "bad", "terrible"] as const
export type MoodType = (typeof moodOptions)[number]

// Bias options
export const biasOptions = ["long", "short", "neutral"] as const
export type BiasType = (typeof biasOptions)[number]

// Daily notes schema
export const dailyNotesSchema = z.object({
	date: z.string().or(z.date()),
	preMarketNotes: z
		.string()
		.max(10000, "Pre-market notes must be 10000 characters or less")
		.optional()
		.nullable(),
	postMarketNotes: z
		.string()
		.max(10000, "Post-market notes must be 10000 characters or less")
		.optional()
		.nullable(),
	mood: z.enum(moodOptions).optional().nullable(),
})

// Asset settings schema
export const assetSettingsSchema = z.object({
	assetId: z.string().uuid("Invalid asset ID"),
	bias: z.enum(biasOptions).optional().nullable(),
	maxDailyTrades: z.coerce
		.number()
		.int("Max daily trades must be a whole number")
		.positive("Max daily trades must be positive")
		.max(1000, "Max daily trades must be 1000 or less")
		.optional()
		.nullable(),
	maxPositionSize: z.coerce
		.number()
		.int("Max position size must be a whole number")
		.positive("Max position size must be positive")
		.max(100000, "Max position size must be 100000 or less")
		.optional()
		.nullable(),
	notes: z
		.string()
		.max(2000, "Notes must be 2000 characters or less")
		.optional()
		.nullable(),
	isActive: z.boolean().default(true),
})

// Type exports
export type ChecklistItem = z.infer<typeof checklistItemSchema>
export type CreateChecklistInput = z.infer<typeof createChecklistSchema>
export type UpdateChecklistInput = z.infer<typeof updateChecklistSchema>
export type UpdateCompletionInput = z.infer<typeof updateCompletionSchema>
export type DailyNotesInput = z.infer<typeof dailyNotesSchema>
export type AssetSettingsInput = z.infer<typeof assetSettingsSchema>

// Circuit breaker status type (not a zod schema, just a type)
export interface CircuitBreakerStatus {
	// Existing fields
	dailyPnL: number
	tradesCount: number
	consecutiveLosses: number
	profitTargetHit: boolean
	lossLimitHit: boolean
	maxTradesHit: boolean
	maxConsecutiveLossesHit: boolean
	shouldStopTrading: boolean
	alerts: string[]

	// Resolved limits from monthly plan
	profitTargetCents: number
	dailyLossLimitCents: number
	maxTrades: number | null
	maxConsecutiveLosses: number | null
	reduceRiskAfterLoss: boolean
	riskReductionFactor: string | null

	// Risk dashboard fields
	riskUsedTodayCents: number
	remainingDailyRiskCents: number
	recommendedRiskCents: number
	monthlyPnL: number
	monthlyLossLimitCents: number
	remainingMonthlyCents: number
	isMonthlyLimitHit: boolean
	isSecondOpBlocked: boolean
}
