"use client"

import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Tabs, TabsList, TabsTrigger, AnimatedTabsContent } from "@/components/ui/tabs"
import { AssetList } from "./asset-list"
import { TimeframeList } from "./timeframe-list"
import { TagList } from "./tag-list"
import { UserProfileSettings } from "./user-profile-settings"
import { AccountSettings } from "./account-settings"
import type { AssetWithType } from "@/app/actions/assets"
import type { AssetType, Timeframe } from "@/db/schema"
import { User, Briefcase, Coins, Clock, Tag, Shield } from "lucide-react"
import { RiskProfilesTab } from "./risk-profiles-tab"

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
	const searchParams = useSearchParams()

	const validTabs = ["profile", "account", "tags", "assets", "timeframes", "riskProfiles"]
	const tabFromUrl = searchParams.get("tab") ?? ""
	const defaultTab = validTabs.includes(tabFromUrl) ? tabFromUrl : "profile"

	return (
		<Tabs defaultValue={defaultTab} className="h-full">
			<TabsList variant="line" className="mb-m-500">
				<TabsTrigger value="profile" className="gap-s-200">
					<User className="h-4 w-4" />
					{t("profile")}
				</TabsTrigger>
				<TabsTrigger value="account" className="gap-s-200">
					<Briefcase className="h-4 w-4" />
					{t("account")}
				</TabsTrigger>
				<TabsTrigger value="tags" className="gap-s-200">
					<Tag className="h-4 w-4" />
					{t("tags")}
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
						<TabsTrigger value="riskProfiles" className="gap-s-200">
							<Shield className="h-4 w-4" />
							{t("riskProfiles")}
						</TabsTrigger>
					</>
				)}
			</TabsList>

			<AnimatedTabsContent value="profile">
				<UserProfileSettings />
			</AnimatedTabsContent>

			<AnimatedTabsContent value="account">
				<AccountSettings assets={assets} />
			</AnimatedTabsContent>

			<AnimatedTabsContent value="tags">
				<TagList />
			</AnimatedTabsContent>

			{isAdmin && (
				<>
					<AnimatedTabsContent value="assets">
						<AssetList assets={assets} assetTypes={assetTypes} />
					</AnimatedTabsContent>

					<AnimatedTabsContent value="timeframes">
						<TimeframeList timeframes={timeframes} />
					</AnimatedTabsContent>

					<AnimatedTabsContent value="riskProfiles">
						<RiskProfilesTab />
					</AnimatedTabsContent>
				</>
			)}
		</Tabs>
	)
}
