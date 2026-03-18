import type { PageGuideConfig } from "@/types/page-guide"

const monthlyGuide: PageGuideConfig = {
	pageKey: "monthly",
	steps: [
		{
			targetId: "monthly-navigator",
			titleKey: "navigator",
			descriptionKey: "navigatorDesc",
			placement: "bottom",
		},
		{
			targetId: "monthly-profit-summary",
			titleKey: "profitSummary",
			descriptionKey: "profitSummaryDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "monthly-projection",
			titleKey: "projection",
			descriptionKey: "projectionDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "monthly-comparison",
			titleKey: "comparison",
			descriptionKey: "comparisonDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "monthly-weekly-breakdown",
			titleKey: "weeklyBreakdown",
			descriptionKey: "weeklyBreakdownDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { monthlyGuide }
