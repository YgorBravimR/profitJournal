"use client"

import { useState, useMemo } from "react"
import { useTranslations, useLocale } from "next-intl"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
	isB3Holiday,
	isNyseHoliday,
	getB3HolidayName,
	getNyseHolidayName,
} from "@/lib/market/holidays"

const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
const WEEKDAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

/** Format as YYYY-MM-DD for holiday lookups */
const toDateStr = (year: number, month: number, day: number): string =>
	`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

/** Convert JS day (0=Sun) to Monday-based (0=Mon, 6=Sun) — standard in Brazil */
const getMondayBasedDay = (date: Date): number => {
	const jsDay = date.getDay()
	return jsDay === 0 ? 6 : jsDay - 1
}

interface DayInfo {
	day: number
	dateStr: string
	isWeekend: boolean
	isToday: boolean
	isB3Closed: boolean
	isNyseClosed: boolean
	b3HolidayName: string | null
	nyseHolidayName: string | null
}

export const B3TradingCalendar = () => {
	const t = useTranslations("market.tradingCalendar")
	const locale = useLocale()

	const [monthOffset, setMonthOffset] = useState(0)

	const today = new Date()
	const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

	const { year, month, firstDayOffset, days } = useMemo(() => {
		const target = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
		const yr = target.getFullYear()
		const mo = target.getMonth()
		const daysInMonth = new Date(yr, mo + 1, 0).getDate()
		const fdo = getMondayBasedDay(target)

		const dayInfos: DayInfo[] = []
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = toDateStr(yr, mo, d)
			const dayOfWeek = getMondayBasedDay(new Date(yr, mo, d))
			const isWeekend = dayOfWeek >= 5

			dayInfos.push({
				day: d,
				dateStr,
				isWeekend,
				isToday: dateStr === todayStr,
				isB3Closed: isWeekend || isB3Holiday(dateStr),
				isNyseClosed: isWeekend || isNyseHoliday(dateStr),
				b3HolidayName: getB3HolidayName(dateStr, locale),
				nyseHolidayName: getNyseHolidayName(dateStr, locale),
			})
		}

		return { year: yr, month: mo, firstDayOffset: fdo, days: dayInfos }
	}, [monthOffset, todayStr, locale])

	const weekdays = locale === "pt-BR" ? WEEKDAYS_PT : WEEKDAYS_EN

	const monthName = new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : "en-US", {
		month: "long",
	}).format(new Date(year, month, 1))

	const handlePrevMonth = () => setMonthOffset((prev) => prev - 1)
	const handleNextMonth = () => setMonthOffset((prev) => prev + 1)

	return (
		<div className="flex flex-col gap-3 p-4">
			{/* Month navigation */}
			<div className="flex items-center justify-between">
				<button
					type="button"
					onClick={handlePrevMonth}
					className="text-txt-300 hover:text-txt-100 rounded p-0.5 transition-colors"
					aria-label={t("prevMonth")}
					tabIndex={0}
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
				<span className="text-small text-txt-100 font-medium capitalize">
					{monthName} {year}
				</span>
				<button
					type="button"
					onClick={handleNextMonth}
					className="text-txt-300 hover:text-txt-100 rounded p-0.5 transition-colors"
					aria-label={t("nextMonth")}
					tabIndex={0}
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			{/* Day-of-week headers */}
			<div className="grid grid-cols-7 gap-0.5 text-center">
				{weekdays.map((wd) => (
					<span key={wd} className="text-tiny text-txt-300 py-1 font-medium">
						{wd}
					</span>
				))}
			</div>

			{/* Day grid */}
			<div className="grid grid-cols-7 gap-0.5" role="grid" aria-label={`${monthName} ${year}`}>
				{/* Empty cells for first-week offset */}
				{Array.from({ length: firstDayOffset }).map((_, i) => (
					<div key={`empty-${i}`} className="aspect-square" />
				))}

				{/* Day cells */}
				{days.map((day) => {
					const b3ClosedNotWeekend = !day.isWeekend && day.isB3Closed
					const nyseClosedB3Open = !day.isWeekend && !day.isB3Closed && day.isNyseClosed

					const tooltipParts = [
						day.b3HolidayName ? `🇧🇷 ${day.b3HolidayName}` : null,
						day.nyseHolidayName ? `🇺🇸 ${day.nyseHolidayName}` : null,
					].filter(Boolean)

					const tooltip = tooltipParts.join("\n")

					return (
						<div
							key={day.day}
							className={cn(
								"flex aspect-square items-center justify-center rounded-sm text-center transition-colors",
								"text-tiny",
								// Default: weekend
								day.isWeekend && "text-txt-300/30",
								// Default: regular trading day
								!day.isWeekend && !day.isB3Closed && "text-txt-100",
								// B3 holiday (not weekend) — red tint
								b3ClosedNotWeekend && "bg-fb-error/15 text-fb-error",
								// NYSE closed but B3 open — warning ring
								nyseClosedB3Open && "ring-warning/60 ring-1 ring-inset",
								// Today — always highlighted with accent
								day.isToday && "bg-acc-100/20 font-bold text-acc-100"
							)}
							title={tooltip || undefined}
							aria-label={`${day.day}${tooltip ? ` — ${tooltip}` : ""}`}
						>
							{day.day}
						</div>
					)
				})}
			</div>

			{/* Legend */}
			<div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
				<span className="text-tiny flex items-center gap-1.5">
					<span className="bg-acc-100/20 h-2.5 w-2.5 rounded-sm" aria-hidden="true" />
					<span className="text-txt-300">{t("today")}</span>
				</span>
				<span className="text-tiny flex items-center gap-1.5">
					<span className="bg-fb-error/15 h-2.5 w-2.5 rounded-sm" aria-hidden="true" />
					<span className="text-txt-300">{t("b3Closed")}</span>
				</span>
				<span className="text-tiny flex items-center gap-1.5">
					<span
						className="ring-warning/60 h-2.5 w-2.5 rounded-sm ring-1 ring-inset"
						aria-hidden="true"
					/>
					<span className="text-txt-300">{t("usClosed")}</span>
				</span>
			</div>
		</div>
	)
}
