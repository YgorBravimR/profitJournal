"use client"

import { Calculator, TrendingUp, TrendingDown, Info } from "lucide-react"
import { useTranslations } from "next-intl"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ExpectedValueData } from "@/types"
import { formatCompactCurrencyWithSign } from "@/lib/formatting"

const StatLabel = ({
	label,
	tooltip,
}: {
	label: string
	tooltip: string
}) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<p className="inline-flex cursor-help items-center gap-s-100 text-tiny text-txt-300">
				{label}
				<Info className="h-3 w-3" />
			</p>
		</TooltipTrigger>
		<TooltipContent
			id="tooltip-expected-value-stat"
			side="top"
			className="border-bg-300 bg-bg-100 text-txt-200 max-w-xs border p-s-300 shadow-lg"
		>
			{tooltip}
		</TooltipContent>
	</Tooltip>
)

interface ExpectedValueProps {
	data: ExpectedValueData | null
}

export const ExpectedValue = ({ data }: ExpectedValueProps) => {
	const t = useTranslations("analytics.expectedValue")

	if (!data || data.sampleSize === 0) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center gap-s-200">
					<Calculator className="h-5 w-5 text-txt-300" />
					<h3 className="text-body font-semibold text-txt-100">
						{t("title")}
					</h3>
				</div>
				<div className="mt-m-400 flex h-32 items-center justify-center text-txt-300">
					{t("noData")}
				</div>
			</div>
		)
	}

	const isPositiveEV = data.expectedValue >= 0

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-s-200">
					<Calculator className="h-5 w-5 text-txt-300" />
					<h3 className="text-body font-semibold text-txt-100">
						{t("title")}
					</h3>
				</div>
				<span className="text-tiny text-txt-300">
					{t("basedOn", { count: data.sampleSize })}
				</span>
			</div>

			{/* Main EV Display */}
			<div className="mt-m-500 flex items-center justify-center">
				<div className="text-center">
					<p className="text-tiny text-txt-300">{t("perTrade")}</p>
					<div className="mt-s-200 flex items-center justify-center gap-s-200">
						{isPositiveEV ? (
							<TrendingUp className="h-8 w-8 text-trade-buy" />
						) : (
							<TrendingDown className="h-8 w-8 text-trade-sell" />
						)}
						<span
							className={`text-h2 font-bold ${
								isPositiveEV ? "text-trade-buy" : "text-trade-sell"
							}`}
						>
							{formatCompactCurrencyWithSign(data.expectedValue)}
						</span>
					</div>
				</div>
			</div>

			{/* Breakdown */}
			<div className="mt-m-600 grid grid-cols-2 gap-m-400 md:grid-cols-4">
				<div className="rounded-lg bg-bg-100 p-s-300 text-center">
					<StatLabel
						label={t("winRateLabel")}
						tooltip={t("winRateDesc")}
					/>
					<p className="mt-s-100 text-body font-bold text-txt-100">
						{data.winRate.toFixed(1)}%
					</p>
				</div>
				<div className="rounded-lg bg-bg-100 p-s-300 text-center">
					<StatLabel
						label={t("avgWinLabel")}
						tooltip={t("avgWinDesc")}
					/>
					<p className="mt-s-100 text-body font-bold text-trade-buy">
						{formatCompactCurrencyWithSign(data.avgWin)}
					</p>
				</div>
				<div className="rounded-lg bg-bg-100 p-s-300 text-center">
					<StatLabel
						label={t("avgLossLabel")}
						tooltip={t("avgLossDesc")}
					/>
					<p className="mt-s-100 text-body font-bold text-trade-sell">
						{formatCompactCurrencyWithSign(-data.avgLoss)}
					</p>
				</div>
				<div className="rounded-lg bg-bg-100 p-s-300 text-center">
					<StatLabel
						label={t("projection100")}
						tooltip={t("projectionDesc")}
					/>
					<p
						className={`mt-s-100 text-body font-bold ${
							data.projectedPnl100 >= 0 ? "text-trade-buy" : "text-trade-sell"
						}`}
					>
						{formatCompactCurrencyWithSign(data.projectedPnl100)}
					</p>
				</div>
			</div>

			{/* Formula Explanation */}
			<div className="mt-m-500 rounded-lg bg-bg-100 p-m-400">
				<div className="flex items-start gap-s-200">
					<Info className="mt-s-100 h-4 w-4 shrink-0 text-txt-300" />
					<div className="text-tiny text-txt-300">
						<p className="font-medium text-txt-200">{t("formulaTitle")}</p>
						<p className="mt-s-100">
							{t("formula")}
						</p>
						<p className="mt-s-200">
							EV = ({data.winRate.toFixed(1)}% × ${data.avgWin.toFixed(2)}) - (
							{(100 - data.winRate).toFixed(1)}% × ${data.avgLoss.toFixed(2)})
						</p>
						<p className="mt-s-200">
							EV = ${((data.winRate / 100) * data.avgWin).toFixed(2)} - $
							{(((100 - data.winRate) / 100) * data.avgLoss).toFixed(2)} ={" "}
							<span
								className={
									isPositiveEV ? "text-trade-buy" : "text-trade-sell"
								}
							>
								{formatCompactCurrencyWithSign(data.expectedValue)}
							</span>
						</p>
					</div>
				</div>
			</div>

			{/* Interpretation */}
			<div className="mt-m-400">
				<p className="text-small text-txt-200">
					{isPositiveEV
						? t.rich("systemHasPositiveEdge", {
								positive: (chunks) => (
									<span className="font-semibold text-trade-buy">{chunks}</span>
								),
								amount: () => (
									<span className="font-semibold text-trade-buy">
										{formatCompactCurrencyWithSign(data.expectedValue)}
									</span>
								),
						  })
						: t.rich("systemHasNegativeEdge", {
								negative: (chunks) => (
									<span className="font-semibold text-trade-sell">{chunks}</span>
								),
								amount: () => (
									<span className="font-semibold text-trade-sell">
										{formatCompactCurrencyWithSign(Math.abs(data.expectedValue))}
									</span>
								),
						  })}
				</p>
			</div>
		</div>
	)
}
