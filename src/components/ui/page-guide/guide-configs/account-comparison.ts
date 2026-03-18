import type { PageGuideConfig } from "@/types/page-guide"

const accountComparisonGuide: PageGuideConfig = {
	pageKey: "accountComparison",
	steps: [
		{
			targetId: "comparison-selector",
			titleKey: "selector",
			descriptionKey: "selectorDesc",
			placement: "bottom",
		},
		{
			targetId: "comparison-stats-table",
			titleKey: "statsTable",
			descriptionKey: "statsTableDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "comparison-normalized-table",
			titleKey: "normalizedTable",
			descriptionKey: "normalizedTableDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "comparison-equity-chart",
			titleKey: "equityChart",
			descriptionKey: "equityChartDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "comparison-config-summary",
			titleKey: "configSummary",
			descriptionKey: "configSummaryDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { accountComparisonGuide }
