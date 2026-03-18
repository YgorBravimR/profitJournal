import type { PageGuideConfig } from "@/types/page-guide"

const riskSimulationGuide: PageGuideConfig = {
	pageKey: "riskSimulation",
	steps: [
		{
			targetId: "sim-date-range",
			titleKey: "dateRange",
			descriptionKey: "dateRangeDesc",
			placement: "bottom",
		},
		{
			targetId: "sim-year-filter",
			titleKey: "yearFilter",
			descriptionKey: "yearFilterDesc",
			placement: "bottom",
		},
		{
			targetId: "sim-prefill-selector",
			titleKey: "prefillSelector",
			descriptionKey: "prefillSelectorDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "sim-risk-params",
			titleKey: "riskParams",
			descriptionKey: "riskParamsDesc",
			placement: "right",
			optional: true,
		},
		{
			targetId: "sim-reduction-factor",
			titleKey: "reductionFactor",
			descriptionKey: "reductionFactorDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "sim-reinvestment-percent",
			titleKey: "reinvestmentPercent",
			descriptionKey: "reinvestmentPercentDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "btn-run-simulation",
			titleKey: "runSimulation",
			descriptionKey: "runSimulationDesc",
			placement: "top",
		},
		{
			targetId: "risk-sim-equity-chart",
			titleKey: "equityCurve",
			descriptionKey: "equityCurveDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "btn-view-trace",
			titleKey: "decisionTrace",
			descriptionKey: "decisionTraceDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { riskSimulationGuide }
