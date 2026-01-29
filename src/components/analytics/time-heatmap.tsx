"use client"

import { useTranslations } from "next-intl"
import type { TimeHeatmapCell } from "@/types"

interface TimeHeatmapProps {
	data: TimeHeatmapCell[]
}

const formatCurrency = (value: number): string => {
	const absValue = Math.abs(value)
	if (absValue >= 1000) {
		return `${value >= 0 ? "+" : "-"}R$${(absValue / 1000).toFixed(1)}K`
	}
	return `${value >= 0 ? "+" : ""}R$${value.toFixed(0)}`
}

export const TimeHeatmap = ({ data }: TimeHeatmapProps) => {
	const t = useTranslations("analytics")

	// Get unique hours and days
	const hours = Array.from(new Set(data.map((d) => d.hour))).sort((a, b) => a - b)
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
			return "bg-bg-300"
		}
		if (cell.totalPnl > 0) {
			if (cell.winRate >= 70) return "bg-pos/90"
			if (cell.winRate >= 60) return "bg-pos/70"
			if (cell.winRate >= 50) return "bg-pos/50"
			return "bg-pos/30"
		}
		if (cell.winRate <= 30) return "bg-neg/90"
		if (cell.winRate <= 40) return "bg-neg/70"
		if (cell.winRate <= 50) return "bg-neg/50"
		return "bg-neg/30"
	}

	// Find best and worst slots
	const cellsWithTrades = data.filter((c) => c.totalTrades > 0)
	const sortedByPnl = [...cellsWithTrades].sort((a, b) => b.totalPnl - a.totalPnl)
	const bestSlot = sortedByPnl[0]
	const worstSlot = sortedByPnl[sortedByPnl.length - 1]

	if (data.length === 0) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
				<h3 className="mb-m-400 text-body font-semibold text-txt-100">
					{t("time.heatmapTitle")}
				</h3>
				<div className="flex h-[200px] items-center justify-center text-txt-300">
					{t("noData")}
				</div>
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
			<h3 className="mb-m-400 text-body font-semibold text-txt-100">
				{t("time.heatmapTitle")}
			</h3>

			{/* Heatmap Grid */}
			<div className="overflow-x-auto">
				<div className="min-w-[600px]">
					{/* Header row with hours */}
					<div className="mb-s-100 flex">
						<div className="w-16 shrink-0" />
						{hours.map((hour) => (
							<div
								key={hour}
								className="flex-1 px-s-100 text-center text-caption text-txt-300"
							>
								{hour.toString().padStart(2, "0")}
							</div>
						))}
					</div>

					{/* Day rows */}
					{days.map((day, dayIndex) => {
						const dayOfWeek = dayIndex + 1 // Monday = 1
						return (
							<div key={day} className="mb-s-100 flex items-center">
								<div className="w-16 shrink-0 pr-s-200 text-right text-caption text-txt-300">
									{dayShorts[dayIndex]}
								</div>
								{hours.map((hour) => {
									const cell = cellMap.get(`${dayOfWeek}-${hour}`)
									return (
										<div
											key={`${day}-${hour}`}
											className="flex-1 px-s-100"
											title={
												cell
													? `${day} ${hour}:00\n${t("time.trades")}: ${cell.totalTrades}\n${t("time.winRate")}: ${cell.winRate.toFixed(0)}%\n${t("time.pnl")}: ${formatCurrency(cell.totalPnl)}`
													: `${day} ${hour}:00\n${t("time.noTrades")}`
											}
										>
											<div
												className={`aspect-square rounded transition-colors ${getColorClass(cell)} ${
													cell && cell.totalTrades > 0
														? "cursor-pointer hover:ring-2 hover:ring-acc-100"
														: ""
												}`}
											/>
										</div>
									)
								})}
							</div>
						)
					})}
				</div>
			</div>

			{/* Legend */}
			<div className="mt-m-400 flex items-center justify-center gap-m-400 text-caption text-txt-300">
				<div className="flex items-center gap-s-100">
					<div className="h-3 w-3 rounded bg-pos/70" />
					<span>{t("time.profitable")}</span>
				</div>
				<div className="flex items-center gap-s-100">
					<div className="h-3 w-3 rounded bg-neg/70" />
					<span>{t("time.losing")}</span>
				</div>
				<div className="flex items-center gap-s-100">
					<div className="h-3 w-3 rounded bg-bg-300" />
					<span>{t("time.noTrades")}</span>
				</div>
			</div>

			{/* Summary */}
			{bestSlot && worstSlot && (
				<div className="mt-m-400 grid grid-cols-2 gap-m-400 border-t border-bg-300 pt-m-400">
					<div>
						<p className="text-caption text-txt-300">{t("time.bestSlot")}</p>
						<p className="text-small font-medium text-pos">
							{bestSlot.dayName} {bestSlot.hourLabel} ({bestSlot.winRate.toFixed(0)}% WR, {formatCurrency(bestSlot.totalPnl)})
						</p>
					</div>
					<div>
						<p className="text-caption text-txt-300">{t("time.worstSlot")}</p>
						<p className="text-small font-medium text-neg">
							{worstSlot.dayName} {worstSlot.hourLabel} ({worstSlot.winRate.toFixed(0)}% WR, {formatCurrency(worstSlot.totalPnl)})
						</p>
					</div>
				</div>
			)}
		</div>
	)
}
