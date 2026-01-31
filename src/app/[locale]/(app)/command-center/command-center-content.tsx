"use client"

import { useState, useCallback } from "react"
import {
	CircuitBreakerPanel,
	DailyChecklist,
	ChecklistManager,
	DailyTargetsForm,
	PreMarketNotes,
	PostMarketNotes,
	AssetRulesPanel,
	DailySummaryCard,
} from "@/components/command-center"
import {
	getTodayCompletions,
	getDailyTargets,
	getTodayNotes,
	getAssetSettings,
	getCircuitBreakerStatus,
	getDailySummary,
} from "@/app/actions/command-center"
import type {
	ChecklistWithCompletion,
	AssetSettingWithAsset,
	DailySummary,
} from "@/app/actions/command-center"
import type { CircuitBreakerStatus } from "@/lib/validations/command-center"
import type { DailyChecklist as DailyChecklistType, DailyTarget, DailyAccountNote, Asset } from "@/db/schema"

interface CommandCenterContentProps {
	initialChecklists: DailyChecklistType[]
	initialCompletions: ChecklistWithCompletion[]
	initialTargets: DailyTarget | null
	initialNotes: DailyAccountNote | null
	initialAssetSettings: AssetSettingWithAsset[]
	initialCircuitBreaker: CircuitBreakerStatus | null
	initialSummary: DailySummary | null
	availableAssets: Asset[]
}

export const CommandCenterContent = ({
	initialChecklists,
	initialCompletions,
	initialTargets,
	initialNotes,
	initialAssetSettings,
	initialCircuitBreaker,
	initialSummary,
	availableAssets,
}: CommandCenterContentProps) => {
	// State
	const [completions, setCompletions] = useState(initialCompletions)
	const [targets, setTargets] = useState(initialTargets)
	const [notes, setNotes] = useState(initialNotes)
	const [assetSettings, setAssetSettings] = useState(initialAssetSettings)
	const [circuitBreaker, setCircuitBreaker] = useState(initialCircuitBreaker)
	const [summary, setSummary] = useState(initialSummary)

	// Checklist manager
	const [checklistManagerOpen, setChecklistManagerOpen] = useState(false)
	const [editingChecklist, setEditingChecklist] = useState<DailyChecklistType | null>(null)

	// Refresh functions
	const refreshCompletions = useCallback(async () => {
		const result = await getTodayCompletions()
		if (result.status === "success" && result.data) {
			setCompletions(result.data)
		}
	}, [])

	const refreshTargets = useCallback(async () => {
		const result = await getDailyTargets()
		if (result.status === "success") {
			setTargets(result.data ?? null)
		}
		// Also refresh circuit breaker when targets change
		const cbResult = await getCircuitBreakerStatus()
		if (cbResult.status === "success" && cbResult.data) {
			setCircuitBreaker(cbResult.data)
		}
	}, [])

	const refreshNotes = useCallback(async () => {
		const result = await getTodayNotes()
		if (result.status === "success") {
			setNotes(result.data ?? null)
		}
	}, [])

	const refreshAssetSettings = useCallback(async () => {
		const result = await getAssetSettings()
		if (result.status === "success" && result.data) {
			setAssetSettings(result.data)
		}
	}, [])

	const refreshCircuitBreaker = useCallback(async () => {
		const result = await getCircuitBreakerStatus()
		if (result.status === "success" && result.data) {
			setCircuitBreaker(result.data)
		}
	}, [])

	const refreshSummary = useCallback(async () => {
		const result = await getDailySummary()
		if (result.status === "success" && result.data) {
			setSummary(result.data)
		}
	}, [])

	const handleManageChecklist = () => {
		setEditingChecklist(completions.length > 0 ? completions[0] : null)
		setChecklistManagerOpen(true)
	}

	const handleChecklistManagerClose = () => {
		setChecklistManagerOpen(false)
		setEditingChecklist(null)
	}

	const handleChecklistManagerSuccess = () => {
		refreshCompletions()
	}

	return (
		<div className="mx-auto max-w-7xl space-y-m-600">
			{/* Circuit Breaker Panel - Full Width */}
			<CircuitBreakerPanel
				status={circuitBreaker}
				targets={targets}
			/>

			{/* Main Grid */}
			<div className="grid gap-m-600 lg:grid-cols-2">
				{/* Left Column */}
				<div className="space-y-m-600">
					{/* Daily Checklist */}
					<DailyChecklist
						checklists={completions}
						onManageClick={handleManageChecklist}
						onRefresh={refreshCompletions}
					/>

					{/* Pre-Market Notes */}
					<PreMarketNotes notes={notes} onRefresh={refreshNotes} />
				</div>

				{/* Right Column */}
				<div className="space-y-m-600">
					{/* Daily Targets */}
					<DailyTargetsForm
						targets={targets}
						onRefresh={refreshTargets}
					/>

					{/* Post-Market Notes */}
					<PostMarketNotes notes={notes} onRefresh={refreshNotes} />
				</div>
			</div>

			{/* Asset Rules - Full Width */}
			<AssetRulesPanel
				settings={assetSettings}
				availableAssets={availableAssets}
				onRefresh={refreshAssetSettings}
			/>

			{/* Daily Summary - Full Width */}
			<DailySummaryCard summary={summary} />

			{/* Checklist Manager Dialog */}
			<ChecklistManager
				open={checklistManagerOpen}
				onClose={handleChecklistManagerClose}
				checklist={editingChecklist}
				onSuccess={handleChecklistManagerSuccess}
			/>
		</div>
	)
}
