"use client"

import { useState, useTransition, useEffect } from "react"
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
import { createTimeframe, updateTimeframe } from "@/app/actions/timeframes"
import type { Timeframe } from "@/db/schema"
import { Loader2 } from "lucide-react"

interface TimeframeFormProps {
	timeframe?: Timeframe | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess?: () => void
}

export const TimeframeForm = ({
	timeframe,
	open,
	onOpenChange,
	onSuccess,
}: TimeframeFormProps) => {
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	const [formData, setFormData] = useState({
		code: timeframe?.code ?? "",
		name: timeframe?.name ?? "",
		type: timeframe?.type ?? "time_based",
		value: timeframe?.value?.toString() ?? "",
		unit: timeframe?.unit ?? "minutes",
		sortOrder: timeframe?.sortOrder?.toString() ?? "0",
	})

	useEffect(() => {
		if (timeframe) {
			setFormData({
				code: timeframe.code,
				name: timeframe.name,
				type: timeframe.type,
				value: timeframe.value.toString(),
				unit: timeframe.unit,
				sortOrder: timeframe.sortOrder?.toString() ?? "0",
			})
		} else {
			setFormData({
				code: "",
				name: "",
				type: "time_based",
				value: "",
				unit: "minutes",
				sortOrder: "0",
			})
		}
	}, [timeframe])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		startTransition(async () => {
			const data = {
				code: formData.code,
				name: formData.name,
				type: formData.type as "time_based" | "renko",
				value: parseInt(formData.value, 10),
				unit: formData.unit as
					| "minutes"
					| "hours"
					| "days"
					| "weeks"
					| "ticks"
					| "points",
				sortOrder: parseInt(formData.sortOrder, 10),
				isActive: true,
			}

			const result = timeframe
				? await updateTimeframe({ ...data, id: timeframe.id })
				: await createTimeframe(data)

			if (result.success) {
				onOpenChange(false)
				onSuccess?.()
			} else {
				setError(result.error ?? "An error occurred")
			}
		})
	}

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	const unitOptions =
		formData.type === "time_based"
			? [
					{ value: "minutes", label: "Minutes" },
					{ value: "hours", label: "Hours" },
					{ value: "days", label: "Days" },
					{ value: "weeks", label: "Weeks" },
			  ]
			: [
					{ value: "ticks", label: "Ticks" },
					{ value: "points", label: "Points" },
			  ]

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{timeframe ? "Edit Timeframe" : "Add Timeframe"}
					</DialogTitle>
					<DialogDescription>
						{timeframe
							? "Update the timeframe configuration"
							: "Add a new timeframe for your trades"}
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
							<Label htmlFor="code">Code</Label>
							<Input
								id="code"
								placeholder="5M"
								value={formData.code}
								onChange={(e) =>
									handleChange("code", e.target.value.toUpperCase())
								}
								required
							/>
						</div>

						<div className="space-y-s-200">
							<Label htmlFor="type">Type</Label>
							<Select
								value={formData.type}
								onValueChange={(value) => {
									handleChange("type", value)
									handleChange(
										"unit",
										value === "time_based" ? "minutes" : "ticks"
									)
								}}
							>
								<SelectTrigger id="type">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="time_based">Time Based</SelectItem>
									<SelectItem value="renko">Renko</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-s-200">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							placeholder="5 Minutes"
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							required
						/>
					</div>

					<div className="grid grid-cols-3 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="value">Value</Label>
							<Input
								id="value"
								type="number"
								placeholder="5"
								value={formData.value}
								onChange={(e) => handleChange("value", e.target.value)}
								required
							/>
						</div>

						<div className="space-y-s-200">
							<Label htmlFor="unit">Unit</Label>
							<Select
								value={formData.unit}
								onValueChange={(value) => handleChange("unit", value)}
							>
								<SelectTrigger id="unit">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{unitOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-s-200">
							<Label htmlFor="sortOrder">Sort Order</Label>
							<Input
								id="sortOrder"
								type="number"
								placeholder="0"
								value={formData.sortOrder}
								onChange={(e) => handleChange("sortOrder", e.target.value)}
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
							{timeframe ? "Save Changes" : "Add Timeframe"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
