/**
 * Market Data Registry
 *
 * Single source of truth for all tracked symbols, display metadata,
 * provider routing, and tab groups. Adding a new symbol or switching
 * its provider is a one-line change in this file.
 */

import type { SymbolDefinition, GroupDefinition, ProviderId } from "@/types/market"

// ── Symbol Definitions ───────────────────────────────────────────────────────
// Each symbol declares its display name, flag, preferred provider, and
// optional fallback provider.

const SYMBOL_LIST: SymbolDefinition[] = [
	// ── Trader tab ───────────────────────────────────────────────────────────
	{ symbol: "ES=F", name: "S&P 500 Futures", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "NQ=F", name: "Nasdaq 100 Futures", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "^VIX", name: "VIX", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "EWZ", name: "EWZ", flag: "🇧🇷", provider: "yahoo" },
	{ symbol: "6L=F", name: "BRL Futures (CME)", flag: "🇧🇷", provider: "yahoo" },
	{ symbol: "VALE", name: "Vale ADR (NYSE)", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "PBR", name: "Petrobras ADR (NYSE)", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "^TYX", name: "US 30Y Bond Yield", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "IFNC.SA", name: "IFNC (Financeiro)", flag: "🇧🇷", provider: "yahoo" },
	{ symbol: "ICOM.SA", name: "ICOM (Comercial)", flag: "🇧🇷", provider: "yahoo" },

	// ── Indices ──────────────────────────────────────────────────────────────
	{ symbol: "^GSPC", name: "S&P 500", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "^DJI", name: "Dow Jones", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "^IXIC", name: "Nasdaq", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "^FTSE", name: "FTSE 100", flag: "🇬🇧", provider: "yahoo" },
	{ symbol: "^GDAXI", name: "DAX", flag: "🇩🇪", provider: "yahoo" },
	{ symbol: "^N225", name: "Nikkei 225", flag: "🇯🇵", provider: "yahoo" },
	{ symbol: "^HSI", name: "Hang Seng", flag: "🇭🇰", provider: "yahoo" },
	{ symbol: "^BVSP", name: "Ibovespa", flag: "🇧🇷", provider: "yahoo" },

	// ── B3 ───────────────────────────────────────────────────────────────────
	{ symbol: "VALE3.SA", name: "Vale", flag: "🇧🇷", provider: "yahoo", adrSymbol: "VALE" },
	{ symbol: "ITUB4.SA", name: "Itau Unibanco", flag: "🇧🇷", provider: "yahoo", adrSymbol: "ITUB" },
	{ symbol: "PETR4.SA", name: "Petrobras PN", flag: "🇧🇷", provider: "yahoo", adrSymbol: "PBR" },
	{ symbol: "PETR3.SA", name: "Petrobras ON", flag: "🇧🇷", provider: "yahoo" },
	{ symbol: "AZZA3.SA", name: "Azzas 2154", flag: "🇧🇷", provider: "yahoo" },
	{ symbol: "BBDC4.SA", name: "Bradesco", flag: "🇧🇷", provider: "yahoo", adrSymbol: "BBD" },
	{ symbol: "SBSP3.SA", name: "Sabesp", flag: "🇧🇷", provider: "yahoo", adrSymbol: "SBS" },
	{ symbol: "ITSA4.SA", name: "Itausa", flag: "🇧🇷", provider: "yahoo" },
	{ symbol: "BPAC11.SA", name: "BTG Pactual", flag: "🇧🇷", provider: "yahoo", adrSymbol: "BPAC" },
	{ symbol: "WEGE3.SA", name: "WEG", flag: "🇧🇷", provider: "yahoo" },
	{ symbol: "BBAS3.SA", name: "Banco do Brasil", flag: "🇧🇷", provider: "yahoo" },
	{ symbol: "ABEV3.SA", name: "Ambev", flag: "🇧🇷", provider: "yahoo", adrSymbol: "ABEV" },

	// ── ADR companions (not in any tab group, fetched for B3 side-by-side) ──
	{ symbol: "ITUB", name: "Itau ADR (NYSE)", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "BBD", name: "Bradesco ADR (NYSE)", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "SBS", name: "Sabesp ADR (NYSE)", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "BPAC", name: "BTG Pactual ADR (NYSE)", flag: "🇺🇸", provider: "yahoo" },
	{ symbol: "ABEV", name: "Ambev ADR (NYSE)", flag: "🇺🇸", provider: "yahoo" },

	// ── Commodities ──────────────────────────────────────────────────────────
	{ symbol: "GC=F", name: "Gold", flag: "🌍", provider: "yahoo" },
	{ symbol: "SI=F", name: "Silver", flag: "🌍", provider: "yahoo" },
	{ symbol: "CL=F", name: "Crude Oil (WTI)", flag: "🌍", provider: "yahoo" },
	{ symbol: "BZ=F", name: "Brent Oil", flag: "🌍", provider: "yahoo" },

	// ── Forex ────────────────────────────────────────────────────────────────
	{ symbol: "BRL=X", name: "USD/BRL", flag: "🇧🇷", provider: "yahoo" },
	{ symbol: "EURUSD=X", name: "EUR/USD", flag: "🇪🇺", provider: "yahoo" },
	{ symbol: "GBPUSD=X", name: "GBP/USD", flag: "🇬🇧", provider: "yahoo" },
	{ symbol: "USDJPY=X", name: "USD/JPY", flag: "🇯🇵", provider: "yahoo" },
	{ symbol: "DX-Y.NYB", name: "Dollar Index (DXY)", flag: "🇺🇸", provider: "yahoo" },

	// ── Crypto ───────────────────────────────────────────────────────────────
	{ symbol: "BTC-USD", name: "Bitcoin", flag: "₿", provider: "coingecko", fallback: "yahoo" },
	{ symbol: "ETH-USD", name: "Ethereum", flag: "⟠", provider: "coingecko", fallback: "yahoo" },
]

// ── Indexed map for O(1) lookups ─────────────────────────────────────────────

export const SYMBOLS: Map<string, SymbolDefinition> = new Map(
	SYMBOL_LIST.map((def) => [def.symbol, def])
)

// ── Tab groups ───────────────────────────────────────────────────────────────

export const GROUPS: GroupDefinition[] = [
	{
		id: "trader",
		labelKey: "groups.trader",
		symbols: ["ES=F", "NQ=F", "^VIX", "EWZ", "6L=F", "VALE", "PBR", "^TYX", "IFNC.SA", "ICOM.SA"],
	},
	{
		id: "indices",
		labelKey: "groups.indices",
		symbols: ["^GSPC", "^DJI", "^IXIC", "^FTSE", "^GDAXI", "^N225", "^HSI", "^BVSP"],
	},
	{
		id: "b3",
		labelKey: "groups.b3",
		symbols: [
			"VALE3.SA", "ITUB4.SA", "PETR4.SA", "PETR3.SA", "AZZA3.SA", "BBDC4.SA",
			"SBSP3.SA", "ITSA4.SA", "BPAC11.SA", "WEGE3.SA", "BBAS3.SA", "ABEV3.SA",
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

// ── Hero symbols for the top-level card row ──────────────────────────────────

export const HERO_SYMBOLS = ["^BVSP", "ES=F", "BRL=X", "EWZ", "^VIX", "BTC-USD"]

// ── Helper functions ─────────────────────────────────────────────────────────

/**
 * Groups all registered symbols by their preferred provider.
 *
 * @returns Map from ProviderId to the list of symbol strings routed to it
 */
export const getSymbolsByProvider = (): Map<ProviderId, string[]> => {
	const providerMap = new Map<ProviderId, string[]>()

	for (const def of SYMBOLS.values()) {
		const existing = providerMap.get(def.provider) ?? []
		existing.push(def.symbol)
		providerMap.set(def.provider, existing)
	}

	return providerMap
}

/**
 * Returns the SymbolDefinition for a given symbol, or undefined if not found.
 */
export const getSymbolDef = (symbol: string): SymbolDefinition | undefined =>
	SYMBOLS.get(symbol)

/**
 * Returns symbols that failed on their primary provider and have the given
 * provider as their fallback.
 *
 * @param fallbackProviderId - The provider to check as fallback
 * @param resolved - Set of symbols already resolved by primary providers
 */
export const getSymbolsNeedingFallback = (
	fallbackProviderId: ProviderId,
	resolved: Set<string>
): string[] => {
	const needsFallback: string[] = []

	for (const def of SYMBOLS.values()) {
		if (def.fallback === fallbackProviderId && !resolved.has(def.symbol)) {
			needsFallback.push(def.symbol)
		}
	}

	return needsFallback
}

/**
 * Returns a map from B3 symbol to its companion ADR symbol.
 * Only includes entries that have an `adrSymbol` defined.
 *
 * @returns Map<b3Symbol, adrSymbol> (e.g. "VALE3.SA" → "VALE")
 */
export const getCompanionSymbols = (): Map<string, string> => {
	const companions = new Map<string, string>()

	for (const def of SYMBOLS.values()) {
		if (def.adrSymbol) {
			companions.set(def.symbol, def.adrSymbol)
		}
	}

	return companions
}
