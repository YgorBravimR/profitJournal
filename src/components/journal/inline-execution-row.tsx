"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

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
	return (
		<div className="grid grid-cols-[1fr_80px_100px_100px_80px_40px] items-center gap-s-200">
			<Input
				type="date"
				value={data.date}
				onChange={(e) => onChange(data.id, "date", e.target.value)}
				className="h-8 text-small"
			/>
			<Input
				type="time"
				value={data.time}
				onChange={(e) => onChange(data.id, "time", e.target.value)}
				className="h-8 text-small"
			/>
			<Input
				type="number"
				step="any"
				placeholder="Price"
				value={data.price}
				onChange={(e) => onChange(data.id, "price", e.target.value)}
				className="h-8 text-small"
			/>
			<Input
				type="number"
				step="any"
				placeholder="Qty"
				value={data.quantity}
				onChange={(e) => onChange(data.id, "quantity", e.target.value)}
				className="h-8 text-small"
			/>
			<div className="relative">
				<span className="absolute left-2 top-1/2 -translate-y-1/2 text-tiny text-txt-300">
					{currency}
				</span>
				<Input
					type="number"
					step="0.01"
					placeholder="0.00"
					value={data.commission}
					onChange={(e) => onChange(data.id, "commission", e.target.value)}
					className="h-8 pl-5 text-small"
				/>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => onRemove(data.id)}
				disabled={!canRemove}
				className="h-8 w-8 p-0 text-txt-300 hover:text-fb-error"
			>
				<X className="h-4 w-4" />
			</Button>
		</div>
	)
}
