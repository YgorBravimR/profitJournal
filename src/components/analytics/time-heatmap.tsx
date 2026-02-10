"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { TimeHeatmapCell } from "@/types"
import { formatBrlCompactWithSign } from "@/lib/formatting"
import { cn } from "@/lib/utils"
import { InsightCard, InsightCardPlaceholder } from "@/components/analytics/insight-card"

interface TimeHeatmapProps {
	data: TimeHeatmapCell[]
}

/** B3 Trading hours (9:00 - 18:00) */
const TRADING_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

/**
 * Displays a heatmap of trading performance by day of week and hour.
 * Cells are colored and sized based on P&L intensity, with a tooltip overlay
 * and actionable insights highlighting best/worst trading windows.
 *
 * @param data - Array of heatmap cells with performance data per time slot
 */
export const TimeHeatmap = ({ data }: TimeHeatmapProps) => {
	const t = useTranslations("analytics")
	const tDays = useTranslations("analytics.time.heatmapDays")
	const [hoveredCell, setHoveredCell] = useState<TimeHeatmapCell | null>(null)

	const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
	const dayLabels = [tDays("mon"), tDays("tue"), tDays("wed"), tDays("thu"), tDays("fri")]

	// Get translated short day name from English day name
	const getTranslatedDayShort = (dayName: string): string => {
		const dayMap: Record<string, string> = {
			Sunday: tDays("sun"),
			Monday: tDays("mon"),
			Tuesday: tDays("tue"),
			Wednesday: tDays("wed"),
			Thursday: tDays("thu"),
			Friday: tDays("fri"),
			Saturday: tDays("sat"),
		}
		return dayMap[dayName] || dayName.slice(0, 3)
	}

	// Create lookup map
	const cellMap = new Map<string, TimeHeatmapCell>()
	for (const cell of data) {
		cellMap.set(`${cell.dayOfWeek}-${cell.hour}`, cell)
	}

	// Calculate max absolute P&L for relative intensity scaling
	const maxAbsPnl = data.reduce((max, cell) => {
		if (cell.totalTrades === 0) return max
		return Math.max(max, Math.abs(cell.totalPnl))
	}, 0)

	// Get cell color with intensity scaled relative to max P&L
	const getCellStyle = (cell: TimeHeatmapCell | undefined): string => {
		if (!cell || cell.totalTrades === 0) return "bg-bg-300/30"

		const intensity = maxAbsPnl > 0 ? Math.abs(cell.totalPnl) / maxAbsPnl : 0.5
		const base = cell.totalPnl > 0 ? "bg-trade-buy" : "bg-trade-sell"

		if (intensity > 0.7) return base
		if (intensity > 0.4) return `${base}/70`
		if (intensity > 0.15) return `${base}/50`
		return `${base}/30`
	}

	// Find best and worst slots
	const cellsWithTrades = data.filter((c) => c.totalTrades > 0)
	const sortedByPnl = cellsWithTrades.toSorted((a, b) => b.totalPnl - a.totalPnl)
	const bestSlot = sortedByPnl[0]
	const worstSlot = sortedByPnl[sortedByPnl.length - 1]

	if (data.length === 0) {
		return (
			<div className="border-bg-300 bg-bg-200 rounded-lg border p-m-500">
				<h3 className="text-body text-txt-100 font-semibold">
					{t("time.heatmapTitle")}
				</h3>
				<div className="text-txt-300 flex h-50 items-center justify-center">
					{t("noData")}
				</div>
			</div>
		)
	}

	return (
		<div className="border-bg-300 bg-bg-200 rounded-lg border p-m-500">
			{/* Header */}
			<div className="mb-m-400">
				<h3 className="text-body text-txt-100 font-semibold">
					{t("time.heatmapTitle")}
				</h3>
				<p className="text-caption text-txt-300 mt-s-100">
					{t("time.heatmapSubtitle")}
				</p>
			</div>

			{/* Heatmap Grid */}
			<div className="overflow-x-auto">
				<div className="min-w-125">
					{/* Hour header row */}
					<div className="mb-s-200 flex items-end">
						<div className="w-14 shrink-0" />
						{TRADING_HOURS.map((hour) => (
							<div
								key={hour}
								className="text-caption text-txt-300 flex-1 text-center font-medium"
							>
								{hour}h
							</div>
						))}
					</div>

					{/* Day rows */}
					{days.map((day, dayIndex) => {
						const dayOfWeek = dayIndex + 1
						return (
							<div key={day} className="mb-s-100 flex items-center">
								<div className="text-small text-txt-200 w-14 shrink-0 pr-s-200 text-right font-medium">
									{dayLabels[dayIndex]}
								</div>
								{TRADING_HOURS.map((hour) => {
									const cell = cellMap.get(`${dayOfWeek}-${hour}`)
									const hasData = cell && cell.totalTrades > 0
									const isHovered = hoveredCell === cell
									return (
										<div
											key={`${day}-${hour}`}
											className="flex-1 px-0.5"
										>
											<div
												className={cn(
													"relative flex h-10 items-center justify-center rounded-md transition-all",
													getCellStyle(cell),
													hasData && "cursor-pointer hover:ring-2 hover:ring-acc-100 focus:ring-2 focus:ring-acc-100 focus:outline-none",
													isHovered && "ring-2 ring-acc-100 scale-105"
												)}
												onMouseEnter={() => {
													if (hasData) setHoveredCell(cell)
												}}
												onMouseLeave={() => setHoveredCell(null)}
												onFocus={() => {
													if (hasData) setHoveredCell(cell)
												}}
												onBlur={() => setHoveredCell(null)}
												tabIndex={hasData ? 0 : undefined}
												role={hasData ? "button" : undefined}
												aria-label={
													hasData
														? `${cell.dayName} ${cell.hourLabel}: ${cell.totalTrades} trades, ${cell.winRate.toFixed(0)}% win rate`
														: undefined
												}
											>
												{/* Trade count inside cell */}
												{hasData && (
													<span className="text-[11px] font-semibold text-white/90 drop-shadow-sm">
														{cell.totalTrades}
													</span>
												)}
											</div>
										</div>
									)
								})}
							</div>
						)
					})}
				</div>
			</div>

			{/* Hovered Cell Detail Bar */}
			<div
				className={cn(
					"mt-m-400 rounded-lg border px-m-400 py-s-300 transition-all",
					hoveredCell
						? "border-acc-100/30 bg-bg-100"
						: "border-bg-300 bg-bg-100/50"
				)}
			>
				{hoveredCell ? (
					<div className="flex items-center justify-between gap-m-400">
						<div>
							<p className="text-small text-txt-100 font-semibold">
								{hoveredCell.dayName} {hoveredCell.hourLabel}
							</p>
							<p className="text-caption text-txt-300">
								{t("time.totalTrades", { count: hoveredCell.totalTrades })}
							</p>
						</div>
						<div className="flex items-center gap-m-500">
							<div className="text-right">
								<p className="text-caption text-txt-300">{t("time.winRate")}</p>
								<p
									className={cn(
										"text-small font-semibold",
										hoveredCell.winRate >= 50 ? "text-trade-buy" : "text-trade-sell"
									)}
								>
									{hoveredCell.winRate.toFixed(0)}%
								</p>
							</div>
							<div className="text-right">
								<p className="text-caption text-txt-300">{t("time.pnl")}</p>
								<p
									className={cn(
										"text-small font-semibold",
										hoveredCell.totalPnl >= 0 ? "text-trade-buy" : "text-trade-sell"
									)}
								>
									{formatBrlCompactWithSign(hoveredCell.totalPnl)}
								</p>
							</div>
							{hoveredCell.avgR !== 0 && (
								<div className="text-right">
									<p className="text-caption text-txt-300">{t("time.avgR")}</p>
									<p
										className={cn(
											"text-small font-semibold",
											hoveredCell.avgR >= 0 ? "text-trade-buy" : "text-trade-sell"
										)}
									>
										{hoveredCell.avgR >= 0 ? "+" : ""}
										{hoveredCell.avgR.toFixed(2)}R
									</p>
								</div>
							)}
						</div>
					</div>
				) : (
					<p className="text-caption text-txt-300 text-center">
						{t("time.heatmapSubtitle")}
					</p>
				)}
			</div>

			{/* Legend */}
			<div className="mt-m-400 flex items-center justify-center gap-m-500 text-caption text-txt-300">
				<div className="flex items-center gap-s-200">
					<div className="h-3 w-3 rounded-sm bg-trade-buy/70" />
					<span>{t("time.profitable")}</span>
				</div>
				<div className="flex items-center gap-s-200">
					<div className="h-3 w-3 rounded-sm bg-trade-sell/70" />
					<span>{t("time.losing")}</span>
				</div>
				<div className="flex items-center gap-s-200">
					<div className="h-3 w-3 rounded-sm bg-bg-300/30" />
					<span>{t("time.noTrades")}</span>
				</div>
			</div>

			{/* Actionable Insights */}
			{bestSlot && worstSlot && (() => {
				const isSameSlot = bestSlot === worstSlot
				const showBestAsReal = !isSameSlot || bestSlot.totalPnl >= 0
				const showWorstAsReal = !isSameSlot || worstSlot.totalPnl < 0

				return (
					<div className="mt-m-400 grid grid-cols-1 gap-s-300 sm:grid-cols-2">
						{showBestAsReal ? (
							<InsightCard
								type="best"
								label={t("time.bestSlot")}
								title={`${getTranslatedDayShort(bestSlot.dayName)} ${bestSlot.hourLabel}`}
								detail={`${bestSlot.winRate.toFixed(0)}% WR · ${formatBrlCompactWithSign(bestSlot.totalPnl)} · ${t("time.totalTrades", { count: bestSlot.totalTrades })}`}
								action={t("time.bestSlotAction")}
							/>
						) : (
							<InsightCardPlaceholder
								type="best"
								label={t("time.bestSlot")}
								placeholderText={t("time.bestSlotPlaceholder")}
							/>
						)}
						{showWorstAsReal ? (
							<InsightCard
								type="worst"
								label={t("time.worstSlot")}
								title={`${getTranslatedDayShort(worstSlot.dayName)} ${worstSlot.hourLabel}`}
								detail={`${worstSlot.winRate.toFixed(0)}% WR · ${formatBrlCompactWithSign(worstSlot.totalPnl)} · ${t("time.totalTrades", { count: worstSlot.totalTrades })}`}
								action={t("time.worstSlotAction")}
							/>
						) : (
							<InsightCardPlaceholder
								type="worst"
								label={t("time.worstSlot")}
								placeholderText={t("time.worstSlotPlaceholder")}
							/>
						)}
					</div>
				)
			})()}
		</div>
	)
}
