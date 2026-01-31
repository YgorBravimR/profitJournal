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
import { useTranslations } from "next-intl"
import type { SimulatedTrade } from "@/types/monte-carlo"

interface DrawdownChartProps {
	trades: SimulatedTrade[]
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		payload: { tradeNumber: number; drawdownPercent: number }
	}>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length > 0) {
		const data = payload[0].payload
		return (
			<div className="border-bg-300 bg-bg-200 p-s-300 rounded-lg border shadow-lg">
				<p className="text-tiny text-txt-300">Trade #{data.tradeNumber}</p>
				<p className="text-small text-trade-sell font-semibold">
					-{data.drawdownPercent.toFixed(2)}%
				</p>
			</div>
		)
	}
	return null
}

export const DrawdownChart = ({ trades }: DrawdownChartProps) => {
	const t = useTranslations("monteCarlo.results")

	// Transform data for chart (invert drawdown for visual representation)
	const chartData = [
		{ tradeNumber: 0, drawdownPercent: 0 },
		...trades.map((trade) => ({
			tradeNumber: trade.tradeNumber,
			drawdownPercent: trade.drawdownPercent,
		})),
	]

	const maxDrawdown = Math.max(...chartData.map((d) => d.drawdownPercent))
	const padding = maxDrawdown * 0.1 || 1

	return (
		<div className="border-bg-300 bg-bg-200 p-m-500 rounded-lg border">
			<h3 className="mb-m-400 text-body text-txt-100 font-semibold">
				{t("drawdownCurve")}
			</h3>

			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="rgb(239, 68, 68)"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="rgb(239, 68, 68)"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--bg-300)" />
						<XAxis
							dataKey="tradeNumber"
							stroke="var(--txt-300)"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="var(--txt-300)"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => `-${value.toFixed(0)}%`}
							domain={[0, maxDrawdown + padding]}
							reversed
						/>
						<Tooltip content={<CustomTooltip />} />
						<ReferenceLine
							y={0}
							stroke="var(--txt-400)"
							strokeDasharray="3 3"
						/>
						<Area
							type="monotone"
							dataKey="drawdownPercent"
							stroke="rgb(239, 68, 68)"
							strokeWidth={2}
							fill="url(#drawdownGradient)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<p className="mt-s-200 text-tiny text-txt-300 text-center">
				{t("tradeNumber")}
			</p>
		</div>
	)
}
