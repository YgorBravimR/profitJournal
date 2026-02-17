"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { useTranslations } from "next-intl"
import type { JournalPeriod } from "@/types"
import { Button } from "@/components/ui/button"
import { APP_TIMEZONE, formatDateKey } from "@/lib/dates"

interface PeriodFilterProps {
	value: JournalPeriod
	onChange: (
		period: JournalPeriod,
		dateRange?: { from: Date; to: Date }
	) => void
	customDateRange?: { from: Date; to: Date }
}

/**
 * Period filter component for selecting time ranges in the journal.
 * Supports predefined periods (day, week, month) and custom date ranges.
 *
 * @param value - Currently selected period
 * @param onChange - Callback when period or date range changes
 * @param customDateRange - Current custom date range if selected
 */
export const PeriodFilter = ({
	value,
	onChange,
	customDateRange,
}: PeriodFilterProps) => {
	const t = useTranslations("journal")
	const [showCustomPicker, setShowCustomPicker] = useState(false)
	const [tempFrom, setTempFrom] = useState<string>(
		customDateRange?.from ? formatDateKey(customDateRange.from) : ""
	)
	const [tempTo, setTempTo] = useState<string>(
		customDateRange?.to ? formatDateKey(customDateRange.to) : ""
	)

	const periods: { key: JournalPeriod; label: string }[] = [
		{ key: "day", label: t("period.day") },
		{ key: "week", label: t("period.week") },
		{ key: "month", label: t("period.month") },
		{ key: "all", label: t("period.all") },
		{ key: "custom", label: t("period.custom") },
	]

	const handlePeriodClick = (period: JournalPeriod) => {
		if (period === "custom") {
			setShowCustomPicker(true)
		} else {
			setShowCustomPicker(false)
			onChange(period)
		}
	}

	const handleCustomApply = () => {
		if (tempFrom && tempTo) {
			const from = new Date(tempFrom + "T00:00:00")
			const to = new Date(tempTo + "T23:59:59")
			onChange("custom", { from, to })
			setShowCustomPicker(false)
		}
	}

	const handleCustomCancel = () => {
		setShowCustomPicker(false)
		// Reset to previous value if not already custom
		if (value !== "custom") {
			setTempFrom("")
			setTempTo("")
		}
	}

	return (
		<div className="gap-s-200 flex flex-col">
			<div className="gap-s-100 flex items-center">
				{periods.map((period) => (
					<button
						key={period.key}
						type="button"
						onClick={() => handlePeriodClick(period.key)}
						className={`px-s-300 py-s-100 text-small rounded-md font-medium transition-colors ${
							value === period.key
								? "bg-acc-100 text-bg-100"
								: "bg-bg-300 text-txt-200 hover:bg-bg-400"
						}`}
						aria-pressed={value === period.key}
					>
						{period.key === "custom" && (
							<Calendar className="mr-s-100 inline h-3.5 w-3.5" />
						)}
						{period.label}
					</button>
				))}
			</div>

			{/* Custom Date Range Picker */}
			{showCustomPicker && (
				<div className="gap-s-200 border-bg-300 bg-bg-100 p-s-300 flex flex-wrap items-end rounded-lg border">
					<div className="gap-s-100 flex flex-col">
						<label htmlFor="date-from" className="text-caption text-txt-300">
							{t("period.from")}
						</label>
						<input
							id="date-from"
							type="date"
							value={tempFrom}
							onChange={(e) => setTempFrom(e.target.value)}
							className="border-bg-300 bg-bg-200 px-s-200 py-s-100 text-small text-txt-100 focus:border-acc-100 rounded-md border focus:outline-none"
						/>
					</div>
					<div className="gap-s-100 flex flex-col">
						<label htmlFor="date-to" className="text-caption text-txt-300">
							{t("period.to")}
						</label>
						<input
							id="date-to"
							type="date"
							value={tempTo}
							onChange={(e) => setTempTo(e.target.value)}
							className="border-bg-300 bg-bg-200 px-s-200 py-s-100 text-small text-txt-100 focus:border-acc-100 rounded-md border focus:outline-none"
						/>
					</div>
					<div className="gap-s-100 flex">
						<Button
							id="period-filter-cancel"
							variant="outline"
							size="sm"
							onClick={handleCustomCancel}
						>
							{t("period.cancel")}
						</Button>
						<Button
							id="period-filter-apply"
							size="sm"
							onClick={handleCustomApply}
							disabled={!tempFrom || !tempTo}
						>
							{t("period.apply")}
						</Button>
					</div>
				</div>
			)}

			{/* Show current custom range if selected */}
			{value === "custom" && customDateRange && !showCustomPicker ? (
				<button
					type="button"
					onClick={() => setShowCustomPicker(true)}
					className="gap-s-100 text-caption text-txt-300 hover:text-txt-200 flex items-center"
					aria-label={t("period.editCustomRange")}
				>
					<Calendar className="h-3 w-3" />
					{customDateRange.from.toLocaleDateString(undefined, {
						timeZone: APP_TIMEZONE,
					})}{" "}
					-{" "}
					{customDateRange.to.toLocaleDateString(undefined, {
						timeZone: APP_TIMEZONE,
					})}
				</button>
			) : null}
		</div>
	)
}
