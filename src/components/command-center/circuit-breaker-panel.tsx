"use client"

import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { CircuitBreakerStatus } from "@/lib/validations/command-center"
import type { DailyTarget } from "@/db/schema"
import { fromCents } from "@/lib/money"

interface CircuitBreakerPanelProps {
	status: CircuitBreakerStatus | null
	targets: DailyTarget | null
	currency?: string
}

const formatCurrency = (value: number, currency = "$"): string => {
	const absValue = Math.abs(value)
	return `${value >= 0 ? "" : "-"}${currency}${absValue.toFixed(2)}`
}

export const CircuitBreakerPanel = ({
	status,
	targets,
	currency = "$",
}: CircuitBreakerPanelProps) => {
	const t = useTranslations("commandCenter.circuitBreaker")

	if (!status) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center gap-s-200">
					<AlertCircle className="h-5 w-5 text-txt-300" />
					<p className="text-small text-txt-300">{t("loading")}</p>
				</div>
			</div>
		)
	}

	const shouldStop = status.shouldStopTrading
	const hasWarnings = status.alerts.length > 0

	// Calculate progress values
	const profitTarget = targets?.profitTarget ? fromCents(targets.profitTarget) : null
	const lossLimit = targets?.lossLimit ? fromCents(targets.lossLimit) : null
	const maxTrades = targets?.maxTrades || null
	const maxConsecutiveLosses = targets?.maxConsecutiveLosses || null

	const pnlProgress = profitTarget
		? Math.min((status.dailyPnL / profitTarget) * 100, 100)
		: lossLimit
			? Math.max((-status.dailyPnL / lossLimit) * 100, 0)
			: 0

	const tradesProgress = maxTrades
		? (status.tradesCount / maxTrades) * 100
		: 0

	const consecutiveLossesProgress = maxConsecutiveLosses
		? (status.consecutiveLosses / maxConsecutiveLosses) * 100
		: 0

	return (
		<div
			className={cn(
				"rounded-lg border p-m-500 transition-colors",
				shouldStop
					? "border-fb-error bg-fb-error/10"
					: hasWarnings
						? "border-trade-sell/50 bg-trade-sell/5"
						: "border-trade-buy/50 bg-trade-buy/5"
			)}
		>
			{/* Header */}
			<div className="mb-m-400 flex items-center justify-between">
				<div className="flex items-center gap-s-200">
					{shouldStop ? (
						<XCircle className="h-6 w-6 text-fb-error" />
					) : hasWarnings ? (
						<AlertTriangle className="h-6 w-6 text-trade-sell" />
					) : (
						<CheckCircle className="h-6 w-6 text-trade-buy" />
					)}
					<h3 className="text-body font-semibold text-txt-100">{t("title")}</h3>
				</div>

				{shouldStop && (
					<span className="rounded-full bg-fb-error px-m-400 py-s-100 text-small font-bold text-white">
						{t("stopTrading")}
					</span>
				)}
			</div>

			{/* Alerts */}
			{hasWarnings && (
				<div className="mb-m-400 space-y-s-200">
					{status.profitTargetHit && (
						<div className="flex items-center gap-s-200 text-small text-trade-buy">
							<CheckCircle className="h-4 w-4" />
							<span>{t("profitTargetHit")}</span>
						</div>
					)}
					{status.lossLimitHit && (
						<div className="flex items-center gap-s-200 text-small text-fb-error">
							<XCircle className="h-4 w-4" />
							<span>{t("lossLimitHit")}</span>
						</div>
					)}
					{status.maxTradesHit && (
						<div className="flex items-center gap-s-200 text-small text-trade-sell">
							<AlertTriangle className="h-4 w-4" />
							<span>{t("maxTradesHit")}</span>
						</div>
					)}
					{status.maxConsecutiveLossesHit && (
						<div className="flex items-center gap-s-200 text-small text-fb-error">
							<XCircle className="h-4 w-4" />
							<span>{t("consecutiveLossesHit")}</span>
						</div>
					)}
				</div>
			)}

			{/* Progress Indicators */}
			<div className="grid gap-m-400 md:grid-cols-3">
				{/* Daily P&L Progress */}
				<div>
					<div className="mb-s-100 flex items-center justify-between">
						<span className="text-tiny text-txt-300">{t("dailyPnL")}</span>
						<span
							className={cn(
								"text-small font-semibold",
								status.dailyPnL >= 0 ? "text-trade-buy" : "text-trade-sell"
							)}
						>
							{formatCurrency(status.dailyPnL, currency)}
						</span>
					</div>
					{(profitTarget || lossLimit) && (
						<>
							<div className="h-2 overflow-hidden rounded-full bg-bg-400">
								<div
									className={cn(
										"h-full transition-[width]",
										status.dailyPnL >= 0 ? "bg-trade-buy" : "bg-trade-sell"
									)}
									style={{ width: `${Math.min(Math.abs(pnlProgress), 100)}%` }}
								/>
							</div>
							<p className="mt-s-100 text-tiny text-txt-300">
								{profitTarget && status.dailyPnL >= 0
									? `${t("target")}: ${formatCurrency(profitTarget, currency)}`
									: lossLimit
										? `${t("limit")}: ${formatCurrency(lossLimit, currency)}`
										: null}
							</p>
						</>
					)}
				</div>

				{/* Trade Count Progress */}
				<div>
					<div className="mb-s-100 flex items-center justify-between">
						<span className="text-tiny text-txt-300">{t("trades")}</span>
						<span className="text-small font-semibold text-txt-100">
							{status.tradesCount}
							{maxTrades ? ` / ${maxTrades}` : ""}
						</span>
					</div>
					{maxTrades && (
						<>
							<div className="h-2 overflow-hidden rounded-full bg-bg-400">
								<div
									className={cn(
										"h-full transition-[width]",
										tradesProgress >= 100 ? "bg-trade-sell" : "bg-accent-primary"
									)}
									style={{ width: `${Math.min(tradesProgress, 100)}%` }}
								/>
							</div>
							<p className="mt-s-100 text-tiny text-txt-300">
								{t("maxTrades")}: {maxTrades}
							</p>
						</>
					)}
				</div>

				{/* Consecutive Losses Progress */}
				<div>
					<div className="mb-s-100 flex items-center justify-between">
						<span className="text-tiny text-txt-300">{t("consecutiveLosses")}</span>
						<span className="text-small font-semibold text-txt-100">
							{status.consecutiveLosses}
							{maxConsecutiveLosses ? ` / ${maxConsecutiveLosses}` : ""}
						</span>
					</div>
					{maxConsecutiveLosses && (
						<>
							<div className="h-2 overflow-hidden rounded-full bg-bg-400">
								<div
									className={cn(
										"h-full transition-[width]",
										consecutiveLossesProgress >= 100 ? "bg-fb-error" : "bg-trade-sell"
									)}
									style={{ width: `${Math.min(consecutiveLossesProgress, 100)}%` }}
								/>
							</div>
							<p className="mt-s-100 text-tiny text-txt-300">
								{t("maxConsecutive")}: {maxConsecutiveLosses}
							</p>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
