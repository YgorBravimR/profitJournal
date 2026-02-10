"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { recalculateAllTradesPnL } from "@/app/actions/trades"
import { useLoadingOverlay } from "@/components/ui/loading-overlay"
import { cn } from "@/lib/utils"

export const RecalculatePnLButton = () => {
	const t = useTranslations("settings.general")
	const tOverlay = useTranslations("overlay")
	const { showLoading, hideLoading } = useLoadingOverlay()
	const [isPending, startTransition] = useTransition()
	const [result, setResult] = useState<{
		message: string
		status: "success" | "error"
	} | null>(null)

	const handleRecalculate = () => {
		setResult(null)
		showLoading({ message: tOverlay("recalculatingPnL") })
		startTransition(async () => {
			const response = await recalculateAllTradesPnL()
			hideLoading()
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
				aria-label={t("recalculatePnLButton")}
				className="rounded-md bg-acc-100 px-m-400 py-s-200 text-small font-medium text-bg-100 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isPending ? t("recalculatingPnL") : t("recalculatePnLButton")}
			</button>
			{result && (
				<p
					className={cn(
						"text-small",
						result.status === "success" ? "text-trade-buy" : "text-trade-sell"
					)}
				>
					{result.message}
				</p>
			)}
		</div>
	)
}
