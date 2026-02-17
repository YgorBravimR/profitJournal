import type { RiskManagementProfile } from "@/types/risk-profile"
import type { RiskManagementProfileForSim } from "@/types/monte-carlo"

/**
 * Converts a risk management profile into a flat simulation config.
 * Pre-computes absolute risk amounts for each loss recovery step.
 *
 * This is a pure function (no DB access) so it can be used both server-side
 * and client-side.
 */
export const buildProfileForSim = (
	profile: RiskManagementProfile,
	overrides: {
		winRate: number
		rewardRiskRatio: number
		breakevenRate?: number
		commissionPerTradeCents?: number
		tradingDaysPerMonth?: number
		tradingDaysPerWeek?: number
	}
): RiskManagementProfileForSim => {
	const tree = profile.decisionTree

	// Pre-compute loss recovery step risk amounts in absolute cents.
	// Uses reduce to track previous step's risk for "sameAsPrevious" resolution.
	const lossRecoverySteps = tree.lossRecovery.sequence.reduce<
		Array<{ riskCents: number }>
	>((acc, step) => {
		let riskCents: number
		const previousRisk = acc.length > 0
			? acc[acc.length - 1].riskCents
			: tree.baseTrade.riskCents

		switch (step.riskCalculation.type) {
			case "percentOfBase":
				riskCents = Math.round(tree.baseTrade.riskCents * step.riskCalculation.percent / 100)
				break
			case "sameAsPrevious":
				riskCents = previousRisk
				break
			case "fixedCents":
				riskCents = step.riskCalculation.amountCents
				break
		}

		acc.push({ riskCents })
		return acc
	}, [])

	const compoundingRiskPercent = tree.gainMode.type === "compounding"
		? tree.gainMode.reinvestmentPercent
		: 0

	const stopOnFirstLoss = tree.gainMode.type === "compounding"
		? tree.gainMode.stopOnFirstLoss
		: true

	const dailyTargetCents = tree.gainMode.dailyTargetCents ?? profile.dailyProfitTargetCents

	return {
		name: profile.name,
		baseRiskCents: tree.baseTrade.riskCents,
		rewardRiskRatio: overrides.rewardRiskRatio,
		winRate: overrides.winRate,
		breakevenRate: overrides.breakevenRate ?? 0,
		dailyTargetCents: dailyTargetCents ?? null,
		dailyLossLimitCents: profile.dailyLossCents,
		lossRecoverySteps,
		executeAllRegardless: tree.lossRecovery.executeAllRegardless,
		stopAfterSequence: tree.lossRecovery.stopAfterSequence,
		compoundingRiskPercent,
		stopOnFirstLoss,
		weeklyLossLimitCents: profile.weeklyLossCents,
		monthlyLossLimitCents: profile.monthlyLossCents,
		tradingDaysPerMonth: overrides.tradingDaysPerMonth ?? 22,
		tradingDaysPerWeek: overrides.tradingDaysPerWeek ?? 5,
		commissionPerTradeCents: overrides.commissionPerTradeCents ?? 0,
	}
}
