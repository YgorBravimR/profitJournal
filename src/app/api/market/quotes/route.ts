/**
 * GET /api/market/quotes
 *
 * Public endpoint — no auth required.
 * Returns grouped market quotes with in-memory TTL cache.
 */

import { NextResponse } from "next/server"
import { fetchMarketQuotes } from "@/lib/market/cascade"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/market/cache"
import type { QuotesResponse } from "@/types/market"

export const GET = async () => {
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
		const groups = await fetchMarketQuotes()
		const lastUpdated = new Date().toISOString()

		const responseData: QuotesResponse = { groups, lastUpdated }

		// Cache the result
		cacheSet(CACHE_KEYS.QUOTES, responseData, CACHE_TTL.QUOTES)

		return NextResponse.json({
			status: "success",
			message: "Market quotes retrieved",
			data: responseData,
		})
	} catch (error) {
		console.error("[API:market/quotes] Error:", error)
		return NextResponse.json(
			{
				status: "error",
				message: "Failed to fetch market quotes",
				errors: [{ code: "MARKET_QUOTES_ERROR", detail: String(error) }],
			},
			{ status: 500 }
		)
	}
}
