"use client"

import {
	CheckCircle,
	XCircle,
	Target,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
} from "lucide-react"
import type { ComplianceOverview } from "@/app/actions/strategies"

interface ComplianceDashboardProps {
	data: ComplianceOverview | null
}

export const ComplianceDashboard = ({ data }: ComplianceDashboardProps) => {
	if (!data) {
		return (
			<div className="border-bg-300 bg-bg-200 rounded-lg border p-m-500">
				<h2 className="text-body text-txt-100 font-semibold">Compliance Overview</h2>
				<div className="text-txt-300 mt-m-400 flex h-24 items-center justify-center">
					Unable to load compliance data
				</div>
			</div>
		)
	}

	const complianceColor =
		data.overallCompliance >= 80
			? "text-trade-buy"
			: data.overallCompliance >= 50
				? "text-warning"
				: "text-trade-sell"

	const complianceBgColor =
		data.overallCompliance >= 80
			? "bg-trade-buy"
			: data.overallCompliance >= 50
				? "bg-warning"
				: "bg-trade-sell"

	return (
		<div className="border-bg-300 bg-bg-200 rounded-lg border p-m-500">
			<h2 className="text-body text-txt-100 font-semibold">Compliance Overview</h2>

			{data.totalTrackedTrades === 0 ? (
				<div className="text-txt-300 mt-m-400 flex h-24 items-center justify-center text-center">
					<div>
						<p>No compliance data yet</p>
						<p className="text-tiny mt-s-100">
							Track your plan adherence when logging trades
						</p>
					</div>
				</div>
			) : (
				<div className="mt-m-400">
					{/* Main Compliance Score */}
					<div className="flex items-center gap-m-500">
						<div className="relative h-24 w-24">
							<svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke="rgb(43 47 54)"
									strokeWidth="8"
								/>
								<circle
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke={
										data.overallCompliance >= 80
											? "rgb(0 255 150)"
											: data.overallCompliance >= 50
												? "rgb(252 213 53)"
												: "rgb(128 128 255)"
									}
									strokeWidth="8"
									strokeLinecap="round"
									strokeDasharray={`${(data.overallCompliance / 100) * 251.2} 251.2`}
								/>
							</svg>
							<div className="absolute inset-0 flex items-center justify-center">
								<span className={`text-h3 font-bold ${complianceColor}`}>
									{data.overallCompliance.toFixed(0)}%
								</span>
							</div>
						</div>

						<div className="flex-1">
							<p className="text-small text-txt-200">
								You followed your trading plan on{" "}
								<span className="text-txt-100 font-semibold">
									{data.followedPlanCount}
								</span>{" "}
								out of{" "}
								<span className="text-txt-100 font-semibold">
									{data.totalTrackedTrades}
								</span>{" "}
								tracked trades
							</p>

							{/* Compliance Bar */}
							<div className="mt-s-300">
								<div className="bg-bg-300 flex h-4 w-full overflow-hidden rounded-full">
									<div
										className="bg-trade-buy flex items-center justify-center transition-all"
										style={{
											width: `${(data.followedPlanCount / data.totalTrackedTrades) * 100}%`,
										}}
									/>
									<div
										className="bg-trade-sell flex items-center justify-center transition-all"
										style={{
											width: `${(data.notFollowedCount / data.totalTrackedTrades) * 100}%`,
										}}
									/>
								</div>
								<div className="mt-s-200 flex justify-between text-tiny">
									<span className="text-trade-buy flex items-center gap-s-100">
										<CheckCircle className="h-3 w-3" />
										Followed: {data.followedPlanCount}
									</span>
									<span className="text-trade-sell flex items-center gap-s-100">
										<XCircle className="h-3 w-3" />
										Deviated: {data.notFollowedCount}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Strategy Highlights */}
					{(data.topPerformingStrategy || data.needsAttentionStrategy) && (
						<div className="mt-m-500 grid grid-cols-1 gap-s-300 sm:grid-cols-2">
							{data.topPerformingStrategy && (
								<div className="bg-trade-buy/10 border-trade-buy/30 flex items-center gap-s-300 rounded-lg border p-s-300">
									<TrendingUp className="text-trade-buy h-5 w-5 shrink-0" />
									<div>
										<p className="text-tiny text-txt-300">Best Compliance</p>
										<p className="text-small text-txt-100 font-semibold">
											{data.topPerformingStrategy.name}
										</p>
										<p className="text-tiny text-trade-buy">
											{data.topPerformingStrategy.compliance.toFixed(0)}% compliance
										</p>
									</div>
								</div>
							)}

							{data.needsAttentionStrategy && (
								<div className="bg-warning/10 border-warning/30 flex items-center gap-s-300 rounded-lg border p-s-300">
									<AlertTriangle className="text-warning h-5 w-5 shrink-0" />
									<div>
										<p className="text-tiny text-txt-300">Needs Attention</p>
										<p className="text-small text-txt-100 font-semibold">
											{data.needsAttentionStrategy.name}
										</p>
										<p className="text-tiny text-warning">
											{data.needsAttentionStrategy.compliance.toFixed(0)}% compliance
										</p>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Quick Stats */}
					<div className="border-bg-300 mt-m-500 flex items-center justify-center gap-m-600 border-t pt-m-400">
						<div className="flex items-center gap-s-200">
							<Target className="text-acc-100 h-4 w-4" />
							<span className="text-small text-txt-200">
								<span className="text-txt-100 font-semibold">
									{data.strategiesCount}
								</span>{" "}
								{data.strategiesCount === 1 ? "Strategy" : "Strategies"}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
