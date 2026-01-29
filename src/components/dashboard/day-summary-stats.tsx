"use client"

import { useTranslations } from "next-intl"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { DaySummary } from "@/types"

interface DaySummaryStatsProps {
	summary: DaySummary
}

const formatCurrency = (value: number): string => {
	const prefix = value >= 0 ? "+" : ""
	return `${prefix}R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const DaySummaryStats = ({ summary }: DaySummaryStatsProps) => {
	const t = useTranslations("dashboard")

	const stats = [
		{
			label: t("dayDetail.netPnl"),
			value: formatCurrency(summary.netPnl),
			isPositive: summary.netPnl >= 0,
			showIcon: true,
		},
		{
			label: t("dayDetail.grossPnl"),
			value: formatCurrency(summary.grossPnl),
			subValue: `${t("dayDetail.fees")}: R$ ${summary.totalFees.toFixed(2)}`,
			isPositive: summary.grossPnl >= 0,
		},
		{
			label: t("dayDetail.winRate"),
			value: `${summary.winRate.toFixed(0)}%`,
			subValue: `${summary.wins}W ${summary.losses}L`,
			isPositive: summary.winRate >= 50,
		},
		{
			label: t("dayDetail.trades"),
			value: summary.totalTrades.toString(),
			subValue: summary.avgR !== 0 ? `${t("dayDetail.avgR")}: ${summary.avgR >= 0 ? "+" : ""}${summary.avgR.toFixed(1)}R` : undefined,
			isPositive: null,
		},
	]

	return (
		<div className="grid grid-cols-2 gap-s-300 sm:grid-cols-4">
			{stats.map((stat) => (
				<div
					key={stat.label}
					className="rounded-lg border border-bg-300 bg-bg-100 p-s-300"
				>
					<p className="text-caption text-txt-300">{stat.label}</p>
					<div className="mt-s-100 flex items-center gap-s-100">
						{stat.showIcon && (
							stat.isPositive ? (
								<TrendingUp className="h-4 w-4 text-pos" />
							) : (
								<TrendingDown className="h-4 w-4 text-neg" />
							)
						)}
						<p
							className={`text-body font-semibold ${
								stat.isPositive === null
									? "text-txt-100"
									: stat.isPositive
										? "text-pos"
										: "text-neg"
							}`}
						>
							{stat.value}
						</p>
					</div>
					{stat.subValue && (
						<p className="mt-s-100 text-caption text-txt-300">{stat.subValue}</p>
					)}
				</div>
			))}
		</div>
	)
}
