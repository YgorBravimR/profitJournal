import { z } from "zod"

export const createStrategySchema = z.object({
	code: z
		.string()
		.min(3, "Strategy code must be at least 3 characters")
		.max(10, "Strategy code must be 10 characters or less")
		.regex(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only")
		.transform((val) => val.toUpperCase()),
	name: z
		.string()
		.min(1, "Strategy name is required")
		.max(100, "Name must be 100 characters or less"),
	description: z
		.string()
		.max(2000, "Description must be 2000 characters or less")
		.optional(),
	entryCriteria: z
		.string()
		.max(5000, "Entry criteria must be 5000 characters or less")
		.optional(),
	exitCriteria: z
		.string()
		.max(5000, "Exit criteria must be 5000 characters or less")
		.optional(),
	riskRules: z
		.string()
		.max(5000, "Risk rules must be 5000 characters or less")
		.optional(),
	targetRMultiple: z.coerce
		.number()
		.positive("Target R must be positive")
		.max(100, "Target R must be 100 or less")
		.optional(),
	maxRiskPercent: z.coerce
		.number()
		.positive("Max risk % must be positive")
		.max(100, "Max risk % must be 100 or less")
		.optional(),
	screenshotUrl: z
		.string()
		.url("Invalid URL")
		.max(500)
		.optional()
		.or(z.literal("")),
	notes: z
		.string()
		.max(5000, "Notes must be 5000 characters or less")
		.optional(),
	isActive: z.boolean().default(true),
})

export const updateStrategySchema = createStrategySchema.partial()

export type CreateStrategyInput = z.infer<typeof createStrategySchema>
export type UpdateStrategyInput = z.infer<typeof updateStrategySchema>
