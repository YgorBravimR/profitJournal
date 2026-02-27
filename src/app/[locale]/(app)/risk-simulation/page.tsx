import { getActiveMonthlyPlan } from "@/app/actions/monthly-plans"
import { listActiveRiskProfiles } from "@/app/actions/risk-profiles"
import { RiskSimulationContent } from "@/components/risk-simulation"

export const dynamic = "force-dynamic"

const RiskSimulationPage = async () => {
	const [planResponse, profilesResponse] = await Promise.all([
		getActiveMonthlyPlan(),
		listActiveRiskProfiles(),
	])

	const monthlyPlan =
		planResponse.status === "success" ? (planResponse.data ?? null) : null
	const riskProfiles =
		profilesResponse.status === "success" ? (profilesResponse.data ?? []) : []

	return (
		<div className="px-m-400 py-m-500 container mx-auto max-w-7xl">
			<RiskSimulationContent
				monthlyPlan={monthlyPlan}
				riskProfiles={riskProfiles}
			/>
		</div>
	)
}

export default RiskSimulationPage
