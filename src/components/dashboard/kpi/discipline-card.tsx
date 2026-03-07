"use client"

import { useTranslations } from "next-intl"
import { formatChartPercent } from "@/lib/formatting"
import { StatCard, TrendIcon, type TrendType } from "@/components/shared"
import { getThresholdColorClass } from "./helpers"
import type { DisciplineData } from "@/types"

interface DisciplineCardProps {
	discipline: DisciplineData | null
}

const DisciplineCard = ({ discipline }: DisciplineCardProps) => {
	const t = useTranslations("dashboard.kpi")

	const colorClass = discipline && discipline.totalTrades > 0
		? getThresholdColorClass(discipline.score, 50)
		: "text-txt-100"

	return (
		<StatCard
			label={t("discipline")}
			value={discipline ? formatChartPercent(discipline.score, false) : "--"}
			valueColorClass={colorClass}
			indicator={discipline?.trend ? <TrendIcon trend={discipline.trend as TrendType} /> : undefined}
			subValue={
				discipline
					? `${discipline.followedCount}/${discipline.totalTrades} ${t("followed")}`
					: undefined
			}
		/>
	)
}

export { DisciplineCard }
