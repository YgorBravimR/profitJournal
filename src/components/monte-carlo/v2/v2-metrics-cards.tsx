"use client"

import { useTranslations } from "next-intl"
import { Info } from "lucide-react"
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
	formatCompactCurrency,
	formatChartPercent,
	formatRatio,
} from "@/lib/formatting"
import type { SimulationStatisticsV2 } from "@/types/monte-carlo"

interface V2MetricsCardsProps {
	statistics: SimulationStatisticsV2
	initialBalance: number // cents
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
	tooltip?: string
}

const MetricRow = ({ label, value, valueClass, tooltip }: MetricRowProps) => (
	<div className="flex items-center justify-between">
		{tooltip ? (
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="inline-flex cursor-help items-center gap-s-100 text-tiny text-txt-300">
						{label}
						<Info className="h-3 w-3" />
					</span>
				</TooltipTrigger>
				<TooltipContent
					id={`tooltip-metric-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
					side="top"
					className="border-bg-300 bg-bg-100 text-txt-200 max-w-xs border p-s-300 shadow-lg"
				>
					<p className="text-tiny leading-relaxed">{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		) : (
			<span className="text-tiny text-txt-300">{label}</span>
		)}
		<span
			className={cn("text-small font-medium", valueClass || "text-txt-100")}
		>
			{value}
		</span>
	</div>
)

const V2MetricsCards = ({
	statistics,
	initialBalance,
}: V2MetricsCardsProps) => {
	const t = useTranslations("monteCarlo.v2.metrics")
	const tTooltips = useTranslations("monteCarlo.tooltips")

	const medianPnlFromCents = statistics.medianMonthlyPnl / 100

	return (
		<div className="gap-m-400 grid md:grid-cols-2 lg:grid-cols-3">
			{/* Monthly P&L */}
			<MetricCard title={t("monthlyPnl")}>
				<MetricRow
					label={t("median")}
					value={formatCompactCurrency(medianPnlFromCents)}
					valueClass={
						statistics.medianMonthlyPnl >= 0
							? "text-trade-buy"
							: "text-trade-sell"
					}
				/>
				<MetricRow
					label={t("mean")}
					value={formatCompactCurrency(statistics.meanMonthlyPnl / 100)}
					valueClass={
						statistics.meanMonthlyPnl >= 0
							? "text-trade-buy"
							: "text-trade-sell"
					}
				/>
				<MetricRow
					label={t("bestCase")}
					value={formatCompactCurrency(statistics.bestCaseMonthlyPnl / 100)}
					valueClass="text-trade-buy"
				/>
				<MetricRow
					label={t("worstCase")}
					value={formatCompactCurrency(statistics.worstCaseMonthlyPnl / 100)}
					valueClass="text-trade-sell"
				/>
			</MetricCard>

			{/* Profitable Months & Limits */}
			<MetricCard title={t("profitableMonths")}>
				<MetricRow
					label={t("profitableMonths")}
					value={formatChartPercent(statistics.profitableMonthsPct, false)}
					valueClass={
						statistics.profitableMonthsPct >= 60
							? "text-trade-buy"
							: "text-trade-sell"
					}
					tooltip={tTooltips("profitableMonths")}
				/>
				<MetricRow
					label={t("monthlyLimitHit")}
					value={formatChartPercent(statistics.monthlyLimitHitPct, false)}
					valueClass={
						statistics.monthlyLimitHitPct <= 10
							? "text-trade-buy"
							: "text-trade-sell"
					}
					tooltip={tTooltips("monthlyLimitHit")}
				/>
				<MetricRow
					label={t("avgTradingDays")}
					value={statistics.avgTradingDaysPerMonth.toFixed(1)}
				/>
				<MetricRow
					label={t("avgTradesPerMonth")}
					value={statistics.avgTradesPerMonth.toFixed(1)}
				/>
			</MetricCard>

			{/* Mode Distribution */}
			<MetricCard title={t("modeDistribution")}>
				<MetricRow
					label={t("lossRecoveryDays")}
					value={statistics.avgDaysInLossRecovery.toFixed(1)}
				/>
				<MetricRow
					label={t("gainCompoundingDays")}
					value={statistics.avgDaysInGainCompounding.toFixed(1)}
				/>
				<MetricRow
					label={t("targetHitDays")}
					value={statistics.avgDaysTargetHit.toFixed(1)}
					valueClass="text-trade-buy"
				/>
				<MetricRow
					label={t("skippedWeekly")}
					value={statistics.avgDaysSkippedWeeklyLimit.toFixed(1)}
				/>
				<MetricRow
					label={t("skippedMonthly")}
					value={statistics.avgDaysSkippedMonthlyLimit.toFixed(1)}
				/>
			</MetricCard>

			{/* Drawdown */}
			<MetricCard title={t("drawdown")}>
				<MetricRow
					label={t("medianMaxDrawdown")}
					value={formatChartPercent(statistics.medianMaxDrawdownPercent, false)}
					valueClass="text-trade-sell"
					tooltip={tTooltips("maxDrawdown")}
				/>
				<MetricRow
					label={t("worstMaxDrawdown")}
					value={formatChartPercent(statistics.worstMaxDrawdownPercent, false)}
					valueClass="text-trade-sell"
				/>
			</MetricCard>

			{/* Risk-Adjusted */}
			<MetricCard title={t("riskAdjusted")}>
				<MetricRow
					label={t("sharpeRatio")}
					value={formatRatio(statistics.sharpeRatio)}
					valueClass={
						statistics.sharpeRatio >= 1 ? "text-trade-buy" : "text-txt-100"
					}
					tooltip={tTooltips("sharpeRatio")}
				/>
				<MetricRow
					label={t("sortinoRatio")}
					value={formatRatio(statistics.sortinoRatio)}
					valueClass={
						statistics.sortinoRatio >= 1 ? "text-trade-buy" : "text-txt-100"
					}
					tooltip={tTooltips("sortinoRatio")}
				/>
				<MetricRow
					label={t("expectedDailyPnl")}
					value={formatCompactCurrency(statistics.expectedDailyPnl / 100)}
					valueClass={
						statistics.expectedDailyPnl >= 0
							? "text-trade-buy"
							: "text-trade-sell"
					}
					tooltip={tTooltips("expectedDailyPnl")}
				/>
			</MetricCard>

			{/* Return */}
			<MetricCard title={t("monthlyReturn")}>
				<MetricRow
					label={t("median")}
					value={formatChartPercent(statistics.medianReturnPercent)}
					valueClass={
						statistics.medianReturnPercent >= 0
							? "text-trade-buy"
							: "text-trade-sell"
					}
				/>
				<MetricRow
					label={t("mean")}
					value={formatChartPercent(
						initialBalance > 0
							? (statistics.meanMonthlyPnl / initialBalance) * 100
							: 0
					)}
					valueClass={
						statistics.meanMonthlyPnl >= 0
							? "text-trade-buy"
							: "text-trade-sell"
					}
				/>
			</MetricCard>
		</div>
	)
}

export { V2MetricsCards }
