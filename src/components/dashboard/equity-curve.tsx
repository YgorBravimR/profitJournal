"use client"

import { useState, useTransition } from "react"
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { getEquityCurve, type EquityCurveMode } from "@/app/actions/analytics"
import type { EquityPoint } from "@/types"

type Period = "month" | "year" | "all"
type ViewMode = "days" | "trades"

interface EquityCurveProps {
	data: EquityPoint[]
}

const formatCurrency = (value: number): string => {
	const absValue = Math.abs(value)
	if (absValue >= 1000000) {
		return `${value >= 0 ? "" : "-"}$${(absValue / 1000000).toFixed(1)}M`
	}
	if (absValue >= 1000) {
		return `${value >= 0 ? "" : "-"}$${(absValue / 1000).toFixed(1)}K`
	}
	return `${value >= 0 ? "" : "-"}$${absValue.toFixed(0)}`
}


interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		dataKey: string
		payload: EquityPoint
	}>
	label?: string
}

interface PeriodToggleProps {
	period: Period
	onChange: (period: Period) => void
	disabled?: boolean
	labels: { month: string; year: string; all: string }
}

const PeriodToggle = ({ period, onChange, disabled, labels }: PeriodToggleProps) => {
	const options: { value: Period; label: string }[] = [
		{ value: "month", label: labels.month },
		{ value: "year", label: labels.year },
		{ value: "all", label: labels.all },
	]

	return (
		<div className="flex rounded-lg border border-bg-300 bg-bg-100 p-s-100">
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					onClick={() => onChange(option.value)}
					disabled={disabled}
					className={cn(
						"rounded-md px-s-300 py-s-100 text-tiny font-medium transition-colors",
						period === option.value
							? "bg-acc-100 text-bg-100"
							: "text-txt-300 hover:text-txt-100",
						disabled && "cursor-not-allowed opacity-50"
					)}
				>
					{option.label}
				</button>
			))}
		</div>
	)
}

interface ViewModeToggleProps {
	mode: ViewMode
	onChange: (mode: ViewMode) => void
	disabled?: boolean
	labels: { days: string; trades: string }
}

const ViewModeToggle = ({ mode, onChange, disabled, labels }: ViewModeToggleProps) => {
	const options: { value: ViewMode; label: string }[] = [
		{ value: "days", label: labels.days },
		{ value: "trades", label: labels.trades },
	]

	return (
		<div className="flex rounded-lg border border-bg-300 bg-bg-100 p-s-100">
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					onClick={() => onChange(option.value)}
					disabled={disabled}
					className={cn(
						"rounded-md px-s-300 py-s-100 text-tiny font-medium transition-colors",
						mode === option.value
							? "bg-acc-100 text-bg-100"
							: "text-txt-300 hover:text-txt-100",
						disabled && "cursor-not-allowed opacity-50"
					)}
				>
					{option.label}
				</button>
			))}
		</div>
	)
}

interface TooltipContextProps {
	viewMode: ViewMode
	locale: string
	drawdownLabel: string
}

const createCustomTooltip = ({ viewMode, locale, drawdownLabel }: TooltipContextProps) => {
	const formatDateLocale = (dateStr: string): string => {
		const date = new Date(dateStr)
		return date.toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US", { month: "short", day: "numeric" })
	}

	const CustomTooltipInner = ({ active, payload, label }: CustomTooltipProps) => {
		if (active && payload && payload.length > 0) {
			const data = payload[0].payload
			// Calculate drawdown value: if we're X% down from peak, the dollar amount is
			// accountEquity * (drawdown / (100 - drawdown))
			const drawdownValue = data.drawdown > 0
				? data.accountEquity * (data.drawdown / (100 - data.drawdown))
				: 0

			const labelDisplay = viewMode === "trades" && data.tradeNumber
				? `Trade #${data.tradeNumber}`
				: formatDateLocale(label || "")

			return (
				<div className="rounded-lg border border-bg-300 bg-bg-200 p-s-300 shadow-lg">
					<p className="text-tiny text-txt-300">{labelDisplay}</p>
					{viewMode === "trades" && (
						<p className="text-tiny text-txt-300">{formatDateLocale(data.date)}</p>
					)}
					<p className="text-small font-semibold text-txt-100">
						{formatCurrency(data.accountEquity)}
					</p>
					{data.drawdown > 0 && (
						<p className="text-tiny text-trade-sell">
							{drawdownLabel}: {formatCurrency(drawdownValue)} ({data.drawdown.toFixed(1)}%)
						</p>
					)}
				</div>
			)
		}
		return null
	}
	return CustomTooltipInner
}

export const EquityCurve = ({ data: initialData }: EquityCurveProps) => {
	const t = useTranslations("dashboard.equity")
	const locale = useLocale()
	const [period, setPeriod] = useState<Period>("month")
	const [viewMode, setViewMode] = useState<ViewMode>("days")
	const [data, setData] = useState<EquityPoint[]>(initialData)
	const [isPending, startTransition] = useTransition()

	const periodLabels = {
		month: t("period.month"),
		year: t("period.year"),
		all: t("period.all"),
	}

	const viewModeLabels = {
		days: t("viewMode.days"),
		trades: t("viewMode.trades"),
	}

	const formatDateLocale = (dateStr: string): string => {
		const date = new Date(dateStr)
		return date.toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US", { month: "short", day: "numeric" })
	}

	const fetchData = (newPeriod: Period, newMode: ViewMode) => {
		startTransition(async () => {
			const now = new Date()
			let dateFrom: Date | undefined
			let dateTo: Date | undefined

			if (newPeriod === "month") {
				dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
				dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
			} else if (newPeriod === "year") {
				dateFrom = new Date(now.getFullYear(), 0, 1)
				dateTo = new Date(now.getFullYear(), 11, 31)
			}
			// "all" leaves both undefined

			const mode: EquityCurveMode = newMode === "trades" ? "trade" : "daily"
			const result = await getEquityCurve(dateFrom, dateTo, mode)
			if (result.status === "success" && result.data) {
				setData(result.data)
			}
		})
	}

	const handlePeriodChange = (newPeriod: Period) => {
		setPeriod(newPeriod)
		fetchData(newPeriod, viewMode)
	}

	const handleViewModeChange = (newMode: ViewMode) => {
		setViewMode(newMode)
		fetchData(period, newMode)
	}

	if (data.length === 0 && !isPending) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center justify-between">
					<h2 className="text-body font-semibold text-txt-100">{t("title")}</h2>
					<div className="flex items-center gap-s-200">
						<ViewModeToggle mode={viewMode} onChange={handleViewModeChange} labels={viewModeLabels} />
						<PeriodToggle period={period} onChange={handlePeriodChange} labels={periodLabels} />
					</div>
				</div>
				<div className="mt-m-400 flex h-64 items-center justify-center text-txt-300">
					{t("noData")}
				</div>
			</div>
		)
	}

	const minEquity = Math.min(...data.map((d) => d.accountEquity))
	const maxEquity = Math.max(...data.map((d) => d.accountEquity))
	const padding = (maxEquity - minEquity) * 0.1 || 100

	const CustomTooltip = createCustomTooltip({ viewMode, locale, drawdownLabel: t("drawdown") })

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			<div className="flex items-center justify-between">
				<h2 className="text-body font-semibold text-txt-100">{t("title")}</h2>
				<div className="flex items-center gap-s-200">
					<ViewModeToggle mode={viewMode} onChange={handleViewModeChange} disabled={isPending} labels={viewModeLabels} />
					<PeriodToggle period={period} onChange={handlePeriodChange} disabled={isPending} labels={periodLabels} />
				</div>
			</div>
			<div className={cn("mt-m-400 h-64", isPending && "opacity-50")}>
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={data}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="rgb(204 162 72)" stopOpacity={0.3} />
								<stop offset="95%" stopColor="rgb(204 162 72)" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="rgb(43 47 54)"
							vertical={false}
						/>
						<XAxis
							dataKey={viewMode === "trades" ? "tradeNumber" : "date"}
							tickFormatter={viewMode === "trades" ? (v) => `#${v}` : formatDateLocale}
							stroke="rgb(90 96 106)"
							tick={{ fill: "rgb(90 96 106)", fontSize: 11 }}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							tickFormatter={formatCurrency}
							stroke="rgb(90 96 106)"
							tick={{ fill: "rgb(90 96 106)", fontSize: 11 }}
							tickLine={false}
							axisLine={false}
							domain={[minEquity - padding, maxEquity + padding]}
							width={60}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Area
							type="monotone"
							dataKey="accountEquity"
							stroke="rgb(204 162 72)"
							strokeWidth={2}
							fill="url(#equityGradient)"
							dot={false}
							activeDot={{
								r: 4,
								fill: "rgb(204 162 72)",
								stroke: "rgb(21 25 33)",
								strokeWidth: 2,
							}}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
