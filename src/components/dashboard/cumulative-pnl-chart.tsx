"use client"

import { useTranslations } from "next-intl"
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart-container"
import { formatCompactCurrencyWithSign } from "@/lib/formatting"
import type { EquityPoint } from "@/types"

interface CumulativePnLChartProps {
	data: EquityPoint[]
	showDrawdown?: boolean
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		dataKey: string
		payload: EquityPoint
	}>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	const t = useTranslations("dashboard")

	if (!active || !payload || payload.length === 0) {
		return null
	}

	const data = payload[0].payload
	const isProfit = data.equity >= 0

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-100 px-s-300 py-s-200 shadow-lg">
			<p className="text-small font-medium text-txt-100">
				{new Date(data.date).toLocaleDateString("pt-BR", {
					day: "numeric",
					month: "short",
					year: "numeric",
				})}
			</p>
			<div className="mt-s-100 space-y-s-100">
				<p className="text-caption text-txt-300">
					{t("cumulativePnL.cumulative")}:{" "}
					<span
						className={`font-semibold ${isProfit ? "text-trade-buy" : "text-trade-sell"}`}
					>
						{formatCompactCurrencyWithSign(data.equity, "R$")}
					</span>
				</p>
				{data.drawdown !== undefined && data.drawdown > 0 && (
					<p className="text-caption text-txt-300">
						{t("cumulativePnL.drawdown")}:{" "}
						<span className="font-semibold text-trade-sell">
							-{data.drawdown.toFixed(1)}%
						</span>
					</p>
				)}
			</div>
		</div>
	)
}

export const CumulativePnLChart = ({ data, showDrawdown = false }: CumulativePnLChartProps) => {
	const t = useTranslations("dashboard")

	const formatDate = (date: string) => {
		const d = new Date(date)
		return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
	}

	const equityValues = data.map((d) => d.equity)
	const minEquity = Math.min(...equityValues, 0)
	const maxEquity = Math.max(...equityValues, 0)
	const padding = Math.max(Math.abs(maxEquity - minEquity) * 0.1, 100)

	if (data.length === 0) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
				<h3 className="mb-m-400 text-body font-semibold text-txt-100">
					{t("cumulativePnL.title")}
				</h3>
				<div className="flex h-[200px] items-center justify-center text-txt-300">
					{t("noData")}
				</div>
			</div>
		)
	}

	const finalPnl = data[data.length - 1]?.equity ?? 0
	const lineColor =
		finalPnl >= 0 ? "var(--color-trade-buy)" : "var(--color-trade-sell)"

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
			<h3 className="mb-m-400 text-body font-semibold text-txt-100">
				{t("cumulativePnL.title")}
			</h3>
			<ChartContainer id="chart-dashboard-cumulative-pnl" className="h-[200px] w-full">
					<LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--color-bg-300)"
							vertical={false}
						/>
						<XAxis
							dataKey="date"
							tickFormatter={formatDate}
							stroke="var(--color-txt-300)"
							tick={{ fill: "var(--color-txt-300)", fontSize: 12 }}
							tickLine={false}
							axisLine={{ stroke: "var(--color-bg-300)" }}
						/>
						<YAxis
							tickFormatter={(value: number) => formatCompactCurrencyWithSign(value, "R$")}
							stroke="var(--color-txt-300)"
							tick={{ fill: "var(--color-txt-300)", fontSize: 12 }}
							tickLine={false}
							axisLine={false}
							domain={[minEquity - padding, maxEquity + padding]}
							width={70}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Line
							type="monotone"
							dataKey="equity"
							stroke={lineColor}
							strokeWidth={2}
							dot={false}
							activeDot={{
								r: 4,
								fill: lineColor,
								stroke: "var(--color-bg-100)",
								strokeWidth: 2,
							}}
						/>
					</LineChart>
			</ChartContainer>
		</div>
	)
}
