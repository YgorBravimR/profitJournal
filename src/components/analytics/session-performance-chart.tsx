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
import type { SessionPerformance } from "@/types"

interface SessionPerformanceChartProps {
	data: SessionPerformance[]
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		dataKey: string
		payload: SessionPerformance
	}>
}

/**
 * Custom tooltip component for the session performance bar chart.
 * Displays detailed session metrics on hover.
 */
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	const t = useTranslations("analytics")

	if (!active || !payload || payload.length === 0) {
		return null
	}

	const data = payload[0].payload
	const isProfit = data.totalPnl >= 0

	// Format session time range
	const formatTime = (decimal: number): string => {
		const hours = Math.floor(decimal)
		const minutes = Math.round((decimal - hours) * 60)
		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
	}
	const timeRange = `${formatTime(data.startHour)} - ${formatTime(data.endHour)}`

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 px-s-300 py-s-200 shadow-lg">
			<p className="text-small font-semibold text-txt-100">{data.sessionLabel}</p>
			<p className="text-[10px] text-txt-300">{timeRange}</p>
			<div className="mt-s-200 space-y-s-100">
				<p className="text-caption">
					<span className="text-txt-300">{t("session.pnl")}:</span>{" "}
					<span className={`font-medium ${isProfit ? "text-trade-buy" : "text-trade-sell"}`}>
						{formatCompactCurrencyWithSign(data.totalPnl, "R$")}
					</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("session.trades")}:</span>{" "}
					<span className="font-medium text-txt-100">{data.totalTrades}</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("session.winRate")}:</span>{" "}
					<span className={`font-medium ${data.winRate >= 50 ? "text-trade-buy" : "text-trade-sell"}`}>
						{data.winRate.toFixed(0)}%
					</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("session.avgR")}:</span>{" "}
					<span className={`font-medium ${data.avgR >= 0 ? "text-trade-buy" : "text-trade-sell"}`}>
						{data.avgR >= 0 ? "+" : ""}{data.avgR.toFixed(2)}R
					</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("session.profitFactor")}:</span>{" "}
					<span className={`font-medium ${data.profitFactor >= 1 ? "text-trade-buy" : "text-trade-sell"}`}>
						{data.profitFactor.toFixed(2)}
					</span>
				</p>
			</div>
		</div>
	)
}

/**
 * Displays trading performance by market session as a bar chart.
 * Shows P&L, win rate, and trade counts for each trading session.
 *
 * @param data - Array of session performance data
 */
export const SessionPerformanceChart = ({ data }: SessionPerformanceChartProps) => {
	const t = useTranslations("analytics")

	// Filter out sessions with no trades
	const sessionsWithTrades = data.filter((s) => s.totalTrades > 0)

	// Calculate domain with padding
	const maxAbsPnl = Math.max(...data.map((d) => Math.abs(d.totalPnl)), 100)
	const domainMax = Math.ceil(maxAbsPnl * 1.1)

	// Find best and worst sessions
	const sortedByPnl = [...sessionsWithTrades].sort((a, b) => b.totalPnl - a.totalPnl)
	const bestSession = sortedByPnl[0]
	const worstSession = sortedByPnl[sortedByPnl.length - 1]

	// Total stats
	const totalPnl = data.reduce((sum, s) => sum + s.totalPnl, 0)
	const totalTrades = data.reduce((sum, s) => sum + s.totalTrades, 0)

	if (sessionsWithTrades.length === 0) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
				<h3 className="mb-m-400 text-body font-semibold text-txt-100">
					{t("session.title")}
				</h3>
				<div className="flex h-[200px] items-center justify-center text-txt-300">
					{t("noData")}
				</div>
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
			<div className="mb-s-300 flex items-start justify-between">
				<div>
					<h3 className="text-body font-semibold text-txt-100">
						{t("session.title")}
					</h3>
					<p className="text-caption text-txt-300">{t("session.description")}</p>
				</div>
				<div className="text-right">
					<p className={`text-body font-semibold ${totalPnl >= 0 ? "text-trade-buy" : "text-trade-sell"}`}>
						{formatCompactCurrencyWithSign(totalPnl, "R$")}
					</p>
					<p className="text-caption text-txt-300">{totalTrades} trades</p>
				</div>
			</div>

			<div className="h-[200px] w-full">
				<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
					<BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--color-bg-300)"
							vertical={false}
						/>
						<XAxis
							dataKey="sessionLabel"
							stroke="var(--color-txt-300)"
							tick={{ fill: "var(--color-txt-300)", fontSize: 11 }}
							tickLine={false}
							axisLine={{ stroke: "var(--color-bg-300)" }}
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
									opacity={entry.totalTrades === 0 ? 0.3 : 1}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Session Stats Grid */}
			<div className="mt-s-300 grid grid-cols-4 gap-s-200">
				{data.map((session) => (
					<div
						key={session.session}
						className={`rounded-md border px-s-200 py-s-100 ${
							session.totalPnl >= 0 ? "border-trade-buy/20 bg-trade-buy/5" : "border-trade-sell/20 bg-trade-sell/5"
						}`}
					>
						<p className="text-[10px] text-txt-300">{session.sessionLabel}</p>
						<p className={`text-caption font-medium ${session.totalPnl >= 0 ? "text-trade-buy" : "text-trade-sell"}`}>
							{session.winRate.toFixed(0)}% WR
						</p>
						<p className="text-[10px] text-txt-300">{session.totalTrades} trades</p>
					</div>
				))}
			</div>

			{/* Summary */}
			{bestSession && worstSession && (
				<div className="mt-s-300 grid grid-cols-2 gap-s-300 border-t border-bg-300 pt-s-300">
					<div>
						<p className="text-caption text-txt-300">{t("session.bestSession")}</p>
						<p className="text-small font-medium text-trade-buy">
							{bestSession.sessionLabel}
						</p>
						<p className="text-[10px] text-trade-buy/80">
							{bestSession.winRate.toFixed(0)}% WR • {formatCompactCurrencyWithSign(bestSession.totalPnl, "R$")}
						</p>
					</div>
					<div>
						<p className="text-caption text-txt-300">{t("session.worstSession")}</p>
						<p className="text-small font-medium text-trade-sell">
							{worstSession.sessionLabel}
						</p>
						<p className="text-[10px] text-trade-sell/80">
							{worstSession.winRate.toFixed(0)}% WR • {formatCompactCurrencyWithSign(worstSession.totalPnl, "R$")}
						</p>
					</div>
				</div>
			)}
		</div>
	)
}
