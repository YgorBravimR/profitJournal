/**
 * Yahoo Finance Provider (PRIMARY)
 *
 * Uses Yahoo Finance v7 batch quote API — free, no API key required.
 * Single HTTP call with all symbols comma-separated.
 *
 * @see https://query1.finance.yahoo.com/v7/finance/quote
 */

import type { MarketQuote, QuoteGroup } from "@/types/market"

const YAHOO_BASE_URL = "https://query1.finance.yahoo.com/v7/finance/quote"

// Symbol groups mapping
export const SYMBOL_GROUPS: { id: string; labelKey: string; symbols: string[] }[] = [
	{
		id: "indices",
		labelKey: "groups.indices",
		symbols: ["^GSPC", "^DJI", "^IXIC", "^FTSE", "^GDAXI", "^N225", "^HSI", "^BVSP"],
	},
	{
		id: "b3",
		labelKey: "groups.b3",
		symbols: ["WING25.SA", "WDOG25.SA"],
	},
	{
		id: "commodities",
		labelKey: "groups.commodities",
		symbols: ["GC=F", "SI=F", "CL=F", "BZ=F"],
	},
	{
		id: "forex",
		labelKey: "groups.forex",
		symbols: ["BRL=X", "EURUSD=X", "GBPUSD=X", "USDJPY=X", "DX-Y.NYB"],
	},
	{
		id: "crypto",
		labelKey: "groups.crypto",
		symbols: ["BTC-USD", "ETH-USD"],
	},
	{
		id: "cme",
		labelKey: "groups.cme",
		symbols: ["6L=F"],
	},
]

// Human-readable names for symbols Yahoo doesn't always label well
const SYMBOL_NAMES: Record<string, string> = {
	"^GSPC": "S&P 500",
	"^DJI": "Dow Jones",
	"^IXIC": "Nasdaq",
	"^FTSE": "FTSE 100",
	"^GDAXI": "DAX",
	"^N225": "Nikkei 225",
	"^HSI": "Hang Seng",
	"^BVSP": "Ibovespa",
	"WING25.SA": "Mini Index (WIN)",
	"WDOG25.SA": "Mini Dollar (WDO)",
	"GC=F": "Gold",
	"SI=F": "Silver",
	"CL=F": "Crude Oil (WTI)",
	"BZ=F": "Brent Oil",
	"BRL=X": "USD/BRL",
	"EURUSD=X": "EUR/USD",
	"GBPUSD=X": "GBP/USD",
	"USDJPY=X": "USD/JPY",
	"DX-Y.NYB": "Dollar Index (DXY)",
	"BTC-USD": "Bitcoin",
	"ETH-USD": "Ethereum",
	"6L=F": "BRL Futures (CME)",
}

interface YahooQuoteResult {
	symbol: string
	shortName?: string
	longName?: string
	regularMarketPrice?: number
	regularMarketChange?: number
	regularMarketChangePercent?: number
	regularMarketPreviousClose?: number
	regularMarketTime?: number
}

interface YahooResponse {
	quoteResponse?: {
		result?: YahooQuoteResult[]
		error?: unknown
	}
}

const mapYahooQuote = (result: YahooQuoteResult): MarketQuote => ({
	symbol: result.symbol,
	name: SYMBOL_NAMES[result.symbol] || result.shortName || result.longName || result.symbol,
	price: result.regularMarketPrice ?? 0,
	change: result.regularMarketChange ?? 0,
	changePercent: result.regularMarketChangePercent ?? 0,
	previousClose: result.regularMarketPreviousClose ?? 0,
	updatedAt: result.regularMarketTime
		? new Date(result.regularMarketTime * 1000).toISOString()
		: new Date().toISOString(),
})

/**
 * Fetch all quotes from Yahoo Finance in a single batch request
 */
export const fetchYahooQuotes = async (): Promise<QuoteGroup[]> => {
	const allSymbols = SYMBOL_GROUPS.flatMap((group) => group.symbols)
	const symbolsParam = allSymbols.join(",")

	const url = `${YAHOO_BASE_URL}?symbols=${encodeURIComponent(symbolsParam)}`

	const response = await fetch(url, {
		headers: {
			"User-Agent": "Mozilla/5.0",
		},
		next: { revalidate: 0 },
	})

	if (!response.ok) {
		throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`)
	}

	const data = (await response.json()) as YahooResponse
	const results = data.quoteResponse?.result ?? []

	// Build a map of symbol → quote for fast lookup
	const quoteMap = new Map<string, MarketQuote>()
	for (const result of results) {
		quoteMap.set(result.symbol, mapYahooQuote(result))
	}

	// Assemble groups with whatever symbols resolved
	const groups: QuoteGroup[] = SYMBOL_GROUPS.map((group) => ({
		id: group.id,
		labelKey: group.labelKey,
		quotes: group.symbols
			.map((symbol) => quoteMap.get(symbol))
			.filter((quote): quote is MarketQuote => quote !== undefined),
	}))

	return groups
}

/**
 * Returns the list of symbols that failed to resolve from a Yahoo result
 */
export const getMissingSymbols = (groups: QuoteGroup[]): { b3: string[]; crypto: string[] } => {
	const b3Group = groups.find((g) => g.id === "b3")
	const cryptoGroup = groups.find((g) => g.id === "crypto")

	const b3Expected = SYMBOL_GROUPS.find((g) => g.id === "b3")?.symbols ?? []
	const cryptoExpected = SYMBOL_GROUPS.find((g) => g.id === "crypto")?.symbols ?? []

	const b3Resolved = new Set(b3Group?.quotes.map((q) => q.symbol) ?? [])
	const cryptoResolved = new Set(cryptoGroup?.quotes.map((q) => q.symbol) ?? [])

	return {
		b3: b3Expected.filter((s) => !b3Resolved.has(s)),
		crypto: cryptoExpected.filter((s) => !cryptoResolved.has(s)),
	}
}
