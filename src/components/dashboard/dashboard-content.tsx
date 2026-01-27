"use client"

import { useState, useEffect, useTransition } from "react"
import { KpiCards } from "./kpi-cards"
import { TradingCalendar } from "./trading-calendar"
import { EquityCurve } from "./equity-curve"
import { QuickStats } from "./quick-stats"
import { getDailyPnL } from "@/app/actions/analytics"
import type { OverallStats, DisciplineData, EquityPoint, StreakData, DailyPnL } from "@/types"

interface DashboardContentProps {
	initialStats: OverallStats | null
	initialDiscipline: DisciplineData | null
	initialEquityCurve: EquityPoint[]
	initialStreakData: StreakData | null
	initialDailyPnL: DailyPnL[]
	initialYear: number
	initialMonthIndex: number
}

export const DashboardContent = ({
	initialStats,
	initialDiscipline,
	initialEquityCurve,
	initialStreakData,
	initialDailyPnL,
	initialYear,
	initialMonthIndex,
}: DashboardContentProps) => {
	// Create Date on client side to avoid hydration issues
	const [currentMonth, setCurrentMonth] = useState(() => new Date(initialYear, initialMonthIndex, 1))
	const [dailyPnL, setDailyPnL] = useState<DailyPnL[]>(initialDailyPnL)
	const [isPending, startTransition] = useTransition()

	const handleMonthChange = (newMonth: Date) => {
		setCurrentMonth(newMonth)
		startTransition(async () => {
			const result = await getDailyPnL(newMonth)
			if (result.status === "success" && result.data) {
				setDailyPnL(result.data)
			}
		})
	}

	return (
		<div className="grid grid-cols-1 gap-m-600 lg:grid-cols-3">
			{/* KPI Cards */}
			<div className="lg:col-span-3">
				<KpiCards stats={initialStats} discipline={initialDiscipline} />
			</div>

			{/* Calendar */}
			<div className="lg:col-span-2">
				<TradingCalendar
					data={dailyPnL}
					month={currentMonth}
					onMonthChange={handleMonthChange}
				/>
			</div>

			{/* Quick Stats */}
			<div>
				<QuickStats streakData={initialStreakData} stats={initialStats} />
			</div>

			{/* Equity Curve */}
			<div className="lg:col-span-3">
				<EquityCurve data={initialEquityCurve} />
			</div>
		</div>
	)
}
