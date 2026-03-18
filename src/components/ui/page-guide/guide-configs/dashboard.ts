import type { PageGuideConfig } from "@/types/page-guide"

const dashboardGuide: PageGuideConfig = {
	pageKey: "dashboard",
	steps: [
		{
			targetId: "dashboard-period-toggle",
			titleKey: "periodToggle",
			descriptionKey: "periodToggleDesc",
			placement: "bottom",
		},
		{
			targetId: "dashboard-kpi-cards",
			titleKey: "kpiCards",
			descriptionKey: "kpiCardsDesc",
			placement: "bottom",
		},
		{
			targetId: "dashboard-calendar",
			titleKey: "calendar",
			descriptionKey: "calendarDesc",
			placement: "bottom",
		},
		{
			targetId: "dashboard-quick-stats",
			titleKey: "quickStats",
			descriptionKey: "quickStatsDesc",
			placement: "bottom",
		},
		{
			targetId: "dashboard-radar",
			titleKey: "radar",
			descriptionKey: "radarDesc",
			placement: "top",
		},
		{
			targetId: "dashboard-equity-curve",
			titleKey: "equityCurve",
			descriptionKey: "equityCurveDesc",
			placement: "top",
		},
	],
}

export { dashboardGuide }
