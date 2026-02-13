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
import { DateNavigator } from "@/components/command-center/date-navigator"
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
import type { DailyChecklist as DailyChecklistType, DailyTarget, DailyAccountNote, Asset, TradingAccount } from "@/db/schema"

export interface CommandCenterContentProps {
	initialChecklists: DailyChecklistType[]
	initialCompletions: ChecklistWithCompletion[]
	initialTargets: DailyTarget | null
	initialNotes: DailyAccountNote | null
	initialAssetSettings: AssetSettingWithAsset[]
	initialCircuitBreaker: CircuitBreakerStatus | null
	initialSummary: DailySummary | null
	availableAssets: Asset[]
	account: TradingAccount | null
	viewDate: string
	isToday: boolean
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
	account,
	viewDate,
	isToday,
}: CommandCenterContentProps) => {
	const isReadOnly = !isToday

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
			{/* Date Navigator */}
			<DateNavigator currentDate={viewDate} isToday={isToday} isReplayAccount={account?.accountType === "replay"} />

			{/* Circuit Breaker Panel - Full Width */}
			<CircuitBreakerPanel
				status={circuitBreaker}
				targets={targets}
				account={account}
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
						isReadOnly={isReadOnly}
					/>

					{/* Pre-Market Notes */}
					<PreMarketNotes notes={notes} onRefresh={refreshNotes} isReadOnly={isReadOnly} />
				</div>

				{/* Right Column */}
				<div className="space-y-m-600">
					{/* Daily Targets */}
					<DailyTargetsForm
						targets={targets}
						onRefresh={refreshTargets}
						isReadOnly={isReadOnly}
					/>

					{/* Post-Market Notes */}
					<PostMarketNotes notes={notes} onRefresh={refreshNotes} isReadOnly={isReadOnly} />
				</div>
			</div>

			{/* Asset Rules - Full Width (not affected by read-only, account-level) */}
			<AssetRulesPanel
				settings={assetSettings}
				availableAssets={availableAssets}
				onRefresh={refreshAssetSettings}
			/>

			{/* Daily Summary - Full Width */}
			<DailySummaryCard summary={summary} />

			{/* Checklist Manager Dialog */}
			{!isReadOnly && (
				<ChecklistManager
					open={checklistManagerOpen}
					onClose={handleChecklistManagerClose}
					checklist={editingChecklist}
					onSuccess={handleChecklistManagerSuccess}
				/>
			)}
		</div>
	)
}
