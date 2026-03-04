type ConditionCategory = "indicator" | "price_action" | "market_context" | "custom"

type ConditionTier = "mandatory" | "tier_2" | "tier_3"

type SetupRank = "A" | "AA" | "AAA"

interface TradingConditionInput {
	name: string
	description?: string | null
	category: ConditionCategory
}

interface StrategyConditionInput {
	conditionId: string
	tier: ConditionTier
	sortOrder: number
}

export type {
	ConditionCategory,
	ConditionTier,
	SetupRank,
	TradingConditionInput,
	StrategyConditionInput,
}
