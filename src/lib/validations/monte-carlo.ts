import { z } from "zod"

/** Maximum allowed total iterations (trades × simulations) */
export const SIMULATION_BUDGET_CAP = 3_000_000

export const simulationParamsSchema = z
	.object({
		winRate: z
			.number()
			.min(1, "Win rate must be at least 1%")
			.max(99, "Win rate cannot exceed 99%"),
		rewardRiskRatio: z
			.number()
			.min(0.1, "Reward/Risk ratio must be at least 0.1")
			.max(20, "Reward/Risk ratio cannot exceed 20"),
		numberOfTrades: z
			.number()
			.int()
			.min(10, "Minimum 10 trades per simulation")
			.max(10000, "Maximum 10,000 trades per simulation"),
		commissionImpactR: z
			.number()
			.min(0, "Commission cannot be negative")
			.max(50, "Commission cannot exceed 50% of risk"),
		simulationCount: z
			.number()
			.int()
			.min(100, "Minimum 100 simulations")
			.max(50000, "Maximum 50,000 simulations"),
	})
	.superRefine((data, ctx) => {
		// Budget cap: trades × simulations must not exceed 3,000,000 total iterations
		const totalIterations = data.numberOfTrades * data.simulationCount
		if (totalIterations > SIMULATION_BUDGET_CAP) {
			const maxTrades = Math.floor(SIMULATION_BUDGET_CAP / data.simulationCount)
			const maxSimulations = Math.floor(SIMULATION_BUDGET_CAP / data.numberOfTrades)
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Total iterations (${totalIterations.toLocaleString()}) exceeds the maximum of ${SIMULATION_BUDGET_CAP.toLocaleString()}. Reduce trades to ${maxTrades.toLocaleString()} or simulations to ${maxSimulations.toLocaleString()}.`,
				path: ["simulationCount"],
			})
		}
	})

export type SimulationParamsInput = z.infer<typeof simulationParamsSchema>

export const dataSourceSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("strategy"),
		strategyId: z.string().uuid("Invalid strategy ID"),
	}),
	z.object({
		type: z.literal("all_strategies"),
	}),
	z.object({
		type: z.literal("universal"),
	}),
])

export type DataSourceInput = z.infer<typeof dataSourceSchema>

export const defaultSimulationParams: SimulationParamsInput = {
	winRate: 55,
	rewardRiskRatio: 1.5,
	numberOfTrades: 100,
	commissionImpactR: 0,
	simulationCount: 1000,
}

// ==========================================
// V2 — DAY-AWARE SIMULATION SCHEMAS
// ==========================================

/** Maximum allowed total iterations for V2: 50 trades/day × days × simulations */
export const V2_SIMULATION_BUDGET_CAP = 10_000_000

const riskManagementProfileForSimSchema = z.object({
	name: z.string(),
	baseRiskCents: z.number().int().positive(),
	rewardRiskRatio: z.number().min(0.1).max(20),
	winRate: z.number().min(1).max(99),
	breakevenRate: z.number().min(0).max(80),
	dailyTargetCents: z.number().int().positive().nullable(),
	dailyLossLimitCents: z.number().int().positive(),
	lossRecoverySteps: z.array(
		z.object({ riskCents: z.number().int().positive() })
	).max(10),
	executeAllRegardless: z.boolean(),
	stopAfterSequence: z.boolean(),
	compoundingRiskPercent: z.number().min(0).max(100),
	stopOnFirstLoss: z.boolean(),
	weeklyLossLimitCents: z.number().int().positive().nullable(),
	monthlyLossLimitCents: z.number().int().positive(),
	tradingDaysPerMonth: z.number().int().min(1).max(31),
	tradingDaysPerWeek: z.number().int().min(1).max(7),
	commissionPerTradeCents: z.number().min(0),
})

export const simulationParamsV2Schema = z
	.object({
		profile: riskManagementProfileForSimSchema,
		simulationCount: z.number().int().min(100).max(50000),
		initialBalance: z.number().int().positive(),
	})
	.superRefine((data, ctx) => {
		// Budget cap: ~50 trades/day × days × simulations
		const maxTradesPerDay = 50
		const totalIterations =
			maxTradesPerDay * data.profile.tradingDaysPerMonth * data.simulationCount
		if (totalIterations > V2_SIMULATION_BUDGET_CAP) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Estimated iterations (${totalIterations.toLocaleString()}) exceeds the cap of ${V2_SIMULATION_BUDGET_CAP.toLocaleString()}. Reduce simulations or trading days.`,
				path: ["simulationCount"],
			})
		}
	})

export type SimulationParamsV2Input = z.infer<typeof simulationParamsV2Schema>
