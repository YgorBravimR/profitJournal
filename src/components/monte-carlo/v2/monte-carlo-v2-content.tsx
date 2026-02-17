"use client"

import { useState, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { useLoadingOverlay } from "@/components/ui/loading-overlay"
import { Dices } from "lucide-react"
import { LoadingSpinner } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RiskProfileSelector } from "./risk-profile-selector"
import { V2ResultsSummary } from "./v2-results-summary"
import { V2MetricsCards } from "./v2-metrics-cards"
import { DailyPnlChart } from "./daily-pnl-chart"
import { ModeDistributionChart } from "./mode-distribution-chart"
import { DistributionHistogram } from "../distribution-histogram"
import { runSimulationV2 } from "@/app/actions/monte-carlo"
import { buildProfileForSim } from "@/lib/risk-profile"
import type { RiskManagementProfile } from "@/types/risk-profile"
import type {
	MonteCarloResultV2,
	RiskManagementProfileForSim,
} from "@/types/monte-carlo"

interface MonteCarloV2ContentProps {
	profiles: RiskManagementProfile[]
}

const MonteCarloV2Content = ({ profiles }: MonteCarloV2ContentProps) => {
	const t = useTranslations("monteCarlo.v2")
	const tOverlay = useTranslations("overlay")
	const { showLoading, hideLoading } = useLoadingOverlay()

	// Profile selection state
	const [selectedProfileId, setSelectedProfileId] = useState("")
	const [winRate, setWinRate] = useState("40.7")
	const [profitFactor, setProfitFactor] = useState("")
	const [rewardRiskRatio, setRewardRiskRatio] = useState("1.38")
	const [breakevenRate, setBreakevenRate] = useState("0")
	const [simulationCount, setSimulationCount] = useState("5000")
	const [initialBalance, setInitialBalance] = useState("50000")
	const [tradingDaysPerMonth, setTradingDaysPerMonth] = useState("22")
	const [tradingDaysPerWeek, setTradingDaysPerWeek] = useState("5")
	const [commissionPerTrade, setCommissionPerTrade] = useState("0")

	// When Profit Factor is set, auto-derive R:R = PF × (1 - WR) / WR
	const derivedRR = useMemo(() => {
		const pf = parseFloat(profitFactor)
		const wr = parseFloat(winRate) / 100
		if (!pf || isNaN(pf) || pf <= 0 || isNaN(wr) || wr <= 0 || wr >= 1) return null
		return pf * (1 - wr) / wr
	}, [profitFactor, winRate])

	// The effective R:R: derived from PF when set, otherwise manual input
	const effectiveRR = derivedRR ?? parseFloat(rewardRiskRatio)

	// Implied PF from current WR + effective R:R (for display)
	const impliedPF = useMemo(() => {
		const wr = parseFloat(winRate) / 100
		if (isNaN(wr) || wr <= 0 || wr >= 1 || isNaN(effectiveRR) || effectiveRR <= 0) return null
		return (wr * effectiveRR) / (1 - wr)
	}, [winRate, effectiveRR])

	// Results state
	const [result, setResult] = useState<MonteCarloResultV2 | null>(null)
	const [isRunning, setIsRunning] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

	// Build simulation profile from the selected risk management profile
	const simProfile = useMemo<RiskManagementProfileForSim | null>(() => {
		if (!selectedProfile) return null

		const wr = parseFloat(winRate)
		if (isNaN(wr) || wr <= 0 || isNaN(effectiveRR) || effectiveRR <= 0) return null

		return buildProfileForSim(selectedProfile, {
			winRate: wr,
			rewardRiskRatio: effectiveRR,
			breakevenRate: parseFloat(breakevenRate) || 0,
			commissionPerTradeCents: Math.round(parseFloat(commissionPerTrade) || 0),
			tradingDaysPerMonth: parseInt(tradingDaysPerMonth, 10) || 22,
			tradingDaysPerWeek: parseInt(tradingDaysPerWeek, 10) || 5,
		})
	}, [
		selectedProfile,
		winRate,
		effectiveRR,
		breakevenRate,
		commissionPerTrade,
		tradingDaysPerMonth,
		tradingDaysPerWeek,
	])

	const handleRunSimulation = useCallback(async () => {
		if (!simProfile) return

		setIsRunning(true)
		setError(null)
		setResult(null)
		showLoading({ message: tOverlay("runningSimulation") })

		try {
			const balance = Math.round(parseFloat(initialBalance) * 100) // to cents
			const simCount = parseInt(simulationCount, 10) || 5000

			const response = await runSimulationV2({
				profile: simProfile,
				simulationCount: simCount,
				initialBalance: balance,
			})

			if (response.status === "success" && response.data) {
				setResult(response.data)
			} else {
				const errorDetails = response.errors
					?.map((e) => e.detail)
					.join(", ")
				setError(errorDetails || response.message)
			}
		} catch {
			setError("Failed to run V2 simulation")
		} finally {
			hideLoading()
			setIsRunning(false)
		}
	}, [simProfile, initialBalance, simulationCount, showLoading, hideLoading, tOverlay])

	const handleRunAgain = () => {
		setResult(null)
	}

	const isValid = !!simProfile && parseFloat(initialBalance) > 0 && parseInt(simulationCount, 10) > 0

	return (
		<div className="space-y-m-500">
			{/* Header */}
			<div>
				<h2 className="text-h3 text-txt-100 font-bold">{t("title")}</h2>
				<p className="mt-s-100 text-small text-txt-300">{t("subtitle")}</p>
			</div>

			{/* Input Section */}
			{!result && (
				<div className="space-y-m-400">
					{/* Profile Selector */}
					<RiskProfileSelector
						profiles={profiles}
						selectedProfileId={selectedProfileId}
						onProfileChange={setSelectedProfileId}
						simProfile={simProfile}
					/>

					{/* Parameters — Row 1: Core trade stats */}
					<div className="gap-m-400 grid sm:grid-cols-2 lg:grid-cols-4">
						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("params.winRate")}
							</label>
							<div className="relative">
								<Input
									id="v2-win-rate"
									type="number"
									step="0.1"
									min="0"
									max="100"
									value={winRate}
									onChange={(e) => setWinRate(e.target.value)}
									placeholder="40.7"
									className="pr-8"
									aria-label={t("params.winRate")}
								/>
								<span className="text-tiny text-txt-300 absolute top-1/2 right-3 -translate-y-1/2">
									%
								</span>
							</div>
						</div>

						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("params.profitFactor")}
							</label>
							<Input
								id="v2-profit-factor"
								type="number"
								step="0.01"
								min="0"
								value={profitFactor}
								onChange={(e) => setProfitFactor(e.target.value)}
								placeholder={t("params.profitFactorPlaceholder")}
								aria-label={t("params.profitFactor")}
							/>
						</div>

						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("params.rewardRiskRatio")}
								{derivedRR !== null && (
									<span className="text-tiny text-acc-100 ml-s-200">
										({t("params.derivedFromPF")})
									</span>
								)}
							</label>
							{derivedRR !== null ? (
								<Input
									id="v2-reward-risk-ratio"
									type="number"
									value={derivedRR.toFixed(2)}
									readOnly
									disabled
									className="opacity-70"
									aria-label={t("params.rewardRiskRatio")}
								/>
							) : (
								<Input
									id="v2-reward-risk-ratio"
									type="number"
									step="0.01"
									min="0"
									value={rewardRiskRatio}
									onChange={(e) => setRewardRiskRatio(e.target.value)}
									placeholder="1.38"
									aria-label={t("params.rewardRiskRatio")}
								/>
							)}
							{impliedPF !== null && !derivedRR && (
								<p className="text-tiny text-txt-300 mt-s-100">
									{t("params.impliedPF")}: {impliedPF.toFixed(2)}
								</p>
							)}
						</div>

						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("params.breakevenRate")}
							</label>
							<div className="relative">
								<Input
									id="v2-breakeven-rate"
									type="number"
									step="0.1"
									min="0"
									max="80"
									value={breakevenRate}
									onChange={(e) => setBreakevenRate(e.target.value)}
									placeholder="0"
									className="pr-8"
									aria-label={t("params.breakevenRate")}
								/>
								<span className="text-tiny text-txt-300 absolute top-1/2 right-3 -translate-y-1/2">
									%
								</span>
							</div>
						</div>
					</div>

					{/* Parameters — Row 2: Simulation config */}
					<div className="gap-m-400 grid sm:grid-cols-2 lg:grid-cols-4">
						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("params.simulationCount")}
							</label>
							<Input
								id="v2-simulation-count"
								type="number"
								step="100"
								min="100"
								max="50000"
								value={simulationCount}
								onChange={(e) => setSimulationCount(e.target.value)}
								placeholder="5000"
								aria-label={t("params.simulationCount")}
							/>
						</div>

						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("params.initialBalance")}
							</label>
							<div className="relative">
								<span className="text-tiny text-txt-300 absolute top-1/2 left-3 -translate-y-1/2">
									R$
								</span>
								<Input
									id="v2-initial-balance"
									type="number"
									step="100"
									min="0"
									value={initialBalance}
									onChange={(e) => setInitialBalance(e.target.value)}
									placeholder="50000"
									className="pl-8"
									aria-label={t("params.initialBalance")}
								/>
							</div>
						</div>

						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("params.tradingDaysPerMonth")}
							</label>
							<Input
								id="v2-trading-days-month"
								type="number"
								step="1"
								min="1"
								max="30"
								value={tradingDaysPerMonth}
								onChange={(e) => setTradingDaysPerMonth(e.target.value)}
								placeholder="22"
								aria-label={t("params.tradingDaysPerMonth")}
							/>
						</div>

						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("params.tradingDaysPerWeek")}
							</label>
							<Input
								id="v2-trading-days-week"
								type="number"
								step="1"
								min="1"
								max="7"
								value={tradingDaysPerWeek}
								onChange={(e) => setTradingDaysPerWeek(e.target.value)}
								placeholder="5"
								aria-label={t("params.tradingDaysPerWeek")}
							/>
						</div>
						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("params.commissionPerTrade")}
							</label>
							<Input
								id="v2-commission"
								type="number"
								step="1"
								min="0"
								value={commissionPerTrade}
								onChange={(e) => setCommissionPerTrade(e.target.value)}
								placeholder="0"
								aria-label={t("params.commissionPerTrade")}
							/>
						</div>
					</div>

					{/* Error Message */}
					{error && (
						<div className="border-fb-error/30 bg-fb-error/10 p-m-400 text-small text-fb-error rounded-lg border">
							{error}
						</div>
					)}

					{/* Run Button */}
					<div className="flex justify-center">
						<Button
							id="monte-carlo-v2-run-simulation"
							size="lg"
							onClick={handleRunSimulation}
							disabled={isRunning || !isValid}
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
					<V2ResultsSummary
						params={result.params}
						onRunAgain={handleRunAgain}
					/>

					{/* Charts Row */}
					<div className="gap-m-500 grid lg:grid-cols-2">
						<DailyPnlChart days={result.sampleRun.days} />
						<ModeDistributionChart statistics={result.statistics} />
					</div>

					{/* Distribution - Full width */}
					<DistributionHistogram
						buckets={result.distributionBuckets}
						medianBalance={result.params.initialBalance / 100 + result.statistics.medianMonthlyPnl / 100}
						initialBalance={result.params.initialBalance / 100}
					/>

					{/* Metrics Cards */}
					<V2MetricsCards
						statistics={result.statistics}
						initialBalance={result.params.initialBalance}
					/>
				</div>
			)}
		</div>
	)
}

export { MonteCarloV2Content }
