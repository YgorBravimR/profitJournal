/**
 * CoinGecko Provider (FALLBACK — Crypto)
 *
 * Free API for crypto prices when Yahoo Finance fails.
 * No API key required for basic tier.
 *
 * @see https://www.coingecko.com/en/api/documentation
 */

import type { MarketQuote } from "@/types/market"

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3/simple/price"

// Map Yahoo crypto symbols to CoinGecko IDs
const YAHOO_TO_COINGECKO: Record<string, string> = {
	"BTC-USD": "bitcoin",
	"ETH-USD": "ethereum",
}

const CRYPTO_NAMES: Record<string, string> = {
	bitcoin: "Bitcoin",
	ethereum: "Ethereum",
}

interface CoinGeckoPrice {
	usd?: number
	usd_24h_change?: number
}

type CoinGeckoResponse = Record<string, CoinGeckoPrice>

/**
 * Fetch crypto prices from CoinGecko
 *
 * @param yahooSymbols - Yahoo-style symbols (e.g., "BTC-USD")
 */
export const fetchCoinGeckoQuotes = async (yahooSymbols: string[]): Promise<MarketQuote[]> => {
	const coinIds = yahooSymbols
		.map((s) => YAHOO_TO_COINGECKO[s])
		.filter((id): id is string => id !== undefined)

	if (coinIds.length === 0) return []

	const idsParam = coinIds.join(",")
	const url = `${COINGECKO_BASE_URL}?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`

	const response = await fetch(url, {
		next: { revalidate: 0 },
	})

	if (!response.ok) {
		throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
	}

	const data = (await response.json()) as CoinGeckoResponse

	return yahooSymbols
		.map((yahooSymbol): MarketQuote | null => {
			const coinId = YAHOO_TO_COINGECKO[yahooSymbol]
			if (!coinId || !data[coinId]) return null

			const coinData = data[coinId]
			const price = coinData.usd ?? 0
			const changePercent = coinData.usd_24h_change ?? 0
			// Estimate previous close from current price and % change
			const previousClose = changePercent !== 0 ? price / (1 + changePercent / 100) : price
			const change = price - previousClose

			return {
				symbol: yahooSymbol,
				name: CRYPTO_NAMES[coinId] || coinId,
				price,
				change,
				changePercent,
				previousClose,
				updatedAt: new Date().toISOString(),
			}
		})
		.filter((q): q is MarketQuote => q !== null)
}
