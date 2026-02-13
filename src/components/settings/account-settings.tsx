"use client"

import { useState, useTransition, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { RecalculateButton } from "./recalculate-button"
import { RecalculatePnLButton } from "./recalculate-pnl-button"
import { Link } from "@/i18n/routing"
import { getCurrentAccount } from "@/app/actions/auth"
import { updateAccount, getAccountAssets, updateAccountAsset } from "@/app/actions/accounts"
import { Loader2 } from "lucide-react"
import { fromCents, toCents } from "@/lib/money"
import type { TradingAccount, AccountAsset, Asset } from "@/db/schema"

interface AccountSettingsProps {
	assets: Array<Asset & { assetType?: { code: string; name: string } | null }>
}

export const AccountSettings = ({ assets }: AccountSettingsProps) => {
	const t = useTranslations("settings.account")
	const tGeneral = useTranslations("settings.general")
	const tCommon = useTranslations("common")
	const { showToast } = useToast()
	const [isPending, startTransition] = useTransition()
	const [isLoading, setIsLoading] = useState(true)
	const [account, setAccount] = useState<TradingAccount | null>(null)
	const [accountAssets, setAccountAssets] = useState<AccountAsset[]>([])

	// Account editing
	const [isEditingAccount, setIsEditingAccount] = useState(false)
	const [accountForm, setAccountForm] = useState({
		name: "",
		accountType: "personal" as "personal" | "prop" | "replay",
		propFirmName: "",
		profitSharePercentage: "100",
		defaultCommission: "0",
		defaultFees: "0",
		replayStartDate: "",
	})

	// Risk management editing
	const [isEditingRisk, setIsEditingRisk] = useState(false)
	const [riskForm, setRiskForm] = useState({
		maxMonthlyLoss: "",
		allowSecondOpAfterLoss: true,
		reduceRiskAfterLoss: false,
		riskReductionFactor: "",
	})

	// Asset fees editing
	const [editingAssetId, setEditingAssetId] = useState<string | null>(null)
	const [assetFeesForm, setAssetFeesForm] = useState({
		commission: "0",
		fees: "0",
	})

	useEffect(() => {
		const loadData = async () => {
			try {
				const [accountData, assetsResult] = await Promise.all([
					getCurrentAccount(),
					getAccountAssets(),
				])
				setAccount(accountData)
				if (assetsResult.status === "success" && assetsResult.data) {
					// Extract the base AccountAsset data from AccountAssetWithDetails
					setAccountAssets(assetsResult.data.map(({ asset, ...rest }) => rest))
				}
				if (accountData) {
					setAccountForm({
						name: accountData.name,
						accountType: accountData.accountType,
						propFirmName: accountData.propFirmName || "",
						profitSharePercentage: accountData.profitSharePercentage,
						defaultCommission: fromCents(accountData.defaultCommission).toString(),
						defaultFees: fromCents(accountData.defaultFees).toString(),
						replayStartDate: accountData.replayCurrentDate
							? new Date(accountData.replayCurrentDate).toISOString().split("T")[0]
							: "",
					})
					setRiskForm({
						maxMonthlyLoss: accountData.maxMonthlyLoss
							? fromCents(accountData.maxMonthlyLoss).toString()
							: "",
						allowSecondOpAfterLoss: accountData.allowSecondOpAfterLoss ?? true,
						reduceRiskAfterLoss: accountData.reduceRiskAfterLoss ?? false,
						riskReductionFactor: accountData.riskReductionFactor || "",
					})
				}
			} finally {
				setIsLoading(false)
			}
		}
		loadData()
	}, [])

	const handleSaveAccount = () => {
		if (!account) return

		startTransition(async () => {
			const result = await updateAccount(account.id, {
				name: accountForm.name,
				accountType: accountForm.accountType,
				propFirmName: accountForm.accountType === "prop" ? accountForm.propFirmName : undefined,
				profitSharePercentage: parseFloat(accountForm.profitSharePercentage) || 100,
				defaultCommission: toCents(parseFloat(accountForm.defaultCommission) || 0),
				defaultFees: toCents(parseFloat(accountForm.defaultFees) || 0),
				replayStartDate: accountForm.accountType === "replay" ? accountForm.replayStartDate : undefined,
			})
			if (result.status === "success" && result.data) {
				setAccount(result.data)
				setIsEditingAccount(false)
				showToast("success", t("accountUpdated"))
			} else {
				showToast("error", result.error || t("accountUpdateError"))
			}
		})
	}

	const handleSaveRisk = () => {
		if (!account) return

		startTransition(async () => {
			const result = await updateAccount(account.id, {
				maxMonthlyLoss: riskForm.maxMonthlyLoss
					? toCents(parseFloat(riskForm.maxMonthlyLoss) || 0)
					: 0,
				allowSecondOpAfterLoss: riskForm.allowSecondOpAfterLoss,
				reduceRiskAfterLoss: riskForm.reduceRiskAfterLoss,
				riskReductionFactor: riskForm.reduceRiskAfterLoss && riskForm.riskReductionFactor
					? parseFloat(riskForm.riskReductionFactor) || undefined
					: undefined,
			})
			if (result.status === "success" && result.data) {
				setAccount(result.data)
				setIsEditingRisk(false)
				showToast("success", t("accountUpdated"))
			} else {
				showToast("error", result.error || t("accountUpdateError"))
			}
		})
	}

	const handleEditAssetFees = (assetId: string) => {
		const existing = accountAssets.find((aa) => aa.assetId === assetId)
		setAssetFeesForm({
			commission: existing ? fromCents(existing.commissionOverride || 0).toString() : "0",
			fees: existing ? fromCents(existing.feesOverride || 0).toString() : "0",
		})
		setEditingAssetId(assetId)
	}

	const handleSaveAssetFees = () => {
		if (!editingAssetId) return

		startTransition(async () => {
			const result = await updateAccountAsset({
				assetId: editingAssetId,
				isEnabled: true,
				commissionOverride: toCents(parseFloat(assetFeesForm.commission) || 0),
				feesOverride: toCents(parseFloat(assetFeesForm.fees) || 0),
			})
			if (result.status === "success") {
				// Update local state
				setAccountAssets((prev) => {
					const existing = prev.find((aa) => aa.assetId === editingAssetId)
					const newData = {
						id: existing?.id || "",
						accountId: account?.id || "",
						assetId: editingAssetId,
						isEnabled: true,
						commissionOverride: toCents(parseFloat(assetFeesForm.commission) || 0),
						feesOverride: toCents(parseFloat(assetFeesForm.fees) || 0),
						notes: null,
						createdAt: existing?.createdAt || new Date(),
						updatedAt: new Date(),
					}
					if (existing) {
						return prev.map((aa) =>
							aa.assetId === editingAssetId ? newData : aa
						)
					}
					return [...prev, newData]
				})
				setEditingAssetId(null)
				showToast("success", t("assetFeesUpdated"))
			} else {
				showToast("error", result.error || t("assetFeesUpdateError"))
			}
		})
	}

	const getAssetFees = (assetId: string) => {
		const override = accountAssets.find((aa) => aa.assetId === assetId)
		if (override && (override.commissionOverride !== null || override.feesOverride !== null)) {
			return {
				commission: fromCents(override.commissionOverride || 0),
				fees: fromCents(override.feesOverride || 0),
				isOverride: true,
			}
		}
		return {
			commission: fromCents(account?.defaultCommission || 0),
			fees: fromCents(account?.defaultFees || 0),
			isOverride: false,
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-txt-300" />
			</div>
		)
	}

	return (
		<div className="mx-auto max-w-2xl space-y-m-600">
			{/* Account Information */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center justify-between">
					<h2 className="text-body font-semibold text-txt-100">
						{t("accountInfo")}
					</h2>
					{!isEditingAccount && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditingAccount(true)}
						>
							{tCommon("edit")}
						</Button>
					)}
				</div>
				<div className="mt-m-400 space-y-m-400">
					<div className="flex items-center justify-between gap-m-400">
						<div className="flex-1">
							<p className="text-small text-txt-100">{t("accountName")}</p>
						</div>
						{isEditingAccount ? (
							<Input
								value={accountForm.name}
								onChange={(e) =>
									setAccountForm((prev) => ({ ...prev, name: e.target.value }))
								}
								className="w-64"
							/>
						) : (
							<span className="text-small text-txt-200">{account?.name}</span>
						)}
					</div>
					<div className="flex items-center justify-between gap-m-400">
						<div className="flex-1">
							<p className="text-small text-txt-100">{t("accountType")}</p>
						</div>
						{isEditingAccount ? (
							<Select
								value={accountForm.accountType}
								onValueChange={(value: "personal" | "prop" | "replay") =>
									setAccountForm((prev) => ({ ...prev, accountType: value }))
								}
							>
								<SelectTrigger className="w-48">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="personal">{t("personal")}</SelectItem>
									<SelectItem value="prop">{t("propFirm")}</SelectItem>
									<SelectItem value="replay">{t("replay")}</SelectItem>
								</SelectContent>
							</Select>
						) : (
							<span className="text-small text-txt-200">
								{account?.accountType === "replay" ? t("replay") : account?.accountType === "prop" ? t("propFirm") : t("personal")}
							</span>
						)}
					</div>
					{(accountForm.accountType === "replay" || account?.accountType === "replay") && (
						<div className="flex items-center justify-between gap-m-400">
							<div className="flex-1">
								<p className="text-small text-txt-100">{t("replayStartDate")}</p>
								<p className="text-tiny text-txt-300">{t("replayStartDateHelp")}</p>
							</div>
							{isEditingAccount ? (
								<Input
									type="date"
									value={accountForm.replayStartDate}
									onChange={(e) =>
										setAccountForm((prev) => ({
											...prev,
											replayStartDate: e.target.value,
										}))
									}
									className="w-48"
								/>
							) : (
								<span className="text-small text-txt-200">
									{account?.replayCurrentDate
										? new Date(account.replayCurrentDate).toLocaleDateString()
										: "-"}
								</span>
							)}
						</div>
					)}
				{(accountForm.accountType === "prop" || account?.accountType === "prop") && (
						<>
							<div className="flex items-center justify-between gap-m-400">
								<div className="flex-1">
									<p className="text-small text-txt-100">{t("propFirmName")}</p>
								</div>
								{isEditingAccount ? (
									<Input
										value={accountForm.propFirmName}
										onChange={(e) =>
											setAccountForm((prev) => ({
												...prev,
												propFirmName: e.target.value,
											}))
										}
										className="w-64"
										placeholder={t("propFirmNamePlaceholder")}
									/>
								) : (
									<span className="text-small text-txt-200">
										{account?.propFirmName || "-"}
									</span>
								)}
							</div>
							<div className="flex items-center justify-between gap-m-400">
								<div className="flex-1">
									<p className="text-small text-txt-100">{t("profitShare")}</p>
								</div>
								{isEditingAccount ? (
									<div className="flex items-center gap-s-200">
										<Input
											type="number"
											min="0"
											max="100"
											step="0.01"
											value={accountForm.profitSharePercentage}
											onChange={(e) =>
												setAccountForm((prev) => ({
													...prev,
													profitSharePercentage: e.target.value,
												}))
											}
											className="w-24 text-right"
										/>
										<span className="text-small text-txt-300">%</span>
									</div>
								) : (
									<span className="text-small text-txt-200">
										{account?.profitSharePercentage}%
									</span>
								)}
							</div>
						</>
					)}
				</div>
				{isEditingAccount && (
					<div className="mt-m-500 flex justify-end gap-s-300">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setIsEditingAccount(false)
								if (account) {
									setAccountForm({
										name: account.name,
										accountType: account.accountType,
										propFirmName: account.propFirmName || "",
										profitSharePercentage: account.profitSharePercentage,
										defaultCommission: fromCents(account.defaultCommission).toString(),
										defaultFees: fromCents(account.defaultFees).toString(),
										replayStartDate: account.replayCurrentDate
											? new Date(account.replayCurrentDate).toISOString().split("T")[0]
											: "",
									})
								}
							}}
							disabled={isPending}
						>
							{tCommon("cancel")}
						</Button>
						<Button size="sm" onClick={handleSaveAccount} disabled={isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{tCommon("save")}
						</Button>
					</div>
				)}
			</div>

			{/* Risk Management */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center justify-between">
					<h2 className="text-body font-semibold text-txt-100">
						{t("riskManagement")}
					</h2>
					{!isEditingRisk && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditingRisk(true)}
						>
							{tCommon("edit")}
						</Button>
					)}
				</div>
				<p className="mt-s-200 text-tiny text-txt-300">{t("riskManagementDesc")}</p>
				<div className="mt-m-400 space-y-m-400">
					{/* Max Monthly Loss */}
					<div className="flex items-center justify-between gap-m-400">
						<div className="flex-1">
							<p className="text-small text-txt-100">{t("maxMonthlyLoss")}</p>
							<p className="text-tiny text-txt-300">{t("maxMonthlyLossHelp")}</p>
						</div>
						{isEditingRisk ? (
							<div className="flex items-center gap-s-200">
								<span className="text-small text-txt-300">$</span>
								<Input
									type="number"
									step="0.01"
									min="0"
									value={riskForm.maxMonthlyLoss}
									onChange={(e) =>
										setRiskForm((prev) => ({
											...prev,
											maxMonthlyLoss: e.target.value,
										}))
									}
									className="w-32 text-right"
									placeholder="0.00"
								/>
							</div>
						) : (
							<span className="text-small text-txt-200">
								{account?.maxMonthlyLoss
									? `$${fromCents(account.maxMonthlyLoss).toFixed(2)}`
									: "-"}
							</span>
						)}
					</div>

					{/* Allow Second Op After Loss */}
					<div className="flex items-center justify-between gap-m-400">
						<div className="flex-1">
							<p className="text-small text-txt-100">{t("allowSecondOpAfterLoss")}</p>
							<p className="text-tiny text-txt-300">{t("allowSecondOpAfterLossHelp")}</p>
						</div>
						{isEditingRisk ? (
							<button
								type="button"
								role="switch"
								aria-checked={riskForm.allowSecondOpAfterLoss}
								aria-label={t("allowSecondOpAfterLoss")}
								tabIndex={0}
								onClick={() =>
									setRiskForm((prev) => ({
										...prev,
										allowSecondOpAfterLoss: !prev.allowSecondOpAfterLoss,
									}))
								}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault()
										setRiskForm((prev) => ({
											...prev,
											allowSecondOpAfterLoss: !prev.allowSecondOpAfterLoss,
										}))
									}
								}}
								className={cn(
									"relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
									riskForm.allowSecondOpAfterLoss ? "bg-trade-buy" : "bg-bg-400"
								)}
							>
								<span
									className={cn(
										"pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
										riskForm.allowSecondOpAfterLoss ? "translate-x-5" : "translate-x-0"
									)}
								/>
							</button>
						) : (
							<span className="text-small text-txt-200">
								{(account?.allowSecondOpAfterLoss ?? true) ? tCommon("yes") : tCommon("no")}
							</span>
						)}
					</div>

					{/* Reduce Risk After Loss */}
					<div className="flex items-center justify-between gap-m-400">
						<div className="flex-1">
							<p className="text-small text-txt-100">{t("reduceRiskAfterLoss")}</p>
							<p className="text-tiny text-txt-300">{t("reduceRiskAfterLossHelp")}</p>
						</div>
						{isEditingRisk ? (
							<button
								type="button"
								role="switch"
								aria-checked={riskForm.reduceRiskAfterLoss}
								aria-label={t("reduceRiskAfterLoss")}
								tabIndex={0}
								onClick={() =>
									setRiskForm((prev) => ({
										...prev,
										reduceRiskAfterLoss: !prev.reduceRiskAfterLoss,
									}))
								}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault()
										setRiskForm((prev) => ({
											...prev,
											reduceRiskAfterLoss: !prev.reduceRiskAfterLoss,
										}))
									}
								}}
								className={cn(
									"relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
									riskForm.reduceRiskAfterLoss ? "bg-trade-buy" : "bg-bg-400"
								)}
							>
								<span
									className={cn(
										"pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform",
										riskForm.reduceRiskAfterLoss ? "translate-x-5" : "translate-x-0"
									)}
								/>
							</button>
						) : (
							<span className="text-small text-txt-200">
								{account?.reduceRiskAfterLoss ? tCommon("yes") : tCommon("no")}
							</span>
						)}
					</div>

					{/* Risk Reduction Factor (only shown when reduceRiskAfterLoss is active) */}
					{(isEditingRisk ? riskForm.reduceRiskAfterLoss : account?.reduceRiskAfterLoss) && (
						<div className="flex items-center justify-between gap-m-400">
							<div className="flex-1">
								<p className="text-small text-txt-100">{t("riskReductionFactor")}</p>
								<p className="text-tiny text-txt-300">{t("riskReductionFactorHelp")}</p>
							</div>
							{isEditingRisk ? (
								<Input
									type="number"
									step="0.01"
									min="0.01"
									max="1"
									value={riskForm.riskReductionFactor}
									onChange={(e) =>
										setRiskForm((prev) => ({
											...prev,
											riskReductionFactor: e.target.value,
										}))
									}
									className="w-24 text-right"
									placeholder="0.50"
								/>
							) : (
								<span className="text-small text-txt-200">
									{account?.riskReductionFactor || "-"}
								</span>
							)}
						</div>
					)}
				</div>
				{isEditingRisk && (
					<div className="mt-m-500 flex justify-end gap-s-300">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setIsEditingRisk(false)
								if (account) {
									setRiskForm({
										maxMonthlyLoss: account.maxMonthlyLoss
											? fromCents(account.maxMonthlyLoss).toString()
											: "",
										allowSecondOpAfterLoss: account.allowSecondOpAfterLoss ?? true,
										reduceRiskAfterLoss: account.reduceRiskAfterLoss ?? false,
										riskReductionFactor: account.riskReductionFactor || "",
									})
								}
							}}
							disabled={isPending}
						>
							{tCommon("cancel")}
						</Button>
						<Button size="sm" onClick={handleSaveRisk} disabled={isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{tCommon("save")}
						</Button>
					</div>
				)}
			</div>

			{/* Default Commission & Fees */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center justify-between">
					<h2 className="text-body font-semibold text-txt-100">
						{t("defaultFees")}
					</h2>
					{!isEditingAccount && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditingAccount(true)}
						>
							{tCommon("edit")}
						</Button>
					)}
				</div>
				<p className="mt-s-200 text-tiny text-txt-300">{t("defaultFeesDesc")}</p>
				<div className="mt-m-400 space-y-m-400">
					<div className="flex items-center justify-between gap-m-400">
						<div className="flex-1">
							<p className="text-small text-txt-100">{t("commission")}</p>
							<p className="text-tiny text-txt-300">{t("perContract")}</p>
						</div>
						{isEditingAccount ? (
							<div className="flex items-center gap-s-200">
								<span className="text-small text-txt-300">$</span>
								<Input
									type="number"
									step="0.01"
									min="0"
									value={accountForm.defaultCommission}
									onChange={(e) =>
										setAccountForm((prev) => ({
											...prev,
											defaultCommission: e.target.value,
										}))
									}
									className="w-24 text-right"
								/>
							</div>
						) : (
							<span className="text-small text-txt-200">
								${fromCents(account?.defaultCommission || 0).toFixed(2)}
							</span>
						)}
					</div>
					<div className="flex items-center justify-between gap-m-400">
						<div className="flex-1">
							<p className="text-small text-txt-100">{t("fees")}</p>
							<p className="text-tiny text-txt-300">{t("perContract")}</p>
						</div>
						{isEditingAccount ? (
							<div className="flex items-center gap-s-200">
								<span className="text-small text-txt-300">$</span>
								<Input
									type="number"
									step="0.01"
									min="0"
									value={accountForm.defaultFees}
									onChange={(e) =>
										setAccountForm((prev) => ({
											...prev,
											defaultFees: e.target.value,
										}))
									}
									className="w-24 text-right"
								/>
							</div>
						) : (
							<span className="text-small text-txt-200">
								${fromCents(account?.defaultFees || 0).toFixed(2)}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Per-Asset Fee Overrides */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">
					{t("assetFeeOverrides")}
				</h2>
				<p className="mt-s-200 text-tiny text-txt-300">
					{t("assetFeeOverridesDesc")}
				</p>
				<div className="mt-m-400 space-y-s-300">
					{assets.map((asset) => {
						const fees = getAssetFees(asset.id)
						const isEditing = editingAssetId === asset.id
						return (
							<div
								key={asset.id}
								className="flex items-center justify-between rounded-md border border-bg-300 p-s-300"
							>
								<div className="flex-1">
									<p className="text-small font-medium text-txt-100">
										{asset.symbol}
									</p>
									<p className="text-tiny text-txt-300">{asset.name}</p>
								</div>
								{isEditing ? (
									<div className="flex items-center gap-s-300">
										<div className="flex items-center gap-s-200">
											<Label className="text-tiny text-txt-300">
												{t("commission")}
											</Label>
											<Input
												type="number"
												step="0.01"
												min="0"
												value={assetFeesForm.commission}
												onChange={(e) =>
													setAssetFeesForm((prev) => ({
														...prev,
														commission: e.target.value,
													}))
												}
												className="h-8 w-20 text-right text-sm"
											/>
										</div>
										<div className="flex items-center gap-s-200">
											<Label className="text-tiny text-txt-300">
												{t("fees")}
											</Label>
											<Input
												type="number"
												step="0.01"
												min="0"
												value={assetFeesForm.fees}
												onChange={(e) =>
													setAssetFeesForm((prev) => ({
														...prev,
														fees: e.target.value,
													}))
												}
												className="h-8 w-20 text-right text-sm"
											/>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setEditingAssetId(null)}
											disabled={isPending}
										>
											{tCommon("cancel")}
										</Button>
										<Button
											size="sm"
											onClick={handleSaveAssetFees}
											disabled={isPending}
										>
											{isPending && (
												<Loader2 className="mr-2 h-3 w-3 animate-spin" />
											)}
											{tCommon("save")}
										</Button>
									</div>
								) : (
									<div className="flex items-center gap-m-400">
										<div className="text-right">
											<p className="text-small text-txt-200">
												${fees.commission.toFixed(2)} / ${fees.fees.toFixed(2)}
											</p>
											{fees.isOverride && (
												<p className="text-tiny text-acc-100">{t("override")}</p>
											)}
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEditAssetFees(asset.id)}
										>
											{tCommon("edit")}
										</Button>
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>

			{/* Data Maintenance */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">
					{tGeneral("dataMaintenance")}
				</h2>
				<div className="mt-m-400 space-y-m-400">
					<div>
						<p className="text-small text-txt-100">{tGeneral("recalculateR")}</p>
						<p className="mb-m-400 text-tiny text-txt-300">
							{tGeneral("recalculateRDescription")}
						</p>
						<RecalculateButton />
					</div>
					<div>
						<p className="text-small text-txt-100">{tGeneral("recalculatePnL")}</p>
						<p className="mb-m-400 text-tiny text-txt-300">
							{tGeneral("recalculatePnLDescription")}
						</p>
						<RecalculatePnLButton />
					</div>
				</div>
			</div>

			{/* Data Import */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">{tGeneral("dataImport")}</h2>
				<div className="mt-m-400">
					<p className="text-small text-txt-200">{tGeneral("dataImportDesc")}</p>
					<p className="mt-m-400 text-tiny text-txt-300">
						{tGeneral("goTo")}{" "}
						<Link href="/journal/new" className="text-acc-100 hover:underline">
							Journal → New Trade → CSV Import
						</Link>{" "}
						{tGeneral("toImport")}
					</p>
				</div>
			</div>

			{/* Data Export */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">{tGeneral("dataExport")}</h2>
				<p className="mt-m-400 text-small text-txt-200">
					{tGeneral("dataExportDesc")}
				</p>
				<p className="mt-m-400 text-tiny text-txt-300">
					{tGeneral("exportComingSoon")}
				</p>
			</div>
		</div>
	)
}
