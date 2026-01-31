import { getTranslations, setRequestLocale } from "next-intl/server"
import { PageHeader } from "@/components/layout"
import { CommandCenterContent } from "./command-center-content"
import {
	getChecklists,
	getTodayCompletions,
	getDailyTargets,
	getTodayNotes,
	getAssetSettings,
	getCircuitBreakerStatus,
	getDailySummary,
} from "@/app/actions/command-center"
import { getActiveAssets } from "@/app/actions/assets"

// Force dynamic rendering to ensure account-specific data
export const dynamic = "force-dynamic"

interface CommandCenterPageProps {
	params: Promise<{ locale: string }>
}

const CommandCenterPage = async ({ params }: CommandCenterPageProps) => {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations("commandCenter")

	// Fetch all initial data server-side in parallel
	const [
		checklistsResult,
		completionsResult,
		targetsResult,
		notesResult,
		assetSettingsResult,
		circuitBreakerResult,
		summaryResult,
		assetsResult,
	] = await Promise.all([
		getChecklists(),
		getTodayCompletions(),
		getDailyTargets(),
		getTodayNotes(),
		getAssetSettings(),
		getCircuitBreakerStatus(),
		getDailySummary(),
		getActiveAssets().catch(() => []),
	])

	const initialChecklists =
		checklistsResult.status === "success" && checklistsResult.data
			? checklistsResult.data
			: []
	const initialCompletions =
		completionsResult.status === "success" && completionsResult.data
			? completionsResult.data
			: []
	const initialTargets =
		targetsResult.status === "success" ? (targetsResult.data ?? null) : null
	const initialNotes =
		notesResult.status === "success" ? (notesResult.data ?? null) : null
	const initialAssetSettings =
		assetSettingsResult.status === "success" && assetSettingsResult.data
			? assetSettingsResult.data
			: []
	const initialCircuitBreaker =
		circuitBreakerResult.status === "success" ? (circuitBreakerResult.data ?? null) : null
	const initialSummary =
		summaryResult.status === "success" ? (summaryResult.data ?? null) : null
	const availableAssets = assetsResult || []

	return (
		<div className="flex h-full flex-col">
			<PageHeader title={t("title")} description={t("description")} />
			<div className="flex-1 overflow-auto p-m-600">
				<CommandCenterContent
					initialChecklists={initialChecklists}
					initialCompletions={initialCompletions}
					initialTargets={initialTargets}
					initialNotes={initialNotes}
					initialAssetSettings={initialAssetSettings}
					initialCircuitBreaker={initialCircuitBreaker}
					initialSummary={initialSummary}
					availableAssets={availableAssets}
				/>
			</div>
		</div>
	)
}

export default CommandCenterPage
