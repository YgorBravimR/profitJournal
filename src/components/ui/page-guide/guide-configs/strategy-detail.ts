import type { PageGuideConfig } from "@/types/page-guide"

const strategyDetailGuide: PageGuideConfig = {
	pageKey: "strategyDetail",
	steps: [
		{
			targetId: "strategy-detail-performance",
			titleKey: "performance",
			descriptionKey: "performanceDesc",
			placement: "bottom",
		},
		{
			targetId: "strategy-detail-conditions",
			titleKey: "conditions",
			descriptionKey: "conditionsDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { strategyDetailGuide }
