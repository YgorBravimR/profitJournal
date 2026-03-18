import type { PageGuideConfig } from "@/types/page-guide"

const analyticsGuide: PageGuideConfig = {
	pageKey: "analytics",
	steps: [
		{
			targetId: "analytics-filters",
			titleKey: "filters",
			descriptionKey: "filtersDesc",
			placement: "bottom",
		},
		{
			targetId: "analytics-variable-comparison",
			titleKey: "variableComparison",
			descriptionKey: "variableComparisonDesc",
			placement: "bottom",
		},
		{
			targetId: "analytics-equity-curve",
			titleKey: "equityCurve",
			descriptionKey: "equityCurveDesc",
			placement: "top",
		},
		{
			targetId: "analytics-expected-value",
			titleKey: "expectedValue",
			descriptionKey: "expectedValueDesc",
			placement: "top",
		},
		{
			targetId: "analytics-r-distribution",
			titleKey: "rDistribution",
			descriptionKey: "rDistributionDesc",
			placement: "top",
		},
		{
			targetId: "analytics-tag-cloud",
			titleKey: "tagCloud",
			descriptionKey: "tagCloudDesc",
			placement: "top",
		},
		{
			targetId: "analytics-time-section",
			titleKey: "timeSection",
			descriptionKey: "timeSectionDesc",
			placement: "bottom",
		},
		{
			targetId: "analytics-heatmap",
			titleKey: "heatmap",
			descriptionKey: "heatmapDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "analytics-session-chart",
			titleKey: "sessionChart",
			descriptionKey: "sessionChartDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "analytics-session-asset",
			titleKey: "sessionAsset",
			descriptionKey: "sessionAssetDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "analytics-hourly",
			titleKey: "hourly",
			descriptionKey: "hourlyDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "analytics-day-of-week",
			titleKey: "dayOfWeek",
			descriptionKey: "dayOfWeekDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { analyticsGuide }
