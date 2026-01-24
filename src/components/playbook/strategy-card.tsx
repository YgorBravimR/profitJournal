"use client"

import { useState } from "react"
import Link from "next/link"
import {
	Target,
	TrendingUp,
	TrendingDown,
	MoreVertical,
	Edit,
	Trash2,
	Eye,
	CheckCircle,
	XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StrategyWithStats } from "@/app/actions/strategies"

interface StrategyCardProps {
	strategy: StrategyWithStats
	onEdit: (strategy: StrategyWithStats) => void
	onDelete: (strategyId: string) => void
}

const formatCurrency = (value: number): string => {
	const absValue = Math.abs(value)
	if (absValue >= 1000) {
		return `${value >= 0 ? "+" : "-"}$${(absValue / 1000).toFixed(1)}K`
	}
	return `${value >= 0 ? "+" : "-"}$${absValue.toFixed(0)}`
}

const formatProfitFactor = (value: number): string => {
	if (!Number.isFinite(value)) return "∞"
	if (value === 0) return "0.00"
	return value.toFixed(2)
}

export const StrategyCard = ({ strategy, onEdit, onDelete }: StrategyCardProps) => {
	const [showMenu, setShowMenu] = useState(false)

	const complianceColor =
		strategy.compliance >= 80
			? "text-trade-buy"
			: strategy.compliance >= 50
				? "text-warning"
				: "text-trade-sell"

	const pnlColor = strategy.totalPnl >= 0 ? "text-trade-buy" : "text-trade-sell"

	return (
		<div className="border-bg-300 bg-bg-200 hover:border-bg-300/80 group relative rounded-lg border p-m-500 transition-all hover:shadow-md">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-s-300">
					<div className="bg-acc-100/20 text-acc-100 flex h-10 w-10 items-center justify-center rounded-lg">
						<Target className="h-5 w-5" />
					</div>
					<div>
						<div className="flex items-center gap-s-200">
							<span className="bg-bg-300 text-txt-200 rounded px-s-200 py-s-100 font-mono text-tiny">
								{strategy.code}
							</span>
							<h3 className="text-body text-txt-100 font-semibold">{strategy.name}</h3>
						</div>
						{strategy.description && (
							<p className="text-tiny text-txt-300 mt-s-100 line-clamp-1">
								{strategy.description}
							</p>
						)}
					</div>
				</div>

				{/* Menu */}
				<div className="relative">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => setShowMenu(!showMenu)}
					>
						<MoreVertical className="h-4 w-4" />
					</Button>
					{showMenu && (
						<>
							<div
								className="fixed inset-0 z-10"
								onClick={() => setShowMenu(false)}
							/>
							<div className="border-bg-300 bg-bg-100 absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border py-1 shadow-lg">
								<Link
									href={`/playbook/${strategy.id}`}
									className="text-txt-200 hover:bg-bg-200 flex w-full items-center gap-s-200 px-s-300 py-s-200 text-left text-small"
								>
									<Eye className="h-4 w-4" />
									View Details
								</Link>
								<button
									type="button"
									onClick={() => {
										setShowMenu(false)
										onEdit(strategy)
									}}
									className="text-txt-200 hover:bg-bg-200 flex w-full items-center gap-s-200 px-s-300 py-s-200 text-left text-small"
								>
									<Edit className="h-4 w-4" />
									Edit
								</button>
								<button
									type="button"
									onClick={() => {
										setShowMenu(false)
										onDelete(strategy.id)
									}}
									className="text-fb-error hover:bg-bg-200 flex w-full items-center gap-s-200 px-s-300 py-s-200 text-left text-small"
								>
									<Trash2 className="h-4 w-4" />
									Delete
								</button>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Stats Grid */}
			<div className="mt-m-400 grid grid-cols-2 gap-s-300 sm:grid-cols-4">
				<div className="bg-bg-100 rounded-lg p-s-300 text-center">
					<p className="text-tiny text-txt-300">Trades</p>
					<p className="text-body text-txt-100 mt-s-100 font-bold">
						{strategy.tradeCount}
					</p>
				</div>
				<div className="bg-bg-100 rounded-lg p-s-300 text-center">
					<p className="text-tiny text-txt-300">P&L</p>
					<p className={`text-body mt-s-100 font-bold ${pnlColor}`}>
						{formatCurrency(strategy.totalPnl)}
					</p>
				</div>
				<div className="bg-bg-100 rounded-lg p-s-300 text-center">
					<p className="text-tiny text-txt-300">Win Rate</p>
					<p className="text-body text-txt-100 mt-s-100 font-bold">
						{strategy.winRate.toFixed(1)}%
					</p>
				</div>
				<div className="bg-bg-100 rounded-lg p-s-300 text-center">
					<p className="text-tiny text-txt-300">Avg R</p>
					<p
						className={`text-body mt-s-100 font-bold ${
							strategy.avgR >= 0 ? "text-trade-buy" : "text-trade-sell"
						}`}
					>
						{strategy.avgR >= 0 ? "+" : ""}
						{strategy.avgR.toFixed(2)}R
					</p>
				</div>
			</div>

			{/* Compliance Bar */}
			<div className="mt-m-400">
				<div className="flex items-center justify-between">
					<span className="text-tiny text-txt-300">Plan Compliance</span>
					<span className={`text-small font-semibold ${complianceColor}`}>
						{strategy.compliance.toFixed(0)}%
					</span>
				</div>
				<div className="bg-bg-300 mt-s-200 h-2 w-full overflow-hidden rounded-full">
					<div
						className={`h-full rounded-full transition-all ${
							strategy.compliance >= 80
								? "bg-trade-buy"
								: strategy.compliance >= 50
									? "bg-warning"
									: "bg-trade-sell"
						}`}
						style={{ width: `${Math.min(strategy.compliance, 100)}%` }}
					/>
				</div>
			</div>

			{/* Target R and Risk */}
			{(strategy.targetRMultiple || strategy.maxRiskPercent) && (
				<div className="mt-m-400 flex items-center gap-m-400">
					{strategy.targetRMultiple && (
						<div className="flex items-center gap-s-100">
							<TrendingUp className="text-trade-buy h-4 w-4" />
							<span className="text-tiny text-txt-300">Target:</span>
							<span className="text-small text-txt-100 font-medium">
								{Number(strategy.targetRMultiple).toFixed(1)}R
							</span>
						</div>
					)}
					{strategy.maxRiskPercent && (
						<div className="flex items-center gap-s-100">
							<TrendingDown className="text-trade-sell h-4 w-4" />
							<span className="text-tiny text-txt-300">Max Risk:</span>
							<span className="text-small text-txt-100 font-medium">
								{Number(strategy.maxRiskPercent).toFixed(1)}%
							</span>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
