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

// ==========================================
// MONTE CARLO V2 — DAY-AWARE SIMULATION
// ==========================================

/**
 * Flat config derived from a risk profile for the V2 simulation engine.
 * Avoids deep nesting so the simulation loop stays readable.
 */
export interface RiskManagementProfileForSim {
	name: string
	baseRiskCents: number
	rewardRiskRatio: number
	winRate: number // 0-100 (of decisive trades, excluding breakevens)
	breakevenRate: number // 0-100 (percentage of ALL trades that are breakeven)
	dailyTargetCents: number | null
	dailyLossLimitCents: number
	lossRecoverySteps: Array<{
		riskCents: number // pre-computed absolute cents for this step
	}>
	executeAllRegardless: boolean // run all recovery trades even if earlier ones win
	stopAfterSequence: boolean // stop trading for the day after recovery sequence completes
	compoundingRiskPercent: number // 0-100, 0 = no compounding (single-target mode)
	stopOnFirstLoss: boolean // in gain mode, stop compounding on first loss
	weeklyLossLimitCents: number | null
	monthlyLossLimitCents: number
	tradingDaysPerMonth: number // typically 22
	tradingDaysPerWeek: number // typically 5
	commissionPerTradeCents: number
}

export interface SimulationParamsV2 {
	profile: RiskManagementProfileForSim
	simulationCount: number
	initialBalance: number // cents
}

/** The mode a trade was executed under within a simulated day. */
export type TradeMode = "base" | "lossRecovery" | "gainCompounding"

export interface SimulatedTradeV2 {
	dayNumber: number
	tradeNumberInDay: number
	mode: TradeMode
	riskAmount: number // cents
	isWin: boolean
	isBreakeven: boolean
	pnl: number // cents (signed)
	commission: number // cents
	accumulatedDayPnl: number // running total for the day
	balanceAfter: number // cents
}

export interface SimulatedDay {
	dayNumber: number
	weekNumber: number
	mode: "lossRecovery" | "gainCompounding" | "mixed"
	trades: SimulatedTradeV2[]
	dayPnl: number // cents
	targetHit: boolean
	skipped: boolean
	skipReason: "weeklyLimit" | "monthlyLimit" | null
}

export interface SimulationRunV2 {
	days: SimulatedDay[]
	totalPnl: number
	totalTrades: number
	totalTradingDays: number
	daysInLossRecovery: number
	daysInGainCompounding: number
	daysSkippedWeeklyLimit: number
	daysSkippedMonthlyLimit: number
	daysTargetHit: number
	timesWeeklyLimitHit: number
	monthlyLimitHit: boolean
	maxDrawdown: number
	maxDrawdownPercent: number
	finalBalance: number
	totalReturnPercent: number
}

export interface SimulationStatisticsV2 {
	medianMonthlyPnl: number
	meanMonthlyPnl: number
	bestCaseMonthlyPnl: number
	worstCaseMonthlyPnl: number
	medianReturnPercent: number
	profitableMonthsPct: number
	monthlyLimitHitPct: number
	avgTradingDaysPerMonth: number
	avgDaysInLossRecovery: number
	avgDaysInGainCompounding: number
	avgDaysTargetHit: number
	avgDaysSkippedWeeklyLimit: number
	avgDaysSkippedMonthlyLimit: number
	avgTradesPerMonth: number
	medianMaxDrawdownPercent: number
	worstMaxDrawdownPercent: number
	sharpeRatio: number
	sortinoRatio: number
	expectedDailyPnl: number
}

export interface MonteCarloResultV2 {
	params: SimulationParamsV2
	statistics: SimulationStatisticsV2
	distributionBuckets: DistributionBucket[]
	sampleRun: SimulationRunV2
}
