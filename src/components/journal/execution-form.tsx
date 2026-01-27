"use client"

import { useState, useTransition, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createExecution, updateExecution } from "@/app/actions/executions"
import type { TradeExecution } from "@/db/schema"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

interface ExecutionFormProps {
	tradeId: string
	execution?: TradeExecution | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess?: () => void
}

export const ExecutionForm = ({
	tradeId,
	execution,
	open,
	onOpenChange,
	onSuccess,
}: ExecutionFormProps) => {
	const t = useTranslations("execution")
	const tCommon = useTranslations("common")
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	const isEdit = !!execution

	const [formData, setFormData] = useState({
		executionType: execution?.executionType ?? "entry",
		executionDate: execution
			? format(new Date(execution.executionDate), "yyyy-MM-dd")
			: format(new Date(), "yyyy-MM-dd"),
		executionTime: execution
			? format(new Date(execution.executionDate), "HH:mm")
			: format(new Date(), "HH:mm"),
		price: execution?.price ?? "",
		quantity: execution?.quantity ?? "",
		orderType: execution?.orderType ?? "market",
		commission: execution?.commission?.toString() ?? "0",
		fees: execution?.fees?.toString() ?? "0",
		slippage: execution?.slippage?.toString() ?? "0",
		notes: execution?.notes ?? "",
	})

	// Update form data when execution prop changes (for edit mode)
	useEffect(() => {
		if (execution) {
			setFormData({
				executionType: execution.executionType ?? "entry",
				executionDate: format(new Date(execution.executionDate), "yyyy-MM-dd"),
				executionTime: format(new Date(execution.executionDate), "HH:mm"),
				price: execution.price ?? "",
				quantity: execution.quantity ?? "",
				orderType: execution.orderType ?? "market",
				commission: execution.commission?.toString() ?? "0",
				fees: execution.fees?.toString() ?? "0",
				slippage: execution.slippage?.toString() ?? "0",
				notes: execution.notes ?? "",
			})
		} else {
			setFormData({
				executionType: "entry",
				executionDate: format(new Date(), "yyyy-MM-dd"),
				executionTime: format(new Date(), "HH:mm"),
				price: "",
				quantity: "",
				orderType: "market",
				commission: "0",
				fees: "0",
				slippage: "0",
				notes: "",
			})
		}
	}, [execution])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		startTransition(async () => {
			// Combine date and time
			const executionDate = new Date(
				`${formData.executionDate}T${formData.executionTime}`
			)

			const data = {
				tradeId,
				executionType: formData.executionType as "entry" | "exit",
				executionDate,
				price: parseFloat(formData.price.toString()),
				quantity: parseFloat(formData.quantity.toString()),
				orderType: formData.orderType as
					| "market"
					| "limit"
					| "stop"
					| "stop_limit"
					| null,
				commission: parseInt(formData.commission) || 0,
				fees: parseInt(formData.fees) || 0,
				slippage: parseInt(formData.slippage) || 0,
				notes: formData.notes || undefined,
			}

			const result = isEdit
				? await updateExecution(execution.id, data)
				: await createExecution(data)

			if (result.status === "success") {
				onOpenChange(false)
				onSuccess?.()
				// Reset form
				setFormData({
					executionType: "entry",
					executionDate: format(new Date(), "yyyy-MM-dd"),
					executionTime: format(new Date(), "HH:mm"),
					price: "",
					quantity: "",
					orderType: "market",
					commission: "0",
					fees: "0",
					slippage: "0",
					notes: "",
				})
			} else {
				setError(result.message ?? "An error occurred")
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
					<DialogTitle>{isEdit ? t("edit") : t("add")}</DialogTitle>
					<DialogDescription>
						{isEdit ? t("editDescription") : t("addDescription")}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-m-400">
					{error && (
						<div className="rounded-md bg-fb-error/10 p-s-300 text-small text-fb-error">
							{error}
						</div>
					)}

					{/* Execution Type */}
					<div className="space-y-s-200">
						<Label>{t("type")}</Label>
						<RadioGroup
							value={formData.executionType}
							onValueChange={(value) => handleChange("executionType", value)}
							className="flex gap-m-400"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="entry" id="entry" />
								<Label
									htmlFor="entry"
									className="cursor-pointer font-normal text-trade-buy"
								>
									{t("entry")}
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="exit" id="exit" />
								<Label
									htmlFor="exit"
									className="cursor-pointer font-normal text-trade-sell"
								>
									{t("exit")}
								</Label>
							</div>
						</RadioGroup>
					</div>

					{/* Date and Time */}
					<div className="grid grid-cols-2 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="executionDate">{t("date")}</Label>
							<Input
								id="executionDate"
								type="date"
								value={formData.executionDate}
								onChange={(e) => handleChange("executionDate", e.target.value)}
								required
							/>
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="executionTime">{t("time")}</Label>
							<Input
								id="executionTime"
								type="time"
								value={formData.executionTime}
								onChange={(e) => handleChange("executionTime", e.target.value)}
								required
							/>
						</div>
					</div>

					{/* Price and Quantity */}
					<div className="grid grid-cols-2 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="price">{t("price")}</Label>
							<Input
								id="price"
								type="number"
								step="any"
								placeholder="128000"
								value={formData.price}
								onChange={(e) => handleChange("price", e.target.value)}
								required
							/>
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="quantity">{t("quantity")}</Label>
							<Input
								id="quantity"
								type="number"
								step="any"
								placeholder="2"
								value={formData.quantity}
								onChange={(e) => handleChange("quantity", e.target.value)}
								required
							/>
						</div>
					</div>

					{/* Order Type */}
					<div className="space-y-s-200">
						<Label htmlFor="orderType">{t("orderType")}</Label>
						<Select
							value={formData.orderType ?? "market"}
							onValueChange={(value) => handleChange("orderType", value)}
						>
							<SelectTrigger id="orderType">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="market">{t("market")}</SelectItem>
								<SelectItem value="limit">{t("limit")}</SelectItem>
								<SelectItem value="stop">{t("stop")}</SelectItem>
								<SelectItem value="stop_limit">{t("stopLimit")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Costs (collapsible section could be added later) */}
					<div className="grid grid-cols-3 gap-m-300">
						<div className="space-y-s-200">
							<Label htmlFor="commission" className="text-small">
								{t("commission")}
							</Label>
							<Input
								id="commission"
								type="number"
								step="1"
								placeholder="0"
								value={formData.commission}
								onChange={(e) => handleChange("commission", e.target.value)}
								className="h-8 text-small"
							/>
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="fees" className="text-small">
								{t("fees")}
							</Label>
							<Input
								id="fees"
								type="number"
								step="1"
								placeholder="0"
								value={formData.fees}
								onChange={(e) => handleChange("fees", e.target.value)}
								className="h-8 text-small"
							/>
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="slippage" className="text-small">
								{t("slippage")}
							</Label>
							<Input
								id="slippage"
								type="number"
								step="1"
								placeholder="0"
								value={formData.slippage}
								onChange={(e) => handleChange("slippage", e.target.value)}
								className="h-8 text-small"
							/>
						</div>
					</div>

					{/* Notes */}
					<div className="space-y-s-200">
						<Label htmlFor="notes">{t("notes")}</Label>
						<Textarea
							id="notes"
							placeholder={t("notesPlaceholder")}
							value={formData.notes}
							onChange={(e) => handleChange("notes", e.target.value)}
							rows={2}
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							{tCommon("cancel")}
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isEdit ? tCommon("saveChanges") : t("addExecution")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
