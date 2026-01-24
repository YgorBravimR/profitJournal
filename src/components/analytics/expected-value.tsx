"use client"

import { Calculator, TrendingUp, TrendingDown, Info } from "lucide-react"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ExpectedValueData } from "@/types"

const StatLabel = ({
	label,
	tooltip,
}: {
	label: string
	tooltip: string
}) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<p className="inline-flex cursor-help items-center gap-s-100 text-tiny text-txt-300">
				{label}
				<Info className="h-3 w-3" />
			</p>
		</TooltipTrigger>
		<TooltipContent
			side="top"
			className="border-bg-300 bg-bg-100 text-txt-200 max-w-xs border p-s-300 shadow-lg"
		>
			{tooltip}
		</TooltipContent>
	</Tooltip>
)

interface ExpectedValueProps {
	data: ExpectedValueData | null
}

const formatCurrency = (value: number): string => {
	const absValue = Math.abs(value)
	if (absValue >= 1000) {
		return `${value >= 0 ? "+" : "-"}$${(absValue / 1000).toFixed(1)}K`
	}
	return `${value >= 0 ? "+" : "-"}$${absValue.toFixed(2)}`
}

export const ExpectedValue = ({ data }: ExpectedValueProps) => {
	if (!data || data.sampleSize === 0) {
		return (
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center gap-s-200">
					<Calculator className="h-5 w-5 text-txt-300" />
					<h3 className="text-body font-semibold text-txt-100">
						Expected Value
					</h3>
				</div>
				<div className="mt-m-400 flex h-32 items-center justify-center text-txt-300">
					Not enough trade data to calculate expected value
				</div>
			</div>
		)
	}

	const isPositiveEV = data.expectedValue >= 0

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-s-200">
					<Calculator className="h-5 w-5 text-txt-300" />
					<h3 className="text-body font-semibold text-txt-100">
						Expected Value
					</h3>
				</div>
				<span className="text-tiny text-txt-300">
					Based on {data.sampleSize} trades
				</span>
			</div>

			{/* Main EV Display */}
			<div className="mt-m-500 flex items-center justify-center">
				<div className="text-center">
					<p className="text-tiny text-txt-300">Expected Value per Trade</p>
					<div className="mt-s-200 flex items-center justify-center gap-s-200">
						{isPositiveEV ? (
							<TrendingUp className="h-8 w-8 text-trade-buy" />
						) : (
							<TrendingDown className="h-8 w-8 text-trade-sell" />
						)}
						<span
							className={`text-h2 font-bold ${
								isPositiveEV ? "text-trade-buy" : "text-trade-sell"
							}`}
						>
							{formatCurrency(data.expectedValue)}
						</span>
					</div>
				</div>
			</div>

			{/* Breakdown */}
			<div className="mt-m-600 grid grid-cols-2 gap-m-400 md:grid-cols-4">
				<div className="rounded-lg bg-bg-100 p-s-300 text-center">
					<StatLabel
						label="Win Rate"
						tooltip="Percentage of trades that were profitable"
					/>
					<p className="mt-s-100 text-body font-bold text-txt-100">
						{data.winRate.toFixed(1)}%
					</p>
				</div>
				<div className="rounded-lg bg-bg-100 p-s-300 text-center">
					<StatLabel
						label="Avg Win"
						tooltip="Average profit on winning trades"
					/>
					<p className="mt-s-100 text-body font-bold text-trade-buy">
						+${data.avgWin.toFixed(2)}
					</p>
				</div>
				<div className="rounded-lg bg-bg-100 p-s-300 text-center">
					<StatLabel
						label="Avg Loss"
						tooltip="Average loss on losing trades"
					/>
					<p className="mt-s-100 text-body font-bold text-trade-sell">
						-${data.avgLoss.toFixed(2)}
					</p>
				</div>
				<div className="rounded-lg bg-bg-100 p-s-300 text-center">
					<StatLabel
						label="100 Trade Projection"
						tooltip="Expected total P&L if you take 100 trades with the same edge"
					/>
					<p
						className={`mt-s-100 text-body font-bold ${
							data.projectedPnl100 >= 0 ? "text-trade-buy" : "text-trade-sell"
						}`}
					>
						{formatCurrency(data.projectedPnl100)}
					</p>
				</div>
			</div>

			{/* Formula Explanation */}
			<div className="mt-m-500 rounded-lg bg-bg-100 p-m-400">
				<div className="flex items-start gap-s-200">
					<Info className="mt-s-100 h-4 w-4 shrink-0 text-txt-300" />
					<div className="text-tiny text-txt-300">
						<p className="font-medium text-txt-200">Expected Value Formula:</p>
						<p className="mt-s-100 font-mono">
							EV = (Win% × Avg Win) - (Loss% × Avg Loss)
						</p>
						<p className="mt-s-200">
							EV = ({data.winRate.toFixed(1)}% × ${data.avgWin.toFixed(2)}) - (
							{(100 - data.winRate).toFixed(1)}% × ${data.avgLoss.toFixed(2)})
						</p>
						<p className="mt-s-200">
							EV = ${((data.winRate / 100) * data.avgWin).toFixed(2)} - $
							{(((100 - data.winRate) / 100) * data.avgLoss).toFixed(2)} ={" "}
							<span
								className={
									isPositiveEV ? "text-trade-buy" : "text-trade-sell"
								}
							>
								{formatCurrency(data.expectedValue)}
							</span>
						</p>
					</div>
				</div>
			</div>

			{/* Interpretation */}
			<div className="mt-m-400">
				<p className="text-small text-txt-200">
					{isPositiveEV ? (
						<>
							Your trading system has a{" "}
							<span className="font-semibold text-trade-buy">positive edge</span>.
							On average, you can expect to make{" "}
							<span className="font-semibold text-trade-buy">
								{formatCurrency(data.expectedValue)}
							</span>{" "}
							per trade over the long run.
						</>
					) : (
						<>
							Your trading system currently has a{" "}
							<span className="font-semibold text-trade-sell">negative edge</span>.
							On average, you can expect to lose{" "}
							<span className="font-semibold text-trade-sell">
								{formatCurrency(Math.abs(data.expectedValue))}
							</span>{" "}
							per trade. Consider reviewing your strategy or risk management.
						</>
					)}
				</p>
			</div>
		</div>
	)
}
