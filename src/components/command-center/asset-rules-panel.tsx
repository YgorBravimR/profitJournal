"use client"

import { useState } from "react"
import { Settings2, Save, Loader2, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { upsertAssetSettings, deleteAssetSettings } from "@/app/actions/command-center"
import type { AssetSettingWithAsset } from "@/app/actions/command-center"
import type { Asset } from "@/db/schema"

interface AssetRulesPanelProps {
	settings: AssetSettingWithAsset[]
	availableAssets: Asset[]
	onRefresh: () => void
}

interface EditingState {
	assetId: string
	maxDailyTrades: string
	maxPositionSize: string
	notes: string
}

export const AssetRulesPanel = ({
	settings,
	availableAssets,
	onRefresh,
}: AssetRulesPanelProps) => {
	const t = useTranslations("commandCenter.assetRules")

	const [addingAsset, setAddingAsset] = useState(false)
	const [selectedAssetId, setSelectedAssetId] = useState<string>("")
	const [editing, setEditing] = useState<EditingState | null>(null)
	const [saving, setSaving] = useState<string | null>(null)
	const [deleting, setDeleting] = useState<string | null>(null)

	// Assets that don't have settings yet
	const availableToAdd = availableAssets.filter(
		(asset) => !settings.some((s) => s.assetId === asset.id)
	)

	const handleAddAsset = async () => {
		if (!selectedAssetId) return

		setSaving(selectedAssetId)
		try {
			await upsertAssetSettings({
				assetId: selectedAssetId,
				maxDailyTrades: null,
				maxPositionSize: null,
				notes: null,
				isActive: true,
			})
			setAddingAsset(false)
			setSelectedAssetId("")
			onRefresh()
		} catch (error) {
			console.error("Failed to add asset:", error)
		} finally {
			setSaving(null)
		}
	}

	const handleStartEdit = (setting: AssetSettingWithAsset) => {
		setEditing({
			assetId: setting.assetId,
			maxDailyTrades: setting.maxDailyTrades?.toString() || "",
			maxPositionSize: setting.maxPositionSize?.toString() || "",
			notes: setting.notes || "",
		})
	}

	const handleSaveEdit = async () => {
		if (!editing) return

		setSaving(editing.assetId)
		try {
			await upsertAssetSettings({
				assetId: editing.assetId,
				maxDailyTrades: editing.maxDailyTrades ? parseInt(editing.maxDailyTrades) : null,
				maxPositionSize: editing.maxPositionSize ? parseInt(editing.maxPositionSize) : null,
				notes: editing.notes || null,
				isActive: true,
			})
			setEditing(null)
			onRefresh()
		} catch (error) {
			console.error("Failed to save settings:", error)
		} finally {
			setSaving(null)
		}
	}

	const handleDelete = async (assetId: string) => {
		setDeleting(assetId)
		try {
			await deleteAssetSettings(assetId)
			onRefresh()
		} catch (error) {
			console.error("Failed to delete settings:", error)
		} finally {
			setDeleting(null)
		}
	}

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			{/* Header */}
			<div className="mb-m-400 flex items-center justify-between">
				<div className="flex items-center gap-s-200">
					<Settings2 className="h-5 w-5 text-txt-200" />
					<h3 className="text-body font-semibold text-txt-100">{t("title")}</h3>
				</div>
				{!addingAsset && availableToAdd.length > 0 && (
					<Button variant="ghost" size="sm" onClick={() => setAddingAsset(true)}>
						<Plus className="mr-s-100 h-4 w-4" />
						{t("addAsset")}
					</Button>
				)}
			</div>

			{/* Add Asset Row */}
			{addingAsset && (
				<div className="mb-m-400 flex items-center gap-s-200 rounded-md border border-dashed border-bg-400 p-s-300">
					<Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder={t("selectAsset")} />
						</SelectTrigger>
						<SelectContent>
							{availableToAdd.map((asset) => (
								<SelectItem key={asset.id} value={asset.id}>
									{asset.symbol} - {asset.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						size="sm"
						onClick={handleAddAsset}
						disabled={!selectedAssetId || saving === selectedAssetId}
					>
						{saving === selectedAssetId ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							t("add")
						)}
					</Button>
					<Button variant="ghost" size="sm" onClick={() => setAddingAsset(false)}>
						{t("cancel")}
					</Button>
				</div>
			)}

			{/* Settings Table */}
			{settings.length === 0 ? (
				<p className="text-small text-txt-300">{t("noAssets")}</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-bg-300 text-left">
								<th className="pb-s-200 text-tiny font-medium text-txt-300">{t("asset")}</th>
								<th className="pb-s-200 text-tiny font-medium text-txt-300">{t("maxTrades")}</th>
								<th className="pb-s-200 text-tiny font-medium text-txt-300">{t("positionSize")}</th>
								<th className="pb-s-200 text-tiny font-medium text-txt-300">{t("notes")}</th>
								<th className="pb-s-200 text-tiny font-medium text-txt-300"></th>
							</tr>
						</thead>
						<tbody>
							{settings.map((setting) => {
								const isEditing = editing?.assetId === setting.assetId
								const isSaving = saving === setting.assetId
								const isDeleting = deleting === setting.assetId

								return (
									<tr
										key={setting.id}
										className="border-b border-bg-300 last:border-0"
									>
										<td className="py-s-300 pr-m-400">
											<span className="text-small font-medium text-txt-100">
												{setting.asset.symbol}
											</span>
										</td>
										<td className="py-s-300 pr-m-400">
											{isEditing ? (
												<Input
													type="number"
													step="1"
													min="0"
													value={editing.maxDailyTrades}
													onChange={(e) =>
														setEditing({ ...editing, maxDailyTrades: e.target.value })
													}
													className="h-8 w-20"
												/>
											) : (
												<span className="text-small text-txt-200">
													{setting.maxDailyTrades || "-"}
												</span>
											)}
										</td>
										<td className="py-s-300 pr-m-400">
											{isEditing ? (
												<Input
													type="number"
													step="1"
													min="0"
													value={editing.maxPositionSize}
													onChange={(e) =>
														setEditing({ ...editing, maxPositionSize: e.target.value })
													}
													className="h-8 w-20"
												/>
											) : (
												<span className="text-small text-txt-200">
													{setting.maxPositionSize || "-"}
												</span>
											)}
										</td>
										<td className="py-s-300 pr-m-400">
											{isEditing ? (
												<Input
													value={editing.notes}
													onChange={(e) =>
														setEditing({ ...editing, notes: e.target.value })
													}
													className="h-8"
													placeholder={t("notesPlaceholder")}
												/>
											) : (
												<span className="text-small text-txt-300">
													{setting.notes || "-"}
												</span>
											)}
										</td>
										<td className="py-s-300">
											<div className="flex items-center gap-s-100">
												{isEditing ? (
													<>
														<Button
															variant="ghost"
															size="sm"
															onClick={handleSaveEdit}
															disabled={isSaving}
															className="h-8 w-8 p-0"
														>
															{isSaving ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Save className="h-4 w-4 text-trade-buy" />
															)}
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => setEditing(null)}
															className="h-8 w-8 p-0 text-txt-300"
														>
															&times;
														</Button>
													</>
												) : (
													<>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleStartEdit(setting)}
															className="h-8 w-8 p-0 text-txt-300 hover:text-txt-100"
														>
															<Settings2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(setting.assetId)}
															disabled={isDeleting}
															className={cn(
																"h-8 w-8 p-0",
																isDeleting
																	? "text-txt-400"
																	: "text-txt-300 hover:text-fb-error"
															)}
														>
															{isDeleting ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Trash2 className="h-4 w-4" />
															)}
														</Button>
													</>
												)}
											</div>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}
