"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog"
import { createAsset, updateAsset, type AssetWithType } from "@/app/actions/assets"
import type { AssetType } from "@/db/schema"
import { Loader2 } from "lucide-react"

interface AssetFormProps {
	asset?: AssetWithType | null
	assetTypes: AssetType[]
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess?: () => void
}

export const AssetForm = ({
	asset,
	assetTypes,
	open,
	onOpenChange,
	onSuccess,
}: AssetFormProps) => {
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	const [formData, setFormData] = useState({
		symbol: asset?.symbol ?? "",
		name: asset?.name ?? "",
		assetTypeId: asset?.assetTypeId ?? "",
		tickSize: asset?.tickSize ?? "",
		tickValue: asset?.tickValue ?? "",
		currency: asset?.currency ?? "BRL",
		multiplier: asset?.multiplier ?? "1",
		commission: asset?.commission ?? "0",
		fees: asset?.fees ?? "0",
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		startTransition(async () => {
			const data = {
				symbol: formData.symbol,
				name: formData.name,
				assetTypeId: formData.assetTypeId,
				tickSize: parseFloat(formData.tickSize.toString()),
				tickValue: parseFloat(formData.tickValue.toString()),
				currency: formData.currency,
				multiplier: parseFloat(formData.multiplier.toString()),
				commission: parseFloat(formData.commission.toString()),
				fees: parseFloat(formData.fees.toString()),
				isActive: true,
			}

			const result = asset
				? await updateAsset({ ...data, id: asset.id })
				: await createAsset(data)

			if (result.success) {
				onOpenChange(false)
				onSuccess?.()
				setFormData({
					symbol: "",
					name: "",
					assetTypeId: "",
					tickSize: "",
					tickValue: "",
					currency: "BRL",
					multiplier: "1",
					commission: "0",
					fees: "0",
				})
			} else {
				setError(result.error ?? "An error occurred")
			}
		})
	}

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{asset ? "Edit Asset" : "Add Asset"}</DialogTitle>
					<DialogDescription>
						{asset
							? "Update the asset configuration"
							: "Add a new asset to your trading portfolio"}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-m-400">
					{error && (
						<div className="rounded-md bg-fb-error/10 p-s-300 text-small text-fb-error">
							{error}
						</div>
					)}

					<div className="grid grid-cols-2 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="symbol">Symbol</Label>
							<Input
								id="symbol"
								placeholder="WINFUT"
								value={formData.symbol}
								onChange={(e) =>
									handleChange("symbol", e.target.value.toUpperCase())
								}
								required
							/>
						</div>

						<div className="space-y-s-200">
							<Label htmlFor="assetTypeId">Type</Label>
							<Select
								value={formData.assetTypeId}
								onValueChange={(value) => handleChange("assetTypeId", value)}
								required
							>
								<SelectTrigger id="assetTypeId">
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									{assetTypes.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-s-200">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							placeholder="Mini Índice Bovespa"
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							required
						/>
					</div>

					<div className="grid grid-cols-3 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="tickSize">Tick Size</Label>
							<Input
								id="tickSize"
								type="number"
								step="any"
								placeholder="5"
								value={formData.tickSize}
								onChange={(e) => handleChange("tickSize", e.target.value)}
								required
							/>
						</div>

						<div className="space-y-s-200">
							<Label htmlFor="tickValue">Tick Value</Label>
							<Input
								id="tickValue"
								type="number"
								step="any"
								placeholder="0.20"
								value={formData.tickValue}
								onChange={(e) => handleChange("tickValue", e.target.value)}
								required
							/>
						</div>

						<div className="space-y-s-200">
							<Label htmlFor="currency">Currency</Label>
							<Select
								value={formData.currency}
								onValueChange={(value) => handleChange("currency", value)}
							>
								<SelectTrigger id="currency">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="BRL">BRL</SelectItem>
									<SelectItem value="USD">USD</SelectItem>
									<SelectItem value="EUR">EUR</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="multiplier">Multiplier</Label>
							<Input
								id="multiplier"
								type="number"
								step="any"
								placeholder="1"
								value={formData.multiplier}
								onChange={(e) => handleChange("multiplier", e.target.value)}
							/>
						</div>

						<div className="space-y-s-200">
							<Label htmlFor="commission">Commission</Label>
							<Input
								id="commission"
								type="number"
								step="any"
								placeholder="0"
								value={formData.commission}
								onChange={(e) => handleChange("commission", e.target.value)}
							/>
						</div>

						<div className="space-y-s-200">
							<Label htmlFor="fees">Fees</Label>
							<Input
								id="fees"
								type="number"
								step="any"
								placeholder="0"
								value={formData.fees}
								onChange={(e) => handleChange("fees", e.target.value)}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{asset ? "Save Changes" : "Add Asset"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
