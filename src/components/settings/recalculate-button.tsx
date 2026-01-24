"use client"

import { useState, useTransition } from "react"
import { recalculateRValues } from "@/app/actions/trades"

export const RecalculateButton = () => {
	const [isPending, startTransition] = useTransition()
	const [result, setResult] = useState<{
		message: string
		status: "success" | "error"
	} | null>(null)

	const handleRecalculate = () => {
		setResult(null)
		startTransition(async () => {
			const response = await recalculateRValues()
			setResult({
				message: response.message,
				status: response.status,
			})
		})
	}

	return (
		<div className="space-y-m-400">
			<button
				type="button"
				onClick={handleRecalculate}
				disabled={isPending}
				className="rounded-md bg-acc-100 px-m-400 py-s-200 text-small font-medium text-bg-100 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isPending ? "Recalculating..." : "Recalculate R Values"}
			</button>
			{result && (
				<p
					className={`text-small ${
						result.status === "success" ? "text-trade-buy" : "text-trade-sell"
					}`}
				>
					{result.message}
				</p>
			)}
		</div>
	)
}
