"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AssetForm } from "./asset-form"
import {
	deleteAsset,
	toggleAssetActive,
	type AssetWithType,
} from "@/app/actions/assets"
import type { AssetType } from "@/db/schema"
import {
	Plus,
	Search,
	Pencil,
	Trash2,
	ToggleLeft,
	ToggleRight,
	Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { fromCents } from "@/lib/money"

interface AssetListProps {
	assets: AssetWithType[]
	assetTypes: AssetType[]
}

export const AssetList = ({ assets, assetTypes }: AssetListProps) => {
	const t = useTranslations("settings.assets")
	const tCommon = useTranslations("common")
	const [search, setSearch] = useState("")
	const [filterType, setFilterType] = useState<string | null>(null)
	const [showInactive, setShowInactive] = useState(false)
	const [formOpen, setFormOpen] = useState(false)
	const [editingAsset, setEditingAsset] = useState<AssetWithType | null>(null)
	const [isPending, startTransition] = useTransition()
	const [pendingId, setPendingId] = useState<string | null>(null)

	const filteredAssets = assets.filter((asset) => {
		const matchesSearch =
			asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
			asset.name.toLowerCase().includes(search.toLowerCase())
		const matchesType = !filterType || asset.assetTypeId === filterType
		const matchesActive = showInactive || asset.isActive
		return matchesSearch && matchesType && matchesActive
	})

	const handleEdit = (asset: AssetWithType) => {
		setEditingAsset(asset)
		setFormOpen(true)
	}

	const handleToggleActive = (asset: AssetWithType) => {
		setPendingId(asset.id)
		startTransition(async () => {
			await toggleAssetActive(asset.id, !asset.isActive)
			setPendingId(null)
		})
	}

	const handleDelete = (asset: AssetWithType) => {
		if (!confirm(`Delete ${asset.symbol}?`)) return
		setPendingId(asset.id)
		startTransition(async () => {
			await deleteAsset(asset.id)
			setPendingId(null)
		})
	}

	const handleFormClose = () => {
		setFormOpen(false)
		setEditingAsset(null)
	}

	return (
		<div className="space-y-m-400">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-m-400">
				<div className="flex items-center gap-s-300">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-txt-300" />
						<Input
							placeholder={t("searchAssets")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-64 pl-9"
						/>
					</div>
					<div className="flex gap-s-200">
						<Badge
							variant={filterType === null ? "default" : "outline"}
							className="cursor-pointer"
							onClick={() => setFilterType(null)}
						>
							{tCommon("all")}
						</Badge>
						{assetTypes.map((type) => (
							<Badge
								key={type.id}
								variant={filterType === type.id ? "default" : "outline"}
								className="cursor-pointer"
								onClick={() =>
									setFilterType(filterType === type.id ? null : type.id)
								}
							>
								{type.name}
							</Badge>
						))}
					</div>
				</div>
				<div className="flex items-center gap-s-300">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowInactive(!showInactive)}
						className="text-txt-200"
					>
						{showInactive ? (
							<ToggleRight className="mr-2 h-4 w-4" />
						) : (
							<ToggleLeft className="mr-2 h-4 w-4" />
						)}
						{showInactive ? t("showingInactive") : t("hidingInactive")}
					</Button>
					<Button onClick={() => setFormOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						{t("addAsset")}
					</Button>
				</div>
			</div>

			{/* Assets Table */}
			<div className="rounded-lg border border-bg-300 overflow-hidden">
				<table className="w-full">
					<thead className="bg-bg-300">
						<tr>
							<th className="px-m-400 py-s-300 text-left text-small font-medium text-txt-200">
								{t("symbol")}
							</th>
							<th className="px-m-400 py-s-300 text-left text-small font-medium text-txt-200">
								{t("name")}
							</th>
							<th className="px-m-400 py-s-300 text-left text-small font-medium text-txt-200">
								{t("type")}
							</th>
							<th className="px-m-400 py-s-300 text-right text-small font-medium text-txt-200">
								{t("tickSize")}
							</th>
							<th className="px-m-400 py-s-300 text-right text-small font-medium text-txt-200">
								{t("tickValue")}
							</th>
							<th className="px-m-400 py-s-300 text-center text-small font-medium text-txt-200">
								{t("currency")}
							</th>
							<th className="px-m-400 py-s-300 text-center text-small font-medium text-txt-200">
								{tCommon("status")}
							</th>
							<th className="px-m-400 py-s-300 text-right text-small font-medium text-txt-200">
								{tCommon("actions")}
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-bg-300">
						{filteredAssets.length === 0 ? (
							<tr>
								<td
									colSpan={8}
									className="px-m-400 py-l-700 text-center text-txt-300"
								>
									{t("noAssets")}
								</td>
							</tr>
						) : (
							filteredAssets.map((asset, index) => (
								<tr
									key={asset.id}
									className={cn(
										"transition-colors hover:bg-bg-300/50",
										index % 2 === 1 && "bg-bg-stripe",
										!asset.isActive && "opacity-50"
									)}
								>
									<td className="px-m-400 py-s-300">
										<span className="font-mono font-medium text-acc-100">
											{asset.symbol}
										</span>
									</td>
									<td className="px-m-400 py-s-300 text-txt-100">
										{asset.name}
									</td>
									<td className="px-m-400 py-s-300">
										<Badge variant="outline" className="text-tiny">
											{asset.assetType.name}
										</Badge>
									</td>
									<td className="px-m-400 py-s-300 text-right font-mono text-txt-200">
										{parseFloat(asset.tickSize)}
									</td>
									<td className="px-m-400 py-s-300 text-right font-mono text-txt-200">
										{fromCents(asset.tickValue)}
									</td>
									<td className="px-m-400 py-s-300 text-center text-txt-200">
										{asset.currency}
									</td>
									<td className="px-m-400 py-s-300 text-center">
										<Badge
											variant={asset.isActive ? "default" : "secondary"}
											className="text-tiny"
										>
											{asset.isActive ? t("active") : t("inactive")}
										</Badge>
									</td>
									<td className="px-m-400 py-s-300">
										<div className="flex items-center justify-end gap-s-200">
											{isPending && pendingId === asset.id ? (
												<Loader2 className="h-4 w-4 animate-spin text-txt-300" />
											) : (
												<>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEdit(asset)}
														className="h-8 w-8 p-0"
														aria-label={`${tCommon("edit")} ${asset.symbol}`}
													>
														<Pencil className="h-4 w-4" aria-hidden="true" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleToggleActive(asset)}
														className="h-8 w-8 p-0"
														aria-label={asset.isActive ? t("deactivate") : t("activate")}
													>
														{asset.isActive ? (
															<ToggleRight className="h-4 w-4 text-trade-buy" aria-hidden="true" />
														) : (
															<ToggleLeft className="h-4 w-4 text-txt-300" aria-hidden="true" />
														)}
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(asset)}
														className="h-8 w-8 p-0 text-fb-error hover:text-fb-error"
														aria-label={`${tCommon("delete")} ${asset.symbol}`}
													>
														<Trash2 className="h-4 w-4" aria-hidden="true" />
													</Button>
												</>
											)}
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Asset Form Dialog */}
			<AssetForm
				asset={editingAsset}
				assetTypes={assetTypes}
				open={formOpen}
				onOpenChange={handleFormClose}
			/>
		</div>
	)
}
