"use client"

import { useState, useEffect, useTransition } from "react"
import { useTranslations } from "next-intl"
import {
	FilterPanel,
	VariableComparison,
	TagCloud,
	ExpectedValue,
	RDistribution,
	CumulativePnlChart,
	HourlyPerformanceChart,
	DayOfWeekChart,
	TimeHeatmap,
	type FilterState,
} from "@/components/analytics"
import {
	getPerformanceByVariable,
	getExpectedValue,
	getRDistribution,
	getEquityCurve,
	getHourlyPerformance,
	getDayOfWeekPerformance,
	getTimeHeatmap,
} from "@/app/actions/analytics"
import { getTagStats } from "@/app/actions/tags"
import type {
	PerformanceByGroup,
	TagStats,
	ExpectedValueData,
	RDistributionBucket,
	EquityPoint,
	HourlyPerformance,
	DayOfWeekPerformance,
	TimeHeatmapCell,
} from "@/types"

interface TimeframeOption {
	id: string
	name: string
}

interface AnalyticsContentProps {
	initialPerformance: PerformanceByGroup[]
	initialTagStats: TagStats[]
	initialExpectedValue: ExpectedValueData | null
	initialRDistribution: RDistributionBucket[]
	initialEquityCurve: EquityPoint[]
	initialHourlyPerformance: HourlyPerformance[]
	initialDayOfWeekPerformance: DayOfWeekPerformance[]
	initialTimeHeatmap: TimeHeatmapCell[]
	availableAssets: string[]
	availableTimeframes: TimeframeOption[]
}

export const AnalyticsContent = ({
	initialPerformance,
	initialTagStats,
	initialExpectedValue,
	initialRDistribution,
	initialEquityCurve,
	initialHourlyPerformance,
	initialDayOfWeekPerformance,
	initialTimeHeatmap,
	availableAssets,
	availableTimeframes,
}: AnalyticsContentProps) => {
	const t = useTranslations("analytics")
	const [isPending, startTransition] = useTransition()

	const [filters, setFilters] = useState<FilterState>({
		dateFrom: null,
		dateTo: null,
		assets: [],
		directions: [],
		outcomes: [],
		timeframeIds: [],
	})

	const [groupBy, setGroupBy] = useState<
		"asset" | "timeframe" | "hour" | "dayOfWeek" | "strategy"
	>("asset")

	const [performance, setPerformance] =
		useState<PerformanceByGroup[]>(initialPerformance)
	const [tagStats, setTagStats] = useState<TagStats[]>(initialTagStats)
	const [expectedValue, setExpectedValue] =
		useState<ExpectedValueData | null>(initialExpectedValue)
	const [rDistribution, setRDistribution] =
		useState<RDistributionBucket[]>(initialRDistribution)
	const [equityCurve, setEquityCurve] =
		useState<EquityPoint[]>(initialEquityCurve)
	const [hourlyPerformance, setHourlyPerformance] =
		useState<HourlyPerformance[]>(initialHourlyPerformance)
	const [dayOfWeekPerformance, setDayOfWeekPerformance] =
		useState<DayOfWeekPerformance[]>(initialDayOfWeekPerformance)
	const [timeHeatmap, setTimeHeatmap] =
		useState<TimeHeatmapCell[]>(initialTimeHeatmap)

	// Reset state when initial props change (e.g., account switch)
	useEffect(() => {
		setPerformance(initialPerformance)
	}, [initialPerformance])

	useEffect(() => {
		setTagStats(initialTagStats)
	}, [initialTagStats])

	useEffect(() => {
		setExpectedValue(initialExpectedValue)
	}, [initialExpectedValue])

	useEffect(() => {
		setRDistribution(initialRDistribution)
	}, [initialRDistribution])

	useEffect(() => {
		setEquityCurve(initialEquityCurve)
	}, [initialEquityCurve])

	useEffect(() => {
		setHourlyPerformance(initialHourlyPerformance)
	}, [initialHourlyPerformance])

	useEffect(() => {
		setDayOfWeekPerformance(initialDayOfWeekPerformance)
	}, [initialDayOfWeekPerformance])

	useEffect(() => {
		setTimeHeatmap(initialTimeHeatmap)
	}, [initialTimeHeatmap])

	// Refetch data when filters or groupBy change
	useEffect(() => {
		startTransition(async () => {
			// Convert FilterState to TradeFilters for server actions
			const tradeFilters = {
				dateFrom: filters.dateFrom || undefined,
				dateTo: filters.dateTo || undefined,
				assets: filters.assets.length > 0 ? filters.assets : undefined,
				directions: filters.directions.length > 0 ? filters.directions : undefined,
				outcomes: filters.outcomes.length > 0 ? filters.outcomes : undefined,
				timeframeIds: filters.timeframeIds.length > 0 ? filters.timeframeIds : undefined,
			}

			const [perfResult, tagResult, evResult, rDistResult, equityResult, hourlyResult, dayOfWeekResult, heatmapResult] = await Promise.all([
				getPerformanceByVariable(groupBy, tradeFilters),
				getTagStats(tradeFilters),
				getExpectedValue(tradeFilters),
				getRDistribution(tradeFilters),
				getEquityCurve(filters.dateFrom || undefined, filters.dateTo || undefined),
				getHourlyPerformance(tradeFilters),
				getDayOfWeekPerformance(tradeFilters),
				getTimeHeatmap(tradeFilters),
			])

			if (perfResult.status === "success" && perfResult.data) {
				setPerformance(perfResult.data)
			}
			if (tagResult.status === "success" && tagResult.data) {
				setTagStats(tagResult.data)
			}
			if (evResult.status === "success" && evResult.data) {
				setExpectedValue(evResult.data)
			}
			if (rDistResult.status === "success" && rDistResult.data) {
				setRDistribution(rDistResult.data)
			}
			if (equityResult.status === "success" && equityResult.data) {
				setEquityCurve(equityResult.data)
			}
			if (hourlyResult.status === "success" && hourlyResult.data) {
				setHourlyPerformance(hourlyResult.data)
			}
			if (dayOfWeekResult.status === "success" && dayOfWeekResult.data) {
				setDayOfWeekPerformance(dayOfWeekResult.data)
			}
			if (heatmapResult.status === "success" && heatmapResult.data) {
				setTimeHeatmap(heatmapResult.data)
			}
		})
	}, [filters, groupBy])

	const handleGroupByChange = (
		newGroupBy: "asset" | "timeframe" | "hour" | "dayOfWeek" | "strategy"
	) => {
		setGroupBy(newGroupBy)
	}

	return (
		<div className="space-y-m-600">
			{/* Filter Panel */}
			<FilterPanel
				filters={filters}
				onFiltersChange={setFilters}
				availableAssets={availableAssets}
				availableTimeframes={availableTimeframes}
			/>

			{/* Loading Indicator */}
			{isPending && (
				<div className="flex items-center justify-center py-s-200">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-acc-100 border-t-transparent" />
					<span className="ml-s-200 text-small text-txt-300">
						Updating analytics...
					</span>
				</div>
			)}

			{/* Variable Comparison - Full Width */}
			<VariableComparison
				data={performance}
				groupBy={groupBy}
				onGroupByChange={handleGroupByChange}
			/>

			{/* Cumulative P&L Chart - Full Width */}
			<CumulativePnlChart data={equityCurve} />

			{/* Two Column Grid */}
			<div className="grid grid-cols-1 gap-m-600 lg:grid-cols-2">
				{/* Expected Value */}
				<ExpectedValue data={expectedValue} />

				{/* R Distribution */}
				<RDistribution data={rDistribution} />
			</div>

			{/* Tag Cloud - Full Width */}
			<TagCloud data={tagStats} />

			{/* Time-Based Analysis Section */}
			<div className="mt-m-600">
				<h2 className="mb-m-400 text-heading font-semibold text-txt-100">
					{t("time.title")}
				</h2>

				{/* Time Heatmap - Full Width */}
				<TimeHeatmap data={timeHeatmap} />

				{/* Two Column Grid for Charts */}
				<div className="mt-m-600 grid grid-cols-1 gap-m-600 lg:grid-cols-2">
					{/* Hourly Performance */}
					<HourlyPerformanceChart data={hourlyPerformance} />

					{/* Day of Week Performance */}
					<DayOfWeekChart data={dayOfWeekPerformance} />
				</div>
			</div>
		</div>
	)
}
