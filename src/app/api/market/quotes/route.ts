/**
 * GET /api/market/quotes
 *
 * Public endpoint — no auth required.
 * Returns grouped market quotes with in-memory TTL cache.
 * Rate-limited: 60 requests per minute per IP.
 */

import { NextResponse, type NextRequest } from "next/server"
import { fetchMarketQuotes } from "@/lib/market/orchestrator"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/market/cache"
import { createRateLimiter } from "@/lib/rate-limiter"
import { toSafeErrorMessage } from "@/lib/error-utils"
import type { QuotesResponse } from "@/types/market"

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
		const cached = cacheGet<QuotesResponse>(CACHE_KEYS.QUOTES)
		if (cached) {
			return NextResponse.json({
				status: "success",
				message: "Market quotes retrieved (cached)",
				data: cached,
			})
		}

		// Cache miss — fetch from providers
		const { groups, companions } = await fetchMarketQuotes()
		const lastUpdated = new Date().toISOString()

		const responseData: QuotesResponse = { groups, companions, lastUpdated }

		// Cache the result
		cacheSet(CACHE_KEYS.QUOTES, responseData, CACHE_TTL.QUOTES)

		return NextResponse.json({
			status: "success",
			message: "Market quotes retrieved",
			data: responseData,
		})
	} catch (error) {
		return NextResponse.json(
			{
				status: "error",
				message: "Failed to fetch market quotes",
				errors: [{ code: "MARKET_QUOTES_ERROR", detail: toSafeErrorMessage(error, "market/quotes") }],
			},
			{ status: 500 }
		)
	}
}
