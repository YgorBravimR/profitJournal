"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { OverallStats, DisciplineData } from "@/types"

interface KpiCardsProps {
	stats: OverallStats | null
	discipline: DisciplineData | null
}

interface KpiCardProps {
	label: string
	value: string
	subValue?: string
	trend?: "up" | "down" | "stable"
	colorClass?: string
}

const KpiCard = ({ label, value, subValue, trend, colorClass }: KpiCardProps) => {
	const getTrendIcon = () => {
		if (!trend) return null
		if (trend === "up") return <TrendingUp className="h-4 w-4 text-trade-buy" />
		if (trend === "down") return <TrendingDown className="h-4 w-4 text-trade-sell" />
		return <Minus className="h-4 w-4 text-txt-300" />
	}

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			<p className="text-tiny text-txt-300">{label}</p>
			<div className="mt-s-200 flex items-baseline gap-s-200">
				<p className={`text-h3 font-bold ${colorClass || "text-txt-100"}`}>{value}</p>
				{getTrendIcon()}
			</div>
			{subValue && <p className="mt-s-100 text-tiny text-txt-300">{subValue}</p>}
		</div>
	)
}

const formatCurrency = (value: number): string => {
	const absValue = Math.abs(value)
	if (absValue >= 1000000) {
		return `${value >= 0 ? "" : "-"}$${(absValue / 1000000).toFixed(1)}M`
	}
	if (absValue >= 1000) {
		return `${value >= 0 ? "" : "-"}$${(absValue / 1000).toFixed(1)}K`
	}
	return `${value >= 0 ? "" : "-"}$${absValue.toFixed(2)}`
}

const formatPercent = (value: number): string => {
	return `${value.toFixed(1)}%`
}

const formatR = (value: number): string => {
	return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`
}

export const KpiCards = ({ stats, discipline }: KpiCardsProps) => {
	const pnlColorClass = stats
		? stats.netPnl > 0
			? "text-trade-buy"
			: stats.netPnl < 0
				? "text-trade-sell"
				: "text-txt-100"
		: "text-txt-100"

	const rColorClass = stats
		? stats.averageR > 0
			? "text-trade-buy"
			: stats.averageR < 0
				? "text-trade-sell"
				: "text-txt-100"
		: "text-txt-100"

	return (
		<div className="grid grid-cols-2 gap-m-500 md:grid-cols-5">
			<KpiCard
				label="Net P&L"
				value={stats ? formatCurrency(stats.netPnl) : "--"}
				subValue={stats ? `${stats.totalTrades} trades` : undefined}
				colorClass={pnlColorClass}
			/>
			<KpiCard
				label="Win Rate"
				value={stats ? formatPercent(stats.winRate) : "--"}
				subValue={stats ? `${stats.winCount}W / ${stats.lossCount}L` : undefined}
			/>
			<KpiCard
				label="Profit Factor"
				value={stats ? stats.profitFactor.toFixed(2) : "--"}
				subValue={
					stats
						? `Avg Win: ${formatCurrency(stats.avgWin)} | Avg Loss: ${formatCurrency(stats.avgLoss)}`
						: undefined
				}
			/>
			<KpiCard
				label="Avg R"
				value={stats ? formatR(stats.averageR) : "--"}
				colorClass={rColorClass}
			/>
			<KpiCard
				label="Discipline"
				value={discipline ? formatPercent(discipline.score) : "--"}
				subValue={
					discipline
						? `${discipline.followedCount}/${discipline.totalTrades} followed`
						: undefined
				}
				trend={discipline?.trend}
			/>
		</div>
	)
}
