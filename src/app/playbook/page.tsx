import { PageHeader } from "@/components/layout"
import { PlaybookContent } from "@/components/playbook"
import { getStrategies, getComplianceOverview } from "@/app/actions/strategies"

const PlaybookPage = async () => {
	const [strategiesResult, complianceResult] = await Promise.all([
		getStrategies(),
		getComplianceOverview(),
	])

	const strategies = strategiesResult.status === "success" ? strategiesResult.data || [] : []
	const compliance = complianceResult.status === "success" ? complianceResult.data || null : null

	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="Strategy Playbook"
				description="Define and track your trading strategies"
			/>
			<div className="flex-1 p-m-600">
				<PlaybookContent
					initialStrategies={strategies}
					initialCompliance={compliance}
				/>
			</div>
		</div>
	)
}

export default PlaybookPage
