"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { fromCents } from "@/lib/money"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { SimulatedTrade, SimulatedTradeStatus } from "@/types/risk-simulation"

interface TradeComparisonTableProps {
	trades: SimulatedTrade[]
}

const PAGE_SIZE = 25

const statusBadgeColors: Record<SimulatedTradeStatus, string> = {
	executed: "bg-trade-buy/20 text-trade-buy",
	skipped_no_sl: "bg-bg-300 text-txt-300",
	skipped_daily_limit: "bg-trade-sell/20 text-trade-sell",
	skipped_daily_target: "bg-acc-100/20 text-acc-100",
	skipped_max_trades: "bg-bg-300 text-txt-300",
	skipped_consecutive_loss: "bg-trade-sell/20 text-trade-sell",
	skipped_monthly_limit: "bg-trade-sell/20 text-trade-sell",
	skipped_weekly_limit: "bg-trade-sell/20 text-trade-sell",
	skipped_recovery_complete: "bg-acc-200/20 text-acc-200",
	skipped_gain_stop: "bg-acc-100/20 text-acc-100",
}

const TradeComparisonTable = ({ trades }: TradeComparisonTableProps) => {
	const t = useTranslations("riskSimulation.table")
	const [page, setPage] = useState(0)

	const totalPages = Math.ceil(trades.length / PAGE_SIZE)
	const paginatedTrades = useMemo(
		() => trades.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
		[trades, page]
	)

	const formatCurrency = (cents: number | null): string => {
		if (cents === null) return "—"
		const value = fromCents(cents)
		const sign = value >= 0 ? "+" : ""
		return `${sign}R$${Math.abs(value).toFixed(2)}`
	}

	const formatR = (r: number | null): string => {
		if (r === null) return "—"
		return `${r >= 0 ? "+" : ""}${r.toFixed(2)}R`
	}

	return (
		<div className="border-bg-300 overflow-hidden rounded-lg border">
			<div className="overflow-x-auto">
				<table className="w-full" role="table" aria-label={t("title")}>
					<thead>
						<tr className="bg-bg-200 border-bg-300 border-b">
							<th className="text-tiny text-txt-300 px-3 py-2 text-left font-medium">
								{t("day")}
							</th>
							<th className="text-tiny text-txt-300 px-3 py-2 text-left font-medium">
								{t("trade")}
							</th>
							<th className="text-tiny text-txt-300 px-3 py-2 text-left font-medium">
								{t("asset")}
							</th>
							<th className="text-tiny text-txt-300 px-3 py-2 text-left font-medium">
								{t("status")}
							</th>
							<th className="text-tiny text-txt-300 px-3 py-2 text-right font-medium">
								{t("risk")}
							</th>
							<th className="text-tiny text-txt-300 px-3 py-2 text-right font-medium">
								{t("originalPnl")}
							</th>
							<th className="text-tiny text-txt-300 px-3 py-2 text-right font-medium">
								{t("simulatedPnl")}
							</th>
							<th className="text-tiny text-txt-300 px-3 py-2 text-right font-medium">
								{t("simR")}
							</th>
							<th className="text-tiny text-txt-300 px-3 py-2 text-left font-medium">
								{t("riskReason")}
							</th>
						</tr>
					</thead>
					<tbody>
						{paginatedTrades.map((trade, idx) => {
							const isSkipped = trade.status !== "executed"
							const rowIndex = page * PAGE_SIZE + idx

							return (
								<tr
									key={`${trade.tradeId}-${rowIndex}`}
									className={cn(
										"border-bg-300 border-b transition-colors",
										isSkipped ? "opacity-60" : "hover:bg-bg-stripe"
									)}
								>
									<td className="text-tiny text-txt-300 px-3 py-2">
										{trade.dayKey}
									</td>
									<td className="text-small text-txt-100 px-3 py-2 font-medium">
										T{trade.dayTradeNumber}
									</td>
									<td className="text-tiny text-txt-200 px-3 py-2">
										{trade.asset}
									</td>
									<td className="px-3 py-2">
										<span
											className={cn(
												"text-tiny inline-block rounded-full px-2 py-0.5 font-medium",
												statusBadgeColors[trade.status]
											)}
										>
											{t(`statuses.${trade.status}`)}
										</span>
									</td>
									<td className="text-tiny text-txt-200 px-3 py-2 text-right">
										{formatCurrency(trade.riskAmountCents)}
									</td>
									<td className="px-3 py-2 text-right">
										<span
											className={cn(
												"text-small font-medium",
												trade.originalPnlCents > 0
													? "text-trade-buy"
													: trade.originalPnlCents < 0
														? "text-trade-sell"
														: "text-txt-300"
											)}
										>
											{formatCurrency(trade.originalPnlCents)}
										</span>
									</td>
									<td className="px-3 py-2 text-right">
										<span
											className={cn(
												"text-small font-medium",
												(trade.simulatedPnlCents ?? 0) > 0
													? "text-trade-buy"
													: (trade.simulatedPnlCents ?? 0) < 0
														? "text-trade-sell"
														: "text-txt-300"
											)}
										>
											{formatCurrency(trade.simulatedPnlCents)}
										</span>
									</td>
									<td className="text-tiny text-txt-200 px-3 py-2 text-right">
										{formatR(trade.simulatedRMultiple)}
									</td>
									<td className="text-tiny text-txt-300 max-w-[200px] truncate px-3 py-2">
										{trade.riskReason}
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="bg-bg-200 border-bg-300 flex items-center justify-between border-t px-4 py-2">
					<span className="text-tiny text-txt-300">
						{t("page", { current: page + 1, total: totalPages })}
					</span>
					<div className="flex gap-1">
						<button
							type="button"
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={page === 0}
							className="text-txt-200 hover:bg-bg-300 disabled:text-txt-placeholder rounded p-1 disabled:cursor-not-allowed"
							aria-label={t("prevPage")}
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
							disabled={page >= totalPages - 1}
							className="text-txt-200 hover:bg-bg-300 disabled:text-txt-placeholder rounded p-1 disabled:cursor-not-allowed"
							aria-label={t("nextPage")}
						>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export { TradeComparisonTable }
