"use client"

import { useState } from "react"
import { FileText, Upload, Layers } from "lucide-react"
import { useTranslations } from "next-intl"
import { TradeForm } from "./trade-form"
import { ScaledTradeForm } from "./scaled-trade-form"
import { CsvImport } from "./csv-import"
import { TradeModeSelector, type TradeMode } from "./trade-mode-selector"
import type { Strategy, Tag, Timeframe } from "@/db/schema"
import type { AssetWithType } from "@/app/actions/assets"

interface NewTradeTabsProps {
	strategies: Strategy[]
	tags: Tag[]
	assets?: AssetWithType[]
	timeframes?: Timeframe[]
	redirectTo?: string
	defaultAssetId?: string
}

type TabValue = "single" | "bulk"

export const NewTradeTabs = ({
	strategies,
	tags,
	assets = [],
	timeframes = [],
	redirectTo,
	defaultAssetId,
}: NewTradeTabsProps) => {
	const t = useTranslations("journal")
	const [activeTab, setActiveTab] = useState<TabValue>("single")
	const [tradeMode, setTradeMode] = useState<TradeMode>("simple")

	return (
		<div>
			{/* Tab Buttons */}
			<div className="mb-m-600 flex gap-s-200 border-b border-bg-300">
				<button
					type="button"
					onClick={() => setActiveTab("single")}
					className={`flex items-center gap-s-200 border-b-2 px-m-400 py-s-300 text-small font-medium transition-colors ${
						activeTab === "single"
							? "border-acc-100 text-acc-100"
							: "border-transparent text-txt-300 hover:text-txt-100"
					}`}
					aria-selected={activeTab === "single"}
					role="tab"
				>
					{tradeMode === "simple" ? (
						<FileText className="h-4 w-4" />
					) : (
						<Layers className="h-4 w-4" />
					)}
					{tradeMode === "simple" ? t("singleEntry") : "Scaled Position"}
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("bulk")}
					className={`flex items-center gap-s-200 border-b-2 px-m-400 py-s-300 text-small font-medium transition-colors ${
						activeTab === "bulk"
							? "border-acc-100 text-acc-100"
							: "border-transparent text-txt-300 hover:text-txt-100"
					}`}
					aria-selected={activeTab === "bulk"}
					role="tab"
				>
					<Upload className="h-4 w-4" />
					{t("csvImport")}
				</button>
			</div>

			{/* Tab Content */}
			<div role="tabpanel">
				{activeTab === "single" ? (
					<div className="space-y-m-600">
						{/* Trade Mode Selector */}
						<TradeModeSelector
							value={tradeMode}
							onChange={setTradeMode}
						/>

						{/* Form based on mode */}
						{tradeMode === "simple" ? (
							<TradeForm
								strategies={strategies}
								tags={tags}
								assets={assets}
								timeframes={timeframes}
								redirectTo={redirectTo}
								defaultAssetId={defaultAssetId}
							/>
						) : (
							<ScaledTradeForm
								strategies={strategies}
								tags={tags}
								assets={assets}
								timeframes={timeframes}
								onModeChange={() => setTradeMode("simple")}
								redirectTo={redirectTo}
								defaultAssetId={defaultAssetId}
							/>
						)}
					</div>
				) : (
					<CsvImport />
				)}
			</div>
		</div>
	)
}
