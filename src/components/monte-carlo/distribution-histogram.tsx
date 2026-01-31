"use client"

import { useMemo } from "react"
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
	Cell,
} from "recharts"
import { useTranslations } from "next-intl"
import { formatCompactCurrency, formatChartPercent } from "@/lib/formatting"
import type { DistributionBucket } from "@/types/monte-carlo"

interface DistributionHistogramProps {
	buckets: DistributionBucket[]
	medianBalance: number
	initialBalance: number
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		payload: DistributionBucket & { midPoint: number }
	}>
	initialBalance: number
}

const CustomTooltip = ({
	active,
	payload,
	initialBalance,
}: CustomTooltipProps) => {
	if (!active || !payload || payload.length === 0) return null

	const data = payload[0].payload
	const returnPct = ((data.midPoint - initialBalance) / initialBalance) * 100
	const isProfit = data.midPoint >= initialBalance

	return (
		<div className="border-bg-300 bg-bg-100 p-s-300 rounded-lg border shadow-lg">
			<p className="text-tiny text-txt-300">
				{formatCompactCurrency(data.rangeStart)} –{" "}
				{formatCompactCurrency(data.rangeEnd)}
			</p>
			<p
				className={`text-small font-semibold ${isProfit ? "text-trade-buy" : "text-trade-sell"}`}
			>
				{data.count} simulations ({data.percentage.toFixed(1)}%)
			</p>
			<p className="text-tiny text-txt-300">
				Return: {formatChartPercent(returnPct)}
			</p>
		</div>
	)
}

export const DistributionHistogram = ({
	buckets,
	medianBalance,
	initialBalance,
}: DistributionHistogramProps) => {
	const t = useTranslations("monteCarlo.results")

	const chartData = useMemo(
		() =>
			buckets.map((bucket) => ({
				...bucket,
				label: formatCompactCurrency((bucket.rangeStart + bucket.rangeEnd) / 2),
				midPoint: (bucket.rangeStart + bucket.rangeEnd) / 2,
			})),
		[buckets]
	)

	const maxCount = useMemo(
		() => Math.max(...chartData.map((d) => d.count)),
		[chartData]
	)

	const profitableCount = useMemo(
		() =>
			chartData
				.filter((d) => d.midPoint >= initialBalance)
				.reduce((sum, d) => sum + d.count, 0),
		[chartData, initialBalance]
	)

	const totalCount = useMemo(
		() => chartData.reduce((sum, d) => sum + d.count, 0),
		[chartData]
	)

	const profitablePct = ((profitableCount / totalCount) * 100).toFixed(0)

	return (
		<div className="border-bg-300 bg-bg-200 p-m-500 rounded-lg border">
			<div className="mb-m-400 flex items-center justify-between">
				<h3 className="text-body text-txt-100 font-semibold">
					{t("distribution")}
				</h3>
				<div className="gap-m-400 flex items-center">
					<span className="text-tiny text-txt-300">
						Median:{" "}
						<span className="text-txt-100 font-medium">
							{formatCompactCurrency(medianBalance)}
						</span>
					</span>
					<span className="text-tiny text-txt-300">
						Profitable:{" "}
						<span className="text-trade-buy font-medium">{profitablePct}%</span>
					</span>
				</div>
			</div>

			<div className="h-72">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--color-bg-300)"
							strokeOpacity={0.5}
							vertical={false}
						/>
						<XAxis
							dataKey="midPoint"
							stroke="var(--color-txt-300)"
							fontSize={10}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => formatCompactCurrency(value)}
							interval="preserveStartEnd"
						/>
						<YAxis
							stroke="var(--color-txt-300)"
							fontSize={11}
							tickLine={false}
							axisLine={false}
							domain={[0, maxCount * 1.1]}
							width={40}
						/>
						<Tooltip
							content={<CustomTooltip initialBalance={initialBalance} />}
						/>
						<ReferenceLine
							x={initialBalance}
							stroke="var(--color-acc-100)"
							strokeDasharray="4 4"
							strokeWidth={1.5}
							label={{
								value: "Start",
								position: "top",
								fill: "var(--color-acc-100)",
								fontSize: 10,
								fontWeight: 500,
							}}
						/>
						<Bar dataKey="count" radius={[3, 3, 0, 0]}>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={
										entry.midPoint >= initialBalance
											? "var(--color-trade-buy)"
											: "var(--color-trade-sell)"
									}
									fillOpacity={0.75}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>

			<p className="mt-s-300 text-tiny text-txt-300 text-center">
				{t("finalBalance")}
			</p>
		</div>
	)
}
