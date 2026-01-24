import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { TradeCard } from "@/components/journal"
import { getTrades } from "@/app/actions/trades"

interface JournalPageProps {
	searchParams: Promise<{
		page?: string
		asset?: string
		outcome?: string
	}>
}

const JournalPage = async ({ searchParams }: JournalPageProps) => {
	const params = await searchParams
	const page = Number(params.page) || 1
	const limit = 10
	const offset = (page - 1) * limit

	const result = await getTrades(
		{
			assets: params.asset ? [params.asset] : undefined,
			outcomes: params.outcome
				? [params.outcome as "win" | "loss" | "breakeven"]
				: undefined,
		},
		{ limit, offset }
	)

	const trades = result.status === "success" ? result.data?.items || [] : []
	const pagination =
		result.status === "success" ? result.data?.pagination : null
	const totalPages = pagination ? Math.ceil(pagination.total / limit) : 0

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
			<div className="flex-1 overflow-auto p-m-600">
				{/* Stats Summary */}
				{pagination && pagination.total > 0 && (
					<div className="mb-m-600 flex items-center justify-between">
						<p className="text-small text-txt-300">
							Showing {offset + 1}-{Math.min(offset + trades.length, pagination.total)} of{" "}
							{pagination.total} trades
						</p>
					</div>
				)}

				{/* Trade List */}
				{trades.length > 0 ? (
					<div className="space-y-m-400">
						{trades.map((trade) => (
							<TradeCard key={trade.id} trade={trade} />
						))}
					</div>
				) : (
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-l-700">
						<div className="flex flex-col items-center justify-center text-center">
							<div className="mb-m-400 flex h-16 w-16 items-center justify-center rounded-full bg-bg-300">
								<Search className="h-8 w-8 text-txt-300" />
							</div>
							<p className="text-body text-txt-200">No trades recorded yet</p>
							<p className="mt-s-200 text-small text-txt-300">
								Start by adding your first trade
							</p>
							<Link href="/journal/new" className="mt-m-500">
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Add Trade
								</Button>
							</Link>
						</div>
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="mt-m-600 flex items-center justify-center gap-s-200">
						{page > 1 && (
							<Link href={`/journal?page=${page - 1}`}>
								<Button variant="outline" size="sm">
									Previous
								</Button>
							</Link>
						)}
						<span className="px-m-400 text-small text-txt-200">
							Page {page} of {totalPages}
						</span>
						{page < totalPages && (
							<Link href={`/journal?page=${page + 1}`}>
								<Button variant="outline" size="sm">
									Next
								</Button>
							</Link>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default JournalPage
