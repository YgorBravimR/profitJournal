import { z } from "zod"

const updateUserRoleSchema = z.object({
	userId: z.string().uuid("Invalid user ID"),
	role: z.enum(["admin", "trader", "viewer"], {
		message: "Role must be admin, trader, or viewer",
	}),
})

type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>

export { updateUserRoleSchema, type UpdateUserRoleInput }
