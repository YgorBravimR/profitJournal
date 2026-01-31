import { z } from "zod"

export const simulationParamsSchema = z.object({
	initialBalance: z
		.number()
		.min(100, "Initial balance must be at least $100")
		.max(100000000, "Initial balance cannot exceed $100,000,000"),
	riskType: z.enum(["percentage", "fixed"]),
	riskPerTrade: z
		.number()
		.min(0.01, "Risk per trade must be at least 0.01")
		.max(100, "Risk per trade cannot exceed 100"),
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
	commissionPerTrade: z
		.number()
		.min(0, "Commission cannot be negative")
		.max(10, "Commission cannot exceed 10% of risk"),
	simulationCount: z
		.number()
		.int()
		.min(100, "Minimum 100 simulations")
		.max(10000, "Maximum 10,000 simulations"),
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
	initialBalance: 10000,
	riskType: "percentage",
	riskPerTrade: 1,
	winRate: 55,
	rewardRiskRatio: 1.5,
	numberOfTrades: 100,
	commissionPerTrade: 0.1,
	simulationCount: 1000,
}
