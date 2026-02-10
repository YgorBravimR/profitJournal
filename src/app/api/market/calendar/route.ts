/**
 * GET /api/market/calendar
 *
 * Public endpoint — no auth required.
 * Returns today's economic calendar events with in-memory TTL cache.
 */

import { NextResponse } from "next/server"
import { fetchCalendar } from "@/lib/market/cascade"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/market/cache"
import type { CalendarResponse } from "@/types/market"

export const GET = async () => {
	try {
		// Check cache first
		const cached = cacheGet<CalendarResponse>(CACHE_KEYS.CALENDAR)
		if (cached) {
			return NextResponse.json({
				status: "success",
				message: "Economic calendar retrieved (cached)",
				data: cached,
			})
		}

		// Cache miss — fetch from provider
		const events = await fetchCalendar()
		const lastUpdated = new Date().toISOString()

		const responseData: CalendarResponse = { events, lastUpdated }

		// Cache the result
		cacheSet(CACHE_KEYS.CALENDAR, responseData, CACHE_TTL.CALENDAR)

		return NextResponse.json({
			status: "success",
			message: "Economic calendar retrieved",
			data: responseData,
		})
	} catch (error) {
		console.error("[API:market/calendar] Error:", error)
		return NextResponse.json(
			{
				status: "error",
				message: "Failed to fetch economic calendar",
				errors: [{ code: "MARKET_CALENDAR_ERROR", detail: String(error) }],
			},
			{ status: 500 }
		)
	}
}
