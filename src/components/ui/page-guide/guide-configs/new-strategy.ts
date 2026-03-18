import type { PageGuideConfig } from "@/types/page-guide"

const newStrategyGuide: PageGuideConfig = {
	pageKey: "newStrategy",
	steps: [
		{
			targetId: "strategy-rules-criteria",
			titleKey: "rulesCriteria",
			descriptionKey: "rulesCriteriaDesc",
			placement: "top",
		},
		{
			targetId: "strategy-risk-settings",
			titleKey: "riskSettings",
			descriptionKey: "riskSettingsDesc",
			placement: "top",
		},
		{
			targetId: "strategy-conditions",
			titleKey: "conditions",
			descriptionKey: "conditionsDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { newStrategyGuide }
