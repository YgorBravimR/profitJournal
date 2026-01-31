"use client"

import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react"
import type { DayTradeCompact } from "@/types"
import { formatBrlWithSign } from "@/lib/formatting"

interface TradeRowProps {
	trade: DayTradeCompact
	onTradeClick?: (tradeId: string) => void
}

export const TradeRow = ({ trade, onTradeClick }: TradeRowProps) => {
	const handleClick = () => {
		onTradeClick?.(trade.id)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			onTradeClick?.(trade.id)
		}
	}

	return (
		<div
			className={`gap-s-200 px-s-300 py-s-200 flex items-center ${
				onTradeClick ? "hover:bg-bg-100 cursor-pointer transition-colors" : ""
			}`}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			tabIndex={onTradeClick ? 0 : undefined}
			role={onTradeClick ? "button" : undefined}
			aria-label={`Trade ${trade.asset} ${trade.direction} at ${trade.time}`}
		>
			{/* Direction Icon */}
			{trade.direction === "long" ? (
				<ArrowUpRight className="text-trade-buy h-4 w-4 shrink-0" />
			) : (
				<ArrowDownRight className="text-trade-sell h-4 w-4 shrink-0" />
			)}

			{/* Asset */}
			<span className="text-small text-txt-100 min-w-[70px] shrink-0 font-semibold">
				{trade.asset}
			</span>

			{/* Direction Badge */}
			<span
				className={`px-s-100 text-caption hidden shrink-0 rounded py-px font-medium uppercase sm:inline ${
					trade.direction === "long"
						? "bg-trade-buy/10 text-trade-buy"
						: "bg-trade-sell/10 text-trade-sell"
				}`}
			>
				{trade.direction}
			</span>

			{/* Timeframe */}
			{trade.timeframeName && (
				<span className="bg-bg-300 px-s-100 text-caption text-txt-300 hidden shrink-0 rounded py-px md:inline">
					{trade.timeframeName}
				</span>
			)}

			{/* Time */}
			<span className="text-small text-txt-300 shrink-0">{trade.time}</span>

			{/* Strategy (truncated) */}
			{trade.strategyName && (
				<span className="text-small text-txt-300 hidden max-w-[120px] shrink-0 truncate lg:inline">
					{trade.strategyName}
				</span>
			)}

			{/* Spacer */}
			<div className="flex-1" />

			{/* P&L */}
			<span
				className={`text-small min-w-[90px] shrink-0 text-right font-medium ${
					trade.pnl >= 0 ? "text-trade-buy" : "text-trade-sell"
				}`}
			>
				{formatBrlWithSign(trade.pnl)}
			</span>

			{/* R Multiple */}
			<span
				className={`text-small min-w-[50px] shrink-0 text-right ${
					trade.rMultiple !== null && trade.rMultiple >= 0
						? "text-trade-buy"
						: trade.rMultiple !== null
							? "text-trade-sell"
							: "text-txt-300"
				}`}
			>
				{trade.rMultiple !== null
					? `${trade.rMultiple >= 0 ? "+" : ""}${trade.rMultiple.toFixed(1)}R`
					: "-"}
			</span>

			{/* Chevron */}
			{onTradeClick && (
				<ChevronRight className="text-txt-300 h-4 w-4 shrink-0" />
			)}
		</div>
	)
}
