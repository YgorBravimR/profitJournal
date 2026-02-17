// ==========================================
// RISK MANAGEMENT PROFILE TYPES
// ==========================================

/**
 * Defines how risk is calculated for a single step in the loss recovery sequence.
 * Discriminated union on `type` for type-safe branching.
 */
type RiskCalculation =
	| { type: "percentOfBase"; percent: number }
	| { type: "sameAsPrevious" }
	| { type: "fixedCents"; amountCents: number }

/**
 * A single step in the loss recovery sequence (e.g., T2, T3, T4).
 */
interface LossRecoveryStep {
	riskCalculation: RiskCalculation
	maxContractsOverride: number | null
}

/**
 * Gain mode after a winning first trade.
 * - compounding: reinvest a % of accumulated gains into subsequent trades
 * - singleTarget: one winning trade hits the daily target, no further trades
 */
type GainMode =
	| {
			type: "compounding"
			reinvestmentPercent: number // 30 = risk 30% of accumulated gain
			stopOnFirstLoss: boolean
			dailyTargetCents: number | null
	  }
	| {
			type: "singleTarget"
			dailyTargetCents: number
	  }

/**
 * Full decision tree configuration stored as JSON in the riskManagementProfiles table.
 *
 * This governs day-level behavior: what happens on T1 loss (recovery sequence),
 * what happens on T1 win (gain mode), and when to stop trading (cascading limits).
 *
 * @see docs/riskManagement/risk-management-flowchart.md
 */
interface DecisionTreeConfig {
	baseTrade: {
		riskCents: number
		maxContracts: number | null
		minStopPoints: number | null
	}
	lossRecovery: {
		sequence: LossRecoveryStep[]
		executeAllRegardless: boolean // run all recovery trades even if earlier ones win
		stopAfterSequence: boolean // stop trading for the day after sequence completes
	}
	gainMode: GainMode
	cascadingLimits: {
		weeklyLossCents: number | null
		weeklyAction: "stopTrading" | "reduceRisk"
		monthlyLossCents: number
		monthlyAction: "stopTrading" | "reduceRisk"
	}
	executionConstraints: {
		minStopPoints: number | null
		maxContracts: number | null
		operatingHoursStart: string | null // "09:01"
		operatingHoursEnd: string | null // "17:00"
	}
}

/**
 * A risk profile as returned from the DB, with the decision tree parsed from JSON.
 */
interface RiskManagementProfile {
	id: string
	name: string
	description: string | null
	createdByUserId: string
	isActive: boolean
	baseRiskCents: number
	dailyLossCents: number
	weeklyLossCents: number | null
	monthlyLossCents: number
	dailyProfitTargetCents: number | null
	decisionTree: DecisionTreeConfig
	createdAt: Date
	updatedAt: Date
}

/**
 * Input shape for creating/updating a risk profile.
 */
interface RiskProfileInput {
	name: string
	description?: string | null
	baseRiskCents: number
	dailyLossCents: number
	weeklyLossCents?: number | null
	monthlyLossCents: number
	dailyProfitTargetCents?: number | null
	decisionTree: DecisionTreeConfig
}

export type {
	RiskCalculation,
	LossRecoveryStep,
	GainMode,
	DecisionTreeConfig,
	RiskManagementProfile,
	RiskProfileInput,
}
