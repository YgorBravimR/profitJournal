"use client"

import { useState, useTransition, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "./language-switcher"
import { useToast } from "@/components/ui/toast"
import { getCurrentUser, updateUserProfile, changePassword } from "@/app/actions/auth"
import { getUserSettings, updateUserSettings } from "@/app/actions/settings"
import { Loader2 } from "lucide-react"
import type { User } from "@/db/schema"

export const UserProfileSettings = () => {
	const t = useTranslations("settings.profile")
	const tCommon = useTranslations("common")
	const tAuth = useTranslations("auth")
	const router = useRouter()
	const { showToast } = useToast()
	const [isPending, startTransition] = useTransition()
	const [isLoading, setIsLoading] = useState(true)
	const [user, setUser] = useState<User | null>(null)
	const [showAllAccounts, setShowAllAccounts] = useState(false)

	// Profile editing
	const [isEditingProfile, setIsEditingProfile] = useState(false)
	const [profileForm, setProfileForm] = useState({
		name: "",
	})

	// Password change
	const [isChangingPassword, setIsChangingPassword] = useState(false)
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	})

	useEffect(() => {
		const loadData = async () => {
			try {
				const [userData, settingsResult] = await Promise.all([
					getCurrentUser(),
					getUserSettings(),
				])
				setUser(userData)
				if (userData) {
					setProfileForm({ name: userData.name })
				}
				if (settingsResult.status === "success" && settingsResult.data) {
					setShowAllAccounts(settingsResult.data.showAllAccounts)
				}
			} finally {
				setIsLoading(false)
			}
		}
		loadData()
	}, [])

	const handleToggleShowAllAccounts = (checked: boolean) => {
		setShowAllAccounts(checked)
		startTransition(async () => {
			const result = await updateUserSettings({ showAllAccounts: checked })
			if (result.status === "success") {
				showToast("success", t("settingsUpdated"))
				// Refresh the page to apply the new setting
				router.refresh()
			} else {
				// Revert on error
				setShowAllAccounts(!checked)
				showToast("error", result.message || t("settingsUpdateError"))
			}
		})
	}

	const handleSaveProfile = () => {
		startTransition(async () => {
			const result = await updateUserProfile(profileForm)
			if (result.status === "success") {
				setUser((prev) => (prev ? { ...prev, name: profileForm.name } : null))
				setIsEditingProfile(false)
				showToast("success", t("profileUpdated"))
			} else {
				showToast("error", result.error || t("profileUpdateError"))
			}
		})
	}

	const handleChangePassword = () => {
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			showToast("error", tAuth("register.passwordMismatch"))
			return
		}

		startTransition(async () => {
			const result = await changePassword({
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword,
				confirmPassword: passwordForm.confirmPassword,
			})
			if (result.status === "success") {
				setIsChangingPassword(false)
				setPasswordForm({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				})
				showToast("success", t("passwordChanged"))
			} else {
				showToast("error", result.error || t("passwordChangeError"))
			}
		})
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
			{/* Profile Information */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center justify-between">
					<h2 className="text-body font-semibold text-txt-100">
						{t("profileInfo")}
					</h2>
					{!isEditingProfile && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditingProfile(true)}
						>
							{tCommon("edit")}
						</Button>
					)}
				</div>
				<div className="mt-m-400 space-y-m-400">
					<div className="flex items-center justify-between gap-m-400">
						<div className="flex-1">
							<p className="text-small text-txt-100">{t("name")}</p>
						</div>
						{isEditingProfile ? (
							<Input
								value={profileForm.name}
								onChange={(e) =>
									setProfileForm((prev) => ({ ...prev, name: e.target.value }))
								}
								className="w-64"
							/>
						) : (
							<span className="text-small text-txt-200">{user?.name}</span>
						)}
					</div>
					<div className="flex items-center justify-between gap-m-400">
						<div className="flex-1">
							<p className="text-small text-txt-100">{t("email")}</p>
							<p className="text-tiny text-txt-300">{t("emailCannotChange")}</p>
						</div>
						<span className="text-small text-txt-200">{user?.email}</span>
					</div>
				</div>
				{isEditingProfile && (
					<div className="mt-m-500 flex justify-end gap-s-300">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setIsEditingProfile(false)
								setProfileForm({ name: user?.name || "" })
							}}
							disabled={isPending}
						>
							{tCommon("cancel")}
						</Button>
						<Button size="sm" onClick={handleSaveProfile} disabled={isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{tCommon("save")}
						</Button>
					</div>
				)}
			</div>

			{/* Change Password */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<div className="flex items-center justify-between">
					<h2 className="text-body font-semibold text-txt-100">
						{t("changePassword")}
					</h2>
					{!isChangingPassword && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsChangingPassword(true)}
						>
							{tCommon("edit")}
						</Button>
					)}
				</div>
				{isChangingPassword ? (
					<div className="mt-m-400 space-y-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="currentPassword">{t("currentPassword")}</Label>
							<Input
								id="currentPassword"
								type="password"
								value={passwordForm.currentPassword}
								onChange={(e) =>
									setPasswordForm((prev) => ({
										...prev,
										currentPassword: e.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="newPassword">{t("newPassword")}</Label>
							<Input
								id="newPassword"
								type="password"
								value={passwordForm.newPassword}
								onChange={(e) =>
									setPasswordForm((prev) => ({
										...prev,
										newPassword: e.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="confirmPassword">{t("confirmNewPassword")}</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={passwordForm.confirmPassword}
								onChange={(e) =>
									setPasswordForm((prev) => ({
										...prev,
										confirmPassword: e.target.value,
									}))
								}
							/>
						</div>
						<div className="flex justify-end gap-s-300">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setIsChangingPassword(false)
									setPasswordForm({
										currentPassword: "",
										newPassword: "",
										confirmPassword: "",
									})
								}}
								disabled={isPending}
							>
								{tCommon("cancel")}
							</Button>
							<Button
								size="sm"
								onClick={handleChangePassword}
								disabled={isPending}
							>
								{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{t("updatePassword")}
							</Button>
						</div>
					</div>
				) : (
					<p className="mt-m-400 text-small text-txt-300">
						{t("passwordDescription")}
					</p>
				)}
			</div>

			{/* Data Display */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">
					{t("dataDisplay")}
				</h2>
				<div className="mt-m-400 space-y-m-500">
					{/* Show All Accounts Toggle */}
					<div className="flex items-center justify-between">
						<div>
							<p className="text-small text-txt-100">{t("showAllAccounts")}</p>
							<p className="text-tiny text-txt-300">
								{t("showAllAccountsDescription")}
							</p>
						</div>
						<Switch
							checked={showAllAccounts}
							onCheckedChange={handleToggleShowAllAccounts}
							disabled={isPending}
						/>
					</div>
				</div>
			</div>

			{/* Appearance */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">
					{t("appearance")}
				</h2>
				<div className="mt-m-400 space-y-m-500">
					{/* Theme */}
					<div className="flex items-center justify-between">
						<div>
							<p className="text-small text-txt-100">{t("theme")}</p>
							<p className="text-tiny text-txt-300">
								{t("themeLight")} / {t("themeDark")}
							</p>
						</div>
						<ThemeToggle />
					</div>
					{/* Language */}
					<div className="flex items-center justify-between">
						<div>
							<p className="text-small text-txt-100">{t("language")}</p>
							<p className="text-tiny text-txt-300">
								Português (Brasil) / English
							</p>
						</div>
						<LanguageSwitcher />
					</div>
				</div>
			</div>
		</div>
	)
}
