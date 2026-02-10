/**
 * Market Data Provider Cascade
 *
 * Tries providers in order of preference until data is resolved:
 *   Quotes: Yahoo Finance → Brapi (B3 fallback) → CoinGecko (crypto fallback)
 *   Calendar: FairEconomy (global) + BCB (BR) → merged & sorted
 *
 * Follows the same cascade pattern as src/lib/vision/cascade.ts
 */

import type { QuoteGroup, EconomicEvent } from "@/types/market"
import { fetchYahooQuotes, getMissingSymbols } from "./providers/yahoo"
import { fetchBrapiQuotes } from "./providers/brapi"
import { fetchCoinGeckoQuotes } from "./providers/coingecko"
import { fetchEconomicCalendar } from "./providers/calendar"
import { fetchBcbCalendar } from "./providers/bcb"

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
	} catch (error) {
		console.error("[MARKET:Cascade] Yahoo Finance failed:", error)
		return []
	}

	// Step 2: Check for missing B3 symbols → try Brapi
	const missing = getMissingSymbols(groups)

	if (missing.b3.length > 0) {
		try {
			const brapiQuotes = await fetchBrapiQuotes(missing.b3)
			const b3Group = groups.find((g) => g.id === "b3")
			if (b3Group) {
				b3Group.quotes = [...b3Group.quotes, ...brapiQuotes]
			}
		} catch (error) {
			console.error("[MARKET:Cascade] Brapi fallback failed:", error)
		}
	}

	// Step 3: Check for missing crypto → try CoinGecko
	if (missing.crypto.length > 0) {
		try {
			const geckoQuotes = await fetchCoinGeckoQuotes(missing.crypto)
			const fxcryptoGroup = groups.find((g) => g.id === "fxcrypto")
			if (fxcryptoGroup) {
				fxcryptoGroup.quotes = [...fxcryptoGroup.quotes, ...geckoQuotes]
			}
		} catch (error) {
			console.error("[MARKET:Cascade] CoinGecko fallback failed:", error)
		}
	}

	return groups
}

/**
 * Fetch economic calendar -- merges FairEconomy (global) + BCB (BR) events.
 *
 * Both providers run in parallel with Promise.allSettled so one failing
 * doesn't block the other. Results are merged and sorted by time.
 */
export const fetchCalendar = async (): Promise<EconomicEvent[]> => {
	const [fairEconomy, bcb] = await Promise.allSettled([
		fetchEconomicCalendar(),
		fetchBcbCalendar(),
	])

	const events: EconomicEvent[] = []

	if (fairEconomy.status === "fulfilled") {
		events.push(...fairEconomy.value)
	} else {
		console.error("[MARKET:Cascade] Fair Economy failed:", fairEconomy.reason)
	}

	if (bcb.status === "fulfilled") {
		events.push(...bcb.value)
	} else {
		console.error("[MARKET:Cascade] BCB failed:", bcb.reason)
	}

	return events.sort((a, b) => a.time.localeCompare(b.time))
}
