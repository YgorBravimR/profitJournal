"use client"

import { useMemo } from "react"
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
	if (!active || !payload || payload.length === 0) return null

	const data = payload[0].payload
	return (
		<div className="border-bg-300 bg-bg-100 p-s-300 rounded-lg border shadow-lg">
			<p className="text-tiny text-txt-300">Trade #{data.tradeNumber}</p>
			<p className="text-small text-trade-sell font-semibold">
				-{data.drawdownPercent.toFixed(2)}%
			</p>
		</div>
	)
}

export const DrawdownChart = ({ trades }: DrawdownChartProps) => {
	const t = useTranslations("monteCarlo.results")

	// Transform data for chart
	const chartData = useMemo(
		() => [
			{ tradeNumber: 0, drawdownPercent: 0 },
			...trades.map((trade) => ({
				tradeNumber: trade.tradeNumber,
				drawdownPercent: trade.drawdownPercent,
			})),
		],
		[trades]
	)

	const { maxDrawdown, padding } = useMemo(() => {
		const max = Math.max(...chartData.map((d) => d.drawdownPercent))
		return { maxDrawdown: max, padding: max * 0.1 || 1 }
	}, [chartData])

	return (
		<div className="border-bg-300 bg-bg-200 p-m-500 rounded-lg border">
			<div className="mb-m-400 flex items-center justify-between">
				<h3 className="text-body text-txt-100 font-semibold">
					{t("drawdownCurve")}
				</h3>
				<span className="text-small text-trade-sell font-medium">
					Max: -{maxDrawdown.toFixed(1)}%
				</span>
			</div>

			<div className="h-72">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-trade-sell)"
									stopOpacity={0.25}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-trade-sell)"
									stopOpacity={0.02}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--color-bg-300)"
							strokeOpacity={0.5}
						/>
						<XAxis
							dataKey="tradeNumber"
							stroke="var(--color-txt-300)"
							fontSize={11}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="var(--color-txt-300)"
							fontSize={11}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => `-${value.toFixed(0)}%`}
							domain={[0, maxDrawdown + padding]}
							reversed
							width={45}
						/>
						<Tooltip content={<CustomTooltip />} />
						<ReferenceLine
							y={0}
							stroke="var(--color-txt-300)"
							strokeDasharray="4 4"
							strokeOpacity={0.5}
						/>
						<Area
							type="monotone"
							dataKey="drawdownPercent"
							stroke="var(--color-trade-sell)"
							strokeWidth={2}
							fill="url(#drawdownGradient)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<p className="mt-s-300 text-tiny text-txt-300 text-center">
				{t("tradeNumber")}
			</p>
		</div>
	)
}
