// API Response Types
export interface ActionResponse<T> {
	status: "success" | "error"
	message: string
	data?: T
	errors?: ActionError[]
}

export interface ActionError {
	code: string
	detail: string
	field?: string
}

export interface PaginatedResponse<T> {
	items: T[]
	pagination: {
		total: number
		limit: number
		offset: number
		hasMore: boolean
	}
}

// Trade Types
export type TradeDirection = "long" | "short"
export type TradeOutcome = "win" | "loss" | "breakeven"
export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w"
export type TagType = "setup" | "mistake" | "general"

// Filter Types
export interface TradeFilters {
	dateFrom?: Date
	dateTo?: Date
	assets?: string[]
	directions?: TradeDirection[]
	outcomes?: TradeOutcome[]
	strategyIds?: string[]
	tagIds?: string[]
	timeframes?: Timeframe[]
}

export interface PaginationParams {
	limit?: number
	offset?: number
	sortBy?: string
	sortOrder?: "asc" | "desc"
}

// Stats Types
export interface OverallStats {
	netPnl: number
	winRate: number
	profitFactor: number
	averageR: number
	totalTrades: number
	winCount: number
	lossCount: number
	avgWin: number
	avgLoss: number
}

export interface DisciplineData {
	score: number
	totalTrades: number
	followedCount: number
	trend: "up" | "down" | "stable"
	recentCompliance: number
}

export interface EquityPoint {
	date: string
	equity: number
	accountEquity: number
	drawdown: number
}

export interface DailyPnL {
	date: string
	pnl: number
	tradeCount: number
}

export interface StreakData {
	currentStreak: number
	currentStreakType: "win" | "loss" | "none"
	longestWinStreak: number
	longestLossStreak: number
	bestDay: { date: string; pnl: number } | null
	worstDay: { date: string; pnl: number } | null
}

export interface TagStats {
	tagId: string
	tagName: string
	tagType: TagType
	tradeCount: number
	totalPnl: number
	winRate: number
	avgR: number
}

export interface StrategyStats {
	strategyId: string
	strategyName: string
	tradeCount: number
	compliance: number
	totalPnl: number
}

export interface PerformanceByGroup {
	group: string
	tradeCount: number
	pnl: number
	winRate: number
	avgR: number
	profitFactor: number
}

export interface ExpectedValueData {
	winRate: number
	avgWin: number
	avgLoss: number
	expectedValue: number
	projectedPnl100: number
	sampleSize: number
}

export interface RDistributionBucket {
	range: string
	rangeMin: number
	rangeMax: number
	count: number
	pnl: number
}
