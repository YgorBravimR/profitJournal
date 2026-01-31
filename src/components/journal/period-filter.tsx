"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { useTranslations } from "next-intl"
import type { JournalPeriod } from "@/types"
import { Button } from "@/components/ui/button"

interface PeriodFilterProps {
	value: JournalPeriod
	onChange: (period: JournalPeriod, dateRange?: { from: Date; to: Date }) => void
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
		customDateRange?.from.toISOString().split("T")[0] || ""
	)
	const [tempTo, setTempTo] = useState<string>(
		customDateRange?.to.toISOString().split("T")[0] || ""
	)

	const periods: { key: JournalPeriod; label: string }[] = [
		{ key: "day", label: t("period.day") },
		{ key: "week", label: t("period.week") },
		{ key: "month", label: t("period.month") },
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
		<div className="flex flex-col gap-s-200">
			<div className="flex items-center gap-s-100">
				{periods.map((period) => (
					<button
						key={period.key}
						type="button"
						onClick={() => handlePeriodClick(period.key)}
						className={`rounded-md px-s-300 py-s-100 text-small font-medium transition-colors ${
							value === period.key
								? "bg-acc-100 text-bg-100"
								: "bg-bg-300 text-txt-200 hover:bg-bg-400"
						}`}
						aria-pressed={value === period.key}
					>
						{period.key === "custom" && <Calendar className="mr-s-100 inline h-3.5 w-3.5" />}
						{period.label}
					</button>
				))}
			</div>

			{/* Custom Date Range Picker */}
			{showCustomPicker && (
				<div className="flex flex-wrap items-end gap-s-200 rounded-lg border border-bg-300 bg-bg-100 p-s-300">
					<div className="flex flex-col gap-s-100">
						<label htmlFor="date-from" className="text-caption text-txt-300">
							{t("period.from")}
						</label>
						<input
							id="date-from"
							type="date"
							value={tempFrom}
							onChange={(e) => setTempFrom(e.target.value)}
							className="rounded-md border border-bg-300 bg-bg-200 px-s-200 py-s-100 text-small text-txt-100 focus:border-acc-100 focus:outline-none"
						/>
					</div>
					<div className="flex flex-col gap-s-100">
						<label htmlFor="date-to" className="text-caption text-txt-300">
							{t("period.to")}
						</label>
						<input
							id="date-to"
							type="date"
							value={tempTo}
							onChange={(e) => setTempTo(e.target.value)}
							className="rounded-md border border-bg-300 bg-bg-200 px-s-200 py-s-100 text-small text-txt-100 focus:border-acc-100 focus:outline-none"
						/>
					</div>
					<div className="flex gap-s-100">
						<Button
							variant="outline"
							size="sm"
							onClick={handleCustomCancel}
						>
							{t("period.cancel")}
						</Button>
						<Button
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
					className="flex items-center gap-s-100 text-caption text-txt-300 hover:text-txt-200"
					aria-label={t("period.editCustomRange")}
				>
					<Calendar className="h-3 w-3" />
					{customDateRange.from.toLocaleDateString()} - {customDateRange.to.toLocaleDateString()}
				</button>
			) : null}
		</div>
	)
}
