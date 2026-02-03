"use client"

import { useState, memo, useCallback } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import type { TradesByDay } from "@/types"
import { formatBrlWithSign } from "@/lib/formatting"
import { ColoredValue, WinRateBadge } from "@/components/shared"
import { TradeRow } from "./trade-row"

interface TradeDayGroupProps {
	dayData: TradesByDay
	onTradeClick?: (tradeId: string) => void
	defaultExpanded?: boolean
}

/**
 * Displays a collapsible group of trades for a single day.
 * Shows day summary (P&L, win rate) in the header and individual trades when expanded.
 *
 * Wrapped with React.memo to prevent unnecessary re-renders when parent updates
 * but day data hasn't changed.
 *
 * @param dayData - Trade data grouped by day including summary and individual trades
 * @param onTradeClick - Optional callback when a trade row is clicked
 * @param defaultExpanded - Whether the group should be expanded by default
 */
export const TradeDayGroup = memo(({
	dayData,
	onTradeClick,
	defaultExpanded = true,
}: TradeDayGroupProps) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded)
	const t = useTranslations("journal")

	const { summary, trades, dateFormatted } = dayData

	// Memoized handlers for stable references
	const handleToggle = useCallback(() => {
		setIsExpanded((prev) => !prev)
	}, [])

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			setIsExpanded((prev) => !prev)
		}
	}, [])

	return (
		<div className="border-bg-300 bg-bg-200 overflow-hidden rounded-lg border">
			{/* Header - Collapsible */}
			<div
				className="gap-s-300 border-bg-300 bg-bg-100 px-s-300 py-s-200 hover:bg-bg-200 flex cursor-pointer items-center border-b transition-colors"
				onClick={handleToggle}
				onKeyDown={handleKeyDown}
				tabIndex={0}
				role="button"
				aria-expanded={isExpanded}
				aria-label={`${dateFormatted}, ${summary.totalTrades} trades, ${formatBrlWithSign(summary.netPnl)}`}
			>
				{/* Expand/Collapse Icon */}
				{isExpanded ? (
					<ChevronDown className="text-txt-300 h-4 w-4 shrink-0" />
				) : (
					<ChevronRight className="text-txt-300 h-4 w-4 shrink-0" />
				)}

				{/* Date */}
				<span className="text-small text-txt-100 flex-1 font-medium">
					{dateFormatted}
				</span>

				{/* Summary Stats */}
				<div className="gap-s-400 flex items-center">
					{/* P&L */}
					<ColoredValue
						value={summary.netPnl}
						showSign
						size="sm"
						formatFn={(v) => formatBrlWithSign(v)}
						className="font-semibold"
					/>

					{/* Win/Loss */}
					<span className="text-caption text-txt-300 hidden sm:inline">
						{summary.wins}W {summary.losses}L
					</span>

					{/* Win Rate */}
					<WinRateBadge winRate={summary.winRate} size="sm" />
				</div>
			</div>

			{/* Trade Rows */}
			{isExpanded && (
				<div className="divide-bg-300 divide-y">
					{trades.length > 0 ? (
						trades.map((trade) => (
							<TradeRow
								key={trade.id}
								trade={trade}
								onTradeClick={onTradeClick}
							/>
						))
					) : (
						<div className="text-txt-300 flex h-[60px] items-center justify-center">
							{t("noTrades")}
						</div>
					)}
				</div>
			)}
		</div>
	)
})

TradeDayGroup.displayName = "TradeDayGroup"
