import { PageHeader } from "@/components/layout"
import { SettingsContent } from "@/components/settings"
import { getAssets, getAssetTypes } from "@/app/actions/assets"
import { getTimeframes } from "@/app/actions/timeframes"

const SettingsPage = async () => {
	const [assets, assetTypes, timeframes] = await Promise.all([
		getAssets(),
		getAssetTypes(),
		getTimeframes(),
	])

	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="Settings"
				description="Configure assets, timeframes, and preferences"
			/>
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
