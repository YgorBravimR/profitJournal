import { getTranslations, setRequestLocale } from "next-intl/server"
import { PageHeader } from "@/components/layout"
import { SettingsContent } from "@/components/settings"
import { getAssets, getAssetTypes } from "@/app/actions/assets"
import { getTimeframes } from "@/app/actions/timeframes"

interface SettingsPageProps {
	params: Promise<{ locale: string }>
}

const SettingsPage = async ({ params }: SettingsPageProps) => {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations("settings")

	const [assets, assetTypes, timeframes] = await Promise.all([
		getAssets(),
		getAssetTypes(),
		getTimeframes(),
	])

	return (
		<div className="flex h-full flex-col">
			<PageHeader title={t("title")} description={t("description")} />
			<div className="flex-1 overflow-auto p-m-600">
				<SettingsContent
					assets={assets}
					assetTypes={assetTypes}
					timeframes={timeframes}
				/>
			</div>
		</div>
	)
}

export default SettingsPage
