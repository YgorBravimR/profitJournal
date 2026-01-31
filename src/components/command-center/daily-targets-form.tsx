"use client"

import { useState, useEffect } from "react"
import { Target, Save, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertDailyTargets } from "@/app/actions/command-center"
import type { DailyTarget } from "@/db/schema"
import { fromCents } from "@/lib/money"

interface DailyTargetsFormProps {
	targets: DailyTarget | null
	currency?: string
	onRefresh: () => void
}

export const DailyTargetsForm = ({
	targets,
	currency = "$",
	onRefresh,
}: DailyTargetsFormProps) => {
	const t = useTranslations("commandCenter.targets")

	const [profitTarget, setProfitTarget] = useState("")
	const [lossLimit, setLossLimit] = useState("")
	const [maxTrades, setMaxTrades] = useState("")
	const [maxConsecutiveLosses, setMaxConsecutiveLosses] = useState("")
	const [saving, setSaving] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)

	// Initialize form values from targets
	useEffect(() => {
		if (targets) {
			setProfitTarget(targets.profitTarget ? fromCents(targets.profitTarget).toString() : "")
			setLossLimit(targets.lossLimit ? fromCents(targets.lossLimit).toString() : "")
			setMaxTrades(targets.maxTrades?.toString() || "")
			setMaxConsecutiveLosses(targets.maxConsecutiveLosses?.toString() || "")
		}
	}, [targets])

	// Track changes
	useEffect(() => {
		const currentProfitTarget = targets?.profitTarget ? fromCents(targets.profitTarget).toString() : ""
		const currentLossLimit = targets?.lossLimit ? fromCents(targets.lossLimit).toString() : ""
		const currentMaxTrades = targets?.maxTrades?.toString() || ""
		const currentMaxConsecutiveLosses = targets?.maxConsecutiveLosses?.toString() || ""

		const changed =
			profitTarget !== currentProfitTarget ||
			lossLimit !== currentLossLimit ||
			maxTrades !== currentMaxTrades ||
			maxConsecutiveLosses !== currentMaxConsecutiveLosses

		setHasChanges(changed)
	}, [profitTarget, lossLimit, maxTrades, maxConsecutiveLosses, targets])

	const handleSave = async () => {
		setSaving(true)
		try {
			await upsertDailyTargets({
				profitTarget: profitTarget ? parseFloat(profitTarget) : null,
				lossLimit: lossLimit ? parseFloat(lossLimit) : null,
				maxTrades: maxTrades ? parseInt(maxTrades) : null,
				maxConsecutiveLosses: maxConsecutiveLosses ? parseInt(maxConsecutiveLosses) : null,
				isActive: true,
			})
			onRefresh()
		} catch (error) {
			console.error("Failed to save targets:", error)
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			{/* Header */}
			<div className="mb-m-400 flex items-center justify-between">
				<div className="flex items-center gap-s-200">
					<Target className="h-5 w-5 text-accent-primary" />
					<h3 className="text-body font-semibold text-txt-100">{t("title")}</h3>
				</div>
				{hasChanges && (
					<Button
						size="sm"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? (
							<Loader2 className="mr-s-100 h-4 w-4 animate-spin" />
						) : (
							<Save className="mr-s-100 h-4 w-4" />
						)}
						{saving ? t("saving") : t("save")}
					</Button>
				)}
			</div>

			{/* Form */}
			<div className="grid gap-m-400 md:grid-cols-2">
				{/* Profit Target */}
				<div>
					<label className="mb-s-200 block text-small text-txt-200">
						{t("profitTarget")}
					</label>
					<div className="relative">
						<span className="text-tiny text-txt-300 absolute left-3 top-1/2 -translate-y-1/2">
							{currency}
						</span>
						<Input
							type="number"
							step="0.01"
							min="0"
							value={profitTarget}
							onChange={(e) => setProfitTarget(e.target.value)}
							placeholder="0.00"
							className="pl-7"
						/>
					</div>
					<p className="mt-s-100 text-tiny text-txt-300">{t("profitTargetHelp")}</p>
				</div>

				{/* Loss Limit */}
				<div>
					<label className="mb-s-200 block text-small text-txt-200">
						{t("lossLimit")}
					</label>
					<div className="relative">
						<span className="text-tiny text-txt-300 absolute left-3 top-1/2 -translate-y-1/2">
							{currency}
						</span>
						<Input
							type="number"
							step="0.01"
							min="0"
							value={lossLimit}
							onChange={(e) => setLossLimit(e.target.value)}
							placeholder="0.00"
							className="pl-7"
						/>
					</div>
					<p className="mt-s-100 text-tiny text-txt-300">{t("lossLimitHelp")}</p>
				</div>

				{/* Max Trades */}
				<div>
					<label className="mb-s-200 block text-small text-txt-200">
						{t("maxTrades")}
					</label>
					<Input
						type="number"
						step="1"
						min="1"
						value={maxTrades}
						onChange={(e) => setMaxTrades(e.target.value)}
						placeholder="10"
					/>
					<p className="mt-s-100 text-tiny text-txt-300">{t("maxTradesHelp")}</p>
				</div>

				{/* Max Consecutive Losses */}
				<div>
					<label className="mb-s-200 block text-small text-txt-200">
						{t("maxConsecutiveLosses")}
					</label>
					<Input
						type="number"
						step="1"
						min="1"
						value={maxConsecutiveLosses}
						onChange={(e) => setMaxConsecutiveLosses(e.target.value)}
						placeholder="3"
					/>
					<p className="mt-s-100 text-tiny text-txt-300">{t("maxConsecutiveLossesHelp")}</p>
				</div>
			</div>
		</div>
	)
}
