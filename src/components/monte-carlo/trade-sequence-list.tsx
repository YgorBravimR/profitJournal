"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { SimulatedTrade } from "@/types/monte-carlo"

interface TradeSequenceListProps {
	trades: SimulatedTrade[]
	currency?: string
	initiallyCollapsed?: boolean
	maxVisible?: number
}

const formatTradePnl = (value: number, symbol = "$"): string => {
	const sign = value >= 0 ? "+" : "-"
	return `${sign}${symbol}${Math.abs(value).toFixed(2)}`
}

export const TradeSequenceList = ({
	trades,
	currency = "$",
	initiallyCollapsed = true,
	maxVisible = 10,
}: TradeSequenceListProps) => {
	const t = useTranslations("monteCarlo.trades")
	const [showAll, setShowAll] = useState(!initiallyCollapsed)

	const displayedTrades = showAll ? trades : trades.slice(0, maxVisible)
	const hasMore = trades.length > maxVisible

	return (
		<div className="border-bg-300 bg-bg-200 p-m-500 rounded-lg border">
			<h3 className="mb-m-400 text-body text-txt-100 font-semibold">
				{t("title")}
			</h3>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-bg-300 border-b">
							<th className="pb-s-200 text-tiny text-txt-300 text-left font-medium">
								{t("number")}
							</th>
							<th className="pb-s-200 text-tiny text-txt-300 text-left font-medium">
								{t("result")}
							</th>
							<th className="pb-s-200 text-tiny text-txt-300 text-right font-medium">
								{t("pnl")}
							</th>
							<th className="pb-s-200 text-tiny text-txt-300 text-right font-medium">
								{t("commission")}
							</th>
							<th className="pb-s-200 text-tiny text-txt-300 text-right font-medium">
								{t("balance")}
							</th>
						</tr>
					</thead>
					<tbody>
						{displayedTrades.map((trade) => (
							<tr
								key={trade.tradeNumber}
								className="border-bg-300 border-b last:border-0"
							>
								<td className="py-s-200 text-small text-txt-200">
									{trade.tradeNumber}
								</td>
								<td className="py-s-200">
									<span
										className={cn(
											"gap-s-100 text-small inline-flex items-center font-medium",
											trade.isWin ? "text-trade-buy" : "text-trade-sell"
										)}
									>
										<span
											className={cn(
												"h-2 w-2 rounded-full",
												trade.isWin ? "bg-trade-buy" : "bg-trade-sell"
											)}
										/>
										{trade.isWin ? t("win") : t("loss")}
									</span>
								</td>
								<td
									className={cn(
										"py-s-200 text-small text-right font-medium",
										trade.pnl >= 0 ? "text-trade-buy" : "text-trade-sell"
									)}
								>
									{formatTradePnl(trade.pnl, currency)}
								</td>
								<td className="py-s-200 text-small text-txt-300 text-right">
									{currency}
									{trade.commission.toFixed(2)}
								</td>
								<td className="py-s-200 text-small text-txt-100 text-right font-medium">
									{currency}
									{trade.balanceAfter.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{hasMore && (
				<div className="mt-s-300 text-center">
					<Button id="monte-carlo-toggle-trades"
						variant="ghost"
						size="sm"
						onClick={() => setShowAll(!showAll)}
						className="text-txt-200"
					>
						{showAll ? (
							<>
								<ChevronUp className="mr-s-100 h-4 w-4" />
								{t("hideAll")}
							</>
						) : (
							<>
								<ChevronDown className="mr-s-100 h-4 w-4" />
								{t("showAll")} ({trades.length - maxVisible} {t("more")})
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	)
}
