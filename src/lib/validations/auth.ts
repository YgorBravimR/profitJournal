import { z } from "zod"

export const registerSchema = z
	.object({
		name: z
			.string()
			.min(2, "Name must be at least 2 characters")
			.max(255, "Name must be less than 255 characters"),
		email: z.string().email("Invalid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})

export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
	accountId: z.string().uuid().optional(),
})

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})

export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(255, "Name must be less than 255 characters"),
	preferredLocale: z.enum(["en", "pt-BR"]).optional(),
	theme: z.enum(["dark", "light"]).optional(),
	dateFormat: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
