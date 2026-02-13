"use client"

import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { format } from "date-fns"
import { useEffectiveDate } from "@/components/providers/effective-date-provider"

export interface ExecutionRowData {
	id: string
	executionType: "entry" | "exit"
	date: string
	time: string
	price: string
	quantity: string
	commission: string
}

interface InlineExecutionRowProps {
	data: ExecutionRowData
	onChange: (id: string, field: keyof ExecutionRowData, value: string) => void
	onRemove: (id: string) => void
	canRemove: boolean
	currency?: string
}

export const InlineExecutionRow = ({
	data,
	onChange,
	onRemove,
	canRemove,
	currency = "$",
}: InlineExecutionRowProps) => {
	const t = useTranslations("execution")
	const effectiveDate = useEffectiveDate()
	const todayDateString = format(effectiveDate, "yyyy-MM-dd")

	return (
		<div className="gap-s-200 grid grid-cols-[4fr_2fr_3fr_2fr_3fr_1fr] items-center">
			<Input
				type="date"
				max={todayDateString}
				value={data.date}
				onChange={(e) => onChange(data.id, "date", e.target.value)}
				className="text-small h-8"
			/>
			<Input
				type="time"
				value={data.time}
				onChange={(e) => onChange(data.id, "time", e.target.value)}
				className="text-small h-8"
			/>
			<Input
				type="number"
				step="any"
				placeholder={t("price")}
				value={data.price}
				onChange={(e) => onChange(data.id, "price", e.target.value)}
				className="text-small h-8"
			/>
			<Input
				type="number"
				step="any"
				placeholder={t("quantity")}
				value={data.quantity}
				onChange={(e) => onChange(data.id, "quantity", e.target.value)}
				className="text-small h-8"
			/>
			<div className="relative">
				<span className="text-tiny text-txt-300 absolute top-1/2 left-2 -translate-y-1/2">
					{currency}
				</span>
				<Input
					type="number"
					step="0.01"
					placeholder="0.00"
					value={data.commission}
					onChange={(e) => onChange(data.id, "commission", e.target.value)}
					className="text-small h-8 pl-5"
				/>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => onRemove(data.id)}
				disabled={!canRemove}
				className="text-txt-300 hover:text-fb-error h-8 w-8 p-0"
			>
				<X className="h-4 w-4" />
			</Button>
		</div>
	)
}
