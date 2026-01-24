import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"

const JournalPage = () => {
	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="Trade Journal"
				description="Review and analyze your trades"
				action={
					<Link href="/journal/new">
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							New Trade
						</Button>
					</Link>
				}
			/>
			<div className="flex-1 p-m-600">
				{/* Filters Placeholder */}
				<div className="mb-m-600 flex flex-wrap items-center gap-m-400">
					<div className="rounded-md border border-bg-300 bg-bg-200 px-m-400 py-s-300 text-small text-txt-200">
						Date Range
					</div>
					<div className="rounded-md border border-bg-300 bg-bg-200 px-m-400 py-s-300 text-small text-txt-200">
						Asset
					</div>
					<div className="rounded-md border border-bg-300 bg-bg-200 px-m-400 py-s-300 text-small text-txt-200">
						Outcome
					</div>
					<div className="rounded-md border border-bg-300 bg-bg-200 px-m-400 py-s-300 text-small text-txt-200">
						Strategy
					</div>
				</div>

				{/* Trade List Placeholder */}
				<div className="rounded-lg border border-bg-300 bg-bg-200 p-l-700">
					<div className="flex flex-col items-center justify-center text-center">
						<p className="text-body text-txt-200">No trades recorded yet</p>
						<p className="mt-s-200 text-small text-txt-300">
							Start by adding your first trade
						</p>
						<Link href="/journal/new" className="mt-m-500">
							<Button variant="outline">
								<Plus className="mr-2 h-4 w-4" />
								Add Trade
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export default JournalPage
