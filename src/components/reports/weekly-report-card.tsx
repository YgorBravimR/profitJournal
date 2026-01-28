"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { getWeeklyReport, type WeeklyReport } from "@/app/actions/reports"
import { format, parseISO } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import Link from "next/link"

interface WeeklyReportCardProps {
	initialReport: WeeklyReport | null
}

export const WeeklyReportCard = ({ initialReport }: WeeklyReportCardProps) => {
	const t = useTranslations("reports.weekly")
	const tStats = useTranslations("reports.stats")
	const tCommon = useTranslations("common")
	const locale = useLocale()
	const dateLocale = locale === "pt-BR" ? ptBR : enUS

	const [report, setReport] = useState<WeeklyReport | null>(initialReport)
	const [weekOffset, setWeekOffset] = useState(0)
	const [isPending, startTransition] = useTransition()
	const [isExpanded, setIsExpanded] = useState(false)

	// Reset state when initialReport changes (e.g., account switch)
	useEffect(() => {
		setReport(initialReport)
		setWeekOffset(0)
		setIsExpanded(false)
	}, [initialReport])

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
				<h2 className="text-body font-semibold text-txt-100">{t("title")}</h2>
				<p className="mt-m-400 text-txt-300">{tCommon("noData")}</p>
			</div>
		)
	}

	const { summary, dailyBreakdown, topWins, topLosses } = report
	const weekLabel =
		weekOffset === 0
			? t("thisWeek")
			: weekOffset === 1
			? t("lastWeek")
			: t("weeksAgo", { n: weekOffset })

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-body font-semibold text-txt-100">{t("title")}</h2>
					<p className="text-tiny text-txt-300">
						{format(parseISO(report.weekStart), "MMM d", { locale: dateLocale })} -{" "}
						{format(parseISO(report.weekEnd), "MMM d, yyyy", { locale: dateLocale })}
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
							<p className="text-tiny text-txt-300">{tStats("netPnl")}</p>
							<p
								className={cn(
									"font-mono text-h3 font-bold",
									summary.netPnl >= 0 ? "text-trade-buy" : "text-trade-sell"
								)}
							>
								{summary.netPnl >= 0 ? "+" : ""}
								{summary.netPnl.toFixed(2)}
							</p>
							{summary.totalFees > 0 && (
								<p className="mt-s-100 text-tiny text-txt-300">
									<span className="text-txt-200">{tStats("grossPnl")}:</span>{" "}
									<span className={cn(
										"font-mono",
										summary.grossPnl >= 0 ? "text-trade-buy" : "text-trade-sell"
									)}>
										{summary.grossPnl >= 0 ? "+" : ""}{summary.grossPnl.toFixed(2)}
									</span>
									{" "}
									<span className="text-txt-300">
										({tStats("fees")}: -{summary.totalFees.toFixed(2)})
									</span>
								</p>
							)}
						</div>
						<div>
							<p className="text-tiny text-txt-300">{tStats("winRate")}</p>
							<p className="text-h3 font-bold text-txt-100">
								{summary.winRate.toFixed(0)}%
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">{tStats("trades")}</p>
							<p className="text-h3 font-bold text-txt-100">
								{summary.totalTrades}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">{tStats("profitFactor")}</p>
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
							<p className="text-tiny text-txt-300">{tStats("wins")}</p>
							<p className="text-small font-medium text-trade-buy">
								{summary.winCount}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">{tStats("losses")}</p>
							<p className="text-small font-medium text-trade-sell">
								{summary.lossCount}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">{tStats("avgWin")}</p>
							<p className="font-mono text-small text-trade-buy">
								+{summary.avgWin.toFixed(2)}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">{tStats("avgLoss")}</p>
							<p className="font-mono text-small text-trade-sell">
								{summary.avgLoss.toFixed(2)}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">{tStats("bestTrade")}</p>
							<p className="font-mono text-small text-trade-buy">
								+{summary.bestTrade.toFixed(2)}
							</p>
						</div>
						<div>
							<p className="text-tiny text-txt-300">{tStats("worstTrade")}</p>
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
						{isExpanded ? tCommon("hideDetails") : tCommon("showDetails")}
					</Button>

					{isExpanded && (
						<div className="mt-m-400 space-y-m-500">
							{/* Daily Breakdown */}
							<div>
								<h3 className="text-small font-medium text-txt-100">
									{t("dailyBreakdown")}
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
													{format(parseISO(day.date), "EEE, MMM d", { locale: dateLocale })}
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
										{t("topWins")}
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
														{format(parseISO(trade.date), "MMM d", { locale: dateLocale })}
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
										{t("topLosses")}
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
														{format(parseISO(trade.date), "MMM d", { locale: dateLocale })}
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
					{t("noTrades")}
				</p>
			)}
		</div>
	)
}
