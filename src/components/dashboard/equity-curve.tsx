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
import { cn } from "@/lib/utils"
import { getEquityCurve } from "@/app/actions/analytics"
import type { EquityPoint } from "@/types"

type Period = "month" | "year" | "all"

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

const formatDate = (dateStr: string): string => {
	const date = new Date(dateStr)
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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
}

const PeriodToggle = ({ period, onChange, disabled }: PeriodToggleProps) => {
	const options: { value: Period; label: string }[] = [
		{ value: "month", label: "Month" },
		{ value: "year", label: "Year" },
		{ value: "all", label: "All" },
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

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (active && payload && payload.length > 0) {
		const data = payload[0].payload
		// Calculate drawdown value: if we're X% down from peak, the dollar amount is
		// accountEquity * (drawdown / (100 - drawdown))
		const drawdownValue = data.drawdown > 0
			? data.accountEquity * (data.drawdown / (100 - data.drawdown))
			: 0
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-s-300 shadow-lg">
				<p className="text-tiny text-txt-300">{formatDate(label || "")}</p>
				<p className="text-small font-semibold text-txt-100">
					{formatCurrency(data.accountEquity)}
				</p>
				{data.drawdown > 0 && (
					<p className="text-tiny text-trade-sell">
						Drawdown: {formatCurrency(drawdownValue)} ({data.drawdown.toFixed(1)}%)
					</p>
				)}
			</div>
		)
	}
	return null
}

export const EquityCurve = ({ data: initialData }: EquityCurveProps) => {
	const [period, setPeriod] = useState<Period>("month")
	const [data, setData] = useState<EquityPoint[]>(initialData)
	const [isPending, startTransition] = useTransition()

	const handlePeriodChange = (newPeriod: Period) => {
		setPeriod(newPeriod)
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

			const result = await getEquityCurve(dateFrom, dateTo)
			if (result.status === "success" && result.data) {
				setData(result.data)
			}
		})
	}

	if (data.length === 0 && !isPending) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center justify-between">
					<h2 className="text-body font-semibold text-txt-100">Equity Curve</h2>
					<PeriodToggle period={period} onChange={handlePeriodChange} />
				</div>
				<div className="mt-m-400 flex h-64 items-center justify-center text-txt-300">
					No trade data available
				</div>
			</div>
		)
	}

	const minEquity = Math.min(...data.map((d) => d.accountEquity))
	const maxEquity = Math.max(...data.map((d) => d.accountEquity))
	const padding = (maxEquity - minEquity) * 0.1 || 100

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			<div className="flex items-center justify-between">
				<h2 className="text-body font-semibold text-txt-100">Equity Curve</h2>
				<PeriodToggle period={period} onChange={handlePeriodChange} disabled={isPending} />
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
							dataKey="date"
							tickFormatter={formatDate}
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
