"use client"

import { useState, useEffect, useTransition } from "react"
import { KpiCards } from "./kpi-cards"
import { TradingCalendar } from "./trading-calendar"
import { EquityCurve } from "./equity-curve"
import { QuickStats } from "./quick-stats"
import { DailyPnLBarChart } from "./daily-pnl-bar-chart"
import { PerformanceRadarChart } from "./performance-radar-chart"
import { DayDetailModal } from "./day-detail-modal"
import { getDailyPnL } from "@/app/actions/analytics"
import type { OverallStats, DisciplineData, EquityPoint, StreakData, DailyPnL, RadarChartData } from "@/types"

interface DashboardContentProps {
	initialStats: OverallStats | null
	initialDiscipline: DisciplineData | null
	initialEquityCurve: EquityPoint[]
	initialStreakData: StreakData | null
	initialDailyPnL: DailyPnL[]
	initialRadarData: RadarChartData[]
	initialYear: number
	initialMonthIndex: number
}

export const DashboardContent = ({
	initialStats,
	initialDiscipline,
	initialEquityCurve,
	initialStreakData,
	initialDailyPnL,
	initialRadarData,
	initialYear,
	initialMonthIndex,
}: DashboardContentProps) => {
	// Create Date on client side to avoid hydration issues
	const [currentMonth, setCurrentMonth] = useState(() => new Date(initialYear, initialMonthIndex, 1))
	const [dailyPnL, setDailyPnL] = useState<DailyPnL[]>(initialDailyPnL)
	const [stats, setStats] = useState<OverallStats | null>(initialStats)
	const [discipline, setDiscipline] = useState<DisciplineData | null>(initialDiscipline)
	const [equityCurve, setEquityCurve] = useState<EquityPoint[]>(initialEquityCurve)
	const [streakData, setStreakData] = useState<StreakData | null>(initialStreakData)
	const [radarData, setRadarData] = useState<RadarChartData[]>(initialRadarData)
	const [isPending, startTransition] = useTransition()

	// Day detail modal state
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [isDayModalOpen, setIsDayModalOpen] = useState(false)

	// Reset all state when initial props change (e.g., account switch)
	useEffect(() => {
		setDailyPnL(initialDailyPnL)
		setStats(initialStats)
		setDiscipline(initialDiscipline)
		setEquityCurve(initialEquityCurve)
		setStreakData(initialStreakData)
		setRadarData(initialRadarData)
	}, [
		initialDailyPnL,
		initialStats,
		initialDiscipline,
		initialEquityCurve,
		initialStreakData,
		initialRadarData,
	])

	const handleDayClick = (date: string) => {
		setSelectedDate(date)
		setIsDayModalOpen(true)
	}

	const handleDayModalChange = (open: boolean) => {
		setIsDayModalOpen(open)
		if (!open) {
			setSelectedDate(null)
		}
	}

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
				<KpiCards stats={stats} discipline={discipline} />
			</div>

			{/* Calendar */}
			<div className="lg:col-span-2">
				<TradingCalendar
					data={dailyPnL}
					month={currentMonth}
					onMonthChange={handleMonthChange}
					onDayClick={handleDayClick}
				/>
			</div>

			{/* Quick Stats */}
			<div>
				<QuickStats streakData={streakData} stats={stats} />
			</div>

			{/* Daily P&L Bar Chart */}
			<div className="lg:col-span-2">
				<DailyPnLBarChart data={dailyPnL} onDayClick={handleDayClick} />
			</div>

			{/* Performance Radar */}
			<div>
				<PerformanceRadarChart data={radarData} />
			</div>

			{/* Equity Curve */}
			<div className="lg:col-span-3">
				<EquityCurve data={equityCurve} />
			</div>

			{/* Day Detail Modal */}
			<DayDetailModal
				date={selectedDate}
				open={isDayModalOpen}
				onOpenChange={handleDayModalChange}
			/>
		</div>
	)
}
