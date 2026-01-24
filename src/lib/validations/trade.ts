import { z } from "zod"

// Direction and outcome enums
export const tradeDirectionSchema = z.enum(["long", "short"])
export const tradeOutcomeSchema = z.enum(["win", "loss", "breakeven"])
export const timeframeSchema = z.enum([
	"1m",
	"5m",
	"15m",
	"30m",
	"1h",
	"4h",
	"1d",
	"1w",
])

// Create trade input schema
export const createTradeSchema = z.object({
	// Basic Info
	asset: z
		.string()
		.min(1, "Asset is required")
		.max(20, "Asset must be 20 characters or less")
		.transform((val) => val.toUpperCase()),
	direction: tradeDirectionSchema,
	timeframe: timeframeSchema.optional(),

	// Timing
	entryDate: z.coerce.date({ message: "Entry date is required" }),
	exitDate: z.coerce.date().optional(),

	// Execution
	entryPrice: z.coerce
		.number({ message: "Entry price is required" })
		.positive("Entry price must be positive"),
	exitPrice: z.coerce.number().positive("Exit price must be positive").optional(),
	positionSize: z.coerce
		.number({ message: "Position size is required" })
		.positive("Position size must be positive"),

	// Risk Management
	stopLoss: z.coerce.number().positive("Stop loss must be positive").optional(),
	takeProfit: z.coerce
		.number()
		.positive("Take profit must be positive")
		.optional(),
	// Note: plannedRiskAmount is always calculated from stopLoss
	// Note: plannedRMultiple is always calculated from takeProfit/stopLoss ratio

	// Results (can be auto-calculated or manual)
	pnl: z.coerce.number().optional(),
	realizedRMultiple: z.coerce.number().optional(),

	// MFE/MAE
	mfe: z.coerce.number().optional(),
	mae: z.coerce.number().optional(),

	// Narrative
	preTradeThoughts: z.string().max(2000).optional(),
	postTradeReflection: z.string().max(2000).optional(),
	lessonLearned: z.string().max(2000).optional(),

	// Strategy Reference
	strategyId: z.string().uuid().optional().nullable(),

	// Compliance
	followedPlan: z.boolean().optional(),
	disciplineNotes: z.string().max(1000).optional(),

	// Tags
	tagIds: z.array(z.string().uuid()).optional(),
})

// Validated/transformed output type
export type CreateTradeOutput = z.output<typeof createTradeSchema>

// Manual input type for forms and server actions (accepts coercible values)
export interface CreateTradeInput {
	asset: string
	direction: "long" | "short"
	timeframe?: "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w"
	entryDate: Date | string | number
	exitDate?: Date | string | number
	entryPrice: number | string
	exitPrice?: number | string
	positionSize: number | string
	stopLoss?: number | string
	takeProfit?: number | string
	// Note: plannedRiskAmount is always calculated from stopLoss
	// Note: plannedRMultiple is always calculated from takeProfit/stopLoss ratio
	pnl?: number | string
	realizedRMultiple?: number | string
	mfe?: number | string
	mae?: number | string
	preTradeThoughts?: string
	postTradeReflection?: string
	lessonLearned?: string
	strategyId?: string | null
	followedPlan?: boolean
	disciplineNotes?: string
	tagIds?: string[]
}

// Form input type alias
export type TradeFormInput = CreateTradeInput

// Update trade schema (all fields optional)
export const updateTradeSchema = createTradeSchema.partial()

// Update input type (all fields optional)
export type UpdateTradeInput = Partial<CreateTradeInput>

// Filter schema for trade queries
export const tradeFiltersSchema = z.object({
	dateFrom: z.coerce.date().optional(),
	dateTo: z.coerce.date().optional(),
	assets: z.array(z.string()).optional(),
	directions: z.array(tradeDirectionSchema).optional(),
	outcomes: z.array(tradeOutcomeSchema).optional(),
	strategyIds: z.array(z.string().uuid()).optional(),
	tagIds: z.array(z.string().uuid()).optional(),
	timeframes: z.array(timeframeSchema).optional(),
})

export type TradeFilters = z.infer<typeof tradeFiltersSchema>

// Pagination schema
export const paginationSchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(20),
	offset: z.coerce.number().min(0).default(0),
	sortBy: z
		.enum(["entryDate", "pnl", "realizedRMultiple", "asset"])
		.default("entryDate"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Use z.input for params to allow defaults to be optional at call site
export type PaginationParams = z.input<typeof paginationSchema>
