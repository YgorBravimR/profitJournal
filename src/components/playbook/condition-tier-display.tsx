"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, ShieldPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StrategyConditionWithDetail } from "@/app/actions/strategy-conditions"

interface ConditionTierDisplayProps {
	conditions: StrategyConditionWithDetail[]
}

const getCategoryColor = (category: string): string => {
	switch (category) {
		case "indicator":
			return "border-acc-100/40 bg-acc-100/10 text-acc-100"
		case "price_action":
			return "border-trade-buy/40 bg-trade-buy/10 text-trade-buy"
		case "market_context":
			return "border-warning/40 bg-warning/10 text-warning"
		case "custom":
			return "border-txt-200/40 bg-txt-200/10 text-txt-200"
		default:
			return "border-bg-300 bg-bg-200 text-txt-300"
	}
}

export const ConditionTierDisplay = ({ conditions }: ConditionTierDisplayProps) => {
	const t = useTranslations("playbook.conditions")

	const mandatory = conditions.filter((c) => c.tier === "mandatory")
	const tier2 = conditions.filter((c) => c.tier === "tier_2")
	const tier3 = conditions.filter((c) => c.tier === "tier_3")

	if (conditions.length === 0) return null

	const tiers = [
		{
			key: "mandatory",
			label: t("tierMandatory"),
			icon: Shield,
			items: mandatory,
			rankLabel: "A",
			description: t("tierMandatoryHint"),
		},
		{
			key: "tier_2",
			label: t("tierTwo"),
			icon: ShieldCheck,
			items: tier2,
			rankLabel: "AA",
			description: t("tierTwoHint"),
		},
		{
			key: "tier_3",
			label: t("tierThree"),
			icon: ShieldPlus,
			items: tier3,
			rankLabel: "AAA",
			description: t("tierThreeHint"),
		},
	]

	return (
		<div className="space-y-m-400">
			{/* Rank legend */}
			<div className="gap-s-300 flex items-center">
				<span className="text-tiny text-txt-300">{t("rankBreakdown")}:</span>
				<Badge id="legend-rank-a" variant="outline" className="text-trade-buy border-trade-buy/40">
					A = {t("tierMandatory")}
				</Badge>
				<Badge id="legend-rank-aa" variant="outline" className="text-acc-100 border-acc-100/40">
					AA = + {t("tierTwo")}
				</Badge>
				<Badge id="legend-rank-aaa" variant="outline" className="border-warning/40 text-warning">
					AAA = + {t("tierThree")}
				</Badge>
			</div>

			{/* Tier sections */}
			{tiers.map((tier) => {
				if (tier.items.length === 0) return null

				const TierIcon = tier.icon
				return (
					<div key={tier.key}>
						<div className="mb-s-200 flex items-center gap-s-200">
							<TierIcon className="text-txt-200 h-4 w-4" />
							<span className="text-small text-txt-100 font-medium">
								{tier.label}
							</span>
							<span className="text-tiny text-txt-300">
								({tier.description})
							</span>
						</div>
						<div className="gap-s-200 flex flex-wrap">
							{tier.items.map((sc) => (
								<Badge
									id={`condition-badge-${sc.id}`}
									key={sc.id}
									variant="outline"
									className={cn("text-small", getCategoryColor(sc.condition.category))}
								>
									{sc.condition.name}
								</Badge>
							))}
						</div>
					</div>
				)
			})}
		</div>
	)
}
