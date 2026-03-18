import type { PageGuideConfig } from "@/types/page-guide"

const monteCarloGuide: PageGuideConfig = {
	pageKey: "monteCarlo",
	steps: [
		// Tab explanation
		{
			targetId: "monte-carlo-tabs",
			titleKey: "tabs",
			descriptionKey: "tabsDesc",
			placement: "bottom",
		},
		// ─── Edge Expectancy tab (V1) ───
		{
			targetId: "monte-carlo-data-source",
			titleKey: "dataSource",
			descriptionKey: "dataSourceDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "monte-carlo-use-stats",
			titleKey: "useStats",
			descriptionKey: "useStatsDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "simulation-win-rate",
			titleKey: "winRate",
			descriptionKey: "winRateDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "simulation-count",
			titleKey: "simulationCount",
			descriptionKey: "simulationCountDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "monte-carlo-run-simulation",
			titleKey: "runSimulation",
			descriptionKey: "runSimulationDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "chart-monte-carlo-equity-curve",
			titleKey: "equityCurve",
			descriptionKey: "equityCurveDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "chart-monte-carlo-drawdown",
			titleKey: "drawdown",
			descriptionKey: "drawdownDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "chart-monte-carlo-distribution-histogram",
			titleKey: "distribution",
			descriptionKey: "distributionDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "monte-carlo-metrics",
			titleKey: "metrics",
			descriptionKey: "metricsDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "monte-carlo-kelly",
			titleKey: "kelly",
			descriptionKey: "kellyDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "monte-carlo-strategy",
			titleKey: "strategy",
			descriptionKey: "strategyDesc",
			placement: "top",
			optional: true,
		},
		// ─── Capital Expectancy tab (V2) ───
		{
			targetId: "v2-initial-balance",
			titleKey: "v2InitialBalance",
			descriptionKey: "v2InitialBalanceDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "v2-ruin-threshold",
			titleKey: "v2RuinThreshold",
			descriptionKey: "v2RuinThresholdDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "monte-carlo-v2-run-simulation",
			titleKey: "v2RunSimulation",
			descriptionKey: "v2RunSimulationDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "monte-carlo-v2-summary",
			titleKey: "v2Summary",
			descriptionKey: "v2SummaryDesc",
			placement: "bottom",
			optional: true,
		},
		{
			targetId: "chart-monte-carlo-v2-daily-pnl",
			titleKey: "v2DailyPnl",
			descriptionKey: "v2DailyPnlDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "chart-monte-carlo-v2-distribution-histogram",
			titleKey: "v2Distribution",
			descriptionKey: "v2DistributionDesc",
			placement: "top",
			optional: true,
		},
		{
			targetId: "chart-monte-carlo-v2-mode-distribution",
			titleKey: "v2ModeDistribution",
			descriptionKey: "v2ModeDistributionDesc",
			placement: "top",
			optional: true,
		},
	],
}

export { monteCarloGuide }
