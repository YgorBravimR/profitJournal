"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { TimeHeatmapCell } from "@/types"
import { formatBrlCompactWithSign } from "@/lib/formatting"

interface TimeHeatmapProps {
	data: TimeHeatmapCell[]
}

/** B3 Trading hours (9:00 - 18:00) */
const TRADING_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

/**
 * Displays a heatmap of trading performance by day of week and hour.
 * Cells are colored based on P&L and win rate, with tooltips showing details.
 *
 * @param data - Array of heatmap cells with performance data per time slot
 */
export const TimeHeatmap = ({ data }: TimeHeatmapProps) => {
	const t = useTranslations("analytics")
	const [hoveredCell, setHoveredCell] = useState<TimeHeatmapCell | null>(null)
	const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

	// Use fixed trading hours instead of dynamic
	const hours = TRADING_HOURS
	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
	const dayShorts = ["Mon", "Tue", "Wed", "Thu", "Fri"]

	// Create lookup map
	const cellMap = new Map<string, TimeHeatmapCell>()
	for (const cell of data) {
		cellMap.set(`${cell.dayOfWeek}-${cell.hour}`, cell)
	}

	// Calculate color intensity based on P&L
	const getColorClass = (cell: TimeHeatmapCell | undefined): string => {
		if (!cell || cell.totalTrades === 0) {
			return "bg-bg-300/50"
		}
		if (cell.totalPnl > 0) {
			if (cell.winRate >= 70) return "bg-trade-buy"
			if (cell.winRate >= 60) return "bg-trade-buy/80"
			if (cell.winRate >= 50) return "bg-trade-buy/60"
			return "bg-trade-buy/40"
		}
		if (cell.winRate <= 30) return "bg-trade-sell"
		if (cell.winRate <= 40) return "bg-trade-sell/80"
		if (cell.winRate <= 50) return "bg-trade-sell/60"
		return "bg-trade-sell/40"
	}

	// Find best and worst slots
	const cellsWithTrades = data.filter((c) => c.totalTrades > 0)
	const sortedByPnl = [...cellsWithTrades].sort(
		(a, b) => b.totalPnl - a.totalPnl
	)
	const bestSlot = sortedByPnl[0]
	const worstSlot = sortedByPnl[sortedByPnl.length - 1]

	const handleCellInteraction = (
		cell: TimeHeatmapCell | undefined,
		e: React.MouseEvent | React.FocusEvent
	) => {
		if (cell && cell.totalTrades > 0) {
			setHoveredCell(cell)
			const rect = (e.target as HTMLElement).getBoundingClientRect()
			setHoverPosition({
				x: rect.left + rect.width / 2,
				y: rect.top - 8,
			})
		}
	}

	const handleCellLeave = () => {
		setHoveredCell(null)
	}

	if (data.length === 0) {
		return (
			<div className="border-bg-300 bg-bg-200 p-m-400 rounded-lg border">
				<h3 className="mb-m-400 text-body text-txt-100 font-semibold">
					{t("time.heatmapTitle")}
				</h3>
				<div className="text-txt-300 flex h-[150px] items-center justify-center">
					{t("noData")}
				</div>
			</div>
		)
	}

	return (
		<div className="border-bg-300 bg-bg-200 p-m-400 rounded-lg border">
			<h3 className="mb-s-300 text-body text-txt-100 font-semibold">
				{t("time.heatmapTitle")}
			</h3>

			{/* Compact Heatmap Grid */}
			<div className="relative">
				{/* Header row with hours */}
				<div className="mb-s-100 flex items-center">
					<div className="w-10 shrink-0" />
					{hours.map((hour) => (
						<div
							key={hour}
							className="text-txt-300 w-7 shrink-0 text-center text-[10px]"
						>
							{hour}
						</div>
					))}
				</div>

				{/* Day rows */}
				{days.map((day, dayIndex) => {
					const dayOfWeek = dayIndex + 1 // Monday = 1
					return (
						<div key={day} className="mb-[3px] flex items-center">
							<div className="text-txt-300 pr-s-100 w-10 shrink-0 text-right text-[10px]">
								{dayShorts[dayIndex]}
							</div>
							{hours.map((hour) => {
								const cell = cellMap.get(`${dayOfWeek}-${hour}`)
								const hasData = cell && cell.totalTrades > 0
								return (
									<div
										key={`${day}-${hour}`}
										className={`mx-[1px] h-5 w-6 shrink-0 rounded-[3px] transition-transform ${getColorClass(cell)} ${
											hasData
												? "hover:ring-acc-100 focus:ring-acc-100 cursor-pointer hover:scale-110 hover:ring-1 focus:scale-110 focus:ring-1 focus:outline-none"
												: ""
										}`}
										onMouseEnter={(e) => handleCellInteraction(cell, e)}
										onMouseLeave={handleCellLeave}
										onFocus={(e) => handleCellInteraction(cell, e)}
										onBlur={handleCellLeave}
										tabIndex={hasData ? 0 : undefined}
										role={hasData ? "button" : undefined}
										aria-label={
											hasData
												? `${cell.dayName} ${cell.hourLabel}: ${cell.totalTrades} trades, ${cell.winRate.toFixed(0)}% win rate`
												: undefined
										}
									/>
								)
							})}
						</div>
					)
				})}

				{/* Tooltip */}
				{hoveredCell && (
					<div
						className="bg-bg-100 px-s-200 py-s-100 border-bg-300 pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md border shadow-lg"
						style={{
							left: hoverPosition.x,
							top: hoverPosition.y,
						}}
					>
						<p className="text-txt-100 text-[10px] font-medium">
							{hoveredCell.dayName} {hoveredCell.hourLabel}
						</p>
						<div className="gap-s-200 text-txt-300 flex text-[10px]">
							<span>{hoveredCell.totalTrades} trades</span>
							<span
								className={
									hoveredCell.winRate >= 50
										? "text-trade-buy"
										: "text-trade-sell"
								}
							>
								{hoveredCell.winRate.toFixed(0)}% WR
							</span>
						</div>
						<p
							className={`text-[10px] font-medium ${hoveredCell.totalPnl >= 0 ? "text-trade-buy" : "text-trade-sell"}`}
						>
							{formatBrlCompactWithSign(hoveredCell.totalPnl)}
						</p>
					</div>
				)}
			</div>

			{/* Compact Legend */}
			<div className="mt-s-300 gap-s-400 text-txt-300 flex items-center justify-center text-[10px]">
				<div className="gap-s-100 flex items-center">
					<div className="bg-trade-buy/70 h-2.5 w-2.5 rounded-sm" />
					<span>{t("time.profitable")}</span>
				</div>
				<div className="gap-s-100 flex items-center">
					<div className="bg-trade-sell/70 h-2.5 w-2.5 rounded-sm" />
					<span>{t("time.losing")}</span>
				</div>
				<div className="gap-s-100 flex items-center">
					<div className="bg-bg-300/50 h-2.5 w-2.5 rounded-sm" />
					<span>{t("time.noTrades")}</span>
				</div>
			</div>

			{/* Summary */}
			{bestSlot && worstSlot && (
				<div className="mt-s-300 gap-s-300 border-bg-300 pt-s-300 grid grid-cols-2 border-t">
					<div>
						<p className="text-txt-300 text-[10px]">{t("time.bestSlot")}</p>
						<p className="text-caption text-trade-buy font-medium">
							{bestSlot.dayName.slice(0, 3)} {bestSlot.hourLabel}
						</p>
						<p className="text-trade-buy/80 text-[10px]">
							{bestSlot.winRate.toFixed(0)}% •{" "}
							{formatBrlCompactWithSign(bestSlot.totalPnl)}
						</p>
					</div>
					<div>
						<p className="text-txt-300 text-[10px]">{t("time.worstSlot")}</p>
						<p className="text-caption text-trade-sell font-medium">
							{worstSlot.dayName.slice(0, 3)} {worstSlot.hourLabel}
						</p>
						<p className="text-trade-sell/80 text-[10px]">
							{worstSlot.winRate.toFixed(0)}% •{" "}
							{formatBrlCompactWithSign(worstSlot.totalPnl)}
						</p>
					</div>
				</div>
			)}
		</div>
	)
}
