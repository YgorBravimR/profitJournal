"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search, Loader2 } from "lucide-react"
import type { JournalPeriod, TradesByDay } from "@/types"
import { getTradesGroupedByDay } from "@/app/actions/trades"
import { PeriodFilter } from "./period-filter"
import { TradeDayGroup } from "./trade-day-group"

/**
 * Get date range based on period selection
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

	const handlePeriodChange = (
		newPeriod: JournalPeriod,
		dateRange?: { from: Date; to: Date }
	) => {
		setPeriod(newPeriod)
		if (newPeriod === "custom" && dateRange) {
			setCustomDateRange(dateRange)
		}
	}

	const handleTradeClick = (tradeId: string) => {
		router.push(`/journal/${tradeId}`)
	}

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
						<span
							className={`font-medium ${
								periodSummary.netPnl >= 0 ? "text-trade-buy" : "text-trade-sell"
							}`}
						>
							{periodSummary.netPnl >= 0 ? "+" : ""}R$ {periodSummary.netPnl.toLocaleString("pt-BR", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</span>
						<span className="text-txt-300">
							{periodSummary.wins}W {periodSummary.losses}L ({periodWinRate.toFixed(0)}%)
						</span>
					</div>
				)}
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="flex h-[200px] items-center justify-center">
					<Loader2 className="h-6 w-6 animate-spin text-txt-300" />
				</div>
			)}

			{/* Empty State */}
			{!isLoading && tradesByDay.length === 0 && (
				<div className="rounded-lg border border-bg-300 bg-bg-200 p-l-700">
					<div className="flex flex-col items-center justify-center text-center">
						<div className="mb-m-400 flex h-16 w-16 items-center justify-center rounded-full bg-bg-300">
							<Search className="h-8 w-8 text-txt-300" />
						</div>
						<p className="text-body text-txt-200">{t("noTradesInPeriod")}</p>
						<p className="mt-s-200 text-small text-txt-300">
							{t("tryDifferentPeriod")}
						</p>
					</div>
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
