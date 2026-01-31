"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import type { TradesByDay } from "@/types"
import { formatBrlWithSign } from "@/lib/formatting"
import { TradeRow } from "./trade-row"

interface TradeDayGroupProps {
	dayData: TradesByDay
	onTradeClick?: (tradeId: string) => void
	defaultExpanded?: boolean
}

export const TradeDayGroup = ({
	dayData,
	onTradeClick,
	defaultExpanded = true,
}: TradeDayGroupProps) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded)
	const t = useTranslations("journal")

	const { summary, trades, dateFormatted } = dayData

	const handleToggle = () => {
		setIsExpanded((prev) => !prev)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			handleToggle()
		}
	}

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
					<span
						className={`text-small font-semibold ${
							summary.netPnl >= 0 ? "text-trade-buy" : "text-trade-sell"
						}`}
					>
						{formatBrlWithSign(summary.netPnl)}
					</span>

					{/* Win/Loss */}
					<span className="text-caption text-txt-300 hidden sm:inline">
						{summary.wins}W {summary.losses}L
					</span>

					{/* Win Rate */}
					<span
						className={`text-caption ${
							summary.winRate >= 50 ? "text-trade-buy" : "text-trade-sell"
						}`}
					>
						{summary.winRate.toFixed(0)}%
					</span>
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
}
