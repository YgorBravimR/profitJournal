import { setRequestLocale } from "next-intl/server"
import { SettingsContent } from "@/components/settings"
import { getAssets, getAssetTypes } from "@/app/actions/assets"
import { getTimeframes } from "@/app/actions/timeframes"
import { getCurrentUser } from "@/app/actions/auth"

// Force dynamic rendering to ensure account-specific data
export const dynamic = "force-dynamic"

interface SettingsPageProps {
	params: Promise<{ locale: string }>
}

const SettingsPage = async ({ params }: SettingsPageProps) => {
	const { locale } = await params
	setRequestLocale(locale)

	const [assets, assetTypes, timeframes, user] = await Promise.all([
		getAssets(),
		getAssetTypes(),
		getTimeframes(),
		getCurrentUser(),
	])

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 overflow-auto p-m-600">
				<SettingsContent
					assets={assets}
					assetTypes={assetTypes}
					timeframes={timeframes}
					isAdmin={user?.isAdmin ?? false}
				/>
			</div>
		</div>
	)
}

export default SettingsPage
