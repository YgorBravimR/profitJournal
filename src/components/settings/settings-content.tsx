"use client"

import { useTranslations } from "next-intl"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AssetList } from "./asset-list"
import { TimeframeList } from "./timeframe-list"
import { UserProfileSettings } from "./user-profile-settings"
import { AccountSettings } from "./account-settings"
import type { AssetWithType } from "@/app/actions/assets"
import type { AssetType, Timeframe } from "@/db/schema"
import { User, Briefcase, Coins, Clock } from "lucide-react"

interface SettingsContentProps {
	assets: AssetWithType[]
	assetTypes: AssetType[]
	timeframes: Timeframe[]
	isAdmin?: boolean
}

export const SettingsContent = ({
	assets,
	assetTypes,
	timeframes,
	isAdmin = false,
}: SettingsContentProps) => {
	const t = useTranslations("settings.tabs")

	return (
		<Tabs defaultValue="profile" className="h-full">
			<TabsList variant="line" className="mb-m-500">
				<TabsTrigger value="profile" className="gap-s-200">
					<User className="h-4 w-4" />
					{t("profile")}
				</TabsTrigger>
				<TabsTrigger value="account" className="gap-s-200">
					<Briefcase className="h-4 w-4" />
					{t("account")}
				</TabsTrigger>
				{isAdmin && (
					<>
						<TabsTrigger value="assets" className="gap-s-200">
							<Coins className="h-4 w-4" />
							{t("assets")}
						</TabsTrigger>
						<TabsTrigger value="timeframes" className="gap-s-200">
							<Clock className="h-4 w-4" />
							{t("timeframes")}
						</TabsTrigger>
					</>
				)}
			</TabsList>

			<TabsContent value="profile">
				<UserProfileSettings />
			</TabsContent>

			<TabsContent value="account">
				<AccountSettings assets={assets} />
			</TabsContent>

			{isAdmin && (
				<>
					<TabsContent value="assets">
						<AssetList assets={assets} assetTypes={assetTypes} />
					</TabsContent>

					<TabsContent value="timeframes">
						<TimeframeList timeframes={timeframes} />
					</TabsContent>
				</>
			)}
		</Tabs>
	)
}
