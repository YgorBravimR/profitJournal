import type { DecisionTreeConfig } from "@/types/risk-profile"

// ==========================================
// RISK PROFILE TEMPLATES
// ==========================================

/**
 * A code-defined template for pre-filling the risk profile creation form.
 * Users select a template, customize values, then save as a real profile.
 */
interface RiskProfileTemplate {
	id: string
	nameKey: string // i18n key under settings.riskProfiles.templates
	descriptionKey: string
	author: string
	category: "sizing" | "drawdown" | "r-based" | "kelly"
	defaults: {
		baseRiskCents: number
		dailyLossCents: number
		weeklyLossCents: number | null
		monthlyLossCents: number
		dailyProfitTargetCents: number | null
		decisionTree: DecisionTreeConfig
	}
}

/**
 * 5 professional risk management model templates.
 *
 * Template 1: Fixed Fractional (Van Tharp) — risk a fixed % of current balance
 * Template 2: Fixed Ratio (Ralph Vince) — scale position size by accumulated profit
 * Template 3: Institutional (CTA/Quant) — conservative with 3-tier drawdown controls
 * Template 4: R-Multiples (Van Tharp) — clean R-based framework with fixed sizing
 * Template 5: Kelly Fractional (Kelly/Shannon) — mathematically optimal sizing with safety divisor
 */
const RISK_PROFILE_TEMPLATES: RiskProfileTemplate[] = [
	// Template 1: Fixed Fractional (Van Tharp)
	{
		id: "fixed-fractional",
		nameKey: "fixedFractional.name",
		descriptionKey: "fixedFractional.description",
		author: "Van Tharp",
		category: "sizing",
		defaults: {
			baseRiskCents: 50000, // R$500 fallback for fixed mode calculations
			dailyLossCents: 100000, // R$1,000
			weeklyLossCents: 250000, // R$2,500
			monthlyLossCents: 500000, // R$5,000
			dailyProfitTargetCents: 300000, // R$3,000 (6R × R$500 base risk)
			decisionTree: {
				baseTrade: {
					riskCents: 50000,
					maxContracts: null,
					minStopPoints: null,
				},
				lossRecovery: {
					sequence: [
						{ riskCalculation: { type: "percentOfBase", percent: 50 }, maxContractsOverride: null },
					],
					executeAllRegardless: false,
					stopAfterSequence: true,
				},
				gainMode: {
					type: "singleTarget",
					dailyTargetCents: 300000,
				},
				cascadingLimits: {
					weeklyLossCents: 250000,
					weeklyAction: "stopTrading",
					monthlyLossCents: 500000,
					monthlyAction: "stopTrading",
				},
				executionConstraints: {
					minStopPoints: null,
					maxContracts: null,
					operatingHoursStart: null,
					operatingHoursEnd: null,
				},
				riskSizing: { type: "percentOfBalance", riskPercent: 0.75 },
				limitMode: "percentOfInitial",
				limitsPercent: { daily: 2, weekly: 5, monthly: 10 },
				drawdownControl: {
					tiers: [
						{ drawdownPercent: 10, action: "reduceRisk", reducePercent: 50 },
					],
					recoveryThresholdPercent: 50,
				},
				consecutiveLossRules: [
					{ consecutiveDays: 3, action: "reduceRisk", reducePercent: 50 },
					{ consecutiveDays: 5, action: "stopDay", reducePercent: 0 },
				],
			},
		},
	},

	// Template 2: Fixed Ratio (Ralph Vince)
	{
		id: "fixed-ratio",
		nameKey: "fixedRatio.name",
		descriptionKey: "fixedRatio.description",
		author: "Ralph Vince",
		category: "sizing",
		defaults: {
			baseRiskCents: 50000,
			dailyLossCents: 150000,
			weeklyLossCents: 300000,
			monthlyLossCents: 600000,
			dailyProfitTargetCents: null,
			decisionTree: {
				baseTrade: {
					riskCents: 50000,
					maxContracts: null,
					minStopPoints: null,
				},
				lossRecovery: {
					sequence: [
						{ riskCalculation: { type: "percentOfBase", percent: 75 }, maxContractsOverride: null },
						{ riskCalculation: { type: "percentOfBase", percent: 50 }, maxContractsOverride: null },
					],
					executeAllRegardless: false,
					stopAfterSequence: false,
				},
				gainMode: {
					type: "compounding",
					reinvestmentPercent: 30,
					stopOnFirstLoss: true,
					dailyTargetCents: null,
				},
				cascadingLimits: {
					weeklyLossCents: 300000,
					weeklyAction: "stopTrading",
					monthlyLossCents: 600000,
					monthlyAction: "stopTrading",
				},
				executionConstraints: {
					minStopPoints: null,
					maxContracts: null,
					operatingHoursStart: null,
					operatingHoursEnd: null,
				},
				riskSizing: { type: "fixedRatio", deltaCents: 500000, baseContractRiskCents: 50000 },
				limitMode: "rMultiples",
				limitsR: { daily: 3, weekly: 6, monthly: 12 },
				consecutiveLossRules: [
					{ consecutiveDays: 2, action: "reduceRisk", reducePercent: 33 },
					{ consecutiveDays: 4, action: "reduceRisk", reducePercent: 75 },
				],
			},
		},
	},

	// Template 3: Institutional (CTA/Quant Funds)
	{
		id: "institutional",
		nameKey: "institutional.name",
		descriptionKey: "institutional.description",
		author: "CTA/Quant Funds",
		category: "drawdown",
		defaults: {
			baseRiskCents: 50000,
			dailyLossCents: 75000,
			weeklyLossCents: 200000,
			monthlyLossCents: 400000,
			dailyProfitTargetCents: 100000,
			decisionTree: {
				baseTrade: {
					riskCents: 50000,
					maxContracts: null,
					minStopPoints: null,
				},
				lossRecovery: {
					sequence: [
						{ riskCalculation: { type: "percentOfBase", percent: 50 }, maxContractsOverride: null },
					],
					executeAllRegardless: false,
					stopAfterSequence: true,
				},
				gainMode: {
					type: "singleTarget",
					dailyTargetCents: 100000,
				},
				cascadingLimits: {
					weeklyLossCents: 200000,
					weeklyAction: "stopTrading",
					monthlyLossCents: 400000,
					monthlyAction: "stopTrading",
				},
				executionConstraints: {
					minStopPoints: null,
					maxContracts: null,
					operatingHoursStart: null,
					operatingHoursEnd: null,
				},
				riskSizing: { type: "percentOfBalance", riskPercent: 0.5 },
				limitMode: "percentOfInitial",
				limitsPercent: { daily: 1.5, weekly: 4, monthly: 8 },
				drawdownControl: {
					tiers: [
						{ drawdownPercent: 5, action: "reduceRisk", reducePercent: 25 },
						{ drawdownPercent: 8, action: "reduceRisk", reducePercent: 50 },
						{ drawdownPercent: 12, action: "pause", reducePercent: 0 },
					],
					recoveryThresholdPercent: 50,
				},
			},
		},
	},

	// Template 4: R-Multiples (Van Tharp / Larry Williams)
	{
		id: "r-multiples",
		nameKey: "rMultiples.name",
		descriptionKey: "rMultiples.description",
		author: "Van Tharp / Larry Williams",
		category: "r-based",
		defaults: {
			baseRiskCents: 50000,
			dailyLossCents: 150000,
			weeklyLossCents: 250000,
			monthlyLossCents: 500000,
			dailyProfitTargetCents: 200000,
			decisionTree: {
				baseTrade: {
					riskCents: 50000,
					maxContracts: null,
					minStopPoints: null,
				},
				lossRecovery: {
					sequence: [
						{ riskCalculation: { type: "sameAsPrevious" }, maxContractsOverride: null },
						{ riskCalculation: { type: "percentOfBase", percent: 75 }, maxContractsOverride: null },
					],
					executeAllRegardless: false,
					stopAfterSequence: false,
				},
				gainMode: {
					type: "singleTarget",
					dailyTargetCents: 200000,
				},
				cascadingLimits: {
					weeklyLossCents: 250000,
					weeklyAction: "stopTrading",
					monthlyLossCents: 500000,
					monthlyAction: "stopTrading",
				},
				executionConstraints: {
					minStopPoints: null,
					maxContracts: null,
					operatingHoursStart: null,
					operatingHoursEnd: null,
				},
				riskSizing: { type: "fixed" },
				limitMode: "rMultiples",
				limitsR: { daily: 3, weekly: 5, monthly: 10 },
			},
		},
	},

	// Template 5: Kelly Fractional (Kelly / Shannon)
	{
		id: "kelly-fractional",
		nameKey: "kellyFractional.name",
		descriptionKey: "kellyFractional.description",
		author: "Kelly / Shannon",
		category: "kelly",
		defaults: {
			baseRiskCents: 50000,
			dailyLossCents: 150000,
			weeklyLossCents: 350000,
			monthlyLossCents: 750000,
			dailyProfitTargetCents: null,
			decisionTree: {
				baseTrade: {
					riskCents: 50000,
					maxContracts: null,
					minStopPoints: null,
				},
				lossRecovery: {
					sequence: [
						{ riskCalculation: { type: "percentOfBase", percent: 50 }, maxContractsOverride: null },
					],
					executeAllRegardless: false,
					stopAfterSequence: true,
				},
				gainMode: {
					type: "compounding",
					reinvestmentPercent: 25,
					stopOnFirstLoss: true,
					dailyTargetCents: null,
				},
				cascadingLimits: {
					weeklyLossCents: 350000,
					weeklyAction: "stopTrading",
					monthlyLossCents: 750000,
					monthlyAction: "stopTrading",
				},
				executionConstraints: {
					minStopPoints: null,
					maxContracts: null,
					operatingHoursStart: null,
					operatingHoursEnd: null,
				},
				riskSizing: { type: "kellyFractional", divisor: 4 },
				limitMode: "percentOfInitial",
				limitsPercent: { daily: 3, weekly: 7, monthly: 15 },
				drawdownControl: {
					tiers: [
						{ drawdownPercent: 10, action: "reduceRisk", reducePercent: 50 },
						{ drawdownPercent: 15, action: "pause", reducePercent: 0 },
					],
					recoveryThresholdPercent: 50,
				},
			},
		},
	},
]

export { RISK_PROFILE_TEMPLATES }
export type { RiskProfileTemplate }
