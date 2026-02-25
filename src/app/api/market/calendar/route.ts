/**
 * GET /api/market/calendar
 *
 * Public endpoint — no auth required.
 * Returns today's economic calendar events with in-memory TTL cache.
 * Rate-limited: 60 requests per minute per IP.
 */

import { NextResponse, type NextRequest } from "next/server"
import { fetchCalendar } from "@/lib/market/orchestrator"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/market/cache"
import { createRateLimiter } from "@/lib/rate-limiter"
import { toSafeErrorMessage } from "@/lib/error-utils"
import type { CalendarResponse } from "@/types/market"

// 60 requests per minute per IP
const rateLimiter = createRateLimiter({ maxAttempts: 60, windowMs: 60_000 })

export const GET = async (request: NextRequest) => {
	const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
	const rateLimitResult = rateLimiter.check(ip)

	if (!rateLimitResult.allowed) {
		return NextResponse.json(
			{ status: "error", message: "Too many requests" },
			{ status: 429, headers: { "Retry-After": String(Math.ceil(rateLimitResult.retryAfterMs / 1000)) } }
		)
	}

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
		return NextResponse.json(
			{
				status: "error",
				message: "Failed to fetch economic calendar",
				errors: [{ code: "MARKET_CALENDAR_ERROR", detail: toSafeErrorMessage(error, "market/calendar") }],
			},
			{ status: 500 }
		)
	}
}
