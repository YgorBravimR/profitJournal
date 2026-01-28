import { z } from "zod"

export const userSettingsSchema = z.object({
	// Prop Trading Settings
	isPropAccount: z.boolean(),
	propFirmName: z.string().max(100).nullable().optional(),
	profitSharePercentage: z
		.number()
		.min(0, "Profit share must be at least 0%")
		.max(100, "Profit share cannot exceed 100%"),

	// Tax Settings
	dayTradeTaxRate: z
		.number()
		.min(0, "Tax rate must be at least 0%")
		.max(100, "Tax rate cannot exceed 100%"),
	swingTradeTaxRate: z
		.number()
		.min(0, "Tax rate must be at least 0%")
		.max(100, "Tax rate cannot exceed 100%"),
	taxExemptThreshold: z
		.number()
		.min(0, "Threshold must be at least 0")
		.optional(),

	// Display Preferences
	defaultCurrency: z.string().length(3, "Currency code must be 3 characters"),
	showTaxEstimates: z.boolean(),
	showPropCalculations: z.boolean(),

	// Multi-Account Preferences
	showAllAccounts: z.boolean(),
})

export type UserSettingsInput = z.infer<typeof userSettingsSchema>

// Partial schema for updates
export const updateUserSettingsSchema = userSettingsSchema.partial()

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>
