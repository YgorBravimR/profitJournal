"use client"

import { useState } from "react"
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	Cell,
} from "recharts"
import { Info } from "lucide-react"
import { useTranslations } from "next-intl"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import type { PerformanceByGroup } from "@/types"

// Tooltip wrapper for column headers
const HeaderWithTooltip = ({
	label,
	tooltip,
}: {
	label: string
	tooltip: React.ReactNode
}) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<span className="gap-s-100 inline-flex cursor-help items-center">
				{label}
				<Info className="text-txt-400 h-3 w-3" />
			</span>
		</TooltipTrigger>
		<TooltipContent
			side="top"
			className="border-bg-300 bg-bg-100 text-acc-100 p-s-300 max-w-xs border shadow-lg"
		>
			{tooltip}
		</TooltipContent>
	</Tooltip>
)

interface VariableComparisonProps {
	data: PerformanceByGroup[]
	groupBy: "asset" | "timeframe" | "hour" | "dayOfWeek" | "strategy"
	onGroupByChange: (
		groupBy: "asset" | "timeframe" | "hour" | "dayOfWeek" | "strategy"
	) => void
}

type MetricType = "pnl" | "winRate" | "avgR" | "tradeCount" | "profitFactor"
type GroupByType = "asset" | "timeframe" | "hour" | "dayOfWeek" | "strategy"

const formatCurrency = (value: number): string => {
	const absValue = Math.abs(value)
	if (absValue >= 1000) {
		return `${value >= 0 ? "" : "-"}$${(absValue / 1000).toFixed(1)}K`
	}
	return `${value >= 0 ? "" : "-"}$${absValue.toFixed(0)}`
}

const formatProfitFactor = (value: number): string => {
	if (!Number.isFinite(value)) return "∞"
	if (value === 0) return "0.00"
	return value.toFixed(2)
}

const formatMetricValue = (value: number, metric: MetricType): string => {
	switch (metric) {
		case "pnl":
			return formatCurrency(value)
		case "winRate":
			return `${value.toFixed(1)}%`
		case "avgR":
			return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`
		case "tradeCount":
			return value.toString()
		case "profitFactor":
			return formatProfitFactor(value)
		default:
			return value.toString()
	}
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		payload: PerformanceByGroup
	}>
	metric: MetricType
}

const CustomTooltip = ({ active, payload, metric }: CustomTooltipProps) => {
	if (active && payload && payload.length > 0) {
		const data = payload[0].payload
		return (
			<div className="border-bg-300 bg-bg-200 p-s-300 rounded-lg border shadow-lg">
				<p className="text-small text-txt-100 font-semibold">{data.group}</p>
				<div className="mt-s-200 space-y-s-100 text-tiny">
					<p className={data.pnl >= 0 ? "text-trade-buy" : "text-trade-sell"}>
						P&L: {formatCurrency(data.pnl)}
					</p>
					<p className="text-txt-200">Win Rate: {data.winRate.toFixed(1)}%</p>
					<p className="text-txt-200">
						Avg R: {data.avgR >= 0 ? "+" : ""}
						{data.avgR.toFixed(2)}R
					</p>
					<p className="text-txt-200">Trades: {data.tradeCount}</p>
					<p className="text-txt-200">
						PF: {formatProfitFactor(data.profitFactor)}
					</p>
				</div>
			</div>
		)
	}
	return null
}

export const VariableComparison = ({
	data,
	groupBy,
	onGroupByChange,
}: VariableComparisonProps) => {
	const t = useTranslations("analytics.variableComparison")
	const [metric, setMetric] = useState<MetricType>("pnl")

	const groupOptions: { value: GroupByType; label: string }[] = [
		{ value: "asset", label: t("asset") },
		{ value: "timeframe", label: t("timeframe") },
		{ value: "hour", label: t("hour") },
		{ value: "dayOfWeek", label: t("dayOfWeek") },
		{ value: "strategy", label: t("strategy") },
	]

	const metricOptions: { value: MetricType; label: string }[] = [
		{ value: "pnl", label: t("metrics.pnl") },
		{ value: "winRate", label: t("metrics.winRate") },
		{ value: "avgR", label: t("metrics.avgR") },
		{ value: "tradeCount", label: t("metrics.tradeCount") },
		{ value: "profitFactor", label: t("metrics.profitFactor") },
	]

	const getBarColor = (value: number, metric: MetricType): string => {
		if (metric === "tradeCount") return "rgb(204 162 72)" // acc-100
		if (metric === "profitFactor") {
			return value >= 1 ? "rgb(0 255 150)" : "rgb(128 128 255)"
		}
		return value >= 0 ? "rgb(0 255 150)" : "rgb(128 128 255)"
	}

	const chartData = data.map((item) => {
		let value = item[metric]
		// Cap Infinity profit factor at a visible value for chart display
		if (metric === "profitFactor" && !Number.isFinite(value)) {
			value = 10 // Cap at 10 for visualization
		}
		return {
			...item,
			value,
		}
	})

	return (
		<div className="border-bg-300 bg-bg-200 p-m-500 rounded-lg border">
			<div className="gap-m-400 flex flex-wrap items-center justify-between">
				<h3 className="text-body text-txt-100 font-semibold">
					{t("title")}
				</h3>
				<div className="gap-s-300 flex flex-wrap">
					{/* Group By Selector */}
					<select
						value={groupBy}
						onChange={(e) => onGroupByChange(e.target.value as typeof groupBy)}
						className="border-bg-300 bg-bg-100 px-s-300 py-s-200 text-small text-txt-100 rounded-md border"
					>
						{groupOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>

					{/* Metric Selector */}
					<select
						value={metric}
						onChange={(e) => setMetric(e.target.value as MetricType)}
						className="border-bg-300 bg-bg-100 px-s-300 py-s-200 text-small text-txt-100 rounded-md border"
					>
						{metricOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>
			</div>

			{data.length === 0 ? (
				<div className="mt-m-400 text-txt-300 flex h-64 items-center justify-center">
					{t("noData")}
				</div>
			) : (
				<div className="mt-m-400 h-80">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={chartData}
							margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgb(43 47 54)"
								vertical={false}
							/>
							<XAxis
								dataKey="group"
								stroke="rgb(90 96 106)"
								tick={{ fill: "rgb(90 96 106)", fontSize: 11 }}
								tickLine={false}
								axisLine={false}
								angle={-45}
								textAnchor="end"
								height={60}
							/>
							<YAxis
								stroke="rgb(90 96 106)"
								tick={{ fill: "rgb(90 96 106)", fontSize: 11 }}
								tickLine={false}
								axisLine={false}
								tickFormatter={(value) => formatMetricValue(value, metric)}
								width={70}
							/>
							<RechartsTooltip content={<CustomTooltip metric={metric} />} />
							<Bar dataKey="value" radius={[4, 4, 0, 0]}>
								{chartData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={getBarColor(entry.value, metric)}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			)}

			{/* Summary Table */}
			{data.length > 0 && (
				<div className="mt-m-500 overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-bg-300 border-b">
								<th className="px-s-300 py-s-200 text-tiny text-txt-300 text-left font-medium">
									{groupOptions.find((o) => o.value === groupBy)?.label}
								</th>
								<th className="px-s-300 py-s-200 text-tiny text-txt-300 text-right font-medium">
									<HeaderWithTooltip
										label="Trades"
										tooltip="Total number of closed trades"
									/>
								</th>
								<th className="px-s-300 py-s-200 text-tiny text-txt-300 text-right font-medium">
									<HeaderWithTooltip
										label="P&L"
										tooltip="Net Profit & Loss (total gains minus losses)"
									/>
								</th>
								<th className="px-s-300 py-s-200 text-tiny text-txt-300 text-right font-medium">
									<HeaderWithTooltip
										label="Win Rate"
										tooltip="Percentage of winning trades (wins ÷ total trades)"
									/>
								</th>
								<th className="px-s-300 py-s-200 text-tiny text-txt-300 text-right font-medium">
									<HeaderWithTooltip
										label="Avg R"
										tooltip="Average R-multiple per trade (actual return ÷ planned risk)"
									/>
								</th>
								<th className="px-s-300 py-s-200 text-tiny text-txt-300 text-right font-medium">
									<HeaderWithTooltip
										label="PF"
										tooltip={
											<div className="space-y-s-100 text-tiny">
												<p className="text-txt-100 font-medium">
													Profit Factor
												</p>
												<ul className="text-txt-200 space-y-1">
													<li>
														<span className="text-trade-buy">PF &gt; 1</span> =
														Profitable
													</li>
													<li>
														<span className="text-txt-300">PF = 1</span> =
														Breakeven
													</li>
													<li>
														<span className="text-trade-sell">PF &lt; 1</span> =
														Losing money
													</li>
													<li>
														<span className="text-trade-buy">PF = ∞</span> = No
														losses yet
													</li>
													<li>
														<span className="text-trade-sell">PF = 0</span> = No
														wins yet
													</li>
												</ul>
											</div>
										}
									/>
								</th>
							</tr>
						</thead>
						<tbody>
							{data.map((row) => (
								<tr key={row.group} className="border-bg-300/50 border-b">
									<td className="px-s-300 py-s-200 text-small text-txt-100 font-medium">
										{row.group}
									</td>
									<td className="px-s-300 py-s-200 text-small text-txt-200 text-right">
										{row.tradeCount}
									</td>
									<td
										className={`px-s-300 py-s-200 text-small text-right font-medium ${
											row.pnl >= 0 ? "text-trade-buy" : "text-trade-sell"
										}`}
									>
										{formatCurrency(row.pnl)}
									</td>
									<td className="px-s-300 py-s-200 text-small text-txt-200 text-right">
										{row.winRate.toFixed(1)}%
									</td>
									<td
										className={`px-s-300 py-s-200 text-small text-right ${
											row.avgR >= 0 ? "text-trade-buy" : "text-trade-sell"
										}`}
									>
										{row.avgR >= 0 ? "+" : ""}
										{row.avgR.toFixed(2)}R
									</td>
									<td
										className={`px-s-300 py-s-200 text-small text-right ${
											row.profitFactor >= 1
												? "text-trade-buy"
												: "text-trade-sell"
										}`}
									>
										{formatProfitFactor(row.profitFactor)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}
