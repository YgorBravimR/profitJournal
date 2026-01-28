import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { TradeForm } from "@/components/journal"
import { getTrade } from "@/app/actions/trades"
import { getStrategies } from "@/app/actions/strategies"
import { getTags } from "@/app/actions/tags"
import { getActiveAssets } from "@/app/actions/assets"
import { getActiveTimeframes } from "@/app/actions/timeframes"

interface EditTradePageProps {
	params: Promise<{ id: string }>
}

const EditTradePage = async ({ params }: EditTradePageProps) => {
	const { id } = await params

	const [tradeResult, strategiesResult, tagsResult, assets, timeframes] =
		await Promise.all([
			getTrade(id),
			getStrategies(),
			getTags(),
			getActiveAssets().catch(() => []),
			getActiveTimeframes().catch(() => []),
		])

	if (tradeResult.status === "error" || !tradeResult.data) {
		notFound()
	}

	const trade = tradeResult.data
	const strategies =
		strategiesResult.status === "success" ? strategiesResult.data || [] : []
	const tags = tagsResult.status === "success" ? tagsResult.data || [] : []

	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title={`Edit ${trade.asset} Trade`}
				description="Update trade details"
				action={
					<Link href={`/journal/${id}`}>
						<Button variant="ghost">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
					</Link>
				}
			/>
			<div className="flex-1 overflow-auto p-m-600">
				<div className="mx-auto max-w-2xl">
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-600">
						<TradeForm
							trade={trade}
							strategies={strategies}
							tags={tags}
							assets={assets}
							timeframes={timeframes}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default EditTradePage
