"use client"

import { useState, lazy, Suspense } from "react"
import { Tabs, TabsList, TabsTrigger, AnimatedTabsContent } from "@/components/ui/tabs"
import { Target, Activity, Calculator } from "lucide-react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"
import { CommandCenterContent, type CommandCenterContentProps } from "./command-center-content"
import type { Asset } from "@/db/schema"
import type { StrategyWithStats } from "@/app/actions/strategies"
import type { AssetSettingWithAsset } from "@/app/actions/command-center"

const MarketMonitorContent = lazy(() =>
	import("@/components/market/market-monitor-content").then((m) => ({
		default: m.MarketMonitorContent,
	}))
)

const PositionCalculator = lazy(() =>
	import("@/components/calculator/position-calculator").then((m) => ({
		default: m.PositionCalculator,
	}))
)

interface CommandCenterTabsProps extends CommandCenterContentProps {
	calculatorAssets: Asset[]
	accountSettings: {
		defaultRiskPerTrade: string | null
		maxDailyLoss: number | null
	}
	strategies: StrategyWithStats[]
	assetSettings: AssetSettingWithAsset[]
	isReplayAccount?: boolean
}

const TabLoadingFallback = () => (
	<div className="flex items-center justify-center py-12">
		<Loader2 className="text-txt-300 h-6 w-6 animate-spin" />
	</div>
)

export const CommandCenterTabs = ({
	calculatorAssets,
	accountSettings,
	strategies,
	assetSettings,
	isReplayAccount = false,
	...commandCenterProps
}: CommandCenterTabsProps) => {
	const t = useTranslations("commandCenter")
	const [activeTab, setActiveTab] = useState("command-center")

	return (
		<Tabs
			value={activeTab}
			onValueChange={setActiveTab}
			className="flex h-full flex-col"
		>
			<TabsList variant="line" className="border-bg-300 border-b px-2">
				<TabsTrigger
					value="command-center"
					className="text-txt-200 data-[state=active]:text-acc-100 gap-2"
					aria-label={t("tabs.commandCenter")}
				>
					<Target className="h-4 w-4" />
					<span>{t("tabs.commandCenter")}</span>
				</TabsTrigger>
				{!isReplayAccount && (
					<TabsTrigger
						value="monitor"
						className="text-txt-200 data-[state=active]:text-acc-100 gap-2"
						aria-label={t("tabs.monitor")}
					>
						<Activity className="h-4 w-4" />
						<span>{t("tabs.monitor")}</span>
					</TabsTrigger>
				)}
				<TabsTrigger
					value="calculator"
					className="text-txt-200 data-[state=active]:text-acc-100 gap-2"
					aria-label={t("tabs.calculator")}
				>
					<Calculator className="h-4 w-4" />
					<span>{t("tabs.calculator")}</span>
				</TabsTrigger>
			</TabsList>

			<AnimatedTabsContent value="command-center" className="flex-1 overflow-auto p-m-600">
				<CommandCenterContent key={commandCenterProps.viewDate} {...commandCenterProps} />
			</AnimatedTabsContent>

			{!isReplayAccount && (
				<AnimatedTabsContent
					value="monitor"
					className="flex-1 overflow-auto p-m-600"
				>
					<Suspense fallback={<TabLoadingFallback />}>
						<MarketMonitorContent />
					</Suspense>
				</AnimatedTabsContent>
			)}

			<AnimatedTabsContent
				value="calculator"
				className="flex-1 overflow-auto p-m-600"
			>
				<Suspense fallback={<TabLoadingFallback />}>
					<PositionCalculator
						assets={calculatorAssets}
						accountSettings={accountSettings}
						strategies={strategies}
						assetSettings={assetSettings}
					/>
				</Suspense>
			</AnimatedTabsContent>
		</Tabs>
	)
}
