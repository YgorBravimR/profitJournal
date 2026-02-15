"use client"

import { useState } from "react"
import { Calendar, Filter, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { FilterPill } from "@/components/shared"
import { useEffectiveDate } from "@/components/providers/effective-date-provider"
import { formatDateKey } from "@/lib/dates"

export interface FilterState {
	dateFrom: Date | null
	dateTo: Date | null
	assets: string[]
	directions: Array<"long" | "short">
	outcomes: Array<"win" | "loss" | "breakeven">
	timeframeIds: string[]
}

interface TimeframeOption {
	id: string
	name: string
}

interface FilterPanelProps {
	filters: FilterState
	onFiltersChange: (filters: FilterState) => void
	availableAssets: string[]
	availableTimeframes: TimeframeOption[]
}

interface DatePreset {
	key: string
	getDates: (now: Date) => { from: Date | null; to: Date | null }
}

const DATE_PRESET_CONFIGS: DatePreset[] = [
	{ key: "today", getDates: (now) => ({ from: new Date(now), to: new Date(now) }) },
	{
		key: "thisWeek",
		getDates: (now) => {
			const start = new Date(now)
			start.setDate(now.getDate() - now.getDay())
			return { from: start, to: new Date(now) }
		},
	},
	{
		key: "thisMonth",
		getDates: (now) => {
			const start = new Date(now.getFullYear(), now.getMonth(), 1)
			return { from: start, to: new Date(now) }
		},
	},
	{
		key: "last30Days",
		getDates: (now) => {
			const start = new Date(now)
			start.setDate(now.getDate() - 30)
			return { from: start, to: new Date(now) }
		},
	},
	{
		key: "last90Days",
		getDates: (now) => {
			const start = new Date(now)
			start.setDate(now.getDate() - 90)
			return { from: start, to: new Date(now) }
		},
	},
	{
		key: "thisYear",
		getDates: (now) => {
			const start = new Date(now.getFullYear(), 0, 1)
			return { from: start, to: new Date(now) }
		},
	},
	{ key: "allTime", getDates: () => ({ from: null, to: null }) },
]

const formatDateForInput = (date: Date | null): string => {
	if (!date) return ""
	return formatDateKey(date)
}

export const FilterPanel = ({
	filters,
	onFiltersChange,
	availableAssets,
	availableTimeframes,
}: FilterPanelProps) => {
	const t = useTranslations("analytics.filters")
	const tTrade = useTranslations("trade")
	const tCommon = useTranslations("common")
	const effectiveDate = useEffectiveDate()
	const [isExpanded, setIsExpanded] = useState(false)

	const directions = [
		{ value: "long" as const, label: tTrade("direction.long") },
		{ value: "short" as const, label: tTrade("direction.short") },
	]

	const outcomes = [
		{ value: "win" as const, label: tTrade("outcome.win") },
		{ value: "loss" as const, label: tTrade("outcome.loss") },
		{ value: "breakeven" as const, label: tTrade("outcome.breakeven") },
	]

	const datePresets = DATE_PRESET_CONFIGS.map((preset) => ({
		...preset,
		label: t(`datePresets.${preset.key}`),
	}))

	const handleDatePreset = (preset: DatePreset) => {
		const { from, to } = preset.getDates(effectiveDate)
		onFiltersChange({
			...filters,
			dateFrom: from,
			dateTo: to,
		})
	}

	const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const date = e.target.value ? new Date(e.target.value) : null
		onFiltersChange({ ...filters, dateFrom: date })
	}

	const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const date = e.target.value ? new Date(e.target.value) : null
		onFiltersChange({ ...filters, dateTo: date })
	}

	const toggleArrayFilter = <T extends string>(
		array: T[],
		value: T,
		key: keyof FilterState
	) => {
		const newArray = array.includes(value)
			? array.filter((v) => v !== value)
			: [...array, value]
		onFiltersChange({ ...filters, [key]: newArray })
	}

	const clearFilters = () => {
		onFiltersChange({
			dateFrom: null,
			dateTo: null,
			assets: [],
			directions: [],
			outcomes: [],
			timeframeIds: [],
		})
	}

	const hasActiveFilters =
		filters.dateFrom ||
		filters.dateTo ||
		filters.assets.length > 0 ||
		filters.directions.length > 0 ||
		filters.outcomes.length > 0 ||
		filters.timeframeIds.length > 0

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-s-300">
					<Filter className="h-4 w-4 text-txt-300" />
					<h3 className="text-small font-semibold text-txt-100">{t("title")}</h3>
					{hasActiveFilters && (
						<span className="rounded-full bg-acc-100 px-s-200 py-s-100 text-tiny font-medium text-bg-100">
							{t("active")}
						</span>
					)}
				</div>
				<div className="flex items-center gap-s-200">
					{hasActiveFilters && (
						<Button id="analytics-filter-clear" variant="ghost" size="sm" onClick={clearFilters}>
							<X className="mr-1 h-3 w-3" />
							{t("clear")}
						</Button>
					)}
					<Button
					id="analytics-filter-toggle"
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? t("collapse") : t("expand")}
					</Button>
				</div>
			</div>

			{/* Date Presets (always visible) */}
			<div className="mt-m-400 flex flex-wrap gap-s-200">
				{datePresets.map((preset) => (
					<FilterPill
						key={preset.key}
						label={preset.label}
						isActive={false}
						onClick={() => handleDatePreset(preset)}
					/>
				))}
			</div>

			{/* Expanded Filters */}
			{isExpanded && (
				<div className="mt-m-500 space-y-m-500">
					{/* Custom Date Range */}
					<div>
						<label className="mb-s-200 block text-tiny font-medium text-txt-300">
							{t("customDateRange")}
						</label>
						<div className="flex items-center gap-s-300">
							<div className="flex items-center gap-s-200">
								<Calendar className="h-4 w-4 text-txt-300" />
								<input
									type="date"
									value={formatDateForInput(filters.dateFrom)}
									onChange={handleDateFromChange}
									className="rounded-md border border-bg-300 bg-bg-100 px-s-300 py-s-200 text-small text-txt-100"
								/>
							</div>
							<span className="text-txt-300">{tCommon("to")}</span>
							<input
								type="date"
								value={formatDateForInput(filters.dateTo)}
								onChange={handleDateToChange}
								className="rounded-md border border-bg-300 bg-bg-100 px-s-300 py-s-200 text-small text-txt-100"
							/>
						</div>
					</div>

					{/* Assets */}
					{availableAssets.length > 0 && (
						<div>
							<label className="mb-s-200 block text-tiny font-medium text-txt-300">
								{t("assets")}
							</label>
							<div className="flex flex-wrap gap-s-200">
								{availableAssets.map((asset) => (
									<FilterPill
										key={asset}
										label={asset}
										isActive={filters.assets.includes(asset)}
										onClick={() =>
											toggleArrayFilter(filters.assets, asset, "assets")
										}
									/>
								))}
							</div>
						</div>
					)}

					{/* Direction */}
					<div>
						<label className="mb-s-200 block text-tiny font-medium text-txt-300">
							{t("direction")}
						</label>
						<div className="flex gap-s-200">
							{directions.map(({ value, label }) => (
								<FilterPill
									key={value}
									label={label}
									isActive={filters.directions.includes(value)}
									onClick={() =>
										toggleArrayFilter(filters.directions, value, "directions")
									}
									variant={value === "long" ? "positive" : "negative"}
								/>
							))}
						</div>
					</div>

					{/* Outcome */}
					<div>
						<label className="mb-s-200 block text-tiny font-medium text-txt-300">
							{t("outcome")}
						</label>
						<div className="flex gap-s-200">
							{outcomes.map(({ value, label }) => (
								<FilterPill
									key={value}
									label={label}
									isActive={filters.outcomes.includes(value)}
									onClick={() =>
										toggleArrayFilter(filters.outcomes, value, "outcomes")
									}
									variant={
										value === "win"
											? "positive"
											: value === "loss"
												? "negative"
												: "accent"
									}
								/>
							))}
						</div>
					</div>

					{/* Timeframes */}
					{availableTimeframes.length > 0 && (
						<div>
							<label className="mb-s-200 block text-tiny font-medium text-txt-300">
								{t("timeframes")}
							</label>
							<div className="flex flex-wrap gap-s-200">
								{availableTimeframes.map((tf) => (
									<FilterPill
										key={tf.id}
										label={tf.name}
										isActive={filters.timeframeIds.includes(tf.id)}
										onClick={() =>
											toggleArrayFilter(filters.timeframeIds, tf.id, "timeframeIds")
										}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
