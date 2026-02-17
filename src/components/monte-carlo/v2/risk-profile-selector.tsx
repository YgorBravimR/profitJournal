"use client"

import { useTranslations } from "next-intl"
import { fromCents } from "@/lib/money"
import { formatCompactCurrency } from "@/lib/formatting"
import type { RiskManagementProfile } from "@/types/risk-profile"
import type { RiskManagementProfileForSim } from "@/types/monte-carlo"

interface RiskProfileSelectorProps {
	profiles: RiskManagementProfile[]
	selectedProfileId: string
	onProfileChange: (profileId: string) => void
	simProfile: RiskManagementProfileForSim | null
}

const RiskProfileSelector = ({
	profiles,
	selectedProfileId,
	onProfileChange,
	simProfile,
}: RiskProfileSelectorProps) => {
	const t = useTranslations("monteCarlo.v2")

	return (
		<div className="space-y-m-300">
			<label className="text-small text-txt-200 block font-medium">
				{t("profileSelector.title")}
			</label>
			<select
				value={selectedProfileId}
				onChange={(e) => onProfileChange(e.target.value)}
				className="border-bg-300 bg-bg-100 text-small text-txt-100 focus:ring-acc-100 w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
				aria-label={t("profileSelector.title")}
			>
				<option value="">{t("profileSelector.selectProfile")}</option>
				{profiles.map((profile) => (
					<option key={profile.id} value={profile.id}>
						{profile.name}
					</option>
				))}
			</select>

			{/* Profile Summary */}
			{simProfile && (
				<div className="rounded-lg border border-acc-100/20 bg-acc-100/5 p-m-300">
					<div className="grid grid-cols-2 gap-s-200 text-tiny">
						<span className="text-txt-300">{t("profileSummary.baseRisk")}:</span>
						<span className="text-txt-100 font-medium">
							{formatCompactCurrency(fromCents(simProfile.baseRiskCents))}
						</span>
						<span className="text-txt-300">{t("profileSummary.dailyLossLimit")}:</span>
						<span className="text-txt-100 font-medium">
							{formatCompactCurrency(fromCents(simProfile.dailyLossLimitCents))}
						</span>
						{simProfile.weeklyLossLimitCents && (
							<>
								<span className="text-txt-300">{t("profileSummary.weeklyLossLimit")}:</span>
								<span className="text-txt-100 font-medium">
									{formatCompactCurrency(fromCents(simProfile.weeklyLossLimitCents))}
								</span>
							</>
						)}
						<span className="text-txt-300">{t("profileSummary.monthlyLossLimit")}:</span>
						<span className="text-txt-100 font-medium">
							{formatCompactCurrency(fromCents(simProfile.monthlyLossLimitCents))}
						</span>
						{simProfile.dailyTargetCents && (
							<>
								<span className="text-txt-300">{t("profileSummary.dailyTarget")}:</span>
								<span className="text-txt-100 font-medium">
									{formatCompactCurrency(fromCents(simProfile.dailyTargetCents))}
								</span>
							</>
						)}
						<span className="text-txt-300">{t("profileSummary.lossRecovery")}:</span>
						<span className="text-txt-100 font-medium">
							{simProfile.lossRecoverySteps.length} {t("profileSummary.steps")}
						</span>
						<span className="text-txt-300">{t("profileSummary.gainMode")}:</span>
						<span className="text-txt-100 font-medium">
							{simProfile.compoundingRiskPercent > 0
								? `${t("profileSummary.compounding")} (${simProfile.compoundingRiskPercent}%)`
								: t("profileSummary.singleTarget")}
						</span>
					</div>
				</div>
			)}
		</div>
	)
}

export { RiskProfileSelector }
