import { PageHeader } from "@/components/layout"

const ReportsPage = () => {
	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="Performance Reports"
				description="Weekly and monthly trading summaries"
			/>
			<div className="flex-1 p-m-600">
				<div className="grid grid-cols-1 gap-m-600 lg:grid-cols-2">
					{/* Report Selector */}
					<div className="lg:col-span-2">
						<div className="flex gap-m-400">
							<button
								type="button"
								className="rounded-md bg-acc-100/10 px-m-500 py-s-300 text-small font-medium text-acc-100"
							>
								Weekly
							</button>
							<button
								type="button"
								className="rounded-md px-m-500 py-s-300 text-small text-txt-200 hover:bg-bg-200"
							>
								Monthly
							</button>
						</div>
					</div>

					{/* Report Content Placeholder */}
					<div className="lg:col-span-2">
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-600">
							<h2 className="text-h3 font-semibold text-txt-100">Weekly Report</h2>
							<p className="mt-s-200 text-small text-txt-300">
								Week of January 20 - January 26, 2025
							</p>
							<div className="mt-l-700 flex h-64 items-center justify-center text-txt-300">
								Report generation coming in Phase 6
							</div>
						</div>
					</div>

					{/* Mistake Cost Analysis Placeholder */}
					<div className="lg:col-span-2">
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">
								Mistake Cost Analysis
							</h2>
							<div className="mt-m-400 flex h-48 items-center justify-center text-txt-300">
								Mistake cost breakdown coming in Phase 6
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ReportsPage
