"use client"

import { useState, useCallback } from "react"
import {
	CircuitBreakerPanel,
	DailyChecklist,
	ChecklistManager,
	PreMarketNotes,
	PostMarketNotes,
	AssetRulesPanel,
	DailySummaryCard,
} from "@/components/command-center"
import { DateNavigator } from "@/components/command-center/date-navigator"
import {
	getTodayCompletions,
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
import type { DailyChecklist as DailyChecklistType, DailyAccountNote, Asset, TradingAccount, MonthlyPlan } from "@/db/schema"
import { useTranslations } from "next-intl"
import { useFormatting } from "@/hooks/use-formatting"
import { fromCents } from "@/lib/money"
import { CalendarDays, Target, TrendingDown, ShieldCheck } from "lucide-react"

export interface CommandCenterContentProps {
	initialChecklists: DailyChecklistType[]
	initialCompletions: ChecklistWithCompletion[]
	initialNotes: DailyAccountNote | null
	initialAssetSettings: AssetSettingWithAsset[]
	initialCircuitBreaker: CircuitBreakerStatus | null
	initialSummary: DailySummary | null
	availableAssets: Asset[]
	account: TradingAccount | null
	viewDate: string
	isToday: boolean
	initialPlan?: MonthlyPlan | null
	riskProfileName?: string | null
}

export const CommandCenterContent = ({
	initialChecklists,
	initialCompletions,
	initialNotes,
	initialAssetSettings,
	initialCircuitBreaker,
	initialSummary,
	availableAssets,
	account,
	viewDate,
	isToday,
	initialPlan,
	riskProfileName,
}: CommandCenterContentProps) => {
	const isReadOnly = !isToday
	const tPlan = useTranslations("commandCenter.plan")
	const { formatCurrency } = useFormatting()

	// State
	const [completions, setCompletions] = useState(initialCompletions)
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
					{/* Plan summary or "create plan" prompt */}
					{initialPlan ? (
						<div className="rounded-lg border border-bg-300 bg-bg-100 p-m-400">
							<div className="mb-m-400 flex items-center gap-s-200">
								<CalendarDays className="h-4 w-4 text-acc-100" />
								<h3 className="text-small font-semibold text-txt-100">{tPlan("title")}</h3>
							</div>
							{riskProfileName && (
								<div className="mb-m-300 flex items-center gap-s-200 rounded-md border border-acc-100/20 bg-acc-100/5 px-s-300 py-s-200">
									<ShieldCheck className="h-3.5 w-3.5 text-acc-100" />
									<span className="text-tiny font-medium text-txt-200">
										{tPlan("summary.usingProfile", { name: riskProfileName })}
									</span>
								</div>
							)}
							<div className="grid grid-cols-2 gap-m-300">
								<div className="rounded-md border border-bg-300 bg-bg-200 p-s-300">
									<div className="flex items-center gap-s-100">
										<Target className="h-3 w-3 text-acc-100" />
										<span className="text-tiny text-txt-300">{tPlan("summary.riskPerTrade")}</span>
									</div>
									<p className="mt-s-100 text-small font-medium text-txt-100">
										{formatCurrency(fromCents(initialPlan.riskPerTradeCents))}
									</p>
									<p className="text-tiny text-txt-300">{initialPlan.riskPerTradePercent}%</p>
								</div>
								<div className="rounded-md border border-bg-300 bg-bg-200 p-s-300">
									<div className="flex items-center gap-s-100">
										<TrendingDown className="h-3 w-3 text-trade-sell" />
										<span className="text-tiny text-txt-300">{tPlan("summary.dailyLossLimit")}</span>
									</div>
									<p className="mt-s-100 text-small font-medium text-txt-100">
										{formatCurrency(fromCents(initialPlan.dailyLossCents))}
									</p>
									<p className="text-tiny text-txt-300">{initialPlan.dailyLossPercent}%</p>
								</div>
							</div>
						</div>
					) : (
						<div className="rounded-lg border border-dashed border-bg-300 bg-bg-100 p-m-500">
							<div className="flex flex-col items-center gap-s-300 text-center">
								<CalendarDays className="h-8 w-8 text-txt-300" />
								<p className="text-small text-txt-200">{tPlan("noPlanPrompt")}</p>
							</div>
						</div>
					)}

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
