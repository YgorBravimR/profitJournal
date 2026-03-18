import type { PageGuideConfig } from "@/types/page-guide"

const reportsGuide: PageGuideConfig = {
	pageKey: "reports",
	steps: [
		{
			targetId: "reports-weekly",
			titleKey: "weekly",
			descriptionKey: "weeklyDesc",
			placement: "bottom",
		},
		{
			targetId: "reports-monthly",
			titleKey: "monthly",
			descriptionKey: "monthlyDesc",
			placement: "bottom",
		},
		{
			targetId: "reports-mistake-cost",
			titleKey: "mistakeCost",
			descriptionKey: "mistakeCostDesc",
			placement: "top",
		},
	],
}

export { reportsGuide }
