"use client"

import { useTranslations } from "next-intl"
import { formatRMultiple } from "@/lib/calculations"
import { StatCard } from "@/components/shared"
import { cn } from "@/lib/utils"
import { getValueColorClass } from "./helpers"

interface RMultipleBarProps {
	value: number
	colorClass: string
}

const BG_COLOR_MAP: Record<string, string> = {
	"text-trade-buy": "bg-trade-buy",
	"text-trade-sell": "bg-trade-sell",
}

/**
 * Thin horizontal progress bar for R Multiple visualization.
 * Maps |R| to a percentage where 2R = 100% (clamped).
 */
const RMultipleBar = ({ value, colorClass }: RMultipleBarProps) => {
	const width = Math.min(Math.abs(value) / 2, 1) * 100
	const bgClass = BG_COLOR_MAP[colorClass] ?? "bg-txt-300"

	return (
		<div className="bg-bg-300 h-1 w-full overflow-hidden rounded-full">
			<div
				className={cn(bgClass, "h-full rounded-full")}
				style={{ width: `${width}%` }}
			/>
		</div>
	)
}

interface AvgRCardProps {
	averageR: number | null
}

const AvgRCard = ({ averageR }: AvgRCardProps) => {
	const t = useTranslations("dashboard.kpi")
	const colorClass = getValueColorClass(averageR)
	const hasData = averageR !== null

	return (
		<StatCard
			label={t("avgR")}
			value={hasData ? formatRMultiple(averageR) : "--"}
			valueColorClass={colorClass}
			subValue={
				hasData ? (
					<RMultipleBar value={averageR} colorClass={colorClass} />
				) : undefined
			}
		/>
	)
}

export { AvgRCard }
