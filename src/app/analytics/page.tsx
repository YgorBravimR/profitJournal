import { PageHeader } from "@/components/layout"

const AnalyticsPage = () => {
	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="Analytics"
				description="Deep dive into your trading performance"
			/>
			<div className="flex-1 p-m-600">
				<div className="grid grid-cols-1 gap-m-600 lg:grid-cols-2">
					{/* Filter Panel Placeholder */}
					<div className="lg:col-span-2">
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">Filters</h2>
							<div className="mt-m-400 flex h-12 items-center justify-center text-txt-300">
								Filter panel coming in Phase 4
							</div>
						</div>
					</div>

					{/* Variable Comparison Placeholder */}
					<div>
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">
								Performance by Variable
							</h2>
							<div className="mt-m-400 flex h-64 items-center justify-center text-txt-300">
								Variable comparison chart coming in Phase 4
							</div>
						</div>
					</div>

					{/* Tag Cloud Placeholder */}
					<div>
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">Tag Analysis</h2>
							<div className="mt-m-400 flex h-64 items-center justify-center text-txt-300">
								Tag cloud coming in Phase 4
							</div>
						</div>
					</div>

					{/* Expected Value Placeholder */}
					<div>
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">
								Expected Value
							</h2>
							<div className="mt-m-400 flex h-48 items-center justify-center text-txt-300">
								EV calculator coming in Phase 4
							</div>
						</div>
					</div>

					{/* R Distribution Placeholder */}
					<div>
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">
								R-Multiple Distribution
							</h2>
							<div className="mt-m-400 flex h-48 items-center justify-center text-txt-300">
								R distribution histogram coming in Phase 4
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AnalyticsPage
