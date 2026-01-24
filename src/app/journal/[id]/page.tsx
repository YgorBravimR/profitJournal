import Link from "next/link"
import { notFound } from "next/navigation"
import {
	ArrowLeft,
	ArrowUpRight,
	ArrowDownRight,
	Calendar,
	Edit,
	Trash2,
	Target,
	TrendingUp,
	AlertTriangle,
	CheckCircle,
	XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/dates"
import { formatCurrency, formatRMultiple } from "@/lib/calculations"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PnLDisplay, TradeMetric, RMultipleBar } from "@/components/journal"
import { getTrade } from "@/app/actions/trades"
import { DeleteTradeButton } from "./delete-button"

interface TradeDetailPageProps {
	params: Promise<{ id: string }>
}

const TradeDetailPage = async ({ params }: TradeDetailPageProps) => {
	const { id } = await params
	const result = await getTrade(id)

	if (result.status === "error" || !result.data) {
		notFound()
	}

	const trade = result.data
	const pnl = Number(trade.pnl) || 0
	const realizedR = Number(trade.realizedRMultiple) || 0
	const plannedR = Number(trade.plannedRMultiple) || 0
	const isLong = trade.direction === "long"
	const isWin = trade.outcome === "win"
	const isLoss = trade.outcome === "loss"

	const tags = trade.tradeTags?.map((tt) => tt.tag) || []
	const setupTags = tags.filter((t) => t.type === "setup")
	const mistakeTags = tags.filter((t) => t.type === "mistake")

	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title={`${trade.asset} Trade`}
				description={formatDateTime(trade.entryDate)}
				action={
					<div className="flex items-center gap-s-200">
						<Link href={`/journal/${id}/edit`}>
							<Button variant="outline">
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Button>
						</Link>
						<DeleteTradeButton tradeId={id} />
						<Link href="/journal">
							<Button variant="ghost">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
						</Link>
					</div>
				}
			/>

			<div className="flex-1 overflow-auto p-m-600">
				<div className="mx-auto max-w-4xl space-y-m-600">
					{/* Header Card */}
					<Card className="p-m-600">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-m-500">
								<div
									className={cn(
										"flex h-14 w-14 items-center justify-center rounded-xl",
										isLong ? "bg-trade-buy-muted" : "bg-trade-sell-muted"
									)}
								>
									{isLong ? (
										<ArrowUpRight className="h-7 w-7 text-trade-buy" />
									) : (
										<ArrowDownRight className="h-7 w-7 text-trade-sell" />
									)}
								</div>
								<div>
									<div className="flex items-center gap-s-300">
										<h2 className="text-h2 font-bold text-txt-100">
											{trade.asset}
										</h2>
										<Badge
											variant="outline"
											className={cn(
												isLong
													? "border-trade-buy/30 text-trade-buy"
													: "border-trade-sell/30 text-trade-sell"
											)}
										>
											{isLong ? "LONG" : "SHORT"}
										</Badge>
										{trade.timeframe && (
											<Badge variant="secondary">{trade.timeframe}</Badge>
										)}
									</div>
									<div className="mt-s-200 flex items-center gap-m-400 text-small text-txt-300">
										<div className="flex items-center gap-s-200">
											<Calendar className="h-4 w-4" />
											<span>{formatDateTime(trade.entryDate)}</span>
										</div>
										{trade.exitDate && (
											<>
												<span>→</span>
												<span>{formatDateTime(trade.exitDate)}</span>
											</>
										)}
									</div>
								</div>
							</div>

							<div className="text-right">
								<PnLDisplay value={pnl} size="xl" />
								{realizedR !== 0 && (
									<p
										className={cn(
											"mt-s-200 font-mono text-body",
											realizedR > 0 ? "text-trade-buy" : "text-trade-sell"
										)}
									>
										{formatRMultiple(realizedR)}
									</p>
								)}
							</div>
						</div>

						{/* Outcome Badge */}
						<div className="mt-m-500 flex items-center gap-s-300">
							{isWin && (
								<Badge className="bg-trade-buy/20 text-trade-buy">
									<CheckCircle className="mr-1 h-3 w-3" />
									Winner
								</Badge>
							)}
							{isLoss && (
								<Badge className="bg-trade-sell/20 text-trade-sell">
									<XCircle className="mr-1 h-3 w-3" />
									Loser
								</Badge>
							)}
							{trade.outcome === "breakeven" && (
								<Badge variant="secondary">Breakeven</Badge>
							)}
							{trade.followedPlan === true && (
								<Badge className="bg-trade-buy/20 text-trade-buy">
									<CheckCircle className="mr-1 h-3 w-3" />
									Followed Plan
								</Badge>
							)}
							{trade.followedPlan === false && (
								<Badge className="bg-warning/20 text-warning">
									<AlertTriangle className="mr-1 h-3 w-3" />
									Discipline Breach
								</Badge>
							)}
						</div>
					</Card>

					{/* Metrics Grid */}
					<div className="grid grid-cols-2 gap-m-500 md:grid-cols-4">
						<Card className="p-m-500">
							<TradeMetric
								label="Entry Price"
								value={`$${Number(trade.entryPrice).toFixed(2)}`}
								size="lg"
							/>
						</Card>
						<Card className="p-m-500">
							<TradeMetric
								label="Exit Price"
								value={
									trade.exitPrice
										? `$${Number(trade.exitPrice).toFixed(2)}`
										: "Open"
								}
								size="lg"
							/>
						</Card>
						<Card className="p-m-500">
							<TradeMetric
								label="Position Size"
								value={Number(trade.positionSize).toLocaleString()}
								size="lg"
							/>
						</Card>
						<Card className="p-m-500">
							<TradeMetric
								label="Risk Amount"
								value={
									trade.plannedRiskAmount
										? formatCurrency(Number(trade.plannedRiskAmount))
										: "—"
								}
								size="lg"
							/>
						</Card>
					</div>

					{/* R-Multiple Visualization */}
					{(plannedR > 0 || realizedR !== 0) && (
						<Card className="p-m-600">
							<h3 className="mb-m-500 flex items-center gap-s-200 text-body font-semibold text-txt-100">
								<Target className="h-5 w-5 text-acc-100" />
								Risk/Reward Analysis
							</h3>
							<RMultipleBar planned={plannedR || undefined} actual={realizedR} />
						</Card>
					)}

					{/* MFE/MAE */}
					{(trade.mfe || trade.mae) && (
						<Card className="p-m-600">
							<h3 className="mb-m-500 text-body font-semibold text-txt-100">
								Trade Excursion
							</h3>
							<div className="grid grid-cols-2 gap-m-500">
								{trade.mfe && (
									<div className="rounded-lg bg-trade-buy/10 p-m-400">
										<p className="text-tiny text-txt-300">
											MFE (Max Favorable)
										</p>
										<p className="mt-s-100 font-mono text-body font-semibold text-trade-buy">
											${Number(trade.mfe).toFixed(2)}
										</p>
									</div>
								)}
								{trade.mae && (
									<div className="rounded-lg bg-trade-sell/10 p-m-400">
										<p className="text-tiny text-txt-300">MAE (Max Adverse)</p>
										<p className="mt-s-100 font-mono text-body font-semibold text-trade-sell">
											${Number(trade.mae).toFixed(2)}
										</p>
									</div>
								)}
							</div>
						</Card>
					)}

					{/* Strategy & Tags */}
					{(trade.strategy || tags.length > 0) && (
						<Card className="p-m-600">
							<h3 className="mb-m-500 flex items-center gap-s-200 text-body font-semibold text-txt-100">
								<TrendingUp className="h-5 w-5 text-acc-100" />
								Classification
							</h3>

							{trade.strategy && (
								<div className="mb-m-400">
									<p className="text-tiny text-txt-300">Strategy</p>
									<p className="mt-s-100 text-body text-txt-100">
										{trade.strategy.name}
									</p>
								</div>
							)}

							{tags.length > 0 && (
								<div className="flex flex-wrap gap-s-200">
									{setupTags.map((tag) => (
										<Badge
											key={tag.id}
											className="bg-trade-buy/10 text-trade-buy"
										>
											{tag.name}
										</Badge>
									))}
									{mistakeTags.map((tag) => (
										<Badge key={tag.id} className="bg-warning/10 text-warning">
											{tag.name}
										</Badge>
									))}
								</div>
							)}
						</Card>
					)}

					{/* Journal Notes */}
					{(trade.preTradeThoughts ||
						trade.postTradeReflection ||
						trade.lessonLearned ||
						trade.disciplineNotes) && (
						<Card className="p-m-600">
							<h3 className="mb-m-500 text-body font-semibold text-txt-100">
								Journal Notes
							</h3>

							<div className="space-y-m-500">
								{trade.preTradeThoughts && (
									<div>
										<p className="text-tiny font-medium text-txt-300">
											Pre-Trade Thoughts
										</p>
										<p className="mt-s-200 text-small text-txt-100">
											{trade.preTradeThoughts}
										</p>
									</div>
								)}

								{trade.postTradeReflection && (
									<>
										{trade.preTradeThoughts && <Separator />}
										<div>
											<p className="text-tiny font-medium text-txt-300">
												Post-Trade Reflection
											</p>
											<p className="mt-s-200 text-small text-txt-100">
												{trade.postTradeReflection}
											</p>
										</div>
									</>
								)}

								{trade.lessonLearned && (
									<>
										<Separator />
										<div>
											<p className="text-tiny font-medium text-txt-300">
												Lesson Learned
											</p>
											<p className="mt-s-200 text-small text-txt-100">
												{trade.lessonLearned}
											</p>
										</div>
									</>
								)}

								{trade.disciplineNotes && (
									<>
										<Separator />
										<div className="rounded-lg bg-warning/10 p-m-400">
											<p className="text-tiny font-medium text-warning">
												Discipline Notes
											</p>
											<p className="mt-s-200 text-small text-txt-100">
												{trade.disciplineNotes}
											</p>
										</div>
									</>
								)}
							</div>
						</Card>
					)}

				</div>
			</div>
		</div>
	)
}

export default TradeDetailPage
