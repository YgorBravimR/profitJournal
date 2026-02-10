// Market Monitor Types

export interface MarketQuote {
	symbol: string
	name: string
	price: number
	change: number
	changePercent: number
	previousClose: number
	sessionHigh: number | null
	sessionLow: number | null
	flag: string
	updatedAt: string
}

export interface QuoteGroup {
	id: string
	labelKey: string
	quotes: MarketQuote[]
}

export type EventImpact = "low" | "medium" | "high"

export interface EconomicEvent {
	id: string
	time: string
	country: string
	event: string
	impact: EventImpact
	actual?: string
	forecast?: string
	previous?: string
}

export interface QuotesResponse {
	groups: QuoteGroup[]
	lastUpdated: string
}

export interface CalendarResponse {
	events: EconomicEvent[]
	lastUpdated: string
}
