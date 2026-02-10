/**
 * Economic Calendar Provider
 *
 * Fetches today's economic events from Investing.com's calendar API.
 * Falls back to empty array if API is unavailable.
 */

import type { EconomicEvent, EventImpact } from "@/types/market"

const INVESTING_CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"

interface FairEconomyEvent {
	title: string
	country: string
	date: string
	impact: string
	forecast: string
	previous: string
	actual?: string
}

const mapImpact = (impact: string): EventImpact => {
	const normalized = impact.toLowerCase()
	if (normalized === "high" || normalized === "holiday") return "high"
	if (normalized === "medium") return "medium"
	return "low"
}

const COUNTRY_FILTER = new Set(["USD", "BRL", "EUR", "CNY", "JPY", "GBP"])

const mapCountryCode = (currency: string): string => {
	const mapping: Record<string, string> = {
		USD: "US",
		BRL: "BR",
		EUR: "EU",
		CNY: "CN",
		JPY: "JP",
		GBP: "GB",
	}
	return mapping[currency] || currency
}

/**
 * Fetch today's economic calendar events
 */
export const fetchEconomicCalendar = async (): Promise<EconomicEvent[]> => {
	const response = await fetch(INVESTING_CALENDAR_URL, {
		next: { revalidate: 0 },
	})

	if (!response.ok) {
		throw new Error(`Calendar API error: ${response.status} ${response.statusText}`)
	}

	const events = (await response.json()) as FairEconomyEvent[]

	// Filter for today's events in target countries with medium/high impact
	const today = new Date().toISOString().split("T")[0]

	return events
		.filter((event) => {
			const eventDate = event.date.split("T")[0]
			const isToday = eventDate === today
			const isRelevantCountry = COUNTRY_FILTER.has(event.country)
			const impact = mapImpact(event.impact)
			const isRelevantImpact = impact === "high" || impact === "medium"
			return isToday && isRelevantCountry && isRelevantImpact
		})
		.map((event, index): EconomicEvent => {
			const eventDate = new Date(event.date)
			const timeStr = eventDate.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
				timeZone: "America/Sao_Paulo",
			})

			return {
				id: `cal-${today}-${index}`,
				time: timeStr,
				country: mapCountryCode(event.country),
				event: event.title,
				impact: mapImpact(event.impact),
				actual: event.actual || undefined,
				forecast: event.forecast || undefined,
				previous: event.previous || undefined,
			}
		})
		.sort((a, b) => a.time.localeCompare(b.time))
}
