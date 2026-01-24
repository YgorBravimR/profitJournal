/**
 * Calculate win rate percentage
 */
export const calculateWinRate = (wins: number, total: number): number => {
	if (total === 0) return 0
	return (wins / total) * 100
}

/**
 * Calculate profit factor (gross profit / gross loss)
 */
export const calculateProfitFactor = (
	grossProfit: number,
	grossLoss: number
): number => {
	if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
	return grossProfit / Math.abs(grossLoss)
}

/**
 * Calculate expected value per trade
 * EV = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
 */
export const calculateExpectedValue = (
	winRate: number,
	avgWin: number,
	avgLoss: number
): number => {
	const lossRate = 100 - winRate
	return (winRate / 100) * avgWin - (lossRate / 100) * Math.abs(avgLoss)
}

/**
 * Calculate drawdown percentage from peak
 */
export const calculateDrawdown = (equity: number, peak: number): number => {
	if (peak <= 0) return 0
	return ((peak - equity) / peak) * 100
}

/**
 * Calculate R-Multiple (profit/loss divided by risk amount)
 */
export const calculateRMultiple = (pnl: number, riskAmount: number): number => {
	if (riskAmount === 0) return 0
	return pnl / riskAmount
}

/**
 * Calculate position size based on risk parameters
 */
export const calculatePositionSize = ({
	accountBalance,
	riskPercent,
	entryPrice,
	stopLoss,
}: {
	accountBalance: number
	riskPercent: number
	entryPrice: number
	stopLoss: number
}): number => {
	const riskAmount = accountBalance * (riskPercent / 100)
	const riskPerShare = Math.abs(entryPrice - stopLoss)
	if (riskPerShare === 0) return 0
	return riskAmount / riskPerShare
}

/**
 * Calculate P&L for a trade
 */
export const calculatePnL = ({
	direction,
	entryPrice,
	exitPrice,
	positionSize,
	commission = 0,
	fees = 0,
}: {
	direction: "long" | "short"
	entryPrice: number
	exitPrice: number
	positionSize: number
	commission?: number
	fees?: number
}): number => {
	const priceDiff =
		direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice
	const grossPnL = priceDiff * positionSize
	return grossPnL - commission - fees
}

/**
 * Determine trade outcome based on P&L
 */
export const determineOutcome = (
	pnl: number
): "win" | "loss" | "breakeven" => {
	if (pnl > 0) return "win"
	if (pnl < 0) return "loss"
	return "breakeven"
}

/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency = "USD"): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value)
}

/**
 * Format percentage value
 */
export const formatPercent = (value: number, decimals = 1): string => {
	return `${value.toFixed(decimals)}%`
}

/**
 * Format R-Multiple value
 */
export const formatRMultiple = (value: number): string => {
	const sign = value >= 0 ? "+" : ""
	return `${sign}${value.toFixed(2)}R`
}

/**
 * P&L calculation input for asset-based calculation
 */
export interface AssetPnLInput {
	entryPrice: number
	exitPrice: number
	positionSize: number
	direction: "long" | "short"
	tickSize: number
	tickValue: number
	commission?: number
	fees?: number
}

/**
 * P&L calculation result for asset-based calculation
 */
export interface AssetPnLResult {
	ticksGained: number
	grossPnl: number
	netPnl: number
	totalCosts: number
}

/**
 * Calculate P&L for a trade using asset configuration (tick size, tick value)
 * Example: WINFUT with tickSize=5, tickValue=0.20
 * Entry: 128000, Exit: 128050, Size: 2 contracts
 * Ticks gained: (128050 - 128000) / 5 = 10 ticks
 * Gross P&L: 10 * 0.20 * 2 = R$4.00
 */
export const calculateAssetPnL = (input: AssetPnLInput): AssetPnLResult => {
	const {
		entryPrice,
		exitPrice,
		positionSize,
		direction,
		tickSize,
		tickValue,
		commission = 0,
		fees = 0,
	} = input

	const priceDiff =
		direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice

	const ticksGained = priceDiff / tickSize
	const grossPnl = ticksGained * tickValue * positionSize
	const totalCosts = (commission + fees) * positionSize
	const netPnl = grossPnl - totalCosts

	return {
		ticksGained,
		grossPnl,
		netPnl,
		totalCosts,
	}
}
