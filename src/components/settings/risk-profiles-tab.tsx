"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Plus, Pencil, Power, PowerOff, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFormatting } from "@/hooks/use-formatting"
import { fromCents } from "@/lib/money"
import {
	listActiveRiskProfiles,
	createRiskProfile,
	updateRiskProfile,
	deactivateRiskProfile,
} from "@/app/actions/risk-profiles"
import type { RiskManagementProfile } from "@/types/risk-profile"
import type { RiskProfileSchemaInput } from "@/lib/validations/risk-profile"

// ==========================================
// RISK PROFILES SETTINGS TAB (Admin Only)
// ==========================================

const RiskProfilesTab = () => {
	const t = useTranslations("settings.riskProfiles")
	const { formatCurrency } = useFormatting()

	const [profiles, setProfiles] = useState<RiskManagementProfile[]>([])
	const [loading, setLoading] = useState(true)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [isCreating, setIsCreating] = useState(false)

	const fetchProfiles = useCallback(async () => {
		setLoading(true)
		const result = await listActiveRiskProfiles()
		if (result.status === "success" && result.data) {
			setProfiles(result.data)
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		fetchProfiles()
	}, [fetchProfiles])

	const handleDeactivate = async (id: string) => {
		if (!confirm(t("confirmDeactivate"))) return
		await deactivateRiskProfile(id)
		await fetchProfiles()
	}

	return (
		<div className="space-y-m-500">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-body font-semibold text-txt-100">{t("title")}</h3>
					<p className="mt-s-100 text-small text-txt-300">{t("description")}</p>
				</div>
				<Button
					id="risk-profiles-create"
					size="sm"
					onClick={() => {
						setIsCreating(true)
						setEditingId(null)
					}}
					aria-label={t("create")}
				>
					<Plus className="mr-s-100 h-4 w-4" />
					{t("create")}
				</Button>
			</div>

			{/* Create/Edit Form */}
			{(isCreating || editingId) && (
				<RiskProfileForm
					profile={editingId ? profiles.find((p) => p.id === editingId) : undefined}
					onSave={async () => {
						setIsCreating(false)
						setEditingId(null)
						await fetchProfiles()
					}}
					onCancel={() => {
						setIsCreating(false)
						setEditingId(null)
					}}
				/>
			)}

			{/* Profiles List */}
			{loading ? (
				<div className="flex items-center justify-center py-8">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-acc-100 border-t-transparent" />
				</div>
			) : profiles.length === 0 ? (
				<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500 text-center">
					<Shield className="mx-auto mb-m-300 h-8 w-8 text-txt-300" />
					<p className="text-small text-txt-300">{t("noProfiles")}</p>
				</div>
			) : (
				<div className="space-y-m-300">
					{profiles.map((profile) => (
						<div
							key={profile.id}
							className="rounded-lg border border-bg-300 bg-bg-100 p-m-400"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-s-200">
										<h4 className="text-small font-semibold text-txt-100">
											{profile.name}
										</h4>
										<span className="rounded-full bg-fb-success/10 px-s-200 py-s-100 text-tiny text-fb-success">
											{t("active")}
										</span>
									</div>
									{profile.description && (
										<p className="mt-s-100 text-tiny text-txt-300">
											{profile.description}
										</p>
									)}
									<div className="mt-m-300 flex flex-wrap gap-m-400">
										<ProfileStat
											label={t("baseRisk")}
											value={formatCurrency(fromCents(profile.baseRiskCents))}
										/>
										<ProfileStat
											label={t("dailyLoss")}
											value={formatCurrency(fromCents(profile.dailyLossCents))}
										/>
										{profile.weeklyLossCents && (
											<ProfileStat
												label={t("weeklyLoss")}
												value={formatCurrency(fromCents(profile.weeklyLossCents))}
											/>
										)}
										<ProfileStat
											label={t("monthlyLoss")}
											value={formatCurrency(fromCents(profile.monthlyLossCents))}
										/>
										{profile.dailyProfitTargetCents && (
											<ProfileStat
												label={t("dailyTarget")}
												value={formatCurrency(fromCents(profile.dailyProfitTargetCents))}
											/>
										)}
									</div>
								</div>
								<div className="flex gap-s-200">
									<Button
										id={`risk-profile-edit-${profile.id}`}
										variant="ghost"
										size="icon"
										onClick={() => {
											setEditingId(profile.id)
											setIsCreating(false)
										}}
										aria-label={t("edit")}
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										id={`risk-profile-deactivate-${profile.id}`}
										variant="ghost"
										size="icon"
										onClick={() => handleDeactivate(profile.id)}
										aria-label={t("deactivate")}
									>
										<PowerOff className="h-4 w-4 text-fb-error" />
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

// ==========================================
// PROFILE STAT (inline display)
// ==========================================

interface ProfileStatProps {
	label: string
	value: string
}

const ProfileStat = ({ label, value }: ProfileStatProps) => (
	<div>
		<span className="text-tiny text-txt-300">{label}</span>
		<p className="text-small font-medium text-txt-100">{value}</p>
	</div>
)

// ==========================================
// CREATE/EDIT FORM
// ==========================================

interface RiskProfileFormProps {
	profile?: RiskManagementProfile
	onSave: () => Promise<void>
	onCancel: () => void
}

const RiskProfileForm = ({ profile, onSave, onCancel }: RiskProfileFormProps) => {
	const t = useTranslations("settings.riskProfiles")
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [name, setName] = useState(profile?.name ?? "")
	const [description, setDescription] = useState(profile?.description ?? "")
	const [baseRiskCents, setBaseRiskCents] = useState(
		profile?.baseRiskCents?.toString() ?? ""
	)
	const [dailyLossCents, setDailyLossCents] = useState(
		profile?.dailyLossCents?.toString() ?? ""
	)
	const [weeklyLossCents, setWeeklyLossCents] = useState(
		profile?.weeklyLossCents?.toString() ?? ""
	)
	const [monthlyLossCents, setMonthlyLossCents] = useState(
		profile?.monthlyLossCents?.toString() ?? ""
	)
	const [dailyProfitTargetCents, setDailyProfitTargetCents] = useState(
		profile?.dailyProfitTargetCents?.toString() ?? ""
	)
	const [decisionTreeJson, setDecisionTreeJson] = useState(
		profile ? JSON.stringify(profile.decisionTree, null, 2) : ""
	)

	const handleSave = async () => {
		setSaving(true)
		setError(null)

		try {
			let parsedTree
			try {
				parsedTree = JSON.parse(decisionTreeJson)
			} catch {
				setError("Invalid JSON in decision tree configuration")
				setSaving(false)
				return
			}

			const input: RiskProfileSchemaInput = {
				name,
				description: description || null,
				baseRiskCents: parseInt(baseRiskCents, 10),
				dailyLossCents: parseInt(dailyLossCents, 10),
				weeklyLossCents: weeklyLossCents ? parseInt(weeklyLossCents, 10) : null,
				monthlyLossCents: parseInt(monthlyLossCents, 10),
				dailyProfitTargetCents: dailyProfitTargetCents
					? parseInt(dailyProfitTargetCents, 10)
					: null,
				decisionTree: parsedTree,
			}

			const result = profile
				? await updateRiskProfile(profile.id, input)
				: await createRiskProfile(input)

			if (result.status === "success") {
				await onSave()
			} else {
				setError(result.errors?.map((e) => e.detail).join(", ") ?? result.message)
			}
		} catch (err) {
			setError(String(err))
		} finally {
			setSaving(false)
		}
	}

	const isValid =
		name.length > 0 &&
		parseInt(baseRiskCents, 10) > 0 &&
		parseInt(dailyLossCents, 10) > 0 &&
		parseInt(monthlyLossCents, 10) > 0 &&
		decisionTreeJson.length > 0

	return (
		<div className="rounded-lg border border-acc-100/30 bg-acc-100/5 p-m-400 space-y-m-400">
			<div className="gap-m-400 grid sm:grid-cols-2">
				<div className="sm:col-span-2">
					<label className="mb-s-200 text-small text-txt-200 block">{t("name")}</label>
					<Input
						id="risk-profile-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Profile name"
						aria-label={t("name")}
					/>
				</div>
				<div className="sm:col-span-2">
					<label className="mb-s-200 text-small text-txt-200 block">
						{t("descriptionField")}
					</label>
					<Input
						id="risk-profile-description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Brief description"
						aria-label={t("descriptionField")}
					/>
				</div>
				<div>
					<label className="mb-s-200 text-small text-txt-200 block">{t("baseRisk")}</label>
					<Input
						id="risk-profile-base-risk"
						type="number"
						value={baseRiskCents}
						onChange={(e) => setBaseRiskCents(e.target.value)}
						placeholder="50000"
						aria-label={t("baseRisk")}
					/>
				</div>
				<div>
					<label className="mb-s-200 text-small text-txt-200 block">{t("dailyLoss")}</label>
					<Input
						id="risk-profile-daily-loss"
						type="number"
						value={dailyLossCents}
						onChange={(e) => setDailyLossCents(e.target.value)}
						placeholder="100000"
						aria-label={t("dailyLoss")}
					/>
				</div>
				<div>
					<label className="mb-s-200 text-small text-txt-200 block">{t("weeklyLoss")}</label>
					<Input
						id="risk-profile-weekly-loss"
						type="number"
						value={weeklyLossCents}
						onChange={(e) => setWeeklyLossCents(e.target.value)}
						placeholder="200000"
						aria-label={t("weeklyLoss")}
					/>
				</div>
				<div>
					<label className="mb-s-200 text-small text-txt-200 block">{t("monthlyLoss")}</label>
					<Input
						id="risk-profile-monthly-loss"
						type="number"
						value={monthlyLossCents}
						onChange={(e) => setMonthlyLossCents(e.target.value)}
						placeholder="750000"
						aria-label={t("monthlyLoss")}
					/>
				</div>
				<div className="sm:col-span-2">
					<label className="mb-s-200 text-small text-txt-200 block">{t("dailyTarget")}</label>
					<Input
						id="risk-profile-daily-target"
						type="number"
						value={dailyProfitTargetCents}
						onChange={(e) => setDailyProfitTargetCents(e.target.value)}
						placeholder="150000"
						aria-label={t("dailyTarget")}
					/>
				</div>
				<div className="sm:col-span-2">
					<label className="mb-s-200 text-small text-txt-200 block">
						{t("decisionTree")}
					</label>
					<textarea
						value={decisionTreeJson}
						onChange={(e) => setDecisionTreeJson(e.target.value)}
						placeholder='{"baseTrade": {...}, "lossRecovery": {...}, ...}'
						className="border-bg-300 bg-bg-100 text-tiny text-txt-100 placeholder:text-txt-300 focus:ring-acc-100 min-h-[160px] w-full rounded-md border px-3 py-2 font-mono focus:ring-2 focus:outline-none"
						aria-label={t("decisionTree")}
					/>
				</div>
			</div>

			{error && (
				<div className="border-fb-error/30 bg-fb-error/10 p-m-300 text-small text-fb-error rounded-lg border">
					{error}
				</div>
			)}

			<div className="flex justify-end gap-s-200">
				<Button
					id="risk-profile-cancel"
					variant="outline"
					size="sm"
					onClick={onCancel}
					aria-label={t("cancel")}
				>
					{t("cancel")}
				</Button>
				<Button
					id="risk-profile-save"
					size="sm"
					onClick={handleSave}
					disabled={saving || !isValid}
					aria-label={t("save")}
				>
					{saving && <Loader2 className="mr-s-100 h-4 w-4 animate-spin" />}
					{t("save")}
				</Button>
			</div>
		</div>
	)
}

export { RiskProfilesTab }
