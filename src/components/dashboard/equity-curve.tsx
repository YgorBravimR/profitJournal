"use client"

import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
} from "recharts"
import type { EquityPoint } from "@/types"

interface EquityCurveProps {
	data: EquityPoint[]
}

const formatCurrency = (value: number): string => {
	const absValue = Math.abs(value)
	if (absValue >= 1000000) {
		return `${value >= 0 ? "" : "-"}$${(absValue / 1000000).toFixed(1)}M`
	}
	if (absValue >= 1000) {
		return `${value >= 0 ? "" : "-"}$${(absValue / 1000).toFixed(1)}K`
	}
	return `${value >= 0 ? "" : "-"}$${absValue.toFixed(0)}`
}

const formatDate = (dateStr: string): string => {
	const date = new Date(dateStr)
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		payload: EquityPoint
	}>
	label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (active && payload && payload.length > 0) {
		const data = payload[0].payload
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-s-300 shadow-lg">
				<p className="text-tiny text-txt-300">{formatDate(label || "")}</p>
				<p className={`text-small font-semibold ${data.equity >= 0 ? "text-trade-buy" : "text-trade-sell"}`}>
					{formatCurrency(data.equity)}
				</p>
				{data.drawdown > 0 && (
					<p className="text-tiny text-trade-sell">
						Drawdown: {data.drawdown.toFixed(1)}%
					</p>
				)}
			</div>
		)
	}
	return null
}

export const EquityCurve = ({ data }: EquityCurveProps) => {
	if (data.length === 0) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">Equity Curve</h2>
				<div className="mt-m-400 flex h-64 items-center justify-center text-txt-300">
					No trade data available
				</div>
			</div>
		)
	}

	const minEquity = Math.min(...data.map((d) => d.equity))
	const maxEquity = Math.max(...data.map((d) => d.equity))
	const padding = (maxEquity - minEquity) * 0.1 || 100

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			<h2 className="text-body font-semibold text-txt-100">Equity Curve</h2>
			<div className="mt-m-400 h-64">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={data}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="rgb(204 162 72)" stopOpacity={0.3} />
								<stop offset="95%" stopColor="rgb(204 162 72)" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="rgb(43 47 54)"
							vertical={false}
						/>
						<XAxis
							dataKey="date"
							tickFormatter={formatDate}
							stroke="rgb(90 96 106)"
							tick={{ fill: "rgb(90 96 106)", fontSize: 11 }}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							tickFormatter={formatCurrency}
							stroke="rgb(90 96 106)"
							tick={{ fill: "rgb(90 96 106)", fontSize: 11 }}
							tickLine={false}
							axisLine={false}
							domain={[minEquity - padding, maxEquity + padding]}
							width={60}
						/>
						<Tooltip content={<CustomTooltip />} />
						<ReferenceLine y={0} stroke="rgb(43 47 54)" strokeWidth={2} />
						<Area
							type="monotone"
							dataKey="equity"
							stroke="rgb(204 162 72)"
							strokeWidth={2}
							fill="url(#equityGradient)"
							dot={false}
							activeDot={{
								r: 4,
								fill: "rgb(204 162 72)",
								stroke: "rgb(21 25 33)",
								strokeWidth: 2,
							}}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
