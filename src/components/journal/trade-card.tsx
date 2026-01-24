import Link from "next/link"
import {
	ArrowUpRight,
	ArrowDownRight,
	Calendar,
	TrendingUp,
	TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/dates"
import { formatCurrency, formatRMultiple } from "@/lib/calculations"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { TradeWithRelations } from "@/app/actions/trades"

interface TradeCardProps {
	trade: TradeWithRelations
	className?: string
}

export const TradeCard = ({ trade, className }: TradeCardProps) => {
	const pnl = Number(trade.pnl) || 0
	const realizedR = Number(trade.realizedRMultiple) || 0
	const isWin = trade.outcome === "win"
	const isLoss = trade.outcome === "loss"
	const isLong = trade.direction === "long"

	const tags = trade.tradeTags?.map((tt) => tt.tag) || []
	const setupTags = tags.filter((t) => t.type === "setup")
	const mistakeTags = tags.filter((t) => t.type === "mistake")

	return (
		<Link href={`/journal/${trade.id}`}>
			<Card
				className={cn(
					"p-m-500 transition-colors hover:border-acc-100/50 hover:bg-bg-200/80",
					className
				)}
			>
				<div className="flex items-start justify-between gap-m-400">
					{/* Left: Asset and Direction */}
					<div className="flex items-center gap-m-400">
						<div
							className={cn(
								"flex h-10 w-10 items-center justify-center rounded-lg",
								isLong ? "bg-trade-buy-muted" : "bg-trade-sell-muted"
							)}
						>
							{isLong ? (
								<ArrowUpRight className="h-5 w-5 text-trade-buy" />
							) : (
								<ArrowDownRight className="h-5 w-5 text-trade-sell" />
							)}
						</div>
						<div>
							<div className="flex items-center gap-s-200">
								<span className="text-body font-semibold text-txt-100">
									{trade.asset}
								</span>
								<Badge
									variant="outline"
									className={cn(
										"text-tiny",
										isLong
											? "border-trade-buy/30 text-trade-buy"
											: "border-trade-sell/30 text-trade-sell"
									)}
								>
									{isLong ? "LONG" : "SHORT"}
								</Badge>
								{trade.timeframe && (
									<Badge variant="secondary" className="text-tiny">
										{trade.timeframe}
									</Badge>
								)}
							</div>
							<div className="mt-s-100 flex items-center gap-s-200 text-tiny text-txt-300">
								<Calendar className="h-3 w-3" />
								<span>{formatDateTime(trade.entryDate)}</span>
							</div>
						</div>
					</div>

					{/* Right: P&L and R */}
					<div className="text-right">
						<div
							className={cn(
								"font-mono text-body font-semibold tabular-nums",
								isWin && "text-trade-buy",
								isLoss && "text-trade-sell",
								!isWin && !isLoss && "text-txt-100"
							)}
						>
							{pnl >= 0 ? "+" : ""}
							{formatCurrency(pnl)}
						</div>
						{realizedR !== 0 && (
							<div
								className={cn(
									"mt-s-100 font-mono text-small tabular-nums",
									realizedR > 0 ? "text-trade-buy" : "text-trade-sell"
								)}
							>
								{formatRMultiple(realizedR)}
							</div>
						)}
					</div>
				</div>

				{/* Tags */}
				{(setupTags.length > 0 || mistakeTags.length > 0) && (
					<div className="mt-m-400 flex flex-wrap gap-s-200">
						{setupTags.map((tag) => (
							<Badge
								key={tag.id}
								variant="secondary"
								className="bg-trade-buy/10 text-tiny text-trade-buy"
							>
								{tag.name}
							</Badge>
						))}
						{mistakeTags.map((tag) => (
							<Badge
								key={tag.id}
								variant="secondary"
								className="bg-warning/10 text-tiny text-warning"
							>
								{tag.name}
							</Badge>
						))}
					</div>
				)}

				{/* Strategy */}
				{trade.strategy && (
					<div className="mt-m-400 flex items-center gap-s-200 text-tiny text-txt-300">
						<TrendingUp className="h-3 w-3" />
						<span>{trade.strategy.name}</span>
					</div>
				)}

				{/* Quick metrics */}
				<div className="mt-m-400 grid grid-cols-3 gap-m-400 border-t border-bg-300 pt-m-400">
					<div>
						<span className="text-tiny text-txt-300">Entry</span>
						<p className="font-mono text-small text-txt-100">
							${Number(trade.entryPrice).toFixed(2)}
						</p>
					</div>
					<div>
						<span className="text-tiny text-txt-300">Exit</span>
						<p className="font-mono text-small text-txt-100">
							{trade.exitPrice
								? `$${Number(trade.exitPrice).toFixed(2)}`
								: "Open"}
						</p>
					</div>
					<div>
						<span className="text-tiny text-txt-300">Size</span>
						<p className="font-mono text-small text-txt-100">
							{Number(trade.positionSize).toLocaleString()}
						</p>
					</div>
				</div>
			</Card>
		</Link>
	)
}
