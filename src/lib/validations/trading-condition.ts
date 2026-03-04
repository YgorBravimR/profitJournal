import { z } from "zod"

const conditionCategories = ["indicator", "price_action", "market_context", "custom"] as const

const createConditionSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must be 100 characters or less"),
	description: z
		.string()
		.max(500, "Description must be 500 characters or less")
		.optional()
		.or(z.literal("")),
	category: z.enum(conditionCategories),
})

const updateConditionSchema = createConditionSchema.partial()

type CreateConditionInput = z.infer<typeof createConditionSchema>
type UpdateConditionInput = z.infer<typeof updateConditionSchema>

export {
	conditionCategories,
	createConditionSchema,
	updateConditionSchema,
	type CreateConditionInput,
	type UpdateConditionInput,
}
