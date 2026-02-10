"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Activity } from "lucide-react"
import type { QuoteGroup, EconomicEvent } from "@/types/market"
import type { ActionResponse } from "@/types"
import { QuoteSection } from "./quote-section"
import { EconomicCalendar } from "./economic-calendar"
import { AutoRefreshIndicator } from "./auto-refresh-indicator"

const REFRESH_INTERVAL_SECONDS = 60

interface QuotesApiData {
	groups: QuoteGroup[]
	lastUpdated: string
}

interface CalendarApiData {
	events: EconomicEvent[]
	lastUpdated: string
}

export const MarketMonitorContent = () => {
	const t = useTranslations("market")

	const [groups, setGroups] = useState<QuoteGroup[]>([])
	const [events, setEvents] = useState<EconomicEvent[]>([])
	const [lastUpdated, setLastUpdated] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchData = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const [quotesRes, calendarRes] = await Promise.allSettled([
				fetch("/api/market/quotes"),
				fetch("/api/market/calendar"),
			])

			// Process quotes
			if (quotesRes.status === "fulfilled" && quotesRes.value.ok) {
				const quotesJson = (await quotesRes.value.json()) as ActionResponse<QuotesApiData>
				if (quotesJson.status === "success" && quotesJson.data) {
					setGroups(quotesJson.data.groups)
					setLastUpdated(quotesJson.data.lastUpdated)
				}
			}

			// Process calendar
			if (calendarRes.status === "fulfilled" && calendarRes.value.ok) {
				const calendarJson = (await calendarRes.value.json()) as ActionResponse<CalendarApiData>
				if (calendarJson.status === "success" && calendarJson.data) {
					setEvents(calendarJson.data.events)
				}
			}

			// If both failed, show error
			if (quotesRes.status === "rejected" && calendarRes.status === "rejected") {
				setError(t("quote.error"))
			}
		} catch {
			setError(t("quote.error"))
		} finally {
			setIsLoading(false)
		}
	}, [t])

	// Initial fetch
	useEffect(() => {
		fetchData()
	}, [fetchData])

	// Auto-refresh polling
	useEffect(() => {
		const interval = setInterval(fetchData, REFRESH_INTERVAL_SECONDS * 1000)
		return () => clearInterval(interval)
	}, [fetchData])

	// Loading state
	if (isLoading && groups.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<Activity className="text-acc-100 mb-4 h-8 w-8 animate-pulse" />
				<p className="text-small text-txt-200">{t("quote.loading")}</p>
			</div>
		)
	}

	// Error state
	if (error && groups.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<p className="text-small text-fb-error mb-2">{error}</p>
				<button
					type="button"
					onClick={fetchData}
					className="text-small text-acc-100 hover:text-acc-100/80 transition-colors"
				>
					{t("refreshNow")}
				</button>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-h3 text-txt-100 font-semibold">{t("title")}</h1>
					<p className="text-small text-txt-200 mt-1">{t("subtitle")}</p>
				</div>
				<AutoRefreshIndicator
					intervalSeconds={REFRESH_INTERVAL_SECONDS}
					lastUpdated={lastUpdated}
					onRefresh={fetchData}
					isLoading={isLoading}
				/>
			</div>

			{/* Quote Groups — 2 column grid on desktop */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{groups.map((group) => (
					<QuoteSection key={group.id} group={group} />
				))}
			</div>

			{/* Economic Calendar */}
			<EconomicCalendar events={events} />
		</div>
	)
}
