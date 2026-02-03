"use client"

import { useTranslations } from "next-intl"
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts"
import { formatCompactCurrencyWithSign } from "@/lib/formatting"
import type { HourlyPerformance } from "@/types"

interface HourlyPerformanceChartProps {
	data: HourlyPerformance[]
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		dataKey: string
		payload: HourlyPerformance
	}>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	const t = useTranslations("analytics")

	if (!active || !payload || payload.length === 0) {
		return null
	}

	const data = payload[0].payload
	const isProfit = data.totalPnl >= 0

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 px-s-300 py-s-200 shadow-lg">
			<p className="text-small font-semibold text-txt-100">{data.hourLabel}</p>
			<div className="mt-s-200 space-y-s-100">
				<p className="text-caption">
					<span className="text-txt-300">{t("time.pnl")}:</span>{" "}
					<span className={`font-medium ${isProfit ? "text-trade-buy" : "text-trade-sell"}`}>
						{formatCompactCurrencyWithSign(data.totalPnl, "R$")}
					</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("time.trades")}:</span>{" "}
					<span className="font-medium text-txt-100">{data.totalTrades}</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("time.winRate")}:</span>{" "}
					<span className={`font-medium ${data.winRate >= 50 ? "text-trade-buy" : "text-trade-sell"}`}>
						{data.winRate.toFixed(0)}%
					</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("time.avgR")}:</span>{" "}
					<span className={`font-medium ${data.avgR >= 0 ? "text-trade-buy" : "text-trade-sell"}`}>
						{data.avgR >= 0 ? "+" : ""}{data.avgR.toFixed(2)}R
					</span>
				</p>
			</div>
		</div>
	)
}

export const HourlyPerformanceChart = ({ data }: HourlyPerformanceChartProps) => {
	const t = useTranslations("analytics")

	// Calculate domain with padding
	const maxAbsPnl = Math.max(...data.map((d) => Math.abs(d.totalPnl)), 100)
	const domainMax = Math.ceil(maxAbsPnl * 1.1)

	// Find best and worst hours (using toSorted for immutability)
	const sortedByPnl = data.toSorted((a, b) => b.totalPnl - a.totalPnl)
	const bestHour = sortedByPnl[0]
	const worstHour = sortedByPnl[sortedByPnl.length - 1]

	if (data.length === 0) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
				<h3 className="mb-m-400 text-body font-semibold text-txt-100">
					{t("time.hourlyTitle")}
				</h3>
				<div className="flex h-[250px] items-center justify-center text-txt-300">
					{t("noData")}
				</div>
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
			<h3 className="mb-m-400 text-body font-semibold text-txt-100">
				{t("time.hourlyTitle")}
			</h3>
			<div className="h-[250px] w-full">
				<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
					<BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--color-bg-300)"
							vertical={false}
						/>
						<XAxis
							dataKey="hourLabel"
							stroke="var(--color-txt-300)"
							tick={{ fill: "var(--color-txt-300)", fontSize: 11 }}
							tickLine={false}
							axisLine={{ stroke: "var(--color-bg-300)" }}
							interval={1}
						/>
						<YAxis
							tickFormatter={(value: number) => formatCompactCurrencyWithSign(value, "R$")}
							stroke="var(--color-txt-300)"
							tick={{ fill: "var(--color-txt-300)", fontSize: 11 }}
							tickLine={false}
							axisLine={false}
							domain={[-domainMax, domainMax]}
							width={65}
						/>
						<Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-bg-300)", opacity: 0.3 }} />
						<Bar dataKey="totalPnl" radius={[4, 4, 0, 0]}>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.totalPnl >= 0 ? "var(--color-trade-buy)" : "var(--color-trade-sell)"}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
			{/* Summary */}
			<div className="mt-m-400 grid grid-cols-2 gap-m-400 border-t border-bg-300 pt-m-400">
				<div>
					<p className="text-caption text-txt-300">{t("time.bestHour")}</p>
					<p className="text-small font-medium text-trade-buy">
						{bestHour?.hourLabel} ({bestHour?.winRate.toFixed(0)}% WR, {formatCompactCurrencyWithSign(bestHour?.totalPnl ?? 0, "R$")}, {bestHour?.totalTrades} {t("time.trades").toLowerCase()})
					</p>
				</div>
				<div>
					<p className="text-caption text-txt-300">{t("time.worstHour")}</p>
					<p className="text-small font-medium text-trade-sell">
						{worstHour?.hourLabel} ({worstHour?.winRate.toFixed(0)}% WR, {formatCompactCurrencyWithSign(worstHour?.totalPnl ?? 0, "R$")}, {worstHour?.totalTrades} {t("time.trades").toLowerCase()})
					</p>
				</div>
			</div>
		</div>
	)
}
