/**
 * Brapi Provider (B3 assets)
 *
 * Free API for B3 assets. Now the primary provider for .SA symbols.
 * Implements QuoteProvider: accepts symbol list, returns Map<string, MarketQuote>.
 *
 * @see https://brapi.dev/docs
 */

import type { MarketQuote, QuoteProvider } from "@/types/market"

const BRAPI_BASE_URL = "https://brapi.dev/api/quote"

interface BrapiQuoteResult {
	symbol: string
	shortName?: string
	longName?: string
	regularMarketPrice?: number
	regularMarketChange?: number
	regularMarketChangePercent?: number
	regularMarketPreviousClose?: number
	regularMarketTime?: string
}

interface BrapiResponse {
	results?: BrapiQuoteResult[]
	error?: boolean
	message?: string
}

/**
 * Fetch B3 quotes from Brapi.
 *
 * @param symbols - Canonical symbols (e.g., "VALE3.SA", "IFNC.SA")
 * @returns Map of symbol → MarketQuote for successfully resolved symbols
 */
const fetchBrapiQuotes = async (symbols: string[]): Promise<Map<string, MarketQuote>> => {
	const quoteMap = new Map<string, MarketQuote>()

	// Brapi expects symbols without the .SA suffix
	const brapiSymbols = symbols.map((s) => s.replace(".SA", ""))
	const symbolsParam = brapiSymbols.join(",")

	const token = process.env.BRAPI_TOKEN
	const tokenParam = token ? `&token=${token}` : ""

	const url = `${BRAPI_BASE_URL}/${symbolsParam}?range=1d&interval=1d${tokenParam}`

	const response = await fetch(url, {
		next: { revalidate: 0 },
	})

	if (!response.ok) {
		throw new Error(`Brapi API error: ${response.status} ${response.statusText}`)
	}

	const data = (await response.json()) as BrapiResponse

	if (data.error || !data.results) {
		throw new Error(`Brapi error: ${data.message || "Unknown error"}`)
	}

	for (const result of data.results) {
		// Map back to canonical symbol (with .SA suffix)
		const canonical = symbols.find((s) => s.replace(".SA", "") === result.symbol)
			|| `${result.symbol}.SA`

		const quote: MarketQuote = {
			symbol: canonical,
			name: canonical, // Overridden by orchestrator from registry
			price: result.regularMarketPrice ?? 0,
			change: result.regularMarketChange ?? 0,
			changePercent: result.regularMarketChangePercent ?? 0,
			previousClose: result.regularMarketPreviousClose ?? 0,
			sessionHigh: null,
			sessionLow: null,
			flag: "", // Overridden by orchestrator from registry
			updatedAt: result.regularMarketTime
				? new Date(result.regularMarketTime).toISOString()
				: new Date().toISOString(),
		}

		quoteMap.set(canonical, quote)
	}

	return quoteMap
}

// ── QuoteProvider export ─────────────────────────────────────────────────────

export const brapiProvider: QuoteProvider = {
	id: "brapi",
	fetchQuotes: fetchBrapiQuotes,
}
