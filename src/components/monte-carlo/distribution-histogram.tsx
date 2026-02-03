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
	Rectangle,
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
		payload: DistributionBucket & { midPoint: number; percentileZone: string }
	}>
	initialBalance: number
}

interface PercentileBoundaries {
	p5: number
	p15: number
	p40: number
	p60: number
	p85: number
	p95: number
	min: number
	max: number
}

type PercentileZone = "outer" | "middle" | "center" | "core"

const calculatePercentileBoundaries = (
	buckets: Array<{ midPoint: number; count: number }>
): PercentileBoundaries => {
	if (buckets.length === 0) {
		return { p5: 0, p15: 0, p40: 0, p60: 0, p85: 0, p95: 0, min: 0, max: 0 }
	}

	const totalCount = buckets.reduce((sum, b) => sum + b.count, 0)
	let cumulative = 0

	const sortedBuckets = [...buckets].sort((a, b) => a.midPoint - b.midPoint)
	const min = sortedBuckets[0].midPoint
	const max = sortedBuckets[sortedBuckets.length - 1].midPoint

	let p5 = min
	let p15 = min
	let p40 = min
	let p60 = max
	let p85 = max
	let p95 = max

	for (const bucket of sortedBuckets) {
		const prevCumulative = cumulative
		cumulative += bucket.count
		const prevPct = (prevCumulative / totalCount) * 100
		const currentPct = (cumulative / totalCount) * 100

		if (prevPct < 5 && currentPct >= 5) {
			p5 = bucket.midPoint
		}
		if (prevPct < 15 && currentPct >= 15) {
			p15 = bucket.midPoint
		}
		if (prevPct < 40 && currentPct >= 40) {
			p40 = bucket.midPoint
		}
		if (prevPct < 60 && currentPct >= 60) {
			p60 = bucket.midPoint
		}
		if (prevPct < 85 && currentPct >= 85) {
			p85 = bucket.midPoint
		}
		if (prevPct < 95 && currentPct >= 95) {
			p95 = bucket.midPoint
		}
	}

	return { p5, p15, p40, p60, p85, p95, min, max }
}

const getPercentileZone = (
	midPoint: number,
	boundaries: PercentileBoundaries
): PercentileZone => {
	// Outer: < 5th or > 95th percentile (5% each tail = 10% total)
	if (midPoint < boundaries.p5 || midPoint > boundaries.p95) {
		return "outer"
	}
	// Middle: 5th-15th or 85th-95th percentile (10% each side = 20% total)
	if (midPoint < boundaries.p15 || midPoint > boundaries.p85) {
		return "middle"
	}
	// Center: 15th-40th or 60th-85th percentile (25% each side = 50% total)
	if (midPoint < boundaries.p40 || midPoint > boundaries.p60) {
		return "center"
	}
	// Core: 40th-60th percentile (20% in the very middle)
	return "core"
}

const ZONE_COLORS: Record<PercentileZone, string> = {
	core: "rgba(255, 50, 0, 0.2)", // brightest orange - very center
	center: "rgba(255, 153, 0, 0.2)", // accent orange
	middle: "rgba(255, 238, 0, 0.2)", // warning yellow
	outer: "transparent",
}

interface CustomBarBackgroundProps {
	x?: number
	y?: number
	width?: number
	height?: number
	payload?: { percentileZone: PercentileZone }
}

const CustomBarBackground = (props: CustomBarBackgroundProps) => {
	const { x, y, width, height, payload } = props
	if (
		x === undefined ||
		y === undefined ||
		width === undefined ||
		height === undefined
	) {
		return null
	}

	const zone = payload?.percentileZone ?? "outer"
	const fill = ZONE_COLORS[zone]

	if (fill === "transparent") return null

	return (
		<Rectangle
			x={x}
			y={0}
			width={width}
			height={y + height}
			fill={fill}
			radius={0}
		/>
	)
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

	const chartData = useMemo(() => {
		const data = buckets.map((bucket) => ({
			...bucket,
			label: formatCompactCurrency((bucket.rangeStart + bucket.rangeEnd) / 2),
			midPoint: (bucket.rangeStart + bucket.rangeEnd) / 2,
		}))

		const boundaries = calculatePercentileBoundaries(data)

		return data.map((item) => ({
			...item,
			percentileZone: getPercentileZone(item.midPoint, boundaries),
		}))
	}, [buckets])

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
						{t("median")}:{" "}
						<span className="text-txt-100 font-medium">
							{formatCompactCurrency(medianBalance)}
						</span>
					</span>
					<span className="text-tiny text-txt-300">
						{t("profitable")}:{" "}
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
						<Bar
							dataKey="count"
							radius={[3, 3, 0, 0]}
							background={<CustomBarBackground />}
						>
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

			{/* Percentile Zone Legend */}
			<div className="mt-m-400 pt-m-300 border-t border-bg-300">
				<div className="flex flex-wrap items-center justify-center gap-m-400">
					<div className="flex items-center gap-s-200">
						<div
							className="h-3 w-6 rounded-sm"
							style={{ backgroundColor: ZONE_COLORS.core }}
						/>
						<span className="text-tiny text-txt-300">{t("legendCore")}</span>
					</div>
					<div className="flex items-center gap-s-200">
						<div
							className="h-3 w-6 rounded-sm"
							style={{ backgroundColor: ZONE_COLORS.center }}
						/>
						<span className="text-tiny text-txt-300">{t("legendCenter")}</span>
					</div>
					<div className="flex items-center gap-s-200">
						<div
							className="h-3 w-6 rounded-sm"
							style={{ backgroundColor: ZONE_COLORS.middle }}
						/>
						<span className="text-tiny text-txt-300">{t("legendMiddle")}</span>
					</div>
					<div className="flex items-center gap-s-200">
						<div className="h-3 w-6 rounded-sm border border-bg-300 bg-transparent" />
						<span className="text-tiny text-txt-300">{t("legendOuter")}</span>
					</div>
				</div>
			</div>
		</div>
	)
}
