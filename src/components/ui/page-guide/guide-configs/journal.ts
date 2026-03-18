import type { PageGuideConfig } from "@/types/page-guide"

const journalGuide: PageGuideConfig = {
	pageKey: "journal",
	steps: [
		{
			targetId: "journal-period-filter",
			titleKey: "periodFilter",
			descriptionKey: "periodFilterDesc",
			placement: "bottom",
		},
		{
			targetId: "journal-period-summary",
			titleKey: "periodSummary",
			descriptionKey: "periodSummaryDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "journal-trade-groups",
			titleKey: "tradeGroups",
			descriptionKey: "tradeGroupsDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { journalGuide }
