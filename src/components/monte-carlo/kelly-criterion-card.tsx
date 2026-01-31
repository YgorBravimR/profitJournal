"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle, Info, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SimulationStatistics } from "@/types/monte-carlo"

interface KellyCriterionCardProps {
	statistics: SimulationStatistics
	initialBalance: number
	currency?: string
}

const formatKellyPercent = (value: number): string => `${value.toFixed(2)}%`

const formatKellyCurrency = (value: number, symbol = "$"): string =>
	`${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export const KellyCriterionCard = ({
	statistics,
	initialBalance,
	currency = "$",
}: KellyCriterionCardProps) => {
	const t = useTranslations("monteCarlo.metrics")

	const {
		kellyFull,
		kellyHalf,
		kellyQuarter,
		kellyRecommendation,
		kellyLevel,
	} = statistics

	const quarterKellyRisk = (kellyQuarter / 100) * initialBalance
	const halfKellyRisk = (kellyHalf / 100) * initialBalance
	const fullKellyRisk = (kellyFull / 100) * initialBalance

	const levelConfig = {
		aggressive: {
			Icon: AlertTriangle,
			color: "text-fb-warning",
			bgColor: "bg-fb-warning/10 border-fb-warning/30",
		},
		balanced: {
			Icon: Info,
			color: "text-accent-primary",
			bgColor: "bg-accent-primary/10 border-accent-primary/30",
		},
		conservative: {
			Icon: CheckCircle,
			color: "text-trade-buy",
			bgColor: "bg-trade-buy/10 border-trade-buy/30",
		},
	}

	const {
		Icon: LevelIcon,
		color: levelColor,
		bgColor: levelBgColor,
	} = levelConfig[kellyLevel]

	return (
		<div className="border-bg-300 bg-bg-200 p-m-500 rounded-lg border">
			<div className="mb-m-400 flex items-start justify-between">
				<div>
					<h3 className="text-body text-txt-100 font-semibold">{t("kelly")}</h3>
					<p className="mt-s-100 text-tiny text-txt-300">
						{t("kellyDescription")}
					</p>
				</div>
			</div>

			{/* Kelly Values */}
			<div className="mb-m-400 gap-m-300 grid grid-cols-3">
				<div
					className={cn(
						"p-m-300 rounded-lg border text-center",
						kellyLevel === "conservative"
							? levelBgColor
							: "border-bg-300 bg-bg-100"
					)}
				>
					<p className="text-tiny text-txt-300">{t("quarterKelly")}</p>
					<p className="text-h4 text-txt-100 font-bold">
						{formatKellyPercent(kellyQuarter)}
					</p>
					<p className="text-tiny text-txt-300">
						{formatKellyCurrency(quarterKellyRisk, currency)}/trade
					</p>
				</div>
				<div
					className={cn(
						"p-m-300 rounded-lg border text-center",
						kellyLevel === "balanced" ? levelBgColor : "border-bg-300 bg-bg-100"
					)}
				>
					<p className="text-tiny text-txt-300">{t("halfKelly")}</p>
					<p className="text-h4 text-txt-100 font-bold">
						{formatKellyPercent(kellyHalf)}
					</p>
					<p className="text-tiny text-txt-300">
						{formatKellyCurrency(halfKellyRisk, currency)}/trade
					</p>
				</div>
				<div
					className={cn(
						"p-m-300 rounded-lg border text-center",
						kellyLevel === "aggressive"
							? levelBgColor
							: "border-bg-300 bg-bg-100"
					)}
				>
					<p className="text-tiny text-txt-300">{t("fullKelly")}</p>
					<p className="text-h4 text-txt-100 font-bold">
						{formatKellyPercent(kellyFull)}
					</p>
					<p className="text-tiny text-txt-300">
						{formatKellyCurrency(fullKellyRisk, currency)}/trade
					</p>
				</div>
			</div>

			{/* Recommendation */}
			<div className={cn("p-m-300 rounded-lg border", levelBgColor)}>
				<div className="gap-s-200 flex items-start">
					<LevelIcon
						className={cn("mt-0.5 h-4 w-4 flex-shrink-0", levelColor)}
					/>
					<p className="text-small text-txt-100">{kellyRecommendation}</p>
				</div>
			</div>

			{/* Position Size Examples */}
			<div className="mt-m-400 border-bg-300 pt-m-400 border-t">
				<p className="mb-s-200 text-tiny text-txt-200 font-medium">
					Recommended (Quarter Kelly) position sizes:
				</p>
				<div className="space-y-s-100 text-tiny text-txt-300">
					<p>
						• {formatKellyCurrency(10000, currency)} account: Risk{" "}
						{formatKellyCurrency((kellyQuarter / 100) * 10000, currency)} per
						trade
					</p>
					<p>
						• {formatKellyCurrency(25000, currency)} account: Risk{" "}
						{formatKellyCurrency((kellyQuarter / 100) * 25000, currency)} per
						trade
					</p>
					<p>
						• {formatKellyCurrency(50000, currency)} account: Risk{" "}
						{formatKellyCurrency((kellyQuarter / 100) * 50000, currency)} per
						trade
					</p>
				</div>
			</div>
		</div>
	)
}
