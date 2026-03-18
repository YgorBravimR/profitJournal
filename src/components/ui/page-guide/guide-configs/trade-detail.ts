import type { PageGuideConfig } from "@/types/page-guide"

const tradeDetailGuide: PageGuideConfig = {
	pageKey: "tradeDetail",
	steps: [
		{
			targetId: "trade-detail-metrics",
			titleKey: "metrics",
			descriptionKey: "metricsDesc",
			placement: "bottom",
		},
		{
			targetId: "trade-detail-position-summary",
			titleKey: "positionSummary",
			descriptionKey: "positionSummaryDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "trade-detail-executions",
			titleKey: "executions",
			descriptionKey: "executionsDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "trade-detail-risk-analysis",
			titleKey: "riskAnalysis",
			descriptionKey: "riskAnalysisDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "trade-detail-excursion",
			titleKey: "excursion",
			descriptionKey: "excursionDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "trade-detail-classification",
			titleKey: "classification",
			descriptionKey: "classificationDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { tradeDetailGuide }
