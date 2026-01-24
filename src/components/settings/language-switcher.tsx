"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"
import { locales, localeNames, type Locale } from "@/i18n/config"

export const LanguageSwitcher = () => {
	const locale = useLocale() as Locale
	const router = useRouter()
	const pathname = usePathname()

	const handleLocaleChange = (newLocale: Locale) => {
		router.replace(pathname, { locale: newLocale })
	}

	return (
		<div className="flex gap-s-200">
			{locales.map((loc) => (
				<button
					key={loc}
					type="button"
					onClick={() => handleLocaleChange(loc)}
					aria-label={`Switch to ${localeNames[loc]}`}
					tabIndex={0}
					className={`rounded-md px-m-400 py-s-200 text-small font-medium transition-colors ${
						locale === loc
							? "bg-acc-100 text-bg-100"
							: "bg-bg-300 text-txt-200 hover:bg-bg-400 hover:text-txt-100"
					}`}
				>
					{loc === "pt-BR" ? "PT" : "EN"}
				</button>
			))}
		</div>
	)
}
