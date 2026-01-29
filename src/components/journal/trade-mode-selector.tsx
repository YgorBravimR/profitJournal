"use client"

import { cn } from "@/lib/utils"
import { Layers, BarChart3 } from "lucide-react"

export type TradeMode = "simple" | "scaled"

interface TradeModeSelectorProps {
	value: TradeMode
	onChange: (mode: TradeMode) => void
	disabled?: boolean
}

export const TradeModeSelector = ({
	value,
	onChange,
	disabled = false,
}: TradeModeSelectorProps) => {
	return (
		<div className="space-y-s-200">
			<label className="text-small font-medium text-txt-100">Trade Mode</label>
			<div className="grid grid-cols-2 gap-m-300">
				<button
					type="button"
					onClick={() => onChange("simple")}
					disabled={disabled}
					className={cn(
						"flex flex-col items-center gap-s-200 rounded-lg border-2 p-m-400 transition-colors",
						value === "simple"
							? "border-brand-500 bg-brand-500/10 text-brand-500"
							: "border-bg-300 text-txt-200 hover:border-brand-500/50",
						disabled && "cursor-not-allowed opacity-50"
					)}
				>
					<BarChart3 className="h-5 w-5" />
					<div className="text-center">
						<p className="text-small font-medium">Simple Trade</p>
						<p className="text-tiny text-txt-300">Single entry & exit</p>
					</div>
				</button>
				<button
					type="button"
					onClick={() => onChange("scaled")}
					disabled={disabled}
					className={cn(
						"flex flex-col items-center gap-s-200 rounded-lg border-2 p-m-400 transition-colors",
						value === "scaled"
							? "border-brand-500 bg-brand-500/10 text-brand-500"
							: "border-bg-300 text-txt-200 hover:border-brand-500/50",
						disabled && "cursor-not-allowed opacity-50"
					)}
				>
					<Layers className="h-5 w-5" />
					<div className="text-center">
						<p className="text-small font-medium">Scaled Position</p>
						<p className="text-tiny text-txt-300">Multiple entries/exits</p>
					</div>
				</button>
			</div>
		</div>
	)
}
