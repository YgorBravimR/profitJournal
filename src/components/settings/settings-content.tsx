"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AssetList } from "./asset-list"
import { TimeframeList } from "./timeframe-list"
import { GeneralSettings } from "./general-settings"
import type { AssetWithType } from "@/app/actions/assets"
import type { AssetType, Timeframe } from "@/db/schema"
import { Coins, Clock, Settings } from "lucide-react"

interface SettingsContentProps {
	assets: AssetWithType[]
	assetTypes: AssetType[]
	timeframes: Timeframe[]
}

export const SettingsContent = ({
	assets,
	assetTypes,
	timeframes,
}: SettingsContentProps) => {
	return (
		<Tabs defaultValue="assets" className="h-full">
			<TabsList variant="line" className="mb-m-500">
				<TabsTrigger value="assets" className="gap-s-200">
					<Coins className="h-4 w-4" />
					Assets
				</TabsTrigger>
				<TabsTrigger value="timeframes" className="gap-s-200">
					<Clock className="h-4 w-4" />
					Timeframes
				</TabsTrigger>
				<TabsTrigger value="general" className="gap-s-200">
					<Settings className="h-4 w-4" />
					General
				</TabsTrigger>
			</TabsList>

			<TabsContent value="assets">
				<AssetList assets={assets} assetTypes={assetTypes} />
			</TabsContent>

			<TabsContent value="timeframes">
				<TimeframeList timeframes={timeframes} />
			</TabsContent>

			<TabsContent value="general">
				<GeneralSettings />
			</TabsContent>
		</Tabs>
	)
}
