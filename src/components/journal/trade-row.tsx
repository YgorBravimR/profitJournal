"use client"

import { ChevronRight } from "lucide-react"
import type { DayTradeCompact } from "@/types"
import { formatBrlWithSign } from "@/lib/formatting"
import { ColoredValue, DirectionBadge } from "@/components/shared"

interface TradeRowProps {
	trade: DayTradeCompact
	onTradeClick?: (tradeId: string) => void
}

/**
 * Displays a single trade row with asset, direction, time, P&L and R multiple.
 * Supports click interaction for navigation to trade details.
 *
 * @param trade - The compact trade data to display
 * @param onTradeClick - Optional callback when the trade row is clicked
 */
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
			<DirectionBadge
				direction={trade.direction}
				showIcon
				showLabel={false}
				size="sm"
				className="shrink-0 bg-transparent p-0"
			/>

			{/* Asset */}
			<span className="text-small text-txt-100 min-w-[70px] shrink-0 font-semibold">
				{trade.asset}
			</span>

			{/* Direction Badge */}
			<DirectionBadge
				direction={trade.direction}
				showIcon={false}
				showLabel
				size="sm"
				className="hidden shrink-0 sm:inline-flex"
			/>

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
			<ColoredValue
				value={trade.pnl}
				showSign
				size="sm"
				formatFn={(v) => formatBrlWithSign(v)}
				className="min-w-[90px] shrink-0 text-right"
			/>

			{/* R Multiple */}
			{trade.rMultiple !== null ? (
				<ColoredValue
					value={trade.rMultiple}
					type="r-multiple"
					showSign
					size="sm"
					className="min-w-[50px] shrink-0 text-right"
				/>
			) : (
				<span className="text-small min-w-[50px] shrink-0 text-right text-txt-300">
					-
				</span>
			)}

			{/* Chevron */}
			{onTradeClick && (
				<ChevronRight className="text-txt-300 h-4 w-4 shrink-0" />
			)}
		</div>
	)
}
