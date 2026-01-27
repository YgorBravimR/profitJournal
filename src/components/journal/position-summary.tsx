"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { PnLDisplay } from "./pnl-display"
import type { ExecutionSummary, PositionStatus } from "@/types"
import { ArrowRight, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface PositionSummaryProps {
	summary: ExecutionSummary
	direction: "long" | "short"
	tickSize?: number
	tickValue?: number
	className?: string
}

export const PositionSummary = ({
	summary,
	direction,
	tickSize,
	tickValue,
	className,
}: PositionSummaryProps) => {
	const t = useTranslations("execution")

	const {
		totalEntryQuantity,
		totalExitQuantity,
		avgEntryPrice,
		avgExitPrice,
		remainingQuantity,
		positionStatus,
	} = summary

	// Calculate P&L
	const hasExits = totalExitQuantity > 0
	let pnlPerUnit = 0
	let totalPnl = 0

	if (hasExits && avgEntryPrice > 0 && avgExitPrice > 0) {
		const priceDiff =
			direction === "long"
				? avgExitPrice - avgEntryPrice
				: avgEntryPrice - avgExitPrice

		if (tickSize && tickValue) {
			// Tick-based calculation
			const ticksGained = priceDiff / tickSize
			pnlPerUnit = ticksGained * tickValue
			totalPnl = pnlPerUnit * totalExitQuantity
		} else {
			// Simple price-based calculation
			pnlPerUnit = priceDiff
			totalPnl = priceDiff * totalExitQuantity
		}
	}

	// Calculate closed percentage
	const closedPercent =
		totalEntryQuantity > 0
			? (totalExitQuantity / totalEntryQuantity) * 100
			: 0

	const formatPrice = (price: number) => {
		return price.toLocaleString("pt-BR", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	}

	const formatQuantity = (qty: number) => {
		return qty.toLocaleString("pt-BR", {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		})
	}

	const getStatusIcon = (status: PositionStatus) => {
		switch (status) {
			case "closed":
				return <CheckCircle className="h-4 w-4 text-trade-buy" />
			case "partial":
				return <Clock className="h-4 w-4 text-fb-warning" />
			case "open":
				return <AlertCircle className="h-4 w-4 text-fb-info" />
			case "over_exit":
				return <AlertCircle className="h-4 w-4 text-fb-error" />
		}
	}

	const getStatusText = (status: PositionStatus) => {
		return t(`positionStatus.${status}`)
	}

	const getStatusColor = (status: PositionStatus) => {
		switch (status) {
			case "closed":
				return "text-trade-buy"
			case "partial":
				return "text-fb-warning"
			case "open":
				return "text-fb-info"
			case "over_exit":
				return "text-fb-error"
		}
	}

	return (
		<div
			className={cn(
				"rounded-lg border border-stroke-100 bg-bg-100 p-m-400",
				className
			)}
		>
			<div className="mb-m-300 flex items-center justify-between">
				<h4 className="text-body font-semibold text-txt-100">
					{t("positionSummary")}
				</h4>
				<div className={cn("flex items-center gap-s-200", getStatusColor(positionStatus))}>
					{getStatusIcon(positionStatus)}
					<span className="text-small font-medium">
						{getStatusText(positionStatus)}
					</span>
				</div>
			</div>

			{/* Price Movement Visualization */}
			<div className="mb-m-400 space-y-s-200">
				<div className="flex items-center justify-between text-small">
					<div>
						<span className="text-txt-300">{t("avgEntry")}:</span>
						<span className="ml-s-200 font-mono font-semibold text-txt-100">
							{formatPrice(avgEntryPrice)}
						</span>
					</div>
					{hasExits && (
						<div>
							<span className="text-txt-300">{t("avgExit")}:</span>
							<span className="ml-s-200 font-mono font-semibold text-txt-100">
								{formatPrice(avgExitPrice)}
							</span>
						</div>
					)}
				</div>

				{hasExits && (
					<div className="flex items-center gap-s-200 rounded-md bg-bg-200 p-s-300">
						<span className="font-mono text-txt-200">{formatPrice(avgEntryPrice)}</span>
						<ArrowRight className="h-4 w-4 text-txt-300" />
						<span className="font-mono text-txt-200">{formatPrice(avgExitPrice)}</span>
						<span
							className={cn(
								"ml-auto font-mono font-semibold",
								totalPnl >= 0 ? "text-trade-buy" : "text-trade-sell"
							)}
						>
							{totalPnl >= 0 ? "+" : ""}
							{formatPrice(Math.abs(avgExitPrice - avgEntryPrice))} pts
						</span>
					</div>
				)}
			</div>

			{/* Progress Bar */}
			<div className="mb-m-400">
				<div className="mb-s-100 flex justify-between text-caption text-txt-300">
					<span>{t("closed")}</span>
					<span>{closedPercent.toFixed(0)}%</span>
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-bg-300">
					<div
						className={cn(
							"h-full transition-all",
							positionStatus === "closed"
								? "bg-trade-buy"
								: positionStatus === "partial"
								? "bg-fb-warning"
								: "bg-fb-info"
						)}
						style={{ width: `${Math.min(closedPercent, 100)}%` }}
					/>
				</div>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-3 gap-m-300 border-t border-stroke-100 pt-m-300">
				<div className="text-center">
					<div className="text-caption text-txt-300">{t("totalIn")}</div>
					<div className="font-mono text-body font-semibold text-txt-100">
						{formatQuantity(totalEntryQuantity)}
					</div>
				</div>
				<div className="text-center">
					<div className="text-caption text-txt-300">{t("totalOut")}</div>
					<div className="font-mono text-body font-semibold text-txt-100">
						{formatQuantity(totalExitQuantity)}
					</div>
				</div>
				<div className="text-center">
					<div className="text-caption text-txt-300">{t("remaining")}</div>
					<div
						className={cn(
							"font-mono text-body font-semibold",
							remainingQuantity > 0 ? "text-fb-warning" : "text-trade-buy"
						)}
					>
						{formatQuantity(remainingQuantity)}
					</div>
				</div>
			</div>

			{/* P&L Summary (if closed or partially closed) */}
			{hasExits && (
				<div className="mt-m-300 border-t border-stroke-100 pt-m-300">
					<div className="flex items-center justify-between">
						<span className="text-small text-txt-300">{t("realizedPnL")}</span>
						<PnLDisplay value={totalPnl} size="lg" />
					</div>
					{tickSize && tickValue && (
						<div className="mt-s-100 text-caption text-txt-300">
							{pnlPerUnit >= 0 ? "+" : ""}
							{formatPrice(pnlPerUnit)} / {t("contract")}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
