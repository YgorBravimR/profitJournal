"use client"

import { useTranslations } from "next-intl"
import {
	BarChart3,
	DollarSign,
	AlertTriangle,
	Brain,
	Lightbulb,
	CheckCircle,
	XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCompactCurrency, formatChartPercent } from "@/lib/formatting"
import { generateAnalysisInsights } from "@/lib/monte-carlo"
import type { MonteCarloResult } from "@/types/monte-carlo"

interface StrategyAnalysisProps {
	result: MonteCarloResult
	currency?: string
}

interface SectionProps {
	icon: React.ElementType
	title: string
	children: React.ReactNode
}

const Section = ({ icon: Icon, title, children }: SectionProps) => (
	<div className="border-bg-300 pb-m-400 border-b last:border-0 last:pb-0">
		<div className="mb-m-300 gap-s-200 flex items-center">
			<Icon className="text-accent-primary h-5 w-5" />
			<h4 className="text-small text-txt-100 font-semibold">{title}</h4>
		</div>
		<div className="space-y-s-200 pl-7">{children}</div>
	</div>
)

interface InsightProps {
	type: "positive" | "negative" | "neutral" | "tip"
	children: React.ReactNode
}

const insightConfig = {
	positive: { Icon: CheckCircle, color: "text-trade-buy" },
	negative: { Icon: XCircle, color: "text-trade-sell" },
	tip: { Icon: Lightbulb, color: "text-fb-warning" },
	neutral: { Icon: Lightbulb, color: "text-txt-200" },
}

const Insight = ({ type, children }: InsightProps) => {
	const { Icon, color } = insightConfig[type]

	return (
		<div className="gap-s-200 flex items-start">
			{type === "tip" ? (
				<span className="text-tiny">bulb</span>
			) : (
				<Icon className={cn("mt-0.5 h-4 w-4 flex-shrink-0", color)} />
			)}
			<p className="text-small text-txt-200">{children}</p>
		</div>
	)
}

const profitQualityLabels: Record<string, string> = {
	robust: "a robust strategy",
	moderate: "a moderately reliable strategy",
	risky: "a risky strategy that needs improvement",
}

const commissionLabels: Record<string, string> = {
	good: "well-managed",
	moderate: "moderate",
	high: "high",
}

const riskLabels: Record<string, string> = {
	excellent: "excellent",
	good: "good",
	moderate: "needs improvement",
	concerning: "needs improvement",
}

const getDrawdownLabel = (dd: number): string => {
	if (dd <= 10) return "Well-controlled"
	if (dd <= 20) return "Moderate"
	return "High risk"
}

const getSharpeLabel = (ratio: number): string => {
	if (ratio >= 2) return "Excellent"
	if (ratio >= 1) return "Good"
	return "Below average"
}

export const StrategyAnalysis = ({
	result,
	currency = "$",
}: StrategyAnalysisProps) => {
	const t = useTranslations("monteCarlo.analysis")
	const { statistics: stats, params, sampleRun } = result
	const insights = generateAnalysisInsights(result)

	const profitQualityText = profitQualityLabels[insights.profitabilityQuality]
	const expectedProfit = stats.medianFinalBalance - params.initialBalance
	const commissionPct =
		expectedProfit > 0 ? (sampleRun.totalCommission / expectedProfit) * 100 : 0

	return (
		<div className="border-bg-300 bg-bg-200 p-m-500 rounded-lg border">
			<h3 className="mb-m-500 text-body text-txt-100 font-semibold">
				{t("title")}
			</h3>

			<div className="space-y-m-400">
				{/* Monte Carlo Analysis */}
				<Section icon={BarChart3} title={t("monteCarlo")}>
					<p className="text-small text-txt-300">
						Based on {params.simulationCount.toLocaleString()} simulations:
					</p>
					<ul className="space-y-s-100 text-small text-txt-200">
						<li>
							• <strong>Average Return:</strong>{" "}
							{formatChartPercent(stats.medianReturn)} (Max DD:{" "}
							{stats.medianMaxDrawdown.toFixed(1)}%) - This is your most likely
							outcome
						</li>
						<li>
							• <strong>Best Case:</strong>{" "}
							{formatChartPercent(stats.bestCaseReturn)} (Max DD:{" "}
							{(stats.medianMaxDrawdown * 0.5).toFixed(1)}%) - Top 5% of
							simulations
						</li>
						<li>
							• <strong>Worst Case:</strong>{" "}
							{formatChartPercent(stats.worstCaseReturn)} (Max DD:{" "}
							{stats.worstMaxDrawdown.toFixed(1)}%) - Your maximum downside risk
						</li>
					</ul>
					<Insight type={stats.profitablePct >= 70 ? "positive" : "neutral"}>
						{stats.profitablePct.toFixed(0)}% of all simulations were
						profitable, indicating {profitQualityText}.
					</Insight>
					<Insight type="tip">
						A reliable strategy should be profitable in at least 70% of
						simulations.
					</Insight>
				</Section>

				{/* Balance and Returns */}
				<Section icon={DollarSign} title={t("balanceReturns")}>
					<p className="text-small text-txt-300">
						Starting with{" "}
						{formatCompactCurrency(params.initialBalance, currency)}, your
						strategy shows:
					</p>
					<ul className="space-y-s-100 text-small text-txt-200">
						<li>
							• <strong>Expected Profit:</strong>{" "}
							{formatCompactCurrency(expectedProfit, currency)} (
							{formatChartPercent(stats.medianReturn)} return)
						</li>
						<li>
							• <strong>Commission Impact:</strong>{" "}
							{formatCompactCurrency(sampleRun.totalCommission, currency)} (
							{commissionPct.toFixed(1)}% of profits)
						</li>
					</ul>
					<Insight
						type={
							insights.commissionAssessment === "good" ? "positive" : "neutral"
						}
					>
						Commission costs are{" "}
						{commissionLabels[insights.commissionAssessment]} relative to
						profits.
					</Insight>
				</Section>

				<Section icon={AlertTriangle} title="Risk Analysis">
					<p className="text-small text-txt-300">Your risk metrics indicate:</p>
					<ul className="space-y-s-100 text-small text-txt-200">
						<li>
							• <strong>Maximum Drawdown:</strong>{" "}
							{stats.medianMaxDrawdown.toFixed(1)}% -{" "}
							{getDrawdownLabel(stats.medianMaxDrawdown)}
						</li>
						<li>
							• <strong>Sharpe Ratio:</strong> {stats.sharpeRatio.toFixed(2)} -{" "}
							{getSharpeLabel(stats.sharpeRatio)}
						</li>
						<li>
							• <strong>Sortino Ratio:</strong> {stats.sortinoRatio.toFixed(2)}{" "}
							-{" "}
							{stats.sortinoRatio >= 2
								? "Strong downside protection"
								: "Moderate"}
						</li>
					</ul>
					<Insight
						type={
							insights.riskAssessment === "excellent" ? "positive" : "neutral"
						}
					>
						Your strategy's risk-adjusted performance is{" "}
						{riskLabels[insights.riskAssessment]}.
					</Insight>
				</Section>

				{/* Psychology */}
				<Section icon={Brain} title="Trading Psychology">
					<p className="text-small text-txt-300">
						Psychological factors to consider:
					</p>
					<ul className="space-y-s-100 text-small text-txt-200">
						<li>
							• <strong>Win Rate:</strong> {params.winRate}% -{" "}
							{params.winRate >= 50
								? "Solid performance"
								: "Requires strong discipline"}
						</li>
						<li>
							• <strong>Longest Win Streak:</strong>{" "}
							{Math.round(stats.expectedMaxWinStreak)} trades
						</li>
						<li>
							• <strong>Longest Loss Streak:</strong>{" "}
							{Math.round(stats.expectedMaxLossStreak)} trades
						</li>
					</ul>
					{insights.psychologyWarning && (
						<Insight type="tip">{insights.psychologyWarning}</Insight>
					)}
				</Section>

				{/* Improvement Suggestions */}
				{insights.improvementSuggestions.length > 0 && (
					<Section icon={Lightbulb} title="Strategy Improvements">
						<p className="text-small text-txt-300">
							Key areas for optimization:
						</p>
						<ul className="space-y-s-100 text-small text-txt-200">
							{insights.improvementSuggestions.map((suggestion, i) => (
								<li key={i}>• {suggestion}</li>
							))}
						</ul>
						<Insight type="tip">
							The best strategy is one you can execute consistently with
							confidence.
						</Insight>
					</Section>
				)}
			</div>
		</div>
	)
}
