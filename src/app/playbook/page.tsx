import { Plus } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"

const PlaybookPage = () => {
	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="Strategy Playbook"
				description="Define and track your trading strategies"
				action={
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						New Strategy
					</Button>
				}
			/>
			<div className="flex-1 p-m-600">
				<div className="grid grid-cols-1 gap-m-600 lg:grid-cols-3">
					{/* Compliance Overview Placeholder */}
					<div className="lg:col-span-3">
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
							<h2 className="text-body font-semibold text-txt-100">
								Compliance Overview
							</h2>
							<div className="mt-m-400 flex h-24 items-center justify-center text-txt-300">
								Compliance dashboard coming in Phase 5
							</div>
						</div>
					</div>

					{/* Strategy Cards Placeholder */}
					<div className="lg:col-span-3">
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-l-700">
							<div className="flex flex-col items-center justify-center text-center">
								<p className="text-body text-txt-200">No strategies defined yet</p>
								<p className="mt-s-200 text-small text-txt-300">
									Create your first trading strategy
								</p>
								<Button variant="outline" className="mt-m-500">
									<Plus className="mr-2 h-4 w-4" />
									Add Strategy
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default PlaybookPage
