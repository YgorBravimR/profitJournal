import { z } from "zod"

const createScenarioSchema = z.object({
	strategyId: z.string().uuid("Invalid strategy ID"),
	name: z
		.string()
		.min(1, "Name is required")
		.max(200, "Name must be 200 characters or less"),
	description: z
		.string()
		.max(2000, "Description must be 2000 characters or less")
		.optional()
		.or(z.literal("")),
	sortOrder: z.coerce.number().int().min(0).default(0),
})

const updateScenarioSchema = createScenarioSchema.omit({ strategyId: true }).partial()

type CreateScenarioInput = z.infer<typeof createScenarioSchema>
type UpdateScenarioInput = z.infer<typeof updateScenarioSchema>

export {
	createScenarioSchema,
	updateScenarioSchema,
	type CreateScenarioInput,
	type UpdateScenarioInput,
}
