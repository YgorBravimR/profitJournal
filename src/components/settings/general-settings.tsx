"use client"

import { useTranslations } from "next-intl"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { RecalculateButton } from "@/components/settings/recalculate-button"
import { LanguageSwitcher } from "@/components/settings/language-switcher"
import { Link } from "@/i18n/routing"

export const GeneralSettings = () => {
	const t = useTranslations("settings.general")

	return (
		<div className="mx-auto max-w-2xl space-y-m-600">
			{/* Appearance */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">{t("title")}</h2>
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

			{/* Risk Settings */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">Risk Settings</h2>
				<div className="mt-m-400 space-y-m-400">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-small text-txt-100">Default Risk %</p>
							<p className="text-tiny text-txt-300">
								Default position risk percentage
							</p>
						</div>
						<span className="text-small text-txt-200">1.0%</span>
					</div>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-small text-txt-100">Account Balance</p>
							<p className="text-tiny text-txt-300">Current trading capital</p>
						</div>
						<span className="text-small text-txt-200">$10,000</span>
					</div>
				</div>
				<p className="mt-m-500 text-tiny text-txt-300">
					Settings editing coming in a future update
				</p>
			</div>

			{/* Data Maintenance */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">
					Data Maintenance
				</h2>
				<div className="mt-m-400 space-y-m-400">
					<div>
						<p className="text-small text-txt-100">Recalculate R Values</p>
						<p className="mb-m-400 text-tiny text-txt-300">
							Updates all trades that have stop loss data to calculate
							planned risk and realized R-multiple
						</p>
						<RecalculateButton />
					</div>
				</div>
			</div>

			{/* Data Import */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">Data Import</h2>
				<div className="mt-m-400">
					<p className="text-small text-txt-200">
						Import trades from CSV file
					</p>
					<p className="mt-m-400 text-tiny text-txt-300">
						Go to{" "}
						<Link
							href="/journal/new"
							className="text-acc-100 hover:underline"
						>
							Journal → New Trade → CSV Import
						</Link>{" "}
						to import trades
					</p>
				</div>
			</div>

			{/* Data Export */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h2 className="text-body font-semibold text-txt-100">Data Export</h2>
				<p className="mt-m-400 text-small text-txt-200">
					Export your trade data for backup or analysis
				</p>
				<p className="mt-m-400 text-tiny text-txt-300">
					Export functionality coming in a future update
				</p>
			</div>
		</div>
	)
}
