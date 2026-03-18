import type { PageGuideConfig } from "@/types/page-guide"

const newTradeGuide: PageGuideConfig = {
	pageKey: "newTrade",
	steps: [
		{
			targetId: "new-trade-mode-selector",
			titleKey: "modeSelector",
			descriptionKey: "modeSelectorDesc",
			placement: "bottom",
			optional: true,
		},
		// Simple trade — Risk tab fields
		{
			targetId: "new-trade-sl-tp",
			titleKey: "slTp",
			descriptionKey: "slTpDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "new-trade-planned-risk",
			titleKey: "plannedRisk",
			descriptionKey: "plannedRiskDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "new-trade-planned-r",
			titleKey: "plannedR",
			descriptionKey: "plannedRDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "new-trade-mfe-mae",
			titleKey: "mfeMae",
			descriptionKey: "mfeMaeDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "new-trade-contracts-executed",
			titleKey: "contractsExecuted",
			descriptionKey: "contractsExecutedDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "new-trade-setup-rank",
			titleKey: "setupRank",
			descriptionKey: "setupRankDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "new-trade-pnl-summary",
			titleKey: "pnlSummary",
			descriptionKey: "pnlSummaryDesc",
			placement: "top",
			optional: true,
		},
		// Scaled trade fields
		{
			targetId: "scaled-trade-entries",
			titleKey: "scaledEntries",
			descriptionKey: "scaledEntriesDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "scaled-trade-exits",
			titleKey: "scaledExits",
			descriptionKey: "scaledExitsDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "scaled-trade-position-summary",
			titleKey: "positionSummary",
			descriptionKey: "positionSummaryDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "scaled-trade-risk",
			titleKey: "scaledRisk",
			descriptionKey: "scaledRiskDesc",
			placement: "top",
			optional: true,
		},
		// CSV import fields
		{
			targetId: "csv-upload-zone",
			titleKey: "csvUpload",
			descriptionKey: "csvUploadDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "csv-import-summary",
			titleKey: "csvSummary",
			descriptionKey: "csvSummaryDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "csv-sl-tp-generator",
			titleKey: "csvSlTp",
			descriptionKey: "csvSlTpDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { newTradeGuide }
