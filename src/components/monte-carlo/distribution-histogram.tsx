"use client"

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
import { formatCompactCurrency } from "@/lib/formatting"
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
		payload: DistributionBucket
	}>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (!active || !payload || payload.length === 0) return null

	const data = payload[0].payload

	return (
		<div className="border-bg-300 bg-bg-200 p-s-300 rounded-lg border shadow-lg">
			<p className="text-tiny text-txt-300">
				{formatCompactCurrency(data.rangeStart)} -{" "}
				{formatCompactCurrency(data.rangeEnd)}
			</p>
			<p className="text-small text-accent-primary font-semibold">
				{data.count} simulations ({data.percentage.toFixed(1)}%)
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

	const chartData = buckets.map((bucket) => ({
		...bucket,
		label: formatCompactCurrency((bucket.rangeStart + bucket.rangeEnd) / 2),
		midPoint: (bucket.rangeStart + bucket.rangeEnd) / 2,
	}))

	const maxCount = Math.max(...chartData.map((d) => d.count))

	return (
		<div className="border-bg-300 bg-bg-200 p-m-500 rounded-lg border">
			<h3 className="mb-m-400 text-body text-txt-100 font-semibold">
				{t("distribution")}
			</h3>

			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--bg-300)"
							vertical={false}
						/>
						<XAxis
							dataKey="midPoint"
							stroke="var(--txt-300)"
							fontSize={10}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => formatCompactCurrency(value)}
							interval="preserveStartEnd"
						/>
						<YAxis
							stroke="var(--txt-300)"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							domain={[0, maxCount * 1.1]}
						/>
						<Tooltip content={<CustomTooltip />} />
						<ReferenceLine
							x={initialBalance}
							stroke="var(--txt-400)"
							strokeDasharray="3 3"
							label={{
								value: "Start",
								position: "top",
								fill: "var(--txt-300)",
								fontSize: 10,
							}}
						/>
						<Bar dataKey="count" radius={[2, 2, 0, 0]}>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={
										entry.midPoint >= initialBalance
											? "rgb(34, 197, 94)"
											: "rgb(239, 68, 68)"
									}
									fillOpacity={0.8}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>

			<p className="mt-s-200 text-tiny text-txt-300 text-center">
				{t("finalBalance")}
			</p>
		</div>
	)
}
