import { getDataSourceOptions } from "@/app/actions/monte-carlo"
import { MonteCarloContent } from "@/components/monte-carlo"

export default async function MonteCarloPage() {
	const optionsResponse = await getDataSourceOptions()
	const options =
		optionsResponse.status === "success" ? (optionsResponse.data ?? []) : []

	return (
		<div className="px-m-400 py-m-500 container mx-auto max-w-7xl">
			<MonteCarloContent initialOptions={options} />
		</div>
	)
}
