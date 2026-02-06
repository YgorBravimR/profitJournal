"use client"

import { Link } from "@/i18n/routing"
import {
	ArrowUpRight,
	ArrowDownRight,
	Calendar,
	TrendingUp,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/dates"
import { formatCurrency, formatRMultiple } from "@/lib/calculations"
import { fromCents } from "@/lib/money"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ColoredValue } from "@/components/shared"
import type { TradeWithRelations } from "@/app/actions/trades"

interface TradeCardProps {
	trade: TradeWithRelations
	className?: string
}

export const TradeCard = ({ trade, className }: TradeCardProps) => {
	const t = useTranslations("trade")

	// pnl is stored in cents, convert to dollars for display
	const pnl = fromCents(trade.pnl)
	const realizedR = Number(trade.realizedRMultiple) || 0
	const isWin = trade.outcome === "win"
	const isLoss = trade.outcome === "loss"
	const isLong = trade.direction === "long"

	const tags = trade.tradeTags?.map((tt) => tt.tag) || []
	const setupTags = tags.filter((tag) => tag.type === "setup")
	const mistakeTags = tags.filter((tag) => tag.type === "mistake")

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
								isLong ? "bg-action-buy-muted" : "bg-action-sell-muted"
							)}
						>
							{isLong ? (
								<ArrowUpRight className="h-5 w-5 text-action-buy" />
							) : (
								<ArrowDownRight className="h-5 w-5 text-action-sell" />
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
									{isLong ? t("direction.long").toUpperCase() : t("direction.short").toUpperCase()}
								</Badge>
								{trade.timeframe && (
									<Badge variant="secondary" className="text-tiny">
										{trade.timeframe.name}
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
						<ColoredValue
							value={pnl}
							showSign
							formatFn={(v) => formatCurrency(v)}
							className="text-body font-semibold"
						/>
						{realizedR !== 0 && (
							<ColoredValue
								value={realizedR}
								type="r-multiple"
								showSign
								size="sm"
								className="mt-s-100"
							/>
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
						<span className="text-tiny text-txt-300">{t("entry")}</span>
						<p className="font-mono text-small text-txt-100">
							${Number(trade.entryPrice).toFixed(2)}
						</p>
					</div>
					<div>
						<span className="text-tiny text-txt-300">{t("exit")}</span>
						<p className="font-mono text-small text-txt-100">
							{trade.exitPrice
								? `$${Number(trade.exitPrice).toFixed(2)}`
								: t("openPosition")}
						</p>
					</div>
					<div>
						<span className="text-tiny text-txt-300">{t("size")}</span>
						<p className="font-mono text-small text-txt-100">
							{Number(trade.positionSize).toLocaleString()}
						</p>
					</div>
				</div>
			</Card>
		</Link>
	)
}
