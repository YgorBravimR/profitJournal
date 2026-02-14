import { setRequestLocale, getTranslations } from "next-intl/server"
import { MonthlyContent } from "@/components/monthly"
import {
	getMonthlyResultsWithProp,
	getMonthlyProjection,
	getMonthComparison,
} from "@/app/actions/reports"

// Force dynamic rendering to ensure account-specific data
export const dynamic = "force-dynamic"

interface MonthlyPageProps {
	params: Promise<{ locale: string }>
}

const MonthlyPage = async ({ params }: MonthlyPageProps) => {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations("monthly")

	// Fetch initial data server-side
	const [monthlyResult, projectionResult, comparisonResult] = await Promise.all([
		getMonthlyResultsWithProp(0),
		getMonthlyProjection(),
		getMonthComparison(0),
	])

	const initialMonthlyData = monthlyResult.status === "success" ? monthlyResult.data ?? null : null
	const initialProjectionData = projectionResult.status === "success" ? projectionResult.data ?? null : null
	const initialComparisonData = comparisonResult.status === "success" ? comparisonResult.data ?? null : null

	return (
		<div className="min-h-screen bg-bg-100">
			<main className="mx-auto max-w-5xl px-m-500 py-m-600">
				<MonthlyContent
					initialMonthlyData={initialMonthlyData}
					initialProjectionData={initialProjectionData}
					initialComparisonData={initialComparisonData}
				/>
			</main>
		</div>
	)
}

export default MonthlyPage
