"use client"

import type { MarketQuote } from "@/types/market"
import { cn } from "@/lib/utils"

interface HeroQuoteCardProps {
	quote: MarketQuote
}

const formatPrice = (price: number): string => {
	if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
	if (price >= 1) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
	return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

const formatChangePercent = (percent: number): string => {
	const sign = percent >= 0 ? "+" : ""
	return `${sign}${percent.toFixed(2)}%`
}

export const HeroQuoteCard = ({ quote }: HeroQuoteCardProps) => {
	const isPositive = quote.change >= 0
	const isZero = quote.change === 0

	return (
		<div
			className={cn(
				"border-bg-300 bg-bg-200 min-w-[150px] shrink-0 rounded-lg border p-3",
				!isZero && isPositive && "border-l-2 border-l-trade-buy",
				!isZero && !isPositive && "border-l-2 border-l-trade-sell"
			)}
			role="listitem"
			aria-label={`${quote.name}: ${formatPrice(quote.price)}, ${formatChangePercent(quote.changePercent)}`}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="text-tiny text-txt-200 flex items-center gap-1.5 truncate font-medium">
					{quote.flag ? (
						<span className="shrink-0" aria-hidden="true">
							{quote.flag}
						</span>
					) : null}
					{quote.name}
				</span>
				<span
					className={cn(
						"text-tiny shrink-0",
						isZero && "text-txt-300",
						!isZero && isPositive && "text-trade-buy",
						!isZero && !isPositive && "text-trade-sell"
					)}
				>
					{formatChangePercent(quote.changePercent)}
				</span>
			</div>
			<span className="text-txt-100 mt-1 block text-lg font-semibold">
				{formatPrice(quote.price)}
			</span>
		</div>
	)
}
