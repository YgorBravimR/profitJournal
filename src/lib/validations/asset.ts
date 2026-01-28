import { z } from "zod"

export const assetTypeSchema = z.object({
	code: z
		.string()
		.min(2, "Code must be at least 2 characters")
		.max(50, "Code must be 50 characters or less")
		.regex(
			/^[A-Z_]+$/,
			"Code must be uppercase letters and underscores only"
		)
		.transform((val) => val.toUpperCase()),
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be 100 characters or less"),
	description: z.string().optional().nullable(),
	isActive: z.boolean().default(true),
})

export const createAssetTypeSchema = assetTypeSchema

export const updateAssetTypeSchema = assetTypeSchema.partial()

export const assetSchema = z.object({
	symbol: z
		.string()
		.min(1, "Symbol is required")
		.max(20, "Symbol must be 20 characters or less")
		.regex(
			/^[A-Z0-9]+$/,
			"Symbol must be uppercase letters and numbers only"
		)
		.transform((val) => val.toUpperCase()),
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be 100 characters or less"),
	assetTypeId: z.string().uuid("Invalid asset type ID"),
	tickSize: z
		.number()
		.positive("Tick size must be positive")
		.or(z.string().transform((val) => parseFloat(val)))
		.refine((val) => val > 0, "Tick size must be positive"),
	tickValue: z
		.number()
		.positive("Tick value must be positive")
		.or(z.string().transform((val) => parseFloat(val)))
		.refine((val) => val > 0, "Tick value must be positive"),
	currency: z
		.string()
		.min(3, "Currency must be 3 characters")
		.max(10, "Currency must be 10 characters or less")
		.default("BRL"),
	multiplier: z
		.number()
		.positive("Multiplier must be positive")
		.or(z.string().transform((val) => parseFloat(val)))
		.optional()
		.default(1),
	isActive: z.boolean().default(true),
})

export const createAssetSchema = assetSchema

export const updateAssetSchema = assetSchema.partial().extend({
	id: z.string().uuid("Invalid asset ID"),
})

export type CreateAssetTypeInput = z.infer<typeof createAssetTypeSchema>
export type UpdateAssetTypeInput = z.infer<typeof updateAssetTypeSchema>
export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
