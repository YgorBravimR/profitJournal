"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import type { JournalPeriod, TradesByDay } from "@/types"
import { getTradesGroupedByDay } from "@/app/actions/trades"
import { formatBrlWithSign } from "@/lib/formatting"
import { LoadingSpinner, EmptyState, ColoredValue } from "@/components/shared"
import { PeriodFilter } from "./period-filter"
import { TradeDayGroup } from "./trade-day-group"

/**
 * Calculates the date range based on the selected period.
 *
 * @param period - The journal period type (day, week, month, custom)
 * @param customRange - Optional custom date range when period is "custom"
 * @returns Object containing from and to Date objects
 */
const getDateRange = (
	period: JournalPeriod,
	customRange?: { from: Date; to: Date }
): { from: Date; to: Date } => {
	const now = new Date()

	switch (period) {
		case "day": {
			const from = new Date(now)
			from.setHours(0, 0, 0, 0)
			const to = new Date(now)
			to.setHours(23, 59, 59, 999)
			return { from, to }
		}
		case "week": {
			// Get Monday of current week
			const from = new Date(now)
			const dayOfWeek = from.getDay()
			const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday = 1
			from.setDate(from.getDate() + diff)
			from.setHours(0, 0, 0, 0)
			// Get Sunday of current week
			const to = new Date(from)
			to.setDate(to.getDate() + 6)
			to.setHours(23, 59, 59, 999)
			return { from, to }
		}
		case "month": {
			const from = new Date(now.getFullYear(), now.getMonth(), 1)
			const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
			return { from, to }
		}
		case "custom": {
			if (customRange) {
				return customRange
			}
			// Default to last 30 days if no custom range
			const from = new Date(now)
			from.setDate(from.getDate() - 30)
			from.setHours(0, 0, 0, 0)
			const to = new Date(now)
			to.setHours(23, 59, 59, 999)
			return { from, to }
		}
		default:
			return { from: now, to: now }
	}
}

interface JournalContentProps {
	initialPeriod?: JournalPeriod
}

/**
 * Main content component for the trading journal page.
 * Handles period filtering, data fetching, and displays trades grouped by day.
 *
 * @param initialPeriod - The initial period to display (defaults to "week")
 */
export const JournalContent = ({ initialPeriod = "week" }: JournalContentProps) => {
	const router = useRouter()
	const t = useTranslations("journal")
	const [isPending, startTransition] = useTransition()

	const [period, setPeriod] = useState<JournalPeriod>(initialPeriod)
	const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date } | undefined>()
	const [tradesByDay, setTradesByDay] = useState<TradesByDay[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [totalTrades, setTotalTrades] = useState(0)

	// Fetch trades when period or custom range changes
	useEffect(() => {
		const fetchTrades = async () => {
			setIsLoading(true)
			const { from, to } = getDateRange(period, customDateRange)

			const result = await getTradesGroupedByDay(from, to)

			if (result.status === "success" && result.data) {
				setTradesByDay(result.data)
				// Calculate total trades
				const total = result.data.reduce((sum, day) => sum + day.trades.length, 0)
				setTotalTrades(total)
			} else {
				setTradesByDay([])
				setTotalTrades(0)
			}

			setIsLoading(false)
		}

		startTransition(() => {
			fetchTrades()
		})
	}, [period, customDateRange])

	// Memoized handlers to prevent unnecessary re-renders in child components
	const handlePeriodChange = useCallback((
		newPeriod: JournalPeriod,
		dateRange?: { from: Date; to: Date }
	) => {
		setPeriod(newPeriod)
		if (newPeriod === "custom" && dateRange) {
			setCustomDateRange(dateRange)
		}
	}, [])

	const handleTradeClick = useCallback((tradeId: string) => {
		router.push(`/journal/${tradeId}`)
	}, [router])

	// Calculate period summary
	const periodSummary = tradesByDay.reduce(
		(acc, day) => {
			acc.netPnl += day.summary.netPnl
			acc.wins += day.summary.wins
			acc.losses += day.summary.losses
			return acc
		},
		{ netPnl: 0, wins: 0, losses: 0 }
	)
	const periodWinRate =
		periodSummary.wins + periodSummary.losses > 0
			? (periodSummary.wins / (periodSummary.wins + periodSummary.losses)) * 100
			: 0

	return (
		<div className="flex flex-col gap-m-400">
			{/* Period Filter */}
			<div className="flex flex-wrap items-start justify-between gap-m-400">
				<PeriodFilter
					value={period}
					onChange={handlePeriodChange}
					customDateRange={customDateRange}
				/>

				{/* Period Summary */}
				{!isLoading && totalTrades > 0 && (
					<div className="flex items-center gap-m-400 text-small">
						<span className="text-txt-300">
							{totalTrades} {t("tradesCount")}
						</span>
						<ColoredValue
							value={periodSummary.netPnl}
							showSign
							formatFn={(v) => formatBrlWithSign(v)}
							className="font-medium"
						/>
						<span className="text-txt-300">
							{periodSummary.wins}W {periodSummary.losses}L ({periodWinRate.toFixed(0)}%)
						</span>
					</div>
				)}
			</div>

			{/* Loading State */}
			{isLoading && <LoadingSpinner size="md" className="h-50" />}

			{/* Empty State */}
			{!isLoading && tradesByDay.length === 0 && (
				<div className="rounded-lg border border-bg-300 bg-bg-200 p-l-700">
					<EmptyState
						icon={Search}
						title={t("noTradesInPeriod")}
						description={t("tryDifferentPeriod")}
					/>
				</div>
			)}

			{/* Trade Groups by Day */}
			{!isLoading && tradesByDay.length > 0 && (
				<div className="space-y-m-400">
					{tradesByDay.map((dayData) => (
						<TradeDayGroup
							key={dayData.date}
							dayData={dayData}
							onTradeClick={handleTradeClick}
						/>
					))}
				</div>
			)}
		</div>
	)
}
