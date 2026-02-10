"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
	formatCompactCurrency,
	formatChartPercent,
	formatRatio,
} from "@/lib/formatting"
import type { SimulationStatistics } from "@/types/monte-carlo"

interface MetricsCardsProps {
	statistics: SimulationStatistics
	initialBalance: number
	currency?: string
}

interface MetricCardProps {
	title: string
	children: React.ReactNode
}

const MetricCard = ({ title, children }: MetricCardProps) => (
	<div className="border-bg-300 bg-bg-200 p-m-400 rounded-lg border">
		<h4 className="mb-s-300 text-small text-txt-100 font-semibold">{title}</h4>
		<div className="space-y-s-200">{children}</div>
	</div>
)

interface MetricRowProps {
	label: string
	value: string
	valueClass?: string
}

const MetricRow = ({ label, value, valueClass }: MetricRowProps) => (
	<div className="flex items-center justify-between">
		<span className="text-tiny text-txt-300">{label}</span>
		<span
			className={cn("text-small font-medium", valueClass || "text-txt-100")}
		>
			{value}
		</span>
	</div>
)

export const MetricsCards = ({
	statistics,
	initialBalance,
	currency = "$",
}: MetricsCardsProps) => {
	const t = useTranslations("monteCarlo.metrics")

	const finalBalance = statistics.medianFinalBalance
	const totalReturn = finalBalance - initialBalance
	const returnPercent = statistics.medianReturn

	return (
		<div className="gap-m-400 grid md:grid-cols-2 lg:grid-cols-3">
			{/* Balance Summary */}
			<MetricCard title={t("balanceSummary")}>
				<MetricRow
					label={t("initial")}
					value={formatCompactCurrency(initialBalance, currency)}
				/>
				<MetricRow
					label={t("final")}
					value={formatCompactCurrency(finalBalance, currency)}
					valueClass={returnPercent >= 0 ? "text-trade-buy" : "text-trade-sell"}
				/>
				<MetricRow
					label={t("totalReturn")}
					value={formatChartPercent(returnPercent)}
					valueClass={returnPercent >= 0 ? "text-trade-buy" : "text-trade-sell"}
				/>
				<MetricRow
					label={t("tradeProfit")}
					value={formatCompactCurrency(totalReturn, currency)}
					valueClass={totalReturn >= 0 ? "text-trade-buy" : "text-trade-sell"}
				/>
			</MetricCard>

			{/* Risk-Adjusted Metrics */}
			<MetricCard title={t("riskAdjusted")}>
				<MetricRow
					label={t("sharpeRatio")}
					value={formatRatio(statistics.sharpeRatio)}
					valueClass={
						statistics.sharpeRatio >= 1 ? "text-trade-buy" : "text-txt-100"
					}
				/>
				<MetricRow
					label={t("sortinoRatio")}
					value={formatRatio(statistics.sortinoRatio)}
					valueClass={
						statistics.sortinoRatio >= 1 ? "text-trade-buy" : "text-txt-100"
					}
				/>
				<MetricRow
					label={t("calmarRatio")}
					value={formatRatio(statistics.calmarRatio)}
					valueClass={
						statistics.calmarRatio >= 1 ? "text-trade-buy" : "text-txt-100"
					}
				/>
			</MetricCard>

			{/* Performance Metrics */}
			<MetricCard title={t("performance")}>
				<MetricRow
					label={t("profitFactor")}
					value={formatRatio(statistics.profitFactor)}
					valueClass={
						statistics.profitFactor >= 1 ? "text-trade-buy" : "text-trade-sell"
					}
				/>
				<MetricRow
					label={t("bestTrade")}
					value={formatCompactCurrency(statistics.bestTrade, currency)}
					valueClass="text-trade-buy"
				/>
				<MetricRow
					label={t("worstTrade")}
					value={formatCompactCurrency(statistics.worstTrade, currency)}
					valueClass="text-trade-sell"
				/>
			</MetricCard>

			{/* Drawdown Analysis */}
			<MetricCard title={t("drawdown")}>
				<MetricRow
					label={t("maxDrawdown")}
					value={formatChartPercent(statistics.medianMaxDrawdown, false)}
					valueClass="text-trade-sell"
				/>
				<MetricRow
					label={t("avgDrawdown")}
					value={formatChartPercent(statistics.meanMaxDrawdown, false)}
				/>
				<MetricRow
					label={t("underwaterTime")}
					value={formatChartPercent(statistics.avgUnderwaterPercent, false)}
				/>
			</MetricCard>

			{/* Streak Statistics */}
			<MetricCard title={t("streaks")}>
				<MetricRow
					label={t("maxWinsInRow")}
					value={Math.round(statistics.expectedMaxWinStreak).toString()}
					valueClass="text-trade-buy"
				/>
				<MetricRow
					label={t("maxLossesInRow")}
					value={Math.round(statistics.expectedMaxLossStreak).toString()}
					valueClass="text-trade-sell"
				/>
				<MetricRow
					label={t("avgWinStreak")}
					value={statistics.avgWinStreak.toFixed(1)}
				/>
				<MetricRow
					label={t("avgLossStreak")}
					value={statistics.avgLossStreak.toFixed(1)}
				/>
			</MetricCard>

			{/* Monte Carlo Outcomes */}
			<MetricCard title={t("monteCarloOutcomes")}>
				<MetricRow
					label={t("bestCase")}
					value={formatChartPercent(statistics.bestCaseReturn)}
					valueClass="text-trade-buy"
				/>
				<MetricRow
					label={t("medianLabel")}
					value={formatChartPercent(statistics.medianReturn)}
					valueClass={
						statistics.medianReturn >= 0 ? "text-trade-buy" : "text-trade-sell"
					}
				/>
				<MetricRow
					label={t("worstCase")}
					value={formatChartPercent(statistics.worstCaseReturn)}
					valueClass="text-trade-sell"
				/>
				<MetricRow
					label={t("profitableSimulations")}
					value={formatChartPercent(statistics.profitablePct, false)}
					valueClass={
						statistics.profitablePct >= 70 ? "text-trade-buy" : "text-txt-100"
					}
				/>
			</MetricCard>
		</div>
	)
}
