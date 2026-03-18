import type { PageGuideConfig } from "@/types/page-guide"

const commandCenterGuide: PageGuideConfig = {
	pageKey: "commandCenter",
	steps: [
		{
			targetId: "cc-circuit-breaker",
			titleKey: "circuitBreaker",
			descriptionKey: "circuitBreakerDesc",
			placement: "bottom",
		},
		{
			targetId: "cc-live-trading",
			titleKey: "liveTrading",
			descriptionKey: "liveTradingDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "cc-daily-checklist",
			titleKey: "dailyChecklist",
			descriptionKey: "dailyChecklistDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "cc-plan-summary",
			titleKey: "planSummary",
			descriptionKey: "planSummaryDesc",
			placement: "bottom",
		},
		{
			targetId: "cc-asset-rules",
			titleKey: "assetRules",
			descriptionKey: "assetRulesDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "cc-daily-summary",
			titleKey: "dailySummary",
			descriptionKey: "dailySummaryDesc",
			placement: "top",
		},
	],
}

export { commandCenterGuide }
