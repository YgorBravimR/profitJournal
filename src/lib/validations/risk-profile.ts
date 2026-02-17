import { z } from "zod"

// ==========================================
// RISK PROFILE VALIDATION SCHEMAS
// ==========================================

/**
 * Discriminated union for how risk is calculated at each loss recovery step.
 */
const riskCalculationSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("percentOfBase"),
		percent: z.number().min(1).max(200),
	}),
	z.object({
		type: z.literal("sameAsPrevious"),
	}),
	z.object({
		type: z.literal("fixedCents"),
		amountCents: z.number().int().positive(),
	}),
])

const lossRecoveryStepSchema = z.object({
	riskCalculation: riskCalculationSchema,
	maxContractsOverride: z.number().int().positive().nullable(),
})

/**
 * Discriminated union for gain mode after a winning first trade.
 */
const gainModeSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("compounding"),
		reinvestmentPercent: z.number().min(0).max(100),
		stopOnFirstLoss: z.boolean(),
		dailyTargetCents: z.number().int().positive().nullable(),
	}),
	z.object({
		type: z.literal("singleTarget"),
		dailyTargetCents: z.number().int().positive(),
	}),
])

/**
 * Full decision tree configuration schema.
 * Validated when creating/updating a risk management profile.
 */
const decisionTreeConfigSchema = z.object({
	baseTrade: z.object({
		riskCents: z.number().int().positive("Base risk must be positive"),
		maxContracts: z.number().int().positive().nullable(),
		minStopPoints: z.number().int().positive().nullable(),
	}),
	lossRecovery: z.object({
		sequence: z.array(lossRecoveryStepSchema).max(10, "Maximum 10 recovery steps"),
		executeAllRegardless: z.boolean(),
		stopAfterSequence: z.boolean(),
	}),
	gainMode: gainModeSchema,
	cascadingLimits: z.object({
		weeklyLossCents: z.number().int().positive().nullable(),
		weeklyAction: z.enum(["stopTrading", "reduceRisk"]),
		monthlyLossCents: z.number().int().positive(),
		monthlyAction: z.enum(["stopTrading", "reduceRisk"]),
	}),
	executionConstraints: z.object({
		minStopPoints: z.number().int().positive().nullable(),
		maxContracts: z.number().int().positive().nullable(),
		operatingHoursStart: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
		operatingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
	}),
})

/**
 * Schema for creating or updating a risk management profile.
 */
const riskProfileSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z.string().max(2000, "Description too long").optional().nullable(),
	baseRiskCents: z.number().int().positive("Base risk must be positive"),
	dailyLossCents: z.number().int().positive("Daily loss limit must be positive"),
	weeklyLossCents: z.number().int().positive("Weekly loss limit must be positive").optional().nullable(),
	monthlyLossCents: z.number().int().positive("Monthly loss limit must be positive"),
	dailyProfitTargetCents: z.number().int().positive("Daily profit target must be positive").optional().nullable(),
	decisionTree: decisionTreeConfigSchema,
})

type RiskProfileSchemaInput = z.infer<typeof riskProfileSchema>
type DecisionTreeConfigInput = z.infer<typeof decisionTreeConfigSchema>

export {
	riskProfileSchema,
	decisionTreeConfigSchema,
	riskCalculationSchema,
	gainModeSchema,
}

export type { RiskProfileSchemaInput, DecisionTreeConfigInput }
