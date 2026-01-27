import { z } from "zod"

// Execution type enum
export const executionTypeSchema = z.enum(["entry", "exit"])

// Order type enum
export const orderTypeSchema = z.enum(["market", "limit", "stop", "stop_limit"])

// Create execution input schema
export const createExecutionSchema = z.object({
	tradeId: z.string().uuid("Trade ID must be a valid UUID"),

	// Execution details
	executionType: executionTypeSchema,
	executionDate: z.coerce.date({ message: "Execution date is required" }),
	price: z.coerce
		.number({ message: "Price is required" })
		.positive("Price must be positive"),
	quantity: z.coerce
		.number({ message: "Quantity is required" })
		.positive("Quantity must be positive"),

	// Optional metadata
	orderType: orderTypeSchema.optional().nullable(),
	notes: z.string().max(1000, "Notes must be 1000 characters or less").optional(),

	// Costs (in cents)
	commission: z.coerce.number().min(0).default(0),
	fees: z.coerce.number().min(0).default(0),
	slippage: z.coerce.number().default(0), // can be negative
})

// Validated/transformed output type
export type CreateExecutionOutput = z.output<typeof createExecutionSchema>

// Manual input type for forms and server actions (accepts coercible values)
export interface CreateExecutionInput {
	tradeId: string
	executionType: "entry" | "exit"
	executionDate: Date | string | number
	price: number | string
	quantity: number | string
	orderType?: "market" | "limit" | "stop" | "stop_limit" | null
	notes?: string
	commission?: number | string
	fees?: number | string
	slippage?: number | string
}

// Form input type alias
export type ExecutionFormInput = CreateExecutionInput

// Update execution schema (all fields optional except tradeId for context)
export const updateExecutionSchema = createExecutionSchema.omit({ tradeId: true }).partial()

// Update input type (all fields optional)
export type UpdateExecutionInput = Partial<Omit<CreateExecutionInput, "tradeId">>
