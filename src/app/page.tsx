import { PageHeader } from "@/components/layout"

const DashboardPage = () => {
	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="Command Center"
				description="Your trading performance at a glance"
			/>
			<div className="flex-1 p-m-600">
				<div className="grid grid-cols-1 gap-m-600 lg:grid-cols-3">
					{/* KPI Cards Placeholder */}
					<div className="lg:col-span-3">
						<div className="grid grid-cols-2 gap-m-500 md:grid-cols-5">
							{["Net P&L", "Win Rate", "Profit Factor", "Avg R", "Discipline"].map(
								(label) => (
									<div
										key={label}
										className="rounded-lg border border-bg-300 bg-bg-200 p-m-500"
									>
										<p className="text-tiny text-txt-300">{label}</p>
										<p className="mt-s-200 text-h3 font-bold text-txt-100">--</p>
									</div>
								)
							)}
						</div>
					</div>

					{/* Calendar Placeholder */}
					<div className="lg:col-span-2">
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">
								Trading Calendar
							</h2>
							<div className="mt-m-400 flex h-64 items-center justify-center text-txt-300">
								Calendar component coming soon
							</div>
						</div>
					</div>

					{/* Quick Stats Placeholder */}
					<div>
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">Quick Stats</h2>
							<div className="mt-m-400 space-y-m-400">
								{["Current Streak", "Best Day", "Worst Day", "Total Trades"].map(
									(stat) => (
										<div
											key={stat}
											className="flex items-center justify-between border-b border-bg-300 pb-s-300"
										>
											<span className="text-small text-txt-200">{stat}</span>
											<span className="text-small font-medium text-txt-100">
												--
											</span>
										</div>
									)
								)}
							</div>
						</div>
					</div>

					{/* Equity Curve Placeholder */}
					<div className="lg:col-span-3">
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">Equity Curve</h2>
							<div className="mt-m-400 flex h-64 items-center justify-center text-txt-300">
								Equity curve chart coming soon
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default DashboardPage
