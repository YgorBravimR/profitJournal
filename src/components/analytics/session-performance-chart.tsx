"use client"

import { useTranslations } from "next-intl"
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Cell,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart-container"
import { formatCompactCurrencyWithSign } from "@/lib/formatting"
import { cn } from "@/lib/utils"
import { InsightCard, InsightCardPlaceholder } from "@/components/analytics/insight-card"
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

/** Map English session labels to translation keys */
const getSessionKey = (label: string): string => {
	const keyMap: Record<string, string> = {
		"Pre-Open": "preOpen",
		Morning: "morning",
		Afternoon: "afternoon",
		Close: "close",
	}
	return keyMap[label] || label.toLowerCase().replace("-", "")
}

/** Format decimal hour to HH:MM string */
const formatTime = (decimal: number): string => {
	const hours = Math.floor(decimal)
	const minutes = Math.round((decimal - hours) * 60)
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

/**
 * Custom tooltip for the session performance bar chart.
 * Shows detailed metrics for the hovered session bar.
 */
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	const t = useTranslations("analytics")
	const tLabels = useTranslations("analytics.session.labels")

	if (!active || !payload || payload.length === 0) {
		return null
	}

	const data = payload[0].payload
	const isProfit = data.totalPnl >= 0
	const timeRange = `${formatTime(data.startHour)} - ${formatTime(data.endHour)}`
	const translatedLabel = tLabels(
		getSessionKey(data.sessionLabel) as
			| "preOpen"
			| "morning"
			| "afternoon"
			| "close"
	)

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 px-m-400 py-s-300 shadow-lg">
			<p className="text-small font-semibold text-txt-100">
				{translatedLabel}
			</p>
			<p className="text-caption text-txt-300">{timeRange}</p>
			<div className="mt-s-200 space-y-s-100">
				<p className="text-caption">
					<span className="text-txt-300">{t("session.pnl")}:</span>{" "}
					<span
						className={cn(
							"font-medium",
							isProfit ? "text-trade-buy" : "text-trade-sell"
						)}
					>
						{formatCompactCurrencyWithSign(data.totalPnl, "R$")}
					</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("session.trades")}:</span>{" "}
					<span className="font-medium text-txt-100">
						{data.totalTrades}
					</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("session.winRate")}:</span>{" "}
					<span
						className={cn(
							"font-medium",
							data.winRate >= 50
								? "text-trade-buy"
								: "text-trade-sell"
						)}
					>
						{data.winRate.toFixed(0)}%
					</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">{t("session.avgR")}:</span>{" "}
					<span
						className={cn(
							"font-medium",
							data.avgR >= 0
								? "text-trade-buy"
								: "text-trade-sell"
						)}
					>
						{data.avgR >= 0 ? "+" : ""}
						{data.avgR.toFixed(2)}R
					</span>
				</p>
				<p className="text-caption">
					<span className="text-txt-300">
						{t("session.profitFactor")}:
					</span>{" "}
					<span
						className={cn(
							"font-medium",
							data.profitFactor >= 1
								? "text-trade-buy"
								: "text-trade-sell"
						)}
					>
						{data.profitFactor.toFixed(2)}
					</span>
				</p>
			</div>
		</div>
	)
}

/**
 * Displays trading performance by market session as a bar chart
 * with session stat cards and actionable insights.
 *
 * @param data - Array of session performance data
 */
export const SessionPerformanceChart = ({
	data,
}: SessionPerformanceChartProps) => {
	const t = useTranslations("analytics")
	const tLabels = useTranslations("analytics.session.labels")

	const translateSessionLabel = (label: string): string => {
		const key = getSessionKey(label) as
			| "preOpen"
			| "morning"
			| "afternoon"
			| "close"
		return tLabels(key)
	}

	// Filter out sessions with no trades
	const sessionsWithTrades = data.filter((s) => s.totalTrades > 0)

	// Calculate domain with padding
	const maxAbsPnl = Math.max(...data.map((d) => Math.abs(d.totalPnl)), 100)
	const domainMax = Math.ceil(maxAbsPnl * 1.1)

	// Find best and worst sessions
	const sortedByPnl = sessionsWithTrades.toSorted(
		(a, b) => b.totalPnl - a.totalPnl
	)
	const bestSession = sortedByPnl[0]
	const worstSession = sortedByPnl[sortedByPnl.length - 1]

	// Totals
	const totalPnl = data.reduce((sum, s) => sum + s.totalPnl, 0)
	const totalTrades = data.reduce((sum, s) => sum + s.totalTrades, 0)

	if (sessionsWithTrades.length === 0) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h3 className="text-body font-semibold text-txt-100">
					{t("session.title")}
				</h3>
				<div className="flex h-50 items-center justify-center text-txt-300">
					{t("noData")}
				</div>
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			{/* Header */}
			<div className="mb-m-400 flex items-start justify-between">
				<div>
					<h3 className="text-body font-semibold text-txt-100">
						{t("session.title")}
					</h3>
					<p className="text-caption text-txt-300 mt-s-100">
						{t("session.description")}
					</p>
				</div>
				<div className="text-right">
					<p
						className={cn(
							"text-body font-semibold",
							totalPnl >= 0
								? "text-trade-buy"
								: "text-trade-sell"
						)}
					>
						{formatCompactCurrencyWithSign(totalPnl, "R$")}
					</p>
					<p className="text-caption text-txt-300">
						{t("session.totalTrades", { count: totalTrades })}
					</p>
				</div>
			</div>

			{/* Bar Chart */}
			<ChartContainer className="h-60 w-full">
					<BarChart
						data={data}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--color-bg-300)"
							vertical={false}
						/>
						<XAxis
							dataKey="sessionLabel"
							tickFormatter={translateSessionLabel}
							stroke="var(--color-txt-300)"
							tick={{
								fill: "var(--color-txt-300)",
								fontSize: 11,
							}}
							tickLine={false}
							axisLine={{ stroke: "var(--color-bg-300)" }}
						/>
						<YAxis
							tickFormatter={(value: number) =>
								formatCompactCurrencyWithSign(value, "R$")
							}
							stroke="var(--color-txt-300)"
							tick={{
								fill: "var(--color-txt-300)",
								fontSize: 11,
							}}
							tickLine={false}
							axisLine={false}
							domain={[-domainMax, domainMax]}
							width={65}
						/>
						<Tooltip
							content={<CustomTooltip />}
							cursor={{
								fill: "var(--color-bg-300)",
								opacity: 0.3,
							}}
						/>
						<Bar dataKey="totalPnl" radius={[4, 4, 0, 0]}>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={
										entry.totalPnl >= 0
											? "var(--color-trade-buy)"
											: "var(--color-trade-sell)"
									}
									opacity={
										entry.totalTrades === 0 ? 0.3 : 1
									}
								/>
							))}
						</Bar>
					</BarChart>
			</ChartContainer>

			{/* Session Stats Cards */}
			<div className="mt-m-400 grid grid-cols-2 gap-s-300 sm:grid-cols-4">
				{data.map((session) => {
					const isProfit = session.totalPnl >= 0
					const hasTrades = session.totalTrades > 0
					return (
						<div
							key={session.session}
							className={cn(
								"rounded-lg border px-m-400 py-s-300",
								hasTrades
									? isProfit
										? "border-trade-buy/20 bg-trade-buy/5"
										: "border-trade-sell/20 bg-trade-sell/5"
									: "border-bg-300/50 bg-bg-300/20"
							)}
						>
							<p className="text-caption text-txt-300">
								{translateSessionLabel(session.sessionLabel)}
							</p>
							<p
								className={cn(
									"text-small font-semibold",
									hasTrades
										? isProfit
											? "text-trade-buy"
											: "text-trade-sell"
										: "text-txt-300"
								)}
							>
								{hasTrades
									? formatCompactCurrencyWithSign(
											session.totalPnl,
											"R$"
										)
									: "—"}
							</p>
							{hasTrades && (
								<p className="text-caption text-txt-300 mt-s-100">
									{session.winRate.toFixed(0)}% WR ·{" "}
									{t("session.totalTrades", {
										count: session.totalTrades,
									})}
								</p>
							)}
						</div>
					)
				})}
			</div>

			{/* Actionable Insights */}
			{bestSession && worstSession && (() => {
				const isSameSession = bestSession === worstSession
				const showBestAsReal = !isSameSession || bestSession.totalPnl >= 0
				const showWorstAsReal = !isSameSession || worstSession.totalPnl < 0

				return (
					<div className="mt-m-400 grid grid-cols-1 gap-s-300 sm:grid-cols-2">
						{showBestAsReal ? (
							<InsightCard
								type="best"
								label={t("session.bestSession")}
								title={translateSessionLabel(bestSession.sessionLabel)}
								detail={`${bestSession.winRate.toFixed(0)}% WR · ${formatCompactCurrencyWithSign(bestSession.totalPnl, "R$")} · ${t("session.totalTrades", { count: bestSession.totalTrades })}`}
								action={t("session.bestSessionAction")}
							/>
						) : (
							<InsightCardPlaceholder
								type="best"
								label={t("session.bestSession")}
								placeholderText={t("session.bestSessionPlaceholder")}
							/>
						)}
						{showWorstAsReal ? (
							<InsightCard
								type="worst"
								label={t("session.worstSession")}
								title={translateSessionLabel(worstSession.sessionLabel)}
								detail={`${worstSession.winRate.toFixed(0)}% WR · ${formatCompactCurrencyWithSign(worstSession.totalPnl, "R$")} · ${t("session.totalTrades", { count: worstSession.totalTrades })}`}
								action={t("session.worstSessionAction")}
							/>
						) : (
							<InsightCardPlaceholder
								type="worst"
								label={t("session.worstSession")}
								placeholderText={t("session.worstSessionPlaceholder")}
							/>
						)}
					</div>
				)
			})()}
		</div>
	)
}
