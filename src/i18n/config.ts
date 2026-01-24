export const locales = ["pt-BR", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "pt-BR"

export const localeNames: Record<Locale, string> = {
	"pt-BR": "Português (Brasil)",
	en: "English",
}

export const localeFlags: Record<Locale, string> = {
	"pt-BR": "🇧🇷",
	en: "🇺🇸",
}

// Currency settings per locale
export const localeCurrency: Record<Locale, string> = {
	"pt-BR": "BRL",
	en: "USD",
}

// Date format settings per locale
export const localeDateFormat: Record<Locale, string> = {
	"pt-BR": "dd/MM/yyyy",
	en: "MM/dd/yyyy",
}

// Number format settings (thousands and decimal separators)
export const localeNumberFormat: Record<
	Locale,
	{ thousands: string; decimal: string }
> = {
	"pt-BR": { thousands: ".", decimal: "," },
	en: { thousands: ",", decimal: "." },
}
