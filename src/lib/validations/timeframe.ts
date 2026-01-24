import { z } from "zod"

export const timeframeTypeValues = ["time_based", "renko"] as const
export const timeframeUnitValues = [
	"minutes",
	"hours",
	"days",
	"weeks",
	"ticks",
	"points",
] as const

export const timeframeTypeSchema = z.enum(timeframeTypeValues)
export const timeframeUnitSchema = z.enum(timeframeUnitValues)

export const timeframeSchema = z.object({
	code: z
		.string()
		.min(1, "Code is required")
		.max(20, "Code must be 20 characters or less")
		.regex(
			/^[A-Z0-9_]+$/,
			"Code must be uppercase letters, numbers and underscores only"
		)
		.transform((val) => val.toUpperCase()),
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be 50 characters or less"),
	type: timeframeTypeSchema,
	value: z.coerce
		.number({ message: "Value is required" })
		.int("Value must be an integer")
		.positive("Value must be positive"),
	unit: timeframeUnitSchema,
	sortOrder: z.coerce
		.number()
		.int("Sort order must be an integer")
		.min(0, "Sort order cannot be negative")
		.optional()
		.default(0),
	isActive: z.boolean().default(true),
})

export const createTimeframeSchema = timeframeSchema

export const updateTimeframeSchema = timeframeSchema.partial().extend({
	id: z.string().uuid("Invalid timeframe ID"),
})

export type TimeframeType = (typeof timeframeTypeValues)[number]
export type TimeframeUnit = (typeof timeframeUnitValues)[number]
export type CreateTimeframeInput = z.infer<typeof createTimeframeSchema>
export type UpdateTimeframeInput = z.infer<typeof updateTimeframeSchema>
