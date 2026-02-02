import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { NewTradeTabs } from "@/components/journal"
import { getStrategies } from "@/app/actions/strategies"
import { getTags } from "@/app/actions/tags"
import { getActiveAssets } from "@/app/actions/assets"
import { getActiveTimeframes } from "@/app/actions/timeframes"

interface NewTradePageProps {
	searchParams: Promise<{ returnTo?: string; asset?: string }>
}

const NewTradePage = async ({ searchParams }: NewTradePageProps) => {
	const { returnTo, asset } = await searchParams

	const [strategiesResult, tagsResult, assets, timeframes] = await Promise.all([
		getStrategies(),
		getTags(),
		getActiveAssets().catch(() => []),
		getActiveTimeframes().catch(() => []),
	])

	const strategies =
		strategiesResult.status === "success" ? strategiesResult.data || [] : []
	const tags = tagsResult.status === "success" ? tagsResult.data || [] : []

	// Determine back link based on returnTo
	const backLink = returnTo || "/journal"

	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="New Trade"
				description="Record a new trade entry or import from CSV"
				action={
					<Link href={backLink}>
						<Button variant="ghost">
							<ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
							Back
						</Button>
					</Link>
				}
			/>
			<div className="flex-1 overflow-auto p-m-600">
				<div className="mx-auto max-w-5xl">
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-600">
						<NewTradeTabs
							strategies={strategies}
							tags={tags}
							assets={assets}
							timeframes={timeframes}
							redirectTo={returnTo}
							defaultAssetId={asset}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NewTradePage
