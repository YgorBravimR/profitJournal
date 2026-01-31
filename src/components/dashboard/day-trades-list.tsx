"use client"

import { useTranslations } from "next-intl"
import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react"
import type { DayTrade } from "@/types"
import { formatBrlWithSign } from "@/lib/formatting"
import { ColoredValue } from "@/components/shared"

interface DayTradesListProps {
	trades: DayTrade[]
	onTradeClick?: (tradeId: string) => void
}

/**
 * Formats a price value for display.
 *
 * @param value - The numeric price value
 * @returns Formatted price string
 */
const formatPrice = (value: number): string => {
	return value.toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

/**
 * Displays a list of trades for a specific day in a table format.
 * Shows time, asset, direction, entry/exit prices, P&L, and R multiple.
 *
 * @param trades - Array of trades for the day
 * @param onTradeClick - Optional callback when a trade row is clicked
 */
export const DayTradesList = ({ trades, onTradeClick }: DayTradesListProps) => {
	const t = useTranslations("dashboard")

	if (trades.length === 0) {
		return (
			<div className="flex h-[100px] items-center justify-center text-txt-300">
				{t("dayDetail.noTrades")}
			</div>
		)
	}

	return (
		<div className="overflow-hidden rounded-lg border border-bg-300">
			<table className="w-full">
				<thead>
					<tr className="border-b border-bg-300 bg-bg-100">
						<th className="px-s-300 py-s-200 text-left text-caption font-medium text-txt-300">
							{t("dayDetail.time")}
						</th>
						<th className="px-s-300 py-s-200 text-left text-caption font-medium text-txt-300">
							{t("dayDetail.asset")}
						</th>
						<th className="hidden px-s-300 py-s-200 text-left text-caption font-medium text-txt-300 sm:table-cell">
							{t("dayDetail.dir")}
						</th>
						<th className="hidden px-s-300 py-s-200 text-right text-caption font-medium text-txt-300 md:table-cell">
							{t("dayDetail.entry")}
						</th>
						<th className="hidden px-s-300 py-s-200 text-right text-caption font-medium text-txt-300 md:table-cell">
							{t("dayDetail.exit")}
						</th>
						<th className="px-s-300 py-s-200 text-right text-caption font-medium text-txt-300">
							{t("dayDetail.pnl")}
						</th>
						<th className="px-s-300 py-s-200 text-right text-caption font-medium text-txt-300">
							R
						</th>
						<th className="w-8 px-s-200 py-s-200"></th>
					</tr>
				</thead>
				<tbody>
					{trades.map((trade) => (
						<tr
							key={trade.id}
							className={`border-b border-bg-300 last:border-b-0 ${
								onTradeClick
									? "cursor-pointer transition-colors hover:bg-bg-100"
									: ""
							}`}
							onClick={() => onTradeClick?.(trade.id)}
						>
							<td className="px-s-300 py-s-200 text-small text-txt-100">
								{trade.time}
							</td>
							<td className="px-s-300 py-s-200">
								<div className="flex items-center gap-s-100">
									{trade.direction === "long" ? (
										<ArrowUpRight className="h-3.5 w-3.5 text-trade-buy" />
									) : (
										<ArrowDownRight className="h-3.5 w-3.5 text-trade-sell" />
									)}
									<span className="text-small font-medium text-txt-100">
										{trade.asset}
									</span>
								</div>
							</td>
							<td className="hidden px-s-300 py-s-200 text-small text-txt-200 sm:table-cell">
								{trade.direction === "long"
									? t("dayDetail.long")
									: t("dayDetail.short")}
							</td>
							<td className="hidden px-s-300 py-s-200 text-right text-small text-txt-200 md:table-cell">
								{formatPrice(trade.entryPrice)}
							</td>
							<td className="hidden px-s-300 py-s-200 text-right text-small text-txt-200 md:table-cell">
								{trade.exitPrice ? formatPrice(trade.exitPrice) : "-"}
							</td>
							<td className="px-s-300 py-s-200 text-right">
								<ColoredValue
									value={trade.pnl}
									showSign
									size="sm"
									formatFn={(v) => formatBrlWithSign(v)}
								/>
							</td>
							<td className="px-s-300 py-s-200 text-right">
								{trade.rMultiple !== null ? (
									<ColoredValue
										value={trade.rMultiple}
										type="r-multiple"
										showSign
										size="sm"
									/>
								) : (
									<span className="text-small text-txt-300">-</span>
								)}
							</td>
							<td className="px-s-200 py-s-200">
								{onTradeClick && (
									<ChevronRight className="h-4 w-4 text-txt-300" />
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
