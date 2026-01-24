import { PageHeader } from "@/components/layout"
import { AnalyticsContent } from "@/components/analytics"
import {
	getPerformanceByVariable,
	getExpectedValue,
	getRDistribution,
} from "@/app/actions/analytics"
import { getTagStats } from "@/app/actions/tags"
import { getUniqueAssets } from "@/app/actions/trades"

const AnalyticsPage = async () => {
	// Fetch all initial data server-side in parallel
	const [
		performanceResult,
		tagStatsResult,
		expectedValueResult,
		rDistributionResult,
		assetsResult,
	] = await Promise.all([
		getPerformanceByVariable("asset"),
		getTagStats(),
		getExpectedValue(),
		getRDistribution(),
		getUniqueAssets(),
	])

	const initialPerformance =
		performanceResult.status === "success" && performanceResult.data
			? performanceResult.data
			: []
	const initialTagStats =
		tagStatsResult.status === "success" && tagStatsResult.data
			? tagStatsResult.data
			: []
	const initialExpectedValue =
		expectedValueResult.status === "success" && expectedValueResult.data
			? expectedValueResult.data
			: null
	const initialRDistribution =
		rDistributionResult.status === "success" && rDistributionResult.data
			? rDistributionResult.data
			: []
	const availableAssets =
		assetsResult.status === "success" && assetsResult.data
			? assetsResult.data
			: []

	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="Analytics"
				description="Deep dive into your trading performance"
			/>
			<div className="flex-1 overflow-auto p-m-600">
				<AnalyticsContent
					initialPerformance={initialPerformance}
					initialTagStats={initialTagStats}
					initialExpectedValue={initialExpectedValue}
					initialRDistribution={initialRDistribution}
					availableAssets={availableAssets}
				/>
			</div>
		</div>
	)
}

export default AnalyticsPage
