import { getDataSourceOptions } from "@/app/actions/monte-carlo"
import { listActiveRiskProfiles } from "@/app/actions/risk-profiles"
import { MonteCarloContent } from "@/components/monte-carlo"

export const dynamic = "force-dynamic"

const MonteCarloPage = async () => {
	const [optionsResponse, profilesResponse] = await Promise.all([
		getDataSourceOptions(),
		listActiveRiskProfiles(),
	])

	const options =
		optionsResponse.status === "success" ? (optionsResponse.data ?? []) : []
	const riskProfiles =
		profilesResponse.status === "success" ? (profilesResponse.data ?? []) : []

	return (
		<div className="px-m-400 py-m-500 container mx-auto max-w-7xl">
			<MonteCarloContent initialOptions={options} riskProfiles={riskProfiles} />
		</div>
	)
}

export default MonteCarloPage
