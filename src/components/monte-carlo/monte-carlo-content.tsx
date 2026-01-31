"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Dices, Loader2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputModeSelector } from "./input-mode-selector"
import { DataSourceSelector } from "./data-source-selector"
import { StatsPreview } from "./stats-preview"
import { SimulationParamsForm } from "./simulation-params-form"
import { EquityCurveChart } from "./equity-curve-chart"
import { DrawdownChart } from "./drawdown-chart"
import { DistributionHistogram } from "./distribution-histogram"
import { MetricsCards } from "./metrics-cards"
import { KellyCriterionCard } from "./kelly-criterion-card"
import { TradeSequenceList } from "./trade-sequence-list"
import { StrategyAnalysis } from "./strategy-analysis"
import {
	getDataSourceOptions,
	getSimulationStats,
	runSimulation,
} from "@/app/actions/monte-carlo"
import { defaultSimulationParams } from "@/lib/validations/monte-carlo"
import type {
	DataSource,
	SourceStats,
	SimulationParams,
	MonteCarloResult,
	DataSourceOption,
} from "@/types/monte-carlo"

interface MonteCarloContentProps {
	initialOptions: DataSourceOption[]
}

export const MonteCarloContent = ({
	initialOptions,
}: MonteCarloContentProps) => {
	const t = useTranslations("monteCarlo")

	// Mode state
	const [inputMode, setInputMode] = useState<"auto" | "manual">("auto")
	const [selectedSource, setSelectedSource] = useState<DataSource | null>(null)
	const [sourceStats, setSourceStats] = useState<SourceStats | null>(null)
	const [isLoadingStats, setIsLoadingStats] = useState(false)

	// Parameters state
	const [params, setParams] = useState<SimulationParams>(
		defaultSimulationParams
	)

	// Results state
	const [result, setResult] = useState<MonteCarloResult | null>(null)
	const [isRunning, setIsRunning] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Load stats when source changes
	const loadSourceStats = useCallback(async (source: DataSource) => {
		setIsLoadingStats(true)
		setError(null)
		try {
			const response = await getSimulationStats(source)
			if (response.status === "success" && response.data) {
				setSourceStats(response.data)
			} else {
				setError(response.message)
				setSourceStats(null)
			}
		} catch (err) {
			setError("Failed to load stats")
			setSourceStats(null)
		} finally {
			setIsLoadingStats(false)
		}
	}, [])

	// When source changes, load stats
	useEffect(() => {
		if (selectedSource && inputMode === "auto") {
			loadSourceStats(selectedSource)
		}
	}, [selectedSource, inputMode, loadSourceStats])

	// Handle "Use These Stats" button
	const handleUseStats = () => {
		if (sourceStats) {
			setParams((prev) => ({
				...prev,
				winRate: Math.round(sourceStats.winRate * 100) / 100,
				rewardRiskRatio: Math.round(sourceStats.avgRewardRiskRatio * 100) / 100,
				commissionPerTrade:
					Math.round(sourceStats.avgCommissionImpact * 100) / 100,
			}))
		}
	}

	// Handle "Customize" button
	const handleCustomize = () => {
		setInputMode("manual")
	}

	const handleRunSimulation = async () => {
		setIsRunning(true)
		setError(null)
		setResult(null)

		try {
			const response = await runSimulation(params)
			if (response.status === "success" && response.data) {
				setResult(response.data)
			} else {
				const errorDetails = response.errors
					?.map((e) => e.detail)
					.join(", ")
				setError(errorDetails || response.message)
			}
		} catch (err) {
			setError("Failed to run simulation")
		} finally {
			setIsRunning(false)
		}
	}

	// Reset to run again
	const handleRunAgain = () => {
		setResult(null)
	}

	return (
		<div className="space-y-m-500">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-h3 text-txt-100 font-bold">{t("title")}</h1>
					<p className="mt-s-100 text-small text-txt-300">{t("subtitle")}</p>
				</div>
				<Button variant="ghost" size="sm" className="text-txt-300">
					<HelpCircle className="mr-s-100 h-4 w-4" />
					Help
				</Button>
			</div>

			{/* Input Section */}
			{!result && (
				<div className="space-y-m-400">
					{/* Mode Selector */}
					<InputModeSelector mode={inputMode} onModeChange={setInputMode} />

					{/* Data Source (Auto mode only) */}
					{inputMode === "auto" && (
						<div className="gap-m-400 grid lg:grid-cols-2">
							<DataSourceSelector
								options={initialOptions}
								selectedSource={selectedSource}
								onSourceChange={setSelectedSource}
								isLoading={isLoadingStats}
							/>
							<StatsPreview
								stats={sourceStats}
								isLoading={isLoadingStats}
								onUseStats={handleUseStats}
								onCustomize={handleCustomize}
							/>
						</div>
					)}

					{/* Parameters Form */}
					<SimulationParamsForm
						params={params}
						onChange={setParams}
						disabled={isRunning}
					/>

					{/* Error Message */}
					{error && (
						<div className="border-fb-error/30 bg-fb-error/10 p-m-400 text-small text-fb-error rounded-lg border">
							{error}
						</div>
					)}

					{/* Run Button */}
					<div className="flex justify-center">
						<Button
							size="lg"
							onClick={handleRunSimulation}
							disabled={isRunning}
							className="min-w-[200px]"
						>
							{isRunning ? (
								<>
									<Loader2 className="mr-s-200 h-5 w-5 animate-spin" />
									Running Simulation...
								</>
							) : (
								<>
									<Dices className="mr-s-200 h-5 w-5" />
									{t("params.calculate")}
								</>
							)}
						</Button>
					</div>
				</div>
			)}

			{/* Results Section */}
			{result && (
				<div className="space-y-m-600">
					{/* Top Summary Banner */}
					<div className="border-bg-300 bg-bg-200 p-m-500 gap-m-500 flex flex-wrap items-center justify-between rounded-lg border">
						<div className="gap-m-400 flex items-center">
							<span className="text-txt-300 text-small">Simulations:</span>
							<span className="text-txt-100 font-medium">
								{params.simulationCount.toLocaleString()}
							</span>
						</div>
						<div className="gap-m-400 flex items-center">
							<span className="text-txt-300 text-small">Trades:</span>
							<span className="text-txt-100 font-medium">
								{params.numberOfTrades}
							</span>
						</div>
						<div className="gap-m-400 flex items-center">
							<span className="text-txt-300 text-small">Win Rate:</span>
							<span className="text-txt-100 font-medium">{params.winRate}%</span>
						</div>
						<div className="gap-m-400 flex items-center">
							<span className="text-txt-300 text-small">R:R:</span>
							<span className="text-txt-100 font-medium">
								1:{params.rewardRiskRatio}
							</span>
						</div>
						<Button variant="outline" size="sm" onClick={handleRunAgain}>
							<Dices className="mr-s-100 h-4 w-4" />
							Run Again
						</Button>
					</div>

					{/* Charts Row - Two equal columns */}
					<div className="gap-m-500 grid lg:grid-cols-2">
						<EquityCurveChart
							trades={result.sampleRun.trades}
							initialBalance={params.initialBalance}
							showPercentage
						/>
						<DrawdownChart trades={result.sampleRun.trades} />
					</div>

					{/* Distribution - Full width */}
					<DistributionHistogram
						buckets={result.distributionBuckets}
						medianBalance={result.statistics.medianFinalBalance}
						initialBalance={params.initialBalance}
					/>

					{/* Metrics Cards - 2x3 grid on desktop */}
					<MetricsCards
						statistics={result.statistics}
						initialBalance={params.initialBalance}
					/>

					{/* Kelly + Trade Sequence - Side by side on desktop */}
					<div className="gap-m-500 grid xl:grid-cols-2">
						<KellyCriterionCard
							statistics={result.statistics}
							initialBalance={params.initialBalance}
						/>
						<TradeSequenceList trades={result.sampleRun.trades} />
					</div>

					{/* Strategy Analysis - Full width */}
					<StrategyAnalysis result={result} />
				</div>
			)}
		</div>
	)
}
