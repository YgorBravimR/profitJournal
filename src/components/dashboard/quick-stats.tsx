"use client"

import { Flame, Trophy, AlertTriangle, Activity } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import type { StreakData, OverallStats } from "@/types"

interface QuickStatsProps {
	streakData: StreakData | null
	stats: OverallStats | null
}

const formatCurrency = (value: number): string => {
	const absValue = Math.abs(value)
	if (absValue >= 1000) {
		return `${value >= 0 ? "+" : "-"}$${(absValue / 1000).toFixed(1)}K`
	}
	return `${value >= 0 ? "+" : "-"}$${absValue.toFixed(0)}`
}

const formatDate = (dateStr: string, locale: string): string => {
	const date = new Date(dateStr)
	return date.toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US", { month: "short", day: "numeric" })
}

interface StatRowProps {
	icon: React.ReactNode
	label: string
	value: string
	subValue?: string
	valueClass?: string
}

const StatRow = ({ icon, label, value, subValue, valueClass }: StatRowProps) => (
	<div className="flex items-center justify-between border-b border-bg-300 pb-s-300">
		<div className="flex items-center gap-s-200">
			<span className="text-txt-300">{icon}</span>
			<span className="text-small text-txt-200">{label}</span>
		</div>
		<div className="text-right">
			<span className={`text-small font-medium ${valueClass || "text-txt-100"}`}>
				{value}
			</span>
			{subValue && (
				<span className="ml-s-200 text-tiny text-txt-300">{subValue}</span>
			)}
		</div>
	</div>
)

export const QuickStats = ({ streakData, stats }: QuickStatsProps) => {
	const t = useTranslations("dashboard.quickStats")
	const locale = useLocale()

	const getStreakDisplay = () => {
		if (!streakData || streakData.currentStreakType === "none") {
			return { value: "0", label: "", colorClass: "text-txt-300" }
		}

		const isWinStreak = streakData.currentStreakType === "win"
		return {
			value: `${streakData.currentStreak}`,
			label: isWinStreak ? t("w") : t("l"),
			colorClass: isWinStreak ? "text-trade-buy" : "text-trade-sell",
		}
	}

	const streak = getStreakDisplay()

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			<h2 className="text-body font-semibold text-txt-100">{t("title")}</h2>
			<div className="mt-m-400 space-y-m-400">
				<StatRow
					icon={<Flame className="h-4 w-4" />}
					label={t("currentStreak")}
					value={streak.value + streak.label}
					valueClass={streak.colorClass}
				/>
				<StatRow
					icon={<Trophy className="h-4 w-4" />}
					label={t("bestDay")}
					value={streakData?.bestDay ? formatCurrency(streakData.bestDay.pnl) : "--"}
					subValue={streakData?.bestDay ? formatDate(streakData.bestDay.date, locale) : undefined}
					valueClass="text-trade-buy"
				/>
				<StatRow
					icon={<AlertTriangle className="h-4 w-4" />}
					label={t("worstDay")}
					value={streakData?.worstDay ? formatCurrency(streakData.worstDay.pnl) : "--"}
					subValue={streakData?.worstDay ? formatDate(streakData.worstDay.date, locale) : undefined}
					valueClass={streakData?.worstDay && streakData.worstDay.pnl >= 0 ? "text-trade-buy" : "text-trade-sell"}
				/>
				<StatRow
					icon={<Activity className="h-4 w-4" />}
					label={t("totalTrades")}
					value={stats?.totalTrades.toString() || "--"}
				/>
				<div className="mt-m-500 grid grid-cols-2 gap-s-300 pt-m-400">
					<div className="rounded-md bg-bg-100 p-s-300 text-center">
						<p className="text-tiny text-txt-300">{t("longestWin")}</p>
						<p className="mt-s-100 text-body font-semibold text-trade-buy">
							{streakData?.longestWinStreak || 0}
						</p>
					</div>
					<div className="rounded-md bg-bg-100 p-s-300 text-center">
						<p className="text-tiny text-txt-300">{t("longestLoss")}</p>
						<p className="mt-s-100 text-body font-semibold text-trade-sell">
							{streakData?.longestLossStreak || 0}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
