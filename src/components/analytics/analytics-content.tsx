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
	SessionPerformanceChart,
	SessionAssetTable,
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
	getSessionPerformance,
	getSessionAssetPerformance,
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
	SessionPerformance,
	SessionAssetPerformance,
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
	initialSessionPerformance: SessionPerformance[]
	initialSessionAssetPerformance: SessionAssetPerformance[]
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
	initialSessionPerformance,
	initialSessionAssetPerformance,
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
	const [expectedValue, setExpectedValue] = useState<ExpectedValueData | null>(
		initialExpectedValue
	)
	const [rDistribution, setRDistribution] =
		useState<RDistributionBucket[]>(initialRDistribution)
	const [equityCurve, setEquityCurve] =
		useState<EquityPoint[]>(initialEquityCurve)
	const [hourlyPerformance, setHourlyPerformance] = useState<
		HourlyPerformance[]
	>(initialHourlyPerformance)
	const [dayOfWeekPerformance, setDayOfWeekPerformance] = useState<
		DayOfWeekPerformance[]
	>(initialDayOfWeekPerformance)
	const [timeHeatmap, setTimeHeatmap] =
		useState<TimeHeatmapCell[]>(initialTimeHeatmap)
	const [sessionPerformance, setSessionPerformance] = useState<
		SessionPerformance[]
	>(initialSessionPerformance)
	const [sessionAssetPerformance, setSessionAssetPerformance] = useState<
		SessionAssetPerformance[]
	>(initialSessionAssetPerformance)

	// Reset all analytics state when initial props change (e.g., account switch)
	useEffect(() => {
		setPerformance(initialPerformance)
		setTagStats(initialTagStats)
		setExpectedValue(initialExpectedValue)
		setRDistribution(initialRDistribution)
		setEquityCurve(initialEquityCurve)
		setHourlyPerformance(initialHourlyPerformance)
		setDayOfWeekPerformance(initialDayOfWeekPerformance)
		setTimeHeatmap(initialTimeHeatmap)
		setSessionPerformance(initialSessionPerformance)
		setSessionAssetPerformance(initialSessionAssetPerformance)
	}, [
		initialPerformance,
		initialTagStats,
		initialExpectedValue,
		initialRDistribution,
		initialEquityCurve,
		initialHourlyPerformance,
		initialDayOfWeekPerformance,
		initialTimeHeatmap,
		initialSessionPerformance,
		initialSessionAssetPerformance,
	])

	// Convert FilterState to TradeFilters format
	const toTradeFilters = (f: FilterState) => ({
		dateFrom: f.dateFrom || undefined,
		dateTo: f.dateTo || undefined,
		assets: f.assets.length > 0 ? f.assets : undefined,
		directions: f.directions.length > 0 ? f.directions : undefined,
		outcomes: f.outcomes.length > 0 ? f.outcomes : undefined,
		timeframeIds: f.timeframeIds.length > 0 ? f.timeframeIds : undefined,
	})

	// Refetch data when filters or groupBy change
	useEffect(() => {
		startTransition(async () => {
			const tradeFilters = toTradeFilters(filters)

			const [
				perfResult,
				tagResult,
				evResult,
				rDistResult,
				equityResult,
				hourlyResult,
				dayOfWeekResult,
				heatmapResult,
				sessionResult,
				sessionAssetResult,
			] = await Promise.all([
				getPerformanceByVariable(groupBy, tradeFilters),
				getTagStats(tradeFilters),
				getExpectedValue(tradeFilters),
				getRDistribution(tradeFilters),
				getEquityCurve(tradeFilters.dateFrom, tradeFilters.dateTo),
				getHourlyPerformance(tradeFilters),
				getDayOfWeekPerformance(tradeFilters),
				getTimeHeatmap(tradeFilters),
				getSessionPerformance(tradeFilters),
				getSessionAssetPerformance(tradeFilters),
			])

			// Update state with successful results
			if (perfResult.status === "success") setPerformance(perfResult.data ?? [])
			if (tagResult.status === "success") setTagStats(tagResult.data ?? [])
			if (evResult.status === "success") setExpectedValue(evResult.data ?? null)
			if (rDistResult.status === "success")
				setRDistribution(rDistResult.data ?? [])
			if (equityResult.status === "success")
				setEquityCurve(equityResult.data ?? [])
			if (hourlyResult.status === "success")
				setHourlyPerformance(hourlyResult.data ?? [])
			if (dayOfWeekResult.status === "success")
				setDayOfWeekPerformance(dayOfWeekResult.data ?? [])
			if (heatmapResult.status === "success")
				setTimeHeatmap(heatmapResult.data ?? [])
			if (sessionResult.status === "success")
				setSessionPerformance(sessionResult.data ?? [])
			if (sessionAssetResult.status === "success")
				setSessionAssetPerformance(sessionAssetResult.data ?? [])
		})
	}, [filters, groupBy])

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
				<div className="py-s-200 flex items-center justify-center">
					<div className="border-acc-100 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
					<span className="ml-s-200 text-small text-txt-300">
						Updating analytics...
					</span>
				</div>
			)}

			{/* Variable Comparison - Full Width */}
			<VariableComparison
				data={performance}
				groupBy={groupBy}
				onGroupByChange={setGroupBy}
			/>

			{/* Cumulative P&L Chart - Full Width */}
			<CumulativePnlChart data={equityCurve} />

			{/* Two Column Grid */}
			<div className="gap-m-600 grid grid-cols-1 lg:grid-cols-2">
				{/* Expected Value */}
				<ExpectedValue data={expectedValue} />

				{/* R Distribution */}
				<RDistribution data={rDistribution} />
			</div>

			{/* Tag Cloud - Full Width */}
			<TagCloud data={tagStats} />

			{/* Time-Based Analysis Section */}
			<div className="mt-m-600">
				<h2 className="mb-m-400 text-heading text-txt-100 font-semibold">
					{t("time.title")}
				</h2>

				{/* Two Column Grid for Heatmap and Session Chart */}
				<div className="gap-m-600 grid grid-cols-1 lg:grid-cols-2">
					{/* Time Heatmap */}
					<TimeHeatmap data={timeHeatmap} />

					{/* Session Performance Chart */}
					<SessionPerformanceChart data={sessionPerformance} />
				</div>

				{/* Session Asset Table - Full Width */}
				<div className="mt-m-600">
					<SessionAssetTable data={sessionAssetPerformance} />
				</div>

				{/* Two Column Grid for Charts */}
				<div className="mt-m-600 gap-m-600 grid grid-cols-1 lg:grid-cols-2">
					{/* Hourly Performance */}
					<HourlyPerformanceChart data={hourlyPerformance} />

					{/* Day of Week Performance */}
					<DayOfWeekChart data={dayOfWeekPerformance} />
				</div>
			</div>
		</div>
	)
}
