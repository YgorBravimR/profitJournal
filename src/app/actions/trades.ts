"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db/drizzle"
import { trades, tradeTags, tags, strategies, timeframes, tradeExecutions } from "@/db/schema"
import type { Trade, TradeExecution } from "@/db/schema"
import type { ActionResponse, PaginatedResponse } from "@/types"
import {
	createTradeSchema,
	updateTradeSchema,
	tradeFiltersSchema,
	paginationSchema,
	type CreateTradeInput,
	type UpdateTradeInput,
	type TradeFilters,
	type PaginationParams,
} from "@/lib/validations/trade"
import type { CsvTradeInput } from "@/lib/csv-parser"
import { eq, and, gte, lte, inArray, desc, asc, count, sql } from "drizzle-orm"
import { calculatePnL, calculateRMultiple, determineOutcome } from "@/lib/calculations"
import { getStartOfDay, getEndOfDay } from "@/lib/dates"
import { toCents } from "@/lib/money"
import { requireAuth } from "@/app/actions/auth"

// Type for trade with relations
export interface TradeWithRelations extends Trade {
	strategy?: typeof strategies.$inferSelect | null
	timeframe?: typeof timeframes.$inferSelect | null
	tradeTags?: Array<{
		tag: typeof tags.$inferSelect
	}>
	executions?: TradeExecution[]
}

/**
 * Create a new trade
 */
export const createTrade = async (
	input: CreateTradeInput
): Promise<ActionResponse<Trade>> => {
	try {
		const { accountId } = await requireAuth()
		const validated = createTradeSchema.parse(input)
		const { tagIds, ...tradeData } = validated

		// Calculate derived fields if we have exit data
		let pnl = tradeData.pnl
		let outcome: "win" | "loss" | "breakeven" | undefined
		let realizedR = tradeData.realizedRMultiple

		// Calculate plannedRiskAmount: use manual riskAmount if provided, otherwise calculate from stopLoss
		let plannedRiskAmount: number | undefined
		let plannedRMultiple: number | undefined

		if (tradeData.riskAmount) {
			// Use manual risk amount if provided
			plannedRiskAmount = tradeData.riskAmount
		} else if (tradeData.stopLoss) {
			// Calculate from stop loss
			const riskPerUnit =
				tradeData.direction === "long"
					? tradeData.entryPrice - tradeData.stopLoss
					: tradeData.stopLoss - tradeData.entryPrice
			plannedRiskAmount = Math.abs(riskPerUnit * tradeData.positionSize)
		}

		// Calculate plannedRMultiple from take profit (reward/risk ratio) - only if we have stopLoss
		if (tradeData.stopLoss && tradeData.takeProfit) {
			const riskPerUnit =
				tradeData.direction === "long"
					? tradeData.entryPrice - tradeData.stopLoss
					: tradeData.stopLoss - tradeData.entryPrice
			if (riskPerUnit !== 0) {
				const rewardPerUnit =
					tradeData.direction === "long"
						? tradeData.takeProfit - tradeData.entryPrice
						: tradeData.entryPrice - tradeData.takeProfit
				plannedRMultiple = Math.abs(rewardPerUnit / riskPerUnit)
			}
		}

		if (tradeData.exitPrice && !pnl) {
			// TODO: Apply per-asset fees from settings when implemented
			pnl = calculatePnL({
				direction: tradeData.direction,
				entryPrice: tradeData.entryPrice,
				exitPrice: tradeData.exitPrice,
				positionSize: tradeData.positionSize,
			})
		}

		if (pnl !== undefined) {
			outcome = determineOutcome(pnl)
		}

		if (pnl !== undefined && plannedRiskAmount && plannedRiskAmount > 0) {
			realizedR = calculateRMultiple(pnl, plannedRiskAmount)
		}

		// Insert trade - money fields (pnl, plannedRiskAmount) stored as cents
		const [trade] = await db
			.insert(trades)
			.values({
				accountId,
				asset: tradeData.asset,
				direction: tradeData.direction,
				timeframeId: tradeData.timeframeId || null,
				entryDate: tradeData.entryDate,
				exitDate: tradeData.exitDate,
				entryPrice: tradeData.entryPrice.toString(),
				exitPrice: tradeData.exitPrice?.toString(),
				positionSize: tradeData.positionSize.toString(),
				stopLoss: tradeData.stopLoss?.toString(),
				takeProfit: tradeData.takeProfit?.toString(),
				plannedRiskAmount: plannedRiskAmount !== undefined ? toCents(plannedRiskAmount) : null,
				plannedRMultiple: plannedRMultiple?.toString(),
				pnl: pnl !== undefined ? toCents(pnl) : null,
				outcome,
				realizedRMultiple: realizedR?.toString(),
				mfe: tradeData.mfe?.toString(),
				mae: tradeData.mae?.toString(),
				// contractsExecuted defaults to positionSize * 2 (entry + exit) if not provided
				contractsExecuted: tradeData.contractsExecuted?.toString() ?? (tradeData.positionSize * 2).toString(),
				followedPlan: tradeData.followedPlan,
				strategyId: tradeData.strategyId || null,
				preTradeThoughts: tradeData.preTradeThoughts,
				postTradeReflection: tradeData.postTradeReflection,
				lessonLearned: tradeData.lessonLearned,
				disciplineNotes: tradeData.disciplineNotes,
			})
			.returning()

		// Insert tag associations
		if (tagIds?.length) {
			await db.insert(tradeTags).values(
				tagIds.map((tagId) => ({
					tradeId: trade.id,
					tagId,
				}))
			)
		}

		// Revalidate journal pages
		revalidatePath("/journal")

		return {
			status: "success",
			message: "Trade created successfully",
			data: trade,
		}
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return {
				status: "error",
				message: "Validation failed",
				errors: [{ code: "VALIDATION_ERROR", detail: error.message }],
			}
		}

		console.error("Create trade error:", error)
		return {
			status: "error",
			message: "Failed to create trade",
			errors: [{ code: "CREATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Update an existing trade
 */
export const updateTrade = async (
	id: string,
	input: UpdateTradeInput
): Promise<ActionResponse<Trade>> => {
	try {
		const { accountId } = await requireAuth()
		const validated = updateTradeSchema.parse(input)
		const { tagIds, ...tradeData } = validated

		// Get existing trade to merge data (verify ownership)
		const existing = await db.query.trades.findFirst({
			where: and(eq(trades.id, id), eq(trades.accountId, accountId)),
		})

		if (!existing) {
			return {
				status: "error",
				message: "Trade not found",
				errors: [{ code: "NOT_FOUND", detail: "Trade does not exist" }],
			}
		}

		// Merge existing data with updates
		const exitPrice = tradeData.exitPrice ?? (existing.exitPrice ? Number(existing.exitPrice) : undefined)
		const entryPrice = tradeData.entryPrice ?? Number(existing.entryPrice)
		const positionSize = tradeData.positionSize ?? Number(existing.positionSize)
		const direction = tradeData.direction ?? existing.direction
		const stopLoss = tradeData.stopLoss ?? (existing.stopLoss ? Number(existing.stopLoss) : undefined)
		const takeProfit = tradeData.takeProfit ?? (existing.takeProfit ? Number(existing.takeProfit) : undefined)
		const riskAmount = tradeData.riskAmount ?? (existing.plannedRiskAmount ? existing.plannedRiskAmount / 100 : undefined)

		// Calculate plannedRiskAmount: use manual riskAmount if provided, otherwise calculate from stopLoss
		let plannedRiskAmount: number | undefined
		let plannedRMultiple: number | undefined

		if (riskAmount) {
			// Use manual risk amount if provided
			plannedRiskAmount = riskAmount
		} else if (stopLoss) {
			// Calculate from stop loss
			const riskPerUnit =
				direction === "long" ? entryPrice - stopLoss : stopLoss - entryPrice
			plannedRiskAmount = Math.abs(riskPerUnit * positionSize)
		}

		// Calculate plannedRMultiple from take profit (reward/risk ratio) - only if we have stopLoss
		if (stopLoss && takeProfit) {
			const riskPerUnit =
				direction === "long" ? entryPrice - stopLoss : stopLoss - entryPrice
			if (riskPerUnit !== 0) {
				const rewardPerUnit =
					direction === "long"
						? takeProfit - entryPrice
						: entryPrice - takeProfit
				plannedRMultiple = Math.abs(rewardPerUnit / riskPerUnit)
			}
		}

		// Always recalculate derived fields when we have exit data
		let pnl: number | undefined
		let outcome: "win" | "loss" | "breakeven" | null = null
		let realizedR: number | undefined

		if (exitPrice) {
			// TODO: Apply per-asset fees from settings when implemented
			pnl = calculatePnL({
				direction,
				entryPrice,
				exitPrice,
				positionSize,
			})
			outcome = determineOutcome(pnl)

			if (plannedRiskAmount && plannedRiskAmount > 0) {
				realizedR = calculateRMultiple(pnl, plannedRiskAmount)
			}
		}

		// Update trade - convert numeric fields to strings for Drizzle
		const updateData: Record<string, unknown> = {
			updatedAt: new Date(),
		}

		// Only include fields that were provided
		if (tradeData.asset !== undefined) updateData.asset = tradeData.asset
		if (tradeData.direction !== undefined) updateData.direction = tradeData.direction
		if (tradeData.timeframeId !== undefined) updateData.timeframeId = tradeData.timeframeId || null
		if (tradeData.entryDate !== undefined) updateData.entryDate = tradeData.entryDate
		if (tradeData.exitDate !== undefined) updateData.exitDate = tradeData.exitDate
		if (tradeData.entryPrice !== undefined) updateData.entryPrice = tradeData.entryPrice.toString()
		if (tradeData.exitPrice !== undefined) updateData.exitPrice = tradeData.exitPrice.toString()
		if (tradeData.positionSize !== undefined) updateData.positionSize = tradeData.positionSize.toString()
		if (tradeData.stopLoss !== undefined) updateData.stopLoss = tradeData.stopLoss.toString()
		if (tradeData.takeProfit !== undefined) updateData.takeProfit = tradeData.takeProfit.toString()
		// Always update calculated risk values (derived from SL/TP)
		if (plannedRiskAmount !== undefined) updateData.plannedRiskAmount = plannedRiskAmount.toString()
		if (plannedRMultiple !== undefined) updateData.plannedRMultiple = plannedRMultiple.toString()
		if (tradeData.mfe !== undefined) updateData.mfe = tradeData.mfe.toString()
		if (tradeData.mae !== undefined) updateData.mae = tradeData.mae.toString()
		if (tradeData.contractsExecuted !== undefined) updateData.contractsExecuted = tradeData.contractsExecuted.toString()
		if (tradeData.followedPlan !== undefined) updateData.followedPlan = tradeData.followedPlan
		if (tradeData.strategyId !== undefined) updateData.strategyId = tradeData.strategyId
		if (tradeData.preTradeThoughts !== undefined) updateData.preTradeThoughts = tradeData.preTradeThoughts
		if (tradeData.postTradeReflection !== undefined) updateData.postTradeReflection = tradeData.postTradeReflection
		if (tradeData.lessonLearned !== undefined) updateData.lessonLearned = tradeData.lessonLearned
		if (tradeData.disciplineNotes !== undefined) updateData.disciplineNotes = tradeData.disciplineNotes

		// Always include calculated fields when we have exit data
		// Money fields (pnl, plannedRiskAmount) stored as cents
		if (exitPrice) {
			updateData.pnl = pnl !== undefined ? toCents(pnl) : null
			updateData.outcome = outcome
			updateData.realizedRMultiple = realizedR?.toString() ?? null
		}
		if (plannedRiskAmount !== undefined) {
			updateData.plannedRiskAmount = toCents(plannedRiskAmount)
		}

		const [trade] = await db
			.update(trades)
			.set(updateData)
			.where(eq(trades.id, id))
			.returning()

		// Update tag associations if provided
		if (tagIds !== undefined) {
			// Remove existing tags
			await db.delete(tradeTags).where(eq(tradeTags.tradeId, id))

			// Insert new tags
			if (tagIds.length) {
				await db.insert(tradeTags).values(
					tagIds.map((tagId) => ({
						tradeId: id,
						tagId,
					}))
				)
			}
		}

		// Revalidate journal pages
		revalidatePath("/journal")
		revalidatePath(`/journal/${id}`)

		return {
			status: "success",
			message: "Trade updated successfully",
			data: trade,
		}
	} catch (error) {
		console.error("Update trade error:", error)
		return {
			status: "error",
			message: "Failed to update trade",
			errors: [{ code: "UPDATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Delete (archive) a trade
 */
export const deleteTrade = async (id: string): Promise<ActionResponse<void>> => {
	try {
		const { accountId } = await requireAuth()
		const existing = await db.query.trades.findFirst({
			where: and(eq(trades.id, id), eq(trades.accountId, accountId)),
		})

		if (!existing) {
			return {
				status: "error",
				message: "Trade not found",
				errors: [{ code: "NOT_FOUND", detail: "Trade does not exist" }],
			}
		}

		await db
			.update(trades)
			.set({ isArchived: true, updatedAt: new Date() })
			.where(and(eq(trades.id, id), eq(trades.accountId, accountId)))

		// Revalidate journal pages
		revalidatePath("/journal")

		return {
			status: "success",
			message: "Trade archived successfully",
		}
	} catch (error) {
		console.error("Delete trade error:", error)
		return {
			status: "error",
			message: "Failed to archive trade",
			errors: [{ code: "DELETE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get a single trade by ID with relations
 */
export const getTrade = async (
	id: string
): Promise<ActionResponse<TradeWithRelations>> => {
	try {
		const { accountId } = await requireAuth()
		const trade = await db.query.trades.findFirst({
			where: and(
				eq(trades.id, id),
				eq(trades.accountId, accountId),
				eq(trades.isArchived, false)
			),
			with: {
				strategy: true,
				timeframe: true,
				tradeTags: {
					with: {
						tag: true,
					},
				},
				executions: true,
			},
		})

		if (!trade) {
			return {
				status: "error",
				message: "Trade not found",
				errors: [{ code: "NOT_FOUND", detail: "Trade does not exist" }],
			}
		}

		return {
			status: "success",
			message: "Trade retrieved successfully",
			data: trade,
		}
	} catch (error) {
		console.error("Get trade error:", error)
		return {
			status: "error",
			message: "Failed to retrieve trade",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get paginated list of trades with filters
 */
export const getTrades = async (
	filters?: TradeFilters,
	pagination?: PaginationParams
): Promise<ActionResponse<PaginatedResponse<TradeWithRelations>>> => {
	try {
		const { accountId, showAllAccounts, allAccountIds } = await requireAuth()
		const validatedFilters = filters ? tradeFiltersSchema.parse(filters) : {}
		const validatedPagination = pagination
			? paginationSchema.parse(pagination)
			: paginationSchema.parse({})

		const { limit, offset, sortBy, sortOrder } = validatedPagination

		// Build where conditions - filter by current account or all accounts based on setting
		const accountCondition = showAllAccounts
			? inArray(trades.accountId, allAccountIds)
			: eq(trades.accountId, accountId)
		const conditions = [accountCondition, eq(trades.isArchived, false)]

		if (validatedFilters.dateFrom) {
			conditions.push(gte(trades.entryDate, validatedFilters.dateFrom))
		}
		if (validatedFilters.dateTo) {
			conditions.push(lte(trades.entryDate, validatedFilters.dateTo))
		}
		if (validatedFilters.assets?.length) {
			conditions.push(inArray(trades.asset, validatedFilters.assets))
		}
		if (validatedFilters.directions?.length) {
			conditions.push(inArray(trades.direction, validatedFilters.directions))
		}
		if (validatedFilters.outcomes?.length) {
			conditions.push(inArray(trades.outcome, validatedFilters.outcomes))
		}
		if (validatedFilters.strategyIds?.length) {
			conditions.push(inArray(trades.strategyId, validatedFilters.strategyIds))
		}
		if (validatedFilters.timeframeIds?.length) {
			conditions.push(inArray(trades.timeframeId, validatedFilters.timeframeIds))
		}

		// Handle tag filtering with subquery
		if (validatedFilters.tagIds?.length) {
			const tradesWithTags = db
				.select({ tradeId: tradeTags.tradeId })
				.from(tradeTags)
				.where(inArray(tradeTags.tagId, validatedFilters.tagIds))

			conditions.push(inArray(trades.id, tradesWithTags))
		}

		const whereClause = and(...conditions)

		// Get sort column
		const sortColumn = trades[sortBy]
		const orderFn = sortOrder === "desc" ? desc : asc

		// Execute queries
		const [result, countResult] = await Promise.all([
			db.query.trades.findMany({
				where: whereClause,
				with: {
					strategy: true,
					timeframe: true,
					tradeTags: {
						with: {
							tag: true,
						},
					},
				},
				orderBy: [orderFn(sortColumn)],
				limit,
				offset,
			}),
			db.select({ count: count() }).from(trades).where(whereClause),
		])

		const total = countResult[0]?.count ?? 0

		return {
			status: "success",
			message: "Trades retrieved successfully",
			data: {
				items: result,
				pagination: {
					total,
					limit,
					offset,
					hasMore: offset + result.length < total,
				},
			},
		}
	} catch (error) {
		console.error("Get trades error:", error)
		return {
			status: "error",
			message: "Failed to retrieve trades",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get trades for a specific date (for calendar)
 */
export const getTradesForDate = async (
	date: Date
): Promise<ActionResponse<Trade[]>> => {
	try {
		const { accountId } = await requireAuth()
		const startOfDay = getStartOfDay(date)
		const endOfDay = getEndOfDay(date)

		const result = await db.query.trades.findMany({
			where: and(
				eq(trades.accountId, accountId),
				eq(trades.isArchived, false),
				gte(trades.entryDate, startOfDay),
				lte(trades.entryDate, endOfDay)
			),
			orderBy: [asc(trades.entryDate)],
		})

		return {
			status: "success",
			message: "Trades retrieved successfully",
			data: result,
		}
	} catch (error) {
		console.error("Get trades for date error:", error)
		return {
			status: "error",
			message: "Failed to retrieve trades",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get unique assets from all trades (for filter dropdowns)
 */
export const getUniqueAssets = async (): Promise<ActionResponse<string[]>> => {
	try {
		const { accountId } = await requireAuth()
		const result = await db
			.selectDistinct({ asset: trades.asset })
			.from(trades)
			.where(and(eq(trades.accountId, accountId), eq(trades.isArchived, false)))
			.orderBy(asc(trades.asset))

		return {
			status: "success",
			message: "Assets retrieved successfully",
			data: result.map((r) => r.asset),
		}
	} catch (error) {
		console.error("Get unique assets error:", error)
		return {
			status: "error",
			message: "Failed to retrieve assets",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Bulk create trades from CSV import
 */
export interface BulkCreateResult {
	successCount: number
	failedCount: number
	errors: Array<{
		index: number
		message: string
	}>
}

export const bulkCreateTrades = async (
	inputs: CsvTradeInput[]
): Promise<ActionResponse<BulkCreateResult>> => {
	const result: BulkCreateResult = {
		successCount: 0,
		failedCount: 0,
		errors: [],
	}

	try {
		const { accountId } = await requireAuth()
		// Collect all unique strategy codes from the inputs
		const strategyCodes = [
			...new Set(
				inputs
					.map((i) => i.strategyCode)
					.filter((code): code is string => !!code)
			),
		]

		// Look up strategies by code
		const strategyMap = new Map<string, string>()
		if (strategyCodes.length > 0) {
			const foundStrategies = await db.query.strategies.findMany({
				where: inArray(strategies.code, strategyCodes),
			})
			for (const strategy of foundStrategies) {
				strategyMap.set(strategy.code, strategy.id)
			}
		}

		// Process trades in batches to avoid overwhelming the database
		const BATCH_SIZE = 50
		const batches: CsvTradeInput[][] = []

		for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
			batches.push(inputs.slice(i, i + BATCH_SIZE))
		}

		for (const batch of batches) {
			const tradeValues: Array<typeof trades.$inferInsert> = []

			for (let i = 0; i < batch.length; i++) {
				const input = batch[i]
				const globalIndex = inputs.indexOf(input)

				try {
					// Extract strategyCode before validation (not part of CreateTradeInput)
					const { strategyCode, ...tradeInput } = input
					const validated = createTradeSchema.parse(tradeInput)
					const { tagIds, ...tradeData } = validated

					// Look up strategy ID from code
					const strategyId = strategyCode
						? strategyMap.get(strategyCode) || null
						: null

					// Calculate derived fields
					let pnl = tradeData.pnl
					let outcome: "win" | "loss" | "breakeven" | undefined
					let realizedR = tradeData.realizedRMultiple

					// Always calculate plannedRiskAmount and plannedRMultiple from SL/TP (never user input)
					let plannedRiskAmount: number | undefined
					let plannedRMultiple: number | undefined
					if (tradeData.stopLoss) {
						const riskPerUnit =
							tradeData.direction === "long"
								? tradeData.entryPrice - tradeData.stopLoss
								: tradeData.stopLoss - tradeData.entryPrice
						plannedRiskAmount = Math.abs(riskPerUnit * tradeData.positionSize)

						// Calculate plannedRMultiple from take profit (reward/risk ratio)
						if (tradeData.takeProfit && riskPerUnit !== 0) {
							const rewardPerUnit =
								tradeData.direction === "long"
									? tradeData.takeProfit - tradeData.entryPrice
									: tradeData.entryPrice - tradeData.takeProfit
							plannedRMultiple = Math.abs(rewardPerUnit / riskPerUnit)
						}
					}

					if (tradeData.exitPrice && !pnl) {
						pnl = calculatePnL({
							direction: tradeData.direction,
							entryPrice: tradeData.entryPrice,
							exitPrice: tradeData.exitPrice,
							positionSize: tradeData.positionSize,
						})
					}

					if (pnl !== undefined) {
						outcome = determineOutcome(pnl)
					}

					if (pnl !== undefined && plannedRiskAmount && plannedRiskAmount > 0) {
						realizedR = calculateRMultiple(pnl, plannedRiskAmount)
					}

					tradeValues.push({
						accountId,
						asset: tradeData.asset,
						direction: tradeData.direction,
						timeframeId: tradeData.timeframeId || null,
						entryDate: tradeData.entryDate,
						exitDate: tradeData.exitDate,
						entryPrice: tradeData.entryPrice.toString(),
						exitPrice: tradeData.exitPrice?.toString(),
						positionSize: tradeData.positionSize.toString(),
						stopLoss: tradeData.stopLoss?.toString(),
						takeProfit: tradeData.takeProfit?.toString(),
						plannedRiskAmount: plannedRiskAmount !== undefined ? toCents(plannedRiskAmount) : null,
						plannedRMultiple: plannedRMultiple?.toString(),
						pnl: pnl !== undefined ? toCents(pnl) : null,
						outcome,
						realizedRMultiple: realizedR?.toString(),
						mfe: tradeData.mfe?.toString(),
						mae: tradeData.mae?.toString(),
						// contractsExecuted defaults to positionSize * 2 (entry + exit)
						contractsExecuted: tradeData.contractsExecuted?.toString() ?? (tradeData.positionSize * 2).toString(),
						followedPlan: tradeData.followedPlan,
						strategyId: strategyId || tradeData.strategyId || null,
						preTradeThoughts: tradeData.preTradeThoughts,
						postTradeReflection: tradeData.postTradeReflection,
						lessonLearned: tradeData.lessonLearned,
						disciplineNotes: tradeData.disciplineNotes,
					})
				} catch (error) {
					result.failedCount++
					result.errors.push({
						index: globalIndex,
						message: error instanceof Error ? error.message : String(error),
					})
				}
			}

			// Bulk insert valid trades
			if (tradeValues.length > 0) {
				await db.insert(trades).values(tradeValues)
				result.successCount += tradeValues.length
			}
		}

		// Revalidate journal pages
		revalidatePath("/journal")
		revalidatePath("/")

		return {
			status: result.failedCount === inputs.length ? "error" : "success",
			message:
				result.failedCount === 0
					? `Successfully imported ${result.successCount} trades`
					: `Imported ${result.successCount} trades, ${result.failedCount} failed`,
			data: result,
		}
	} catch (error) {
		console.error("Bulk create trades error:", error)
		return {
			status: "error",
			message: "Failed to import trades",
			errors: [{ code: "BULK_CREATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Recalculate R values for all trades that have stopLoss but no plannedRiskAmount
 * This is useful for fixing trades imported before R calculation was added
 */
export const recalculateRValues = async (): Promise<
	ActionResponse<{ updatedCount: number }>
> => {
	try {
		const { accountId } = await requireAuth()
		// Get all non-archived trades that have stopLoss but missing plannedRiskAmount
		const allTrades = await db.query.trades.findMany({
			where: and(eq(trades.accountId, accountId), eq(trades.isArchived, false)),
		})

		let updatedCount = 0

		for (const trade of allTrades) {
			const stopLoss = trade.stopLoss ? Number(trade.stopLoss) : null
			const takeProfit = trade.takeProfit ? Number(trade.takeProfit) : null
			const entryPrice = Number(trade.entryPrice)
			const positionSize = Number(trade.positionSize)
			// pnl is stored in cents, convert to dollars for calculation
			const pnlCents = trade.pnl
			const pnl = pnlCents !== null ? pnlCents / 100 : null

			// Only process trades that have stopLoss and entry data
			if (!stopLoss || !entryPrice || !positionSize) continue

			// Calculate plannedRiskAmount from stopLoss (in dollars)
			const riskPerUnit =
				trade.direction === "long"
					? entryPrice - stopLoss
					: stopLoss - entryPrice
			const plannedRiskAmount = Math.abs(riskPerUnit * positionSize)

			// Skip if risk is 0 or negative
			if (plannedRiskAmount <= 0) continue

			// Calculate plannedRMultiple from take profit (reward/risk ratio)
			let plannedRMultiple: number | null = null
			if (takeProfit && riskPerUnit !== 0) {
				const rewardPerUnit =
					trade.direction === "long"
						? takeProfit - entryPrice
						: entryPrice - takeProfit
				plannedRMultiple = Math.abs(rewardPerUnit / riskPerUnit)
			}

			// Calculate realizedR if we have pnl
			let realizedR: number | null = null
			if (pnl !== null) {
				realizedR = calculateRMultiple(pnl, plannedRiskAmount)
			}

			// Update the trade - money fields stored as cents
			await db
				.update(trades)
				.set({
					plannedRiskAmount: toCents(plannedRiskAmount),
					plannedRMultiple: plannedRMultiple?.toString() ?? null,
					realizedRMultiple: realizedR?.toString() ?? null,
				})
				.where(eq(trades.id, trade.id))

			updatedCount++
		}

		// Revalidate all pages that might show trade data
		revalidatePath("/")
		revalidatePath("/journal")
		revalidatePath("/analytics")

		return {
			status: "success",
			message: `Recalculated R values for ${updatedCount} trades`,
			data: { updatedCount },
		}
	} catch (error) {
		console.error("Recalculate R values error:", error)
		return {
			status: "error",
			message: "Failed to recalculate R values",
			errors: [{ code: "RECALCULATE_FAILED", detail: String(error) }],
		}
	}
}
