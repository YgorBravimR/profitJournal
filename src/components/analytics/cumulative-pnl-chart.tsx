"use client"

import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
} from "recharts"
import { useTranslations, useLocale } from "next-intl"
import type { EquityPoint } from "@/types"

interface CumulativePnlChartProps {
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

const formatDate = (dateStr: string, locale: string): string => {
	const date = new Date(dateStr)
	return date.toLocaleDateString(locale === "pt-BR" ? "pt-BR" : "en-US", { month: "short", day: "numeric" })
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		payload: EquityPoint
	}>
	label?: string
	locale: string
}

const CustomTooltip = ({ active, payload, label, locale }: CustomTooltipProps) => {
	if (active && payload && payload.length > 0) {
		const data = payload[0].payload
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-s-300 shadow-lg">
				<p className="text-tiny text-txt-300">{formatDate(label || "", locale)}</p>
				<p className={`text-small font-semibold ${data.equity >= 0 ? "text-trade-buy" : "text-trade-sell"}`}>
					{data.equity >= 0 ? "+" : ""}{formatCurrency(data.equity)}
				</p>
			</div>
		)
	}
	return null
}

export const CumulativePnlChart = ({ data }: CumulativePnlChartProps) => {
	const t = useTranslations("dashboard.equity")
	const locale = useLocale()

	if (data.length === 0) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">{t("cumulative")}</h2>
				<div className="mt-m-400 flex h-64 items-center justify-center text-txt-300">
					{t("noData")}
				</div>
			</div>
		)
	}

	const minEquity = Math.min(...data.map((d) => d.equity))
	const maxEquity = Math.max(...data.map((d) => d.equity))
	const padding = (maxEquity - minEquity) * 0.1 || 100

	// Determine if overall P&L is positive or negative for color
	const lastEquity = data[data.length - 1]?.equity ?? 0
	const isPositive = lastEquity >= 0
	const strokeColor = isPositive ? "rgb(38 166 91)" : "rgb(234 56 59)"
	const gradientColor = isPositive ? "38, 166, 91" : "234, 56, 59"

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			<h2 className="text-body font-semibold text-txt-100">{t("cumulative")}</h2>
			<div className="mt-m-400 h-64">
				<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
					<AreaChart
						data={data}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={`rgb(${gradientColor})`} stopOpacity={0.3} />
								<stop offset="95%" stopColor={`rgb(${gradientColor})`} stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="rgb(43 47 54)"
							vertical={false}
						/>
						<XAxis
							dataKey="date"
							tickFormatter={(dateStr) => formatDate(dateStr, locale)}
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
						<Tooltip content={<CustomTooltip locale={locale} />} />
						<ReferenceLine y={0} stroke="rgb(43 47 54)" strokeWidth={2} />
						<Area
							type="monotone"
							dataKey="equity"
							stroke={strokeColor}
							strokeWidth={2}
							fill="url(#pnlGradient)"
							dot={false}
							activeDot={{
								r: 4,
								fill: strokeColor,
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
