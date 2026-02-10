"use client"

import type { MarketQuote } from "@/types/market"
import { cn } from "@/lib/utils"

interface QuoteCardProps {
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

/**
 * Tabular quote row — uses CSS grid so all columns align across rows.
 * Columns: [flag+name] [price] [high] [low] [change badge]
 */
export const QuoteCard = ({ quote }: QuoteCardProps) => {
	const isPositive = quote.change >= 0
	const isZero = quote.change === 0
	const hasRange = quote.sessionHigh !== null && quote.sessionLow !== null

	return (
		<div
			className="border-bg-300/50 hover:bg-bg-300/20 grid grid-cols-[minmax(120px,1.5fr)_auto_auto_auto_auto] items-center gap-x-3 rounded-lg border px-3 py-2 transition-colors"
			role="listitem"
			aria-label={`${quote.name}: ${formatPrice(quote.price)}, ${formatChangePercent(quote.changePercent)}`}
		>
			{/* Col 1: Flag + Name + Symbol */}
			<div className="flex min-w-0 items-center gap-2">
				{quote.flag ? (
					<span className="shrink-0 text-base" aria-hidden="true">
						{quote.flag}
					</span>
				) : null}
				<div className="min-w-0">
					<p className="text-small text-txt-100 truncate font-medium">{quote.name}</p>
					<p className="text-tiny text-txt-300 truncate">{quote.symbol}</p>
				</div>
			</div>

			{/* Col 2: Price */}
			<span className="text-small text-txt-100 text-right">
				{formatPrice(quote.price)}
			</span>

			{/* Col 3: Session High */}
			<span className="text-tiny text-txt-300 text-right">
				{hasRange ? `H ${formatPrice(quote.sessionHigh!)}` : ""}
			</span>

			{/* Col 4: Session Low */}
			<span className="text-tiny text-txt-300 text-right">
				{hasRange ? `L ${formatPrice(quote.sessionLow!)}` : ""}
			</span>

			{/* Col 5: Change badge */}
			<span
				className={cn(
					"text-tiny inline-flex items-center justify-end gap-1 rounded-md px-2 py-0.5",
					isZero && "bg-bg-300/50 text-txt-300",
					!isZero && isPositive && "bg-trade-buy-muted text-trade-buy",
					!isZero && !isPositive && "bg-trade-sell-muted text-trade-sell"
				)}
			>
				<span>{formatChange(quote.change)}</span>
				<span className="text-txt-300/60">|</span>
				<span>{formatChangePercent(quote.changePercent)}</span>
			</span>
		</div>
	)
}
