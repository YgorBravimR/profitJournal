"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getWeeklyReport, type WeeklyReport } from "@/app/actions/reports"
import { format, parseISO } from "date-fns"
import Link from "next/link"

interface WeeklyReportCardProps {
	initialReport: WeeklyReport | null
}

export const WeeklyReportCard = ({ initialReport }: WeeklyReportCardProps) => {
	const [report, setReport] = useState<WeeklyReport | null>(initialReport)
	const [weekOffset, setWeekOffset] = useState(0)
	const [isPending, startTransition] = useTransition()
	const [isExpanded, setIsExpanded] = useState(false)

	const handleWeekChange = (offset: number) => {
		startTransition(async () => {
			const result = await getWeeklyReport(offset)
			if (result.status === "success" && result.data) {
				setReport(result.data)
				setWeekOffset(offset)
			}
		})
	}

	if (!report) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">Weekly Report</h2>
				<p className="mt-m-400 text-txt-300">No data available</p>
			</div>
		)
	}

	const { summary, dailyBreakdown, topWins, topLosses } = report
	const weekLabel =
		weekOffset === 0
			? "This Week"
			: weekOffset === 1
			? "Last Week"
			: `${weekOffset} weeks ago`

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-body font-semibold text-txt-100">Weekly Report</h2>
					<p className="text-tiny text-txt-300">
						{format(parseISO(report.weekStart), "MMM d")} -{" "}
						{format(parseISO(report.weekEnd), "MMM d, yyyy")}
					</p>
				</div>
				<div className="flex items-center gap-s-200">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleWeekChange(weekOffset + 1)}
						disabled={isPending}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="text-small text-txt-200">{weekLabel}</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleWeekChange(Math.max(0, weekOffset - 1))}
						disabled={isPending || weekOffset === 0}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
					{isPending && <Loader2 className="h-4 w-4 animate-spin text-txt-300" />}
				</div>
			</div>

			{/* Summary Stats */}
			{summary.totalTrades > 0 ? (
				<>
					<div className="mt-m-500 grid grid-cols-2 gap-m-400 sm:grid-cols-4">
						<div>
							<p className="text-tiny text-txt-300">Net P&L</p>
							<p
								className={cn(
									"font-mono text-h3 font-bold",
									summary.netPnl >= 0 ? "text-trade-buy" : "text-trade-sell"
								)}
							>
								{summary.netPnl >= 0 ? "+" : ""}
								{summary.netPnl.toFixed(2)}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">Win Rate</p>
							<p className="text-h3 font-bold text-txt-100">
								{summary.winRate.toFixed(0)}%
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">Trades</p>
							<p className="text-h3 font-bold text-txt-100">
								{summary.totalTrades}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">Profit Factor</p>
							<p className="text-h3 font-bold text-txt-100">
								{summary.profitFactor === Infinity
									? "∞"
									: summary.profitFactor.toFixed(2)}
							</p>
						</div>
					</div>

					{/* Secondary Stats */}
					<div className="mt-m-400 grid grid-cols-3 gap-m-400 border-t border-bg-300 pt-m-400 sm:grid-cols-6">
						<div>
							<p className="text-tiny text-txt-300">Wins</p>
							<p className="text-small font-medium text-trade-buy">
								{summary.winCount}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">Losses</p>
							<p className="text-small font-medium text-trade-sell">
								{summary.lossCount}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">Avg Win</p>
							<p className="font-mono text-small text-trade-buy">
								+{summary.avgWin.toFixed(2)}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">Avg Loss</p>
							<p className="font-mono text-small text-trade-sell">
								{summary.avgLoss.toFixed(2)}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">Best Trade</p>
							<p className="font-mono text-small text-trade-buy">
								+{summary.bestTrade.toFixed(2)}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">Worst Trade</p>
							<p className="font-mono text-small text-trade-sell">
								{summary.worstTrade.toFixed(2)}
							</p>
						</div>
					</div>

					{/* Expand/Collapse */}
					<Button
						variant="ghost"
						size="sm"
						className="mt-m-400 w-full"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? "Hide Details" : "Show Details"}
					</Button>

					{isExpanded && (
						<div className="mt-m-400 space-y-m-500">
							{/* Daily Breakdown */}
							<div>
								<h3 className="text-small font-medium text-txt-100">
									Daily Breakdown
								</h3>
								<div className="mt-s-300 space-y-s-200">
									{dailyBreakdown
										.filter((d) => d.tradeCount > 0)
										.map((day) => (
											<div
												key={day.date}
												className="flex items-center justify-between rounded bg-bg-100 px-s-300 py-s-200"
											>
												<span className="text-small text-txt-200">
													{format(parseISO(day.date), "EEE, MMM d")}
												</span>
												<div className="flex items-center gap-m-400">
													<span className="text-tiny text-txt-300">
														{day.tradeCount} trades
													</span>
													<span
														className={cn(
															"font-mono text-small",
															day.pnl >= 0
																? "text-trade-buy"
																: "text-trade-sell"
														)}
													>
														{day.pnl >= 0 ? "+" : ""}
														{day.pnl.toFixed(2)}
													</span>
												</div>
											</div>
										))}
								</div>
							</div>

							{/* Top Wins */}
							{topWins.length > 0 && (
								<div>
									<h3 className="flex items-center gap-s-200 text-small font-medium text-txt-100">
										<TrendingUp className="h-4 w-4 text-trade-buy" />
										Top Wins
									</h3>
									<div className="mt-s-300 space-y-s-200">
										{topWins.map((trade) => (
											<Link
												key={trade.id}
												href={`/journal/${trade.id}`}
												className="flex items-center justify-between rounded bg-bg-100 px-s-300 py-s-200 transition-colors hover:bg-bg-300"
											>
												<div className="flex items-center gap-s-200">
													<Badge variant="outline" className="text-tiny">
														{trade.asset}
													</Badge>
													<span className="text-tiny text-txt-300">
														{format(parseISO(trade.date), "MMM d")}
													</span>
												</div>
												<span className="font-mono text-small text-trade-buy">
													+{trade.pnl.toFixed(2)}
													{trade.r && (
														<span className="ml-1 text-txt-300">
															({trade.r.toFixed(1)}R)
														</span>
													)}
												</span>
											</Link>
										))}
									</div>
								</div>
							)}

							{/* Top Losses */}
							{topLosses.length > 0 && (
								<div>
									<h3 className="flex items-center gap-s-200 text-small font-medium text-txt-100">
										<TrendingDown className="h-4 w-4 text-trade-sell" />
										Top Losses
									</h3>
									<div className="mt-s-300 space-y-s-200">
										{topLosses.map((trade) => (
											<Link
												key={trade.id}
												href={`/journal/${trade.id}`}
												className="flex items-center justify-between rounded bg-bg-100 px-s-300 py-s-200 transition-colors hover:bg-bg-300"
											>
												<div className="flex items-center gap-s-200">
													<Badge variant="outline" className="text-tiny">
														{trade.asset}
													</Badge>
													<span className="text-tiny text-txt-300">
														{format(parseISO(trade.date), "MMM d")}
													</span>
												</div>
												<span className="font-mono text-small text-trade-sell">
													{trade.pnl.toFixed(2)}
													{trade.r && (
														<span className="ml-1 text-txt-300">
															({trade.r.toFixed(1)}R)
														</span>
													)}
												</span>
											</Link>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</>
			) : (
				<p className="mt-m-400 text-center text-txt-300">
					No trades recorded for this week
				</p>
			)}
		</div>
	)
}
