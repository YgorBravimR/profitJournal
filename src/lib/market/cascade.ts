/**
 * Market Data Provider Cascade
 *
 * Tries providers in order of preference until data is resolved:
 *   Quotes: Yahoo Finance → Brapi (B3 fallback) → CoinGecko (crypto fallback)
 *   Calendar: FairEconomy → empty fallback
 *
 * Follows the same cascade pattern as src/lib/vision/cascade.ts
 */

import type { QuoteGroup, EconomicEvent } from "@/types/market"
import { fetchYahooQuotes, getMissingSymbols } from "./providers/yahoo"
import { fetchBrapiQuotes } from "./providers/brapi"
import { fetchCoinGeckoQuotes } from "./providers/coingecko"
import { fetchEconomicCalendar } from "./providers/calendar"

/**
 * Fetch market quotes with cascade fallback.
 *
 * 1. Try Yahoo Finance batch → all groups at once
 * 2. For any failed B3 symbols → try Brapi
 * 3. For any failed crypto → try CoinGecko
 * 4. Return partial data (available groups only)
 */
export const fetchMarketQuotes = async (): Promise<QuoteGroup[]> => {
	let groups: QuoteGroup[] = []

	// Step 1: Try Yahoo Finance for everything
	try {
		groups = await fetchYahooQuotes()
		console.log("[MARKET:Cascade] Yahoo Finance succeeded")
	} catch (error) {
		console.error("[MARKET:Cascade] Yahoo Finance failed:", error)
		// Return empty groups structure if Yahoo completely fails
		return []
	}

	// Step 2: Check for missing B3 symbols → try Brapi
	const missing = getMissingSymbols(groups)

	if (missing.b3.length > 0) {
		console.log(`[MARKET:Cascade] Missing B3 symbols: ${missing.b3.join(", ")}. Trying Brapi...`)
		try {
			const brapiQuotes = await fetchBrapiQuotes(missing.b3)
			const b3Group = groups.find((g) => g.id === "b3")
			if (b3Group) {
				b3Group.quotes = [...b3Group.quotes, ...brapiQuotes]
			}
			console.log("[MARKET:Cascade] Brapi fallback succeeded")
		} catch (error) {
			console.error("[MARKET:Cascade] Brapi fallback failed:", error)
		}
	}

	// Step 3: Check for missing crypto → try CoinGecko
	if (missing.crypto.length > 0) {
		console.log(`[MARKET:Cascade] Missing crypto symbols: ${missing.crypto.join(", ")}. Trying CoinGecko...`)
		try {
			const geckoQuotes = await fetchCoinGeckoQuotes(missing.crypto)
			const cryptoGroup = groups.find((g) => g.id === "crypto")
			if (cryptoGroup) {
				cryptoGroup.quotes = [...cryptoGroup.quotes, ...geckoQuotes]
			}
			console.log("[MARKET:Cascade] CoinGecko fallback succeeded")
		} catch (error) {
			console.error("[MARKET:Cascade] CoinGecko fallback failed:", error)
		}
	}

	return groups
}

/**
 * Fetch economic calendar with fallback to empty array
 */
export const fetchCalendar = async (): Promise<EconomicEvent[]> => {
	try {
		const events = await fetchEconomicCalendar()
		console.log(`[MARKET:Cascade] Calendar fetched: ${events.length} events`)
		return events
	} catch (error) {
		console.error("[MARKET:Cascade] Calendar fetch failed:", error)
		return []
	}
}
