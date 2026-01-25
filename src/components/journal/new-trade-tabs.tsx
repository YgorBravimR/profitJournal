"use client"

import { useState } from "react"
import { FileText, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import { TradeForm } from "./trade-form"
import { CsvImport } from "./csv-import"
import type { Strategy, Tag, Timeframe } from "@/db/schema"
import type { AssetWithType } from "@/app/actions/assets"

interface NewTradeTabsProps {
	strategies: Strategy[]
	tags: Tag[]
	assets?: AssetWithType[]
	timeframes?: Timeframe[]
}

type TabValue = "single" | "bulk"

export const NewTradeTabs = ({
	strategies,
	tags,
	assets = [],
	timeframes = [],
}: NewTradeTabsProps) => {
	const t = useTranslations("journal")
	const [activeTab, setActiveTab] = useState<TabValue>("single")

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
					<FileText className="h-4 w-4" />
					{t("singleEntry")}
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
					<TradeForm
						strategies={strategies}
						tags={tags}
						assets={assets}
						timeframes={timeframes}
					/>
				) : (
					<CsvImport />
				)}
			</div>
		</div>
	)
}
