"use client"

import { useState, useMemo, useCallback } from "react"
import { Save, Loader2, ChevronDown, ChevronUp, Eye } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useFormatting } from "@/hooks/use-formatting"
import { deriveMonthlyPlanValues } from "@/lib/monthly-plan"
import { fromCents, toCents } from "@/lib/money"
import type { MonthlyPlan } from "@/db/schema"

interface MonthlyPlanFormProps {
	plan?: MonthlyPlan | null
	onSave: (data: MonthlyPlanFormData) => Promise<void>
	year: number
	month: number
}

type WinRiskMode = "off" | "increase" | "cap"

const WIN_RISK_MODES: readonly WinRiskMode[] = ["off", "increase", "cap"]

const WIN_RISK_KEYS: Record<
	WinRiskMode,
	"form.winRiskOff" | "form.winRiskIncrease" | "form.winRiskCap"
> = {
	off: "form.winRiskOff",
	increase: "form.winRiskIncrease",
	cap: "form.winRiskCap",
}

interface MonthlyPlanFormData {
	year: number
	month: number
	accountBalance: number // cents
	riskPerTradePercent: number
	dailyLossPercent: number
	monthlyLossPercent: number
	dailyProfitTargetPercent: number | null
	maxDailyTrades: number | null
	maxConsecutiveLosses: number | null
	allowSecondOpAfterLoss: boolean
	reduceRiskAfterLoss: boolean
	riskReductionFactor: number | null
	increaseRiskAfterWin: boolean
	capRiskAfterWin: boolean
	profitReinvestmentPercent: number | null
	notes: string | null
}

const MonthlyPlanForm = ({
	plan,
	onSave,
	year,
	month,
}: MonthlyPlanFormProps) => {
	const t = useTranslations("commandCenter.plan")
	const { formatCurrency } = useFormatting()

	// Required fields
	const [accountBalance, setAccountBalance] = useState(
		plan ? fromCents(plan.accountBalance).toString() : ""
	)
	const [riskPerTradePercent, setRiskPerTradePercent] = useState(
		plan?.riskPerTradePercent ?? ""
	)
	const [dailyLossPercent, setDailyLossPercent] = useState(
		plan?.dailyLossPercent ?? ""
	)
	const [monthlyLossPercent, setMonthlyLossPercent] = useState(
		plan?.monthlyLossPercent ?? ""
	)

	// Optional fields
	const [dailyProfitTargetPercent, setDailyProfitTargetPercent] = useState(
		plan?.dailyProfitTargetPercent ?? ""
	)
	const [maxDailyTrades, setMaxDailyTrades] = useState(
		plan?.maxDailyTrades?.toString() ?? ""
	)
	const [maxConsecutiveLosses, setMaxConsecutiveLosses] = useState(
		plan?.maxConsecutiveLosses?.toString() ?? ""
	)
	const [allowSecondOpAfterLoss, setAllowSecondOpAfterLoss] = useState(
		plan?.allowSecondOpAfterLoss ?? true
	)
	const [reduceRiskAfterLoss, setReduceRiskAfterLoss] = useState(
		plan?.reduceRiskAfterLoss ?? false
	)
	const [riskReductionFactor, setRiskReductionFactor] = useState(
		plan?.riskReductionFactor ?? ""
	)
	const [winRiskMode, setWinRiskMode] = useState<WinRiskMode>(
		plan?.capRiskAfterWin
			? "cap"
			: plan?.increaseRiskAfterWin
				? "increase"
				: "off"
	)
	const [profitReinvestmentPercent, setProfitReinvestmentPercent] = useState(
		plan?.profitReinvestmentPercent ?? ""
	)
	const [notes, setNotes] = useState(plan?.notes ?? "")

	// UI state
	const [showAdvanced, setShowAdvanced] = useState(false)
	const [saving, setSaving] = useState(false)

	const handleWinRiskKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLButtonElement>) => {
			const currentIndex = WIN_RISK_MODES.indexOf(winRiskMode)
			let nextIndex = currentIndex

			if (event.key === "ArrowRight" || event.key === "ArrowDown") {
				event.preventDefault()
				nextIndex = (currentIndex + 1) % WIN_RISK_MODES.length
			} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
				event.preventDefault()
				nextIndex =
					(currentIndex - 1 + WIN_RISK_MODES.length) % WIN_RISK_MODES.length
			} else {
				return
			}

			const nextMode = WIN_RISK_MODES[nextIndex]
			setWinRiskMode(nextMode)

			// Focus the newly selected radio button
			const radioGroup = event.currentTarget.parentElement
			const nextButton =
				radioGroup?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[
					nextIndex
				]
			nextButton?.focus()
		},
		[winRiskMode]
	)

	// Live preview computation
	const preview = useMemo(() => {
		const balanceCents = toCents(accountBalance)
		const riskPct = parseFloat(String(riskPerTradePercent))
		const dailyLossPct = parseFloat(String(dailyLossPercent))
		const monthlyLossPct = parseFloat(String(monthlyLossPercent))
		const profitTargetPct = dailyProfitTargetPercent
			? parseFloat(String(dailyProfitTargetPercent))
			: null
		const maxTradesOverride = maxDailyTrades
			? parseInt(String(maxDailyTrades), 10)
			: null

		if (
			balanceCents <= 0 ||
			isNaN(riskPct) ||
			riskPct <= 0 ||
			isNaN(dailyLossPct) ||
			dailyLossPct <= 0 ||
			isNaN(monthlyLossPct) ||
			monthlyLossPct <= 0
		) {
			return null
		}

		return deriveMonthlyPlanValues({
			accountBalance: balanceCents,
			riskPerTradePercent: riskPct,
			dailyLossPercent: dailyLossPct,
			monthlyLossPercent: monthlyLossPct,
			dailyProfitTargetPercent: profitTargetPct,
			maxDailyTrades: maxTradesOverride,
		})
	}, [
		accountBalance,
		riskPerTradePercent,
		dailyLossPercent,
		monthlyLossPercent,
		dailyProfitTargetPercent,
		maxDailyTrades,
	])

	const handleSave = useCallback(async () => {
		setSaving(true)
		try {
			await onSave({
				year,
				month,
				accountBalance: toCents(accountBalance),
				riskPerTradePercent: parseFloat(String(riskPerTradePercent)),
				dailyLossPercent: parseFloat(String(dailyLossPercent)),
				monthlyLossPercent: parseFloat(String(monthlyLossPercent)),
				dailyProfitTargetPercent: dailyProfitTargetPercent
					? parseFloat(String(dailyProfitTargetPercent))
					: null,
				maxDailyTrades: maxDailyTrades
					? parseInt(String(maxDailyTrades), 10)
					: null,
				maxConsecutiveLosses: maxConsecutiveLosses
					? parseInt(String(maxConsecutiveLosses), 10)
					: null,
				allowSecondOpAfterLoss,
				reduceRiskAfterLoss,
				riskReductionFactor: riskReductionFactor
					? parseFloat(String(riskReductionFactor))
					: null,
				increaseRiskAfterWin: winRiskMode === "increase",
				capRiskAfterWin: winRiskMode === "cap",
				profitReinvestmentPercent: profitReinvestmentPercent
					? parseFloat(String(profitReinvestmentPercent))
					: null,
				notes: notes || null,
			})
		} finally {
			setSaving(false)
		}
	}, [
		year,
		month,
		accountBalance,
		riskPerTradePercent,
		dailyLossPercent,
		monthlyLossPercent,
		dailyProfitTargetPercent,
		maxDailyTrades,
		maxConsecutiveLosses,
		allowSecondOpAfterLoss,
		reduceRiskAfterLoss,
		riskReductionFactor,
		winRiskMode,
		profitReinvestmentPercent,
		notes,
		onSave,
	])

	const isValid =
		parseFloat(String(accountBalance)) > 0 &&
		parseFloat(String(riskPerTradePercent)) > 0 &&
		parseFloat(String(dailyLossPercent)) > 0 &&
		parseFloat(String(monthlyLossPercent)) > 0

	return (
		<div className="space-y-m-500">
			{/* Two-column layout: Form + Preview */}
			<div className="gap-m-500 grid lg:grid-cols-2">
				{/* Left: Form */}
				<div className="space-y-m-400">
					{/* Required Fields */}
					<div className="gap-m-400 grid sm:grid-cols-2">
						{/* Account Balance */}
						<div className="sm:col-span-2">
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("form.accountBalance")}
							</label>
							<div className="relative">
								<span className="text-tiny text-txt-300 absolute top-1/2 left-3 -translate-y-1/2">
									R$
								</span>
								<Input
									id="plan-account-balance"
									type="number"
									step="0.01"
									min="0"
									value={accountBalance}
									onChange={(e) => setAccountBalance(e.target.value)}
									placeholder="0.00"
									className="pl-8"
									aria-label={t("form.accountBalance")}
								/>
							</div>
							<p className="mt-s-100 text-tiny text-txt-300">
								{t("form.accountBalanceHelp")}
							</p>
						</div>

						{/* Risk per Trade % */}
						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("form.riskPerTrade")}
							</label>
							<div className="relative">
								<Input
									id="plan-risk-per-trade"
									type="number"
									step="0.01"
									min="0"
									max="100"
									value={riskPerTradePercent}
									onChange={(e) => setRiskPerTradePercent(e.target.value)}
									placeholder="1.00"
									className="pr-8"
									aria-label={t("form.riskPerTrade")}
								/>
								<span className="text-tiny text-txt-300 absolute top-1/2 right-3 -translate-y-1/2">
									%
								</span>
							</div>
							<p className="mt-s-100 text-tiny text-txt-300">
								{t("form.riskPerTradeHelp")}
							</p>
						</div>

						{/* Daily Loss % */}
						<div>
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("form.dailyLoss")}
							</label>
							<div className="relative">
								<Input
									id="plan-daily-loss"
									type="number"
									step="0.01"
									min="0"
									max="100"
									value={dailyLossPercent}
									onChange={(e) => setDailyLossPercent(e.target.value)}
									placeholder="3.00"
									className="pr-8"
									aria-label={t("form.dailyLoss")}
								/>
								<span className="text-tiny text-txt-300 absolute top-1/2 right-3 -translate-y-1/2">
									%
								</span>
							</div>
							<p className="mt-s-100 text-tiny text-txt-300">
								{t("form.dailyLossHelp")}
							</p>
						</div>

						{/* Monthly Loss % */}
						<div className="sm:col-span-2">
							<label className="mb-s-200 text-small text-txt-200 block">
								{t("form.monthlyLoss")}
							</label>
							<div className="relative">
								<Input
									id="plan-monthly-loss"
									type="number"
									step="0.01"
									min="0"
									max="100"
									value={monthlyLossPercent}
									onChange={(e) => setMonthlyLossPercent(e.target.value)}
									placeholder="10.00"
									className="pr-8"
									aria-label={t("form.monthlyLoss")}
								/>
								<span className="text-tiny text-txt-300 absolute top-1/2 right-3 -translate-y-1/2">
									%
								</span>
							</div>
							<p className="mt-s-100 text-tiny text-txt-300">
								{t("form.monthlyLossHelp")}
							</p>
						</div>
					</div>

					{/* Advanced Settings Toggle */}
					<button
						type="button"
						onClick={() => setShowAdvanced((prev) => !prev)}
						className="gap-s-200 border-bg-300 bg-bg-100 px-m-400 py-s-300 text-small text-txt-200 hover:bg-bg-200 flex w-full items-center rounded-lg border transition-colors"
						aria-expanded={showAdvanced}
						aria-label={t("form.advanced")}
					>
						{showAdvanced ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
						{t("form.advanced")}
					</button>

					{/* Advanced Fields (Collapsible) */}
					{showAdvanced && (
						<div className="space-y-m-400 border-bg-300 bg-bg-100 p-m-400 rounded-lg border">
							<div className="gap-m-400 grid sm:grid-cols-2">
								{/* Daily Profit Target % */}
								<div>
									<label className="mb-s-200 text-small text-txt-200 block">
										{t("form.dailyProfitTarget")}
									</label>
									<div className="relative">
										<Input
											id="plan-daily-profit-target"
											type="number"
											step="0.01"
											min="0"
											value={dailyProfitTargetPercent}
											onChange={(e) =>
												setDailyProfitTargetPercent(e.target.value)
											}
											placeholder="5.00"
											className="pr-8"
											aria-label={t("form.dailyProfitTarget")}
										/>
										<span className="text-tiny text-txt-300 absolute top-1/2 right-3 -translate-y-1/2">
											%
										</span>
									</div>
									<p className="mt-s-100 text-tiny text-txt-300">
										{t("form.dailyProfitTargetHelp")}
									</p>
								</div>

								{/* Max Daily Trades */}
								<div>
									<label className="mb-s-200 text-small text-txt-200 block">
										{t("form.maxDailyTrades")}
									</label>
									<Input
										id="plan-max-daily-trades"
										type="number"
										step="1"
										min="1"
										value={maxDailyTrades}
										onChange={(e) => setMaxDailyTrades(e.target.value)}
										placeholder="auto"
										aria-label={t("form.maxDailyTrades")}
									/>
									<p className="mt-s-100 text-tiny text-txt-300">
										{t("form.maxDailyTradesHelp")}
									</p>
								</div>

								{/* Max Consecutive Losses */}
								<div>
									<label className="mb-s-200 text-small text-txt-200 block">
										{t("form.maxConsecutiveLosses")}
									</label>
									<Input
										id="plan-max-consecutive-losses"
										type="number"
										step="1"
										min="1"
										value={maxConsecutiveLosses}
										onChange={(e) => setMaxConsecutiveLosses(e.target.value)}
										placeholder="3"
										aria-label={t("form.maxConsecutiveLosses")}
									/>
									<p className="mt-s-100 text-tiny text-txt-300">
										{t("form.maxConsecutiveLossesHelp")}
									</p>
								</div>
							</div>

							{/* Behavioral Switches */}
							<div className="space-y-m-400 border-bg-300 pt-m-400 border-t">
								{/* Allow 2nd Op */}
								<div className="flex items-center justify-between">
									<label className="text-small text-txt-200">
										{t("form.allowSecondOp")}
									</label>
									<Switch
										id="allow-second-op-after-loss"
										checked={allowSecondOpAfterLoss}
										onCheckedChange={setAllowSecondOpAfterLoss}
										aria-label={t("form.allowSecondOp")}
									/>
								</div>

								{/* Reduce Risk After Loss */}
								<div className="flex items-center justify-between">
									<label className="text-small text-txt-200">
										{t("form.reduceRisk")}
									</label>
									<Switch
										id="reduce-risk-after-loss"
										checked={reduceRiskAfterLoss}
										onCheckedChange={setReduceRiskAfterLoss}
										aria-label={t("form.reduceRisk")}
									/>
								</div>

								{/* Risk Reduction Factor (shown when reduceRiskAfterLoss is on) */}
								{reduceRiskAfterLoss && (
									<div className="ml-m-400">
										<label className="mb-s-200 text-small text-txt-200 block">
											{t("form.riskReductionFactor")}
										</label>
										<Input
											id="plan-risk-reduction-factor"
											type="number"
											step="0.01"
											min="0.01"
											max="1"
											value={riskReductionFactor}
											onChange={(e) => setRiskReductionFactor(e.target.value)}
											placeholder="0.50"
											aria-label={t("form.riskReductionFactor")}
										/>
										<p className="mt-s-100 text-tiny text-txt-300">
											{t("form.riskReductionFactorHelp")}
										</p>
									</div>
								)}

								{/* Win Risk Adjustment — 3-way selector */}
								<div className="space-y-s-300">
									<label className="text-small text-txt-200">
										{t("form.winRiskAdjustment")}
									</label>
									<div
										className="gap-s-200 border-bg-300 bg-bg-200 p-s-100 flex rounded-lg border"
										role="radiogroup"
										aria-label={t("form.winRiskAdjustment")}
									>
										{WIN_RISK_MODES.map((mode) => (
											<button
												key={mode}
												type="button"
												role="radio"
												aria-checked={winRiskMode === mode}
												onClick={() => setWinRiskMode(mode)}
												onKeyDown={handleWinRiskKeyDown}
												className={`px-m-300 py-s-200 text-small flex-1 rounded-md font-medium transition-all ${
													winRiskMode === mode
														? "bg-acc-100 text-bg-100 shadow-sm"
														: "text-txt-300 hover:text-txt-200"
												}`}
												tabIndex={winRiskMode === mode ? 0 : -1}
												aria-label={t(WIN_RISK_KEYS[mode])}
											>
												{t(WIN_RISK_KEYS[mode])}
											</button>
										))}
									</div>
									{winRiskMode !== "off" && (
										<p className="text-tiny text-txt-300">
											{winRiskMode === "increase"
												? t("form.winRiskIncreaseDesc")
												: t("form.winRiskCapDesc")}
										</p>
									)}
								</div>

								{/* Profit Reinvestment / Cap % (shown when mode is increase or cap) */}
								{winRiskMode !== "off" && (
									<div className="ml-m-400">
										<label className="mb-s-200 text-small text-txt-200 block">
											{t("form.profitReinvestment")}
										</label>
										<div className="relative">
											<Input
												id="plan-profit-reinvestment"
												type="number"
												step="1"
												min="1"
												max="100"
												value={profitReinvestmentPercent}
												onChange={(e) =>
													setProfitReinvestmentPercent(e.target.value)
												}
												placeholder="50"
												className="pr-8"
												aria-label={t("form.profitReinvestment")}
											/>
											<span className="text-tiny text-txt-300 absolute top-1/2 right-3 -translate-y-1/2">
												%
											</span>
										</div>
										<p className="mt-s-100 text-tiny text-txt-300">
											{winRiskMode === "increase"
												? t("form.profitReinvestmentHelpIncrease")
												: t("form.profitReinvestmentHelpCap")}
										</p>
									</div>
								)}
							</div>

							{/* Notes */}
							<div className="border-bg-300 pt-m-400 border-t">
								<label className="mb-s-200 text-small text-txt-200 block">
									{t("form.notes")}
								</label>
								<textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder={t("form.notesPlaceholder")}
									className="border-bg-300 bg-bg-100 text-small text-txt-100 placeholder:text-txt-300 focus:ring-acc-100 min-h-[80px] w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
									aria-label={t("form.notes")}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Right: Live Preview */}
				<div className="border-bg-300 bg-bg-100 p-m-400 rounded-lg border">
					<div className="mb-m-400 gap-s-200 flex items-center">
						<Eye className="text-acc-100 h-4 w-4" />
						<h4 className="text-small text-txt-100 font-semibold">
							{t("preview.title")}
						</h4>
					</div>

					{preview ? (
						<div className="space-y-m-300">
							<PreviewRow
								label={t("preview.riskPerTrade")}
								value={formatCurrency(fromCents(preview.riskPerTradeCents))}
							/>
							<PreviewRow
								label={t("preview.dailyLossLimit")}
								value={formatCurrency(fromCents(preview.dailyLossCents))}
							/>
							<PreviewRow
								label={t("preview.monthlyLossLimit")}
								value={formatCurrency(fromCents(preview.monthlyLossCents))}
							/>
							{preview.dailyProfitTargetCents !== null && (
								<PreviewRow
									label={t("preview.dailyProfitTarget")}
									value={formatCurrency(
										fromCents(preview.dailyProfitTargetCents)
									)}
								/>
							)}
							{preview.derivedMaxDailyTrades !== null && (
								<PreviewRow
									label={t("preview.maxTradesPerDay")}
									value={String(preview.derivedMaxDailyTrades)}
									subValue={
										!maxDailyTrades ? `(${t("preview.derived")})` : undefined
									}
								/>
							)}
						</div>
					) : (
						<p className="text-small text-txt-300">{t("description")}</p>
					)}
				</div>
			</div>

			{/* Save Button */}
			<div className="flex justify-end">
				<Button id="plan-save"
					onClick={handleSave}
					disabled={saving || !isValid}
					aria-label={t("save")}
				>
					{saving ? (
						<Loader2 className="mr-s-100 h-4 w-4 animate-spin" />
					) : (
						<Save className="mr-s-100 h-4 w-4" />
					)}
					{saving ? t("saving") : t("save")}
				</Button>
			</div>
		</div>
	)
}

interface PreviewRowProps {
	label: string
	value: string
	subValue?: string
}

const PreviewRow = ({ label, value, subValue }: PreviewRowProps) => (
	<div className="border-bg-300 pb-s-200 flex items-center justify-between border-b last:border-0">
		<span className="text-small text-txt-300">{label}</span>
		<div className="text-right">
			<span className="text-small text-txt-100 font-semibold">{value}</span>
			{subValue && (
				<span className="ml-s-200 text-tiny text-txt-300">{subValue}</span>
			)}
		</div>
	</div>
)

export { MonthlyPlanForm }
