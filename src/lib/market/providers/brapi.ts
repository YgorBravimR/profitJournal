/**
 * Brapi Provider (FALLBACK — B3 assets)
 *
 * Free API for B3 assets when Yahoo Finance fails for .SA symbols.
 *
 * @see https://brapi.dev/docs
 */

import type { MarketQuote } from "@/types/market"

const BRAPI_BASE_URL = "https://brapi.dev/api/quote"

// Map Yahoo symbols to Brapi symbols (Brapi uses tickers without .SA)
const YAHOO_TO_BRAPI: Record<string, string> = {
	"WING25.SA": "WING25",
	"WDOG25.SA": "WDOG25",
}

const BRAPI_NAMES: Record<string, string> = {
	WING25: "Mini Index (WIN)",
	WDOG25: "Mini Dollar (WDO)",
}

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
 * Fetch B3 quotes from Brapi
 *
 * @param yahooSymbols - Yahoo-style symbols (e.g., "WING25.SA")
 */
export const fetchBrapiQuotes = async (yahooSymbols: string[]): Promise<MarketQuote[]> => {
	const brapiSymbols = yahooSymbols.map((s) => YAHOO_TO_BRAPI[s] || s.replace(".SA", ""))
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

	return data.results.map((result): MarketQuote => {
		// Reverse-map back to Yahoo symbol for consistency
		const yahooSymbol = yahooSymbols.find(
			(ys) => YAHOO_TO_BRAPI[ys] === result.symbol || ys.replace(".SA", "") === result.symbol
		) || `${result.symbol}.SA`

		return {
			symbol: yahooSymbol,
			name: BRAPI_NAMES[result.symbol] || result.shortName || result.longName || result.symbol,
			price: result.regularMarketPrice ?? 0,
			change: result.regularMarketChange ?? 0,
			changePercent: result.regularMarketChangePercent ?? 0,
			previousClose: result.regularMarketPreviousClose ?? 0,
			updatedAt: result.regularMarketTime
				? new Date(result.regularMarketTime).toISOString()
				: new Date().toISOString(),
		}
	})
}
