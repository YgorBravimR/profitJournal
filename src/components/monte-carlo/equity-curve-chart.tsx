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
import { formatCompactCurrency, formatChartPercent } from "@/lib/formatting"
import type { SimulatedTrade } from "@/types/monte-carlo"

interface EquityCurveChartProps {
	trades: SimulatedTrade[]
	initialBalance: number
	showPercentage?: boolean
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		payload: { tradeNumber: number; balance: number; returnPct: number }
	}>
	showPercentage: boolean
}

const CustomTooltip = ({
	active,
	payload,
	showPercentage,
}: CustomTooltipProps) => {
	if (!active || !payload || payload.length === 0) return null

	const data = payload[0].payload
	const isPositive = data.returnPct >= 0

	return (
		<div className="border-bg-300 bg-bg-200 p-s-300 rounded-lg border shadow-lg">
			<p className="text-tiny text-txt-300">Trade #{data.tradeNumber}</p>
			<p
				className={`text-small font-semibold ${isPositive ? "text-trade-buy" : "text-trade-sell"}`}
			>
				{showPercentage
					? formatChartPercent(data.returnPct)
					: formatCompactCurrency(data.balance)}
			</p>
		</div>
	)
}

export const EquityCurveChart = ({
	trades,
	initialBalance,
	showPercentage = false,
}: EquityCurveChartProps) => {
	const t = useTranslations("monteCarlo.results")

	// Transform data for chart
	const chartData = [
		{ tradeNumber: 0, balance: initialBalance, returnPct: 0 },
		...trades.map((trade) => ({
			tradeNumber: trade.tradeNumber,
			balance: trade.balanceAfter,
			returnPct: ((trade.balanceAfter - initialBalance) / initialBalance) * 100,
		})),
	]

	const values = showPercentage
		? chartData.map((d) => d.returnPct)
		: chartData.map((d) => d.balance)
	const minValue = Math.min(...values)
	const maxValue = Math.max(...values)
	const padding = (maxValue - minValue) * 0.1 || 100

	const finalReturnPct = chartData[chartData.length - 1]?.returnPct || 0
	const isPositive = finalReturnPct >= 0

	return (
		<div className="border-bg-300 bg-bg-200 p-m-500 rounded-lg border">
			<h3 className="mb-m-400 text-body text-txt-100 font-semibold">
				{t("equityCurve")}
			</h3>

			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor={
										isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"
									}
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor={
										isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"
									}
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
							tickFormatter={(value) =>
								showPercentage
									? formatChartPercent(value)
									: formatCompactCurrency(value)
							}
							domain={[minValue - padding, maxValue + padding]}
						/>
						<Tooltip
							content={<CustomTooltip showPercentage={showPercentage} />}
						/>
						{showPercentage && (
							<ReferenceLine
								y={0}
								stroke="var(--txt-400)"
								strokeDasharray="3 3"
							/>
						)}
						<Area
							type="monotone"
							dataKey={showPercentage ? "returnPct" : "balance"}
							stroke={isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
							strokeWidth={2}
							fill="url(#equityGradient)"
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
