export type DataSource =
	| { type: "strategy"; strategyId: string }
	| { type: "all_strategies" }
	| { type: "universal" }

export interface SimulationParams {
	initialBalance: number
	riskType: "percentage" | "fixed"
	riskPerTrade: number
	winRate: number
	rewardRiskRatio: number
	numberOfTrades: number
	commissionPerTrade: number
	simulationCount: number
}

export interface SourceStats {
	sourceType: DataSource["type"]
	sourceName: string
	totalTrades: number
	winRate: number
	avgRewardRiskRatio: number
	avgRiskPerTrade: number
	avgCommissionImpact: number
	dateRange: { from: Date | string; to: Date | string }
	profitFactor: number
	avgR: number
	strategiesCount?: number
	accountsCount?: number
	strategiesBreakdown?: Array<{
		name: string
		tradesCount: number
		winRate: number
	}>
}

export interface SimulatedTrade {
	tradeNumber: number
	isWin: boolean
	pnl: number
	commission: number
	balanceAfter: number
	drawdown: number
	drawdownPercent: number
}

export interface SimulationRun {
	runId: number
	trades: SimulatedTrade[]
	finalBalance: number
	totalReturn: number
	totalReturnPercent: number
	maxDrawdown: number
	maxDrawdownPercent: number
	totalCommission: number
	winCount: number
	lossCount: number
	maxWinStreak: number
	maxLossStreak: number
	peakBalance: number
	underwaterTrades: number
}

export interface DistributionBucket {
	rangeStart: number
	rangeEnd: number
	count: number
	percentage: number
}

export interface SimulationStatistics {
	medianFinalBalance: number
	meanFinalBalance: number
	bestCaseFinalBalance: number
	worstCaseFinalBalance: number
	medianReturn: number
	meanReturn: number
	bestCaseReturn: number
	worstCaseReturn: number
	medianMaxDrawdown: number
	meanMaxDrawdown: number
	worstMaxDrawdown: number
	profitablePct: number
	ruinPct: number
	sharpeRatio: number
	sortinoRatio: number
	calmarRatio: number
	profitFactor: number
	expectedValuePerTrade: number
	expectedMaxWinStreak: number
	expectedMaxLossStreak: number
	avgWinStreak: number
	avgLossStreak: number
	kellyFull: number
	kellyHalf: number
	kellyQuarter: number
	kellyRecommendation: string
	kellyLevel: "aggressive" | "balanced" | "conservative"
	avgRecoveryTrades: number
	avgUnderwaterPercent: number
	bestTrade: number
	worstTrade: number
}

export interface MonteCarloResult {
	params: SimulationParams
	statistics: SimulationStatistics
	distributionBuckets: DistributionBucket[]
	sampleRun: SimulationRun
}

export interface StrategyComparisonResult {
	strategyId: string
	strategyName: string
	accountName?: string // For universal mode
	tradesCount: number
	winRate: number
	rewardRiskRatio: number
	medianReturn: number
	profitablePct: number // % of simulations profitable
	maxDrawdown: number
	sharpeRatio: number
	rank: number
	result: MonteCarloResult
}

export type ComparisonSortField =
	| "rank"
	| "profitablePct"
	| "medianReturn"
	| "maxDrawdown"
	| "sharpeRatio"
	| "winRate"

export interface ComparisonRecommendation {
	topPerformers: string[]
	needsImprovement: string[]
	suggestedAllocations: Array<{
		strategyName: string
		allocationPct: number
		reason: string
	}>
}

export interface DataSourceOption {
	type: DataSource["type"]
	strategyId?: string
	label: string
	description?: string
	tradesCount: number
	disabled?: boolean
	disabledReason?: string
}
