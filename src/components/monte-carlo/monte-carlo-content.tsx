"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useLoadingOverlay } from "@/components/ui/loading-overlay"
import { Dices, HelpCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, AnimatedTabsContent } from "@/components/ui/tabs"
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
import { MonteCarloV2Content } from "./v2/monte-carlo-v2-content"
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
import type { RiskManagementProfile } from "@/types/risk-profile"

interface MonteCarloContentProps {
	initialOptions: DataSourceOption[]
	riskProfiles?: RiskManagementProfile[]
}

export const MonteCarloContent = ({
	initialOptions,
	riskProfiles = [],
}: MonteCarloContentProps) => {
	const t = useTranslations("monteCarlo")
	const tOverlay = useTranslations("overlay")
	const { showLoading, hideLoading } = useLoadingOverlay()

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
		showLoading({ message: tOverlay("runningSimulation") })

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
			hideLoading()
			setIsRunning(false)
		}
	}

	// Reset to run again
	const handleRunAgain = () => {
		setResult(null)
	}

	const tV2 = useTranslations("monteCarlo.v2")

	return (
		<div className="space-y-m-500">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-h3 text-txt-100 font-bold">{t("title")}</h1>
					<p className="mt-s-100 text-small text-txt-300">{t("subtitle")}</p>
				</div>
				<Button id="monte-carlo-help" variant="ghost" size="sm" className="text-txt-300">
					<HelpCircle className="mr-s-100 h-4 w-4" />
					{t("help")}
				</Button>
			</div>

			{/* Mode Tabs: Classic | Risk Management */}
			<Tabs defaultValue="classic">
				<TabsList variant="line" className="mb-m-500">
					<TabsTrigger value="classic">{tV2("tabClassic")}</TabsTrigger>
					<TabsTrigger value="riskManagement">{tV2("tabRiskManagement")}</TabsTrigger>
				</TabsList>

				<AnimatedTabsContent value="classic">
					<ClassicContent
						initialOptions={initialOptions}
						inputMode={inputMode}
						setInputMode={setInputMode}
						selectedSource={selectedSource}
						setSelectedSource={setSelectedSource}
						sourceStats={sourceStats}
						isLoadingStats={isLoadingStats}
						params={params}
						setParams={setParams}
						result={result}
						isRunning={isRunning}
						error={error}
						onUseStats={handleUseStats}
						onCustomize={handleCustomize}
						onRunSimulation={handleRunSimulation}
						onRunAgain={handleRunAgain}
					/>
				</AnimatedTabsContent>

				<AnimatedTabsContent value="riskManagement">
					<MonteCarloV2Content profiles={riskProfiles} />
				</AnimatedTabsContent>
			</Tabs>
		</div>
	)
}

// ==========================================
// CLASSIC CONTENT — Extracted for tab layout
// ==========================================

interface ClassicContentProps {
	initialOptions: DataSourceOption[]
	inputMode: "auto" | "manual"
	setInputMode: (mode: "auto" | "manual") => void
	selectedSource: DataSource | null
	setSelectedSource: (source: DataSource | null) => void
	sourceStats: SourceStats | null
	isLoadingStats: boolean
	params: SimulationParams
	setParams: (params: SimulationParams | ((prev: SimulationParams) => SimulationParams)) => void
	result: MonteCarloResult | null
	isRunning: boolean
	error: string | null
	onUseStats: () => void
	onCustomize: () => void
	onRunSimulation: () => void
	onRunAgain: () => void
}

const ClassicContent = ({
	initialOptions,
	inputMode,
	setInputMode,
	selectedSource,
	setSelectedSource,
	sourceStats,
	isLoadingStats,
	params,
	setParams,
	result,
	isRunning,
	error,
	onUseStats,
	onCustomize,
	onRunSimulation,
	onRunAgain,
}: ClassicContentProps) => {
	const t = useTranslations("monteCarlo")

	return (
		<div className="space-y-m-500">
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
								onUseStats={onUseStats}
								onCustomize={onCustomize}
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
						<Button id="monte-carlo-run-simulation"
							size="lg"
							onClick={onRunSimulation}
							disabled={isRunning}
							className="min-w-[200px]"
						>
							{isRunning ? (
								<LoadingSpinner size="sm" label="Running Simulation..." />
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
							<span className="text-txt-300 text-small">{t("results.simulations")}:</span>
							<span className="text-txt-100 font-medium">
								{params.simulationCount.toLocaleString()}
							</span>
						</div>
						<div className="gap-m-400 flex items-center">
							<span className="text-txt-300 text-small">{t("results.tradesLabel")}:</span>
							<span className="text-txt-100 font-medium">
								{params.numberOfTrades}
							</span>
						</div>
						<div className="gap-m-400 flex items-center">
							<span className="text-txt-300 text-small">{t("results.winRateLabel")}:</span>
							<span className="text-txt-100 font-medium">{params.winRate}%</span>
						</div>
						<div className="gap-m-400 flex items-center">
							<span className="text-txt-300 text-small">{t("results.rrLabel")}:</span>
							<span className="text-txt-100 font-medium">
								1:{params.rewardRiskRatio}
							</span>
						</div>
						<Button id="monte-carlo-run-again" variant="outline" size="sm" onClick={onRunAgain}>
							<Dices className="mr-s-100 h-4 w-4" />
							{t("results.runAgain")}
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
