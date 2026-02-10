/**
 * Yahoo Finance Provider (PRIMARY)
 *
 * Uses Yahoo Finance v8 spark API — free, no API key required.
 * The v7 quote endpoint was deprecated behind authentication (returns 401).
 * The v8 spark endpoint returns close prices + chartPreviousClose per symbol.
 * Using 15m interval to compute intraday session high/low from close array.
 *
 * @see https://query2.finance.yahoo.com/v8/finance/spark
 */

import type { MarketQuote, QuoteGroup } from "@/types/market"

const YAHOO_BASE_URL = "https://query2.finance.yahoo.com/v8/finance/spark"

// ── Symbol groups ────────────────────────────────────────────────────────────
// Tab order: trader (first), indices, b3, commodities, fxcrypto

export const SYMBOL_GROUPS: { id: string; labelKey: string; symbols: string[] }[] = [
	{
		id: "trader",
		labelKey: "groups.trader",
		symbols: ["^GSPC", "^VIX", "EWZ", "6L=F", "VALE", "PBR", "^TYX", "IFNC.SA", "ICOM.SA"],
	},
	{
		id: "indices",
		labelKey: "groups.indices",
		symbols: ["^GSPC", "^DJI", "^IXIC", "^FTSE", "^GDAXI", "^N225", "^HSI", "^BVSP"],
	},
	{
		id: "b3",
		labelKey: "groups.b3",
		// WIN/WDO mini contracts are B3-exclusive — not available on Yahoo or any free API
		symbols: [
			"VALE3.SA",
			"ITUB4.SA",
			"PETR4.SA",
			"PETR3.SA",
			"AZZA3.SA",
			"BBDC4.SA",
			"SBSP3.SA",
			"ITSA4.SA",
			"BPAC11.SA",
			"WEGE3.SA",
			"BBAS3.SA",
			"ABEV3.SA",
		],
	},
	{
		id: "commodities",
		labelKey: "groups.commodities",
		symbols: ["GC=F", "SI=F", "CL=F", "BZ=F"],
	},
	{
		id: "fxcrypto",
		labelKey: "groups.fxcrypto",
		symbols: ["BRL=X", "EURUSD=X", "GBPUSD=X", "USDJPY=X", "DX-Y.NYB", "BTC-USD", "ETH-USD"],
	},
]

// ── Human-readable names ─────────────────────────────────────────────────────

const SYMBOL_NAMES: Record<string, string> = {
	// Trader tab
	"^GSPC": "S&P 500",
	"^VIX": "VIX",
	EWZ: "EWZ (Brazil ETF)",
	"6L=F": "BRL Futures (CME)",
	VALE: "Vale ADR (NYSE)",
	PBR: "Petrobras ADR (NYSE)",
	"^TYX": "US 30Y Bond Yield",
	"IFNC.SA": "IFNC (Financeiro)",
	"ICOM.SA": "ICOM (Comercial)",

	// Indices
	"^DJI": "Dow Jones",
	"^IXIC": "Nasdaq",
	"^FTSE": "FTSE 100",
	"^GDAXI": "DAX",
	"^N225": "Nikkei 225",
	"^HSI": "Hang Seng",
	"^BVSP": "Ibovespa",

	// B3
	"VALE3.SA": "Vale",
	"ITUB4.SA": "Itau Unibanco",
	"PETR4.SA": "Petrobras PN",
	"PETR3.SA": "Petrobras ON",
	"AZZA3.SA": "Azzas 2154",
	"BBDC4.SA": "Bradesco",
	"SBSP3.SA": "Sabesp",
	"ITSA4.SA": "Itausa",
	"BPAC11.SA": "BTG Pactual",
	"WEGE3.SA": "WEG",
	"BBAS3.SA": "Banco do Brasil",
	"ABEV3.SA": "Ambev",

	// Commodities
	"GC=F": "Gold",
	"SI=F": "Silver",
	"CL=F": "Crude Oil (WTI)",
	"BZ=F": "Brent Oil",

	// Forex + Crypto
	"BRL=X": "USD/BRL",
	"EURUSD=X": "EUR/USD",
	"GBPUSD=X": "GBP/USD",
	"USDJPY=X": "USD/JPY",
	"DX-Y.NYB": "Dollar Index (DXY)",
	"BTC-USD": "Bitcoin",
	"ETH-USD": "Ethereum",
}

// ── Flag emojis per symbol ───────────────────────────────────────────────────

const SYMBOL_FLAGS: Record<string, string> = {
	// Trader tab
	"^GSPC": "🇺🇸",
	"^VIX": "🇺🇸",
	EWZ: "🇧🇷",
	"6L=F": "🇧🇷",
	VALE: "🇺🇸",
	PBR: "🇺🇸",
	"^TYX": "🇺🇸",
	"IFNC.SA": "🇧🇷",
	"ICOM.SA": "🇧🇷",

	// Indices
	"^DJI": "🇺🇸",
	"^IXIC": "🇺🇸",
	"^FTSE": "🇬🇧",
	"^GDAXI": "🇩🇪",
	"^N225": "🇯🇵",
	"^HSI": "🇭🇰",
	"^BVSP": "🇧🇷",

	// B3
	"VALE3.SA": "🇧🇷",
	"ITUB4.SA": "🇧🇷",
	"PETR4.SA": "🇧🇷",
	"PETR3.SA": "🇧🇷",
	"AZZA3.SA": "🇧🇷",
	"BBDC4.SA": "🇧🇷",
	"SBSP3.SA": "🇧🇷",
	"ITSA4.SA": "🇧🇷",
	"BPAC11.SA": "🇧🇷",
	"WEGE3.SA": "🇧🇷",
	"BBAS3.SA": "🇧🇷",
	"ABEV3.SA": "🇧🇷",

	// Commodities
	"GC=F": "🌍",
	"SI=F": "🌍",
	"CL=F": "🌍",
	"BZ=F": "🌍",

	// Forex + Crypto
	"BRL=X": "🇧🇷",
	"EURUSD=X": "🇪🇺",
	"GBPUSD=X": "🇬🇧",
	"USDJPY=X": "🇯🇵",
	"DX-Y.NYB": "🇺🇸",
	"BTC-USD": "₿",
	"ETH-USD": "⟠",
}

// ── Yahoo v8 spark types ─────────────────────────────────────────────────────

interface YahooSparkResult {
	timestamp: number[]
	symbol: string
	chartPreviousClose: number
	close: number[]
}

type YahooSparkResponse = Record<string, YahooSparkResult>

// ── Mapping ──────────────────────────────────────────────────────────────────

const mapSparkQuote = (result: YahooSparkResult): MarketQuote => {
	const validCloses = result.close.filter((c) => c != null && !Number.isNaN(c))
	const price = validCloses[validCloses.length - 1] ?? 0
	const previousClose = result.chartPreviousClose ?? 0
	const change = price - previousClose
	const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

	// Session high/low from intraday 15m close values
	const sessionHigh = validCloses.length > 1 ? Math.max(...validCloses) : null
	const sessionLow = validCloses.length > 1 ? Math.min(...validCloses) : null

	return {
		symbol: result.symbol,
		name: SYMBOL_NAMES[result.symbol] || result.symbol,
		price,
		change,
		changePercent,
		previousClose,
		sessionHigh,
		sessionLow,
		flag: SYMBOL_FLAGS[result.symbol] || "",
		updatedAt: result.timestamp[result.timestamp.length - 1]
			? new Date(result.timestamp[result.timestamp.length - 1] * 1000).toISOString()
			: new Date().toISOString(),
	}
}

// Yahoo v8 spark API allows a maximum of 20 symbols per request
const MAX_SYMBOLS_PER_BATCH = 20

/**
 * Fetch a single batch of symbols from Yahoo Finance v8 spark endpoint.
 * Uses 15m interval to get intraday data for session high/low computation.
 */
const fetchSparkBatch = async (symbols: string[]): Promise<YahooSparkResponse> => {
	const symbolsParam = symbols.join(",")
	const url = `${YAHOO_BASE_URL}?symbols=${encodeURIComponent(symbolsParam)}&range=1d&interval=15m`

	const response = await fetch(url, {
		headers: {
			"User-Agent": "Mozilla/5.0",
		},
		next: { revalidate: 0 },
	})

	if (!response.ok) {
		throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`)
	}

	return (await response.json()) as YahooSparkResponse
}

/**
 * Fetch all quotes from Yahoo Finance v8 spark endpoint.
 * Deduplicates symbols across groups, splits into batches of 20 (API limit),
 * and runs them in parallel.
 */
export const fetchYahooQuotes = async (): Promise<QuoteGroup[]> => {
	// Deduplicate symbols across all groups before batching
	const uniqueSymbols = [...new Set(SYMBOL_GROUPS.flatMap((group) => group.symbols))]

	// Split symbols into batches of MAX_SYMBOLS_PER_BATCH
	const batches: string[][] = []
	for (let i = 0; i < uniqueSymbols.length; i += MAX_SYMBOLS_PER_BATCH) {
		batches.push(uniqueSymbols.slice(i, i + MAX_SYMBOLS_PER_BATCH))
	}

	// Fetch all batches in parallel
	const results = await Promise.all(batches.map(fetchSparkBatch))

	// Build a map of symbol -> quote for fast lookup
	const quoteMap = new Map<string, MarketQuote>()
	for (const data of results) {
		for (const [symbol, result] of Object.entries(data)) {
			if (result?.close?.length > 0) {
				quoteMap.set(symbol, mapSparkQuote(result))
			}
		}
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
	const fxcryptoGroup = groups.find((g) => g.id === "fxcrypto")

	const b3Expected = SYMBOL_GROUPS.find((g) => g.id === "b3")?.symbols ?? []
	const cryptoExpected = ["BTC-USD", "ETH-USD"]

	const b3Resolved = new Set(b3Group?.quotes.map((q) => q.symbol) ?? [])
	const cryptoResolved = new Set(
		fxcryptoGroup?.quotes
			.filter((q) => q.symbol.includes("-USD"))
			.map((q) => q.symbol) ?? []
	)

	return {
		b3: b3Expected.filter((s) => !b3Resolved.has(s)),
		crypto: cryptoExpected.filter((s) => !cryptoResolved.has(s)),
	}
}
