"use client"

import { useState, useRef, useCallback } from "react"
import { FileText, Upload, Layers } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { TradeForm } from "./trade-form"
import { ScaledTradeForm } from "./scaled-trade-form"
import { CsvImport } from "./csv-import"
import { OcrImport } from "./ocr-import"
import { TradeModeSelector, type TradeMode } from "./trade-mode-selector"
import type {
	SharedTradeFormState,
	TradeFormRef,
} from "@/lib/validations/trade"
import type { Strategy, Tag, Timeframe } from "@/db/schema"
import type { AssetWithType } from "@/app/actions/assets"

interface NewTradeTabsProps {
	strategies: Strategy[]
	tags: Tag[]
	assets?: AssetWithType[]
	timeframes?: Timeframe[]
	redirectTo?: string
	defaultAssetId?: string
	defaultDate?: string
}

type TabValue = "single" | "csv" | "screenshot"

export const NewTradeTabs = ({
	strategies,
	tags,
	assets = [],
	timeframes = [],
	redirectTo,
	defaultAssetId,
	defaultDate,
}: NewTradeTabsProps) => {
	const t = useTranslations("journal")
	const tTrade = useTranslations("trade")
	const [activeTab, setActiveTab] = useState<TabValue>("single")
	const [tradeMode, setTradeMode] = useState<TradeMode>("simple")
	const [sharedState, setSharedState] = useState<
		SharedTradeFormState | undefined
	>()
	const tradeFormRef = useRef<TradeFormRef>(null)
	const scaledFormRef = useRef<TradeFormRef>(null)

	// Capture state from current form before switching modes
	const handleModeChange = useCallback(
		(newMode: TradeMode) => {
			if (newMode === tradeMode) return
			const currentRef = tradeMode === "simple" ? tradeFormRef : scaledFormRef
			const captured = currentRef.current?.getSharedState()
			setSharedState(captured)
			setTradeMode(newMode)
		},
		[tradeMode]
	)

	return (
		<div>
			{/* Tab Buttons */}
			<div className="mb-m-600 gap-s-200 border-bg-300 flex border-b">
				<button
					type="button"
					onClick={() => setActiveTab("single")}
					className={cn(
						"gap-s-200 px-m-400 py-s-300 text-small flex items-center border-b-2 font-medium transition-colors",
						activeTab === "single"
							? "border-acc-100 text-acc-100"
							: "text-txt-300 hover:text-txt-100 border-transparent"
					)}
					aria-selected={activeTab === "single"}
					role="tab"
				>
					{tradeMode === "simple" ? (
						<FileText className="h-4 w-4" />
					) : (
						<Layers className="h-4 w-4" />
					)}
					{tradeMode === "simple" ? t("singleEntry") : tTrade("mode.scaled")}
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("csv")}
					className={cn(
						"gap-s-200 px-m-400 py-s-300 text-small flex items-center border-b-2 font-medium transition-colors",
						activeTab === "csv"
							? "border-acc-100 text-acc-100"
							: "text-txt-300 hover:text-txt-100 border-transparent"
					)}
					aria-selected={activeTab === "csv"}
					role="tab"
				>
					<Upload className="h-4 w-4" />
					{t("csvImport")}
				</button>
				{/* <button
					type="button"
					onClick={() => setActiveTab("screenshot")}
					className={`flex items-center gap-s-200 border-b-2 px-m-400 py-s-300 text-small font-medium transition-colors ${
						activeTab === "screenshot"
							? "border-acc-100 text-acc-100"
							: "border-transparent text-txt-300 hover:text-txt-100"
					}`}
					aria-selected={activeTab === "screenshot"}
					role="tab"
				>
					<ImageIcon className="h-4 w-4" />
					{t("ocr.title")}
				</button> */}
			</div>

			{/* Tab Content */}
			<div role="tabpanel">
				{/* Trade form stays mounted (hidden when other tabs active) to preserve state */}
				<div className={activeTab !== "single" ? "hidden" : ""}>
					<div className="space-y-m-600">
						{/* Trade Mode Selector */}
						<TradeModeSelector value={tradeMode} onChange={handleModeChange} />

						{/* Form based on mode */}
						{tradeMode === "simple" ? (
							<TradeForm
								ref={tradeFormRef}
								strategies={strategies}
								tags={tags}
								assets={assets}
								timeframes={timeframes}
								redirectTo={redirectTo}
								defaultAssetId={defaultAssetId}
								defaultDate={defaultDate}
								initialSharedState={sharedState}
							/>
						) : (
							<ScaledTradeForm
								ref={scaledFormRef}
								strategies={strategies}
								tags={tags}
								assets={assets}
								timeframes={timeframes}
								onModeChange={() => handleModeChange("simple")}
								redirectTo={redirectTo}
								defaultAssetId={defaultAssetId}
								defaultDate={defaultDate}
								initialSharedState={sharedState}
							/>
						)}
					</div>
				</div>
				{activeTab === "csv" && <CsvImport />}
				{activeTab === "screenshot" && <OcrImport />}
			</div>
		</div>
	)
}
