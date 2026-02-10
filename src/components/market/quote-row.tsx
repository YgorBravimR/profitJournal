"use client"

import type { MarketQuote } from "@/types/market"
import { cn } from "@/lib/utils"

interface QuoteRowProps {
	quote: MarketQuote
}

const formatPrice = (price: number): string => {
	if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
	if (price >= 1) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
	return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

const formatChange = (change: number): string => {
	const sign = change >= 0 ? "+" : ""
	return `${sign}${change.toFixed(2)}`
}

const formatChangePercent = (percent: number): string => {
	const sign = percent >= 0 ? "+" : ""
	return `${sign}${percent.toFixed(2)}%`
}

export const QuoteRow = ({ quote }: QuoteRowProps) => {
	const isPositive = quote.change >= 0
	const isZero = quote.change === 0

	return (
		<tr
			className="border-bg-300/50 hover:bg-bg-300/30 border-b transition-colors last:border-b-0"
			aria-label={`${quote.name}: ${formatPrice(quote.price)}, ${formatChangePercent(quote.changePercent)}`}
		>
			{/* Symbol + Name */}
			<td className="py-2 pr-3">
				<div className="flex flex-col">
					<span className="text-small text-txt-100 font-medium">{quote.name}</span>
					<span className="text-tiny text-txt-300">{quote.symbol}</span>
				</div>
			</td>

			{/* Price */}
			<td className="text-small text-txt-100 py-2 pr-3 text-right font-mono tabular-nums">
				{formatPrice(quote.price)}
			</td>

			{/* Change + Percent */}
			<td className="py-2 text-right">
				<div
					className={cn(
						"text-tiny inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono tabular-nums",
						isZero && "bg-bg-300/50 text-txt-300",
						!isZero && isPositive && "bg-trade-buy-muted text-trade-buy",
						!isZero && !isPositive && "bg-trade-sell-muted text-trade-sell"
					)}
				>
					<span>{formatChange(quote.change)}</span>
					<span className="text-txt-300/60">|</span>
					<span>{formatChangePercent(quote.changePercent)}</span>
				</div>
			</td>
		</tr>
	)
}
