"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DailyPnL } from "@/types"

interface TradingCalendarProps {
	data: DailyPnL[]
	month: Date
	onMonthChange: (month: Date) => void
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const formatCurrency = (value: number): string => {
	const absValue = Math.abs(value)
	if (absValue >= 1000) {
		return `${value >= 0 ? "+" : "-"}$${(absValue / 1000).toFixed(1)}K`
	}
	return `${value >= 0 ? "+" : "-"}$${absValue.toFixed(0)}`
}

const formatDateKey = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	return `${year}-${month}-${day}`
}

export const TradingCalendar = ({ data, month, onMonthChange }: TradingCalendarProps) => {
	const year = month.getFullYear()
	const monthIndex = month.getMonth()

	const dailyPnLMap = useMemo(() => {
		const map = new Map<string, DailyPnL>()
		for (const day of data) {
			map.set(day.date, day)
		}
		return map
	}, [data])

	const calendarDays = useMemo(() => {
		const firstDayOfMonth = new Date(year, monthIndex, 1)
		const lastDayOfMonth = new Date(year, monthIndex + 1, 0)
		const startingDayOfWeek = firstDayOfMonth.getDay()
		const daysInMonth = lastDayOfMonth.getDate()

		const days: Array<{ date: Date; isCurrentMonth: boolean } | null> = []

		// Add empty slots for days before the first of the month
		for (let i = 0; i < startingDayOfWeek; i++) {
			days.push(null)
		}

		// Add days of the current month
		for (let day = 1; day <= daysInMonth; day++) {
			days.push({
				date: new Date(year, monthIndex, day),
				isCurrentMonth: true,
			})
		}

		return days
	}, [year, monthIndex])

	const handlePreviousMonth = () => {
		onMonthChange(new Date(year, monthIndex - 1, 1))
	}

	const handleNextMonth = () => {
		onMonthChange(new Date(year, monthIndex + 1, 1))
	}

	const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" })

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			<div className="flex items-center justify-between">
				<h2 className="text-body font-semibold text-txt-100">Trading Calendar</h2>
				<div className="flex items-center gap-s-200">
					<Button
						variant="ghost"
						size="icon"
						onClick={handlePreviousMonth}
						aria-label="Previous month"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="min-w-[140px] text-center text-small font-medium text-txt-100">
						{monthName}
					</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleNextMonth}
						aria-label="Next month"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="mt-m-400">
				{/* Days of week header */}
				<div className="grid grid-cols-7 gap-s-100">
					{DAYS_OF_WEEK.map((day) => (
						<div
							key={day}
							className="py-s-200 text-center text-tiny font-medium text-txt-300"
						>
							{day}
						</div>
					))}
				</div>

				{/* Calendar grid */}
				<div className="grid grid-cols-7 gap-s-100">
					{calendarDays.map((dayData, index) => {
						if (!dayData) {
							return <div key={`empty-${index}`} className="aspect-square" />
						}

						const dateKey = formatDateKey(dayData.date)
						const dailyData = dailyPnLMap.get(dateKey)
						const isToday =
							dayData.date.toDateString() === new Date().toDateString()

						const bgClass = dailyData
							? dailyData.pnl > 0
								? "bg-trade-buy-muted"
								: dailyData.pnl < 0
									? "bg-trade-sell-muted"
									: "bg-bg-300"
							: "bg-bg-100"

						const textClass = dailyData
							? dailyData.pnl > 0
								? "text-trade-buy"
								: dailyData.pnl < 0
									? "text-trade-sell"
									: "text-txt-300"
							: "text-txt-300"

						return (
							<div
								key={dateKey}
								className={`aspect-square rounded-md p-s-100 ${bgClass} ${isToday ? "ring-2 ring-acc-100" : ""}`}
							>
								<div className="flex h-full flex-col">
									<span className="text-tiny text-txt-200">
										{dayData.date.getDate()}
									</span>
									{dailyData && (
										<div className="mt-auto">
											<span className={`text-tiny font-medium ${textClass}`}>
												{formatCurrency(dailyData.pnl)}
											</span>
											<span className="block text-tiny text-txt-300">
												{dailyData.tradeCount}t
											</span>
										</div>
									)}
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
