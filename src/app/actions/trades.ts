"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db/drizzle"
import { trades, tradeTags, tags, strategies } from "@/db/schema"
import type { Trade } from "@/db/schema"
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
import { eq, and, gte, lte, inArray, desc, asc, count, sql } from "drizzle-orm"
import { calculatePnL, calculateRMultiple, determineOutcome } from "@/lib/calculations"
import { getStartOfDay, getEndOfDay } from "@/lib/dates"

// Type for trade with relations
export interface TradeWithRelations extends Trade {
	strategy?: typeof strategies.$inferSelect | null
	tradeTags?: Array<{
		tag: typeof tags.$inferSelect
	}>
}

/**
 * Create a new trade
 */
export const createTrade = async (
	input: CreateTradeInput
): Promise<ActionResponse<Trade>> => {
	try {
		const validated = createTradeSchema.parse(input)
		const { tagIds, ...tradeData } = validated

		// Calculate derived fields if we have exit data
		let pnl = tradeData.pnl
		let outcome: "win" | "loss" | "breakeven" | undefined
		let realizedR = tradeData.realizedRMultiple

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

		if (pnl !== undefined && tradeData.plannedRiskAmount) {
			realizedR = calculateRMultiple(pnl, tradeData.plannedRiskAmount)
		}

		// Insert trade - convert numeric fields to strings for Drizzle
		const [trade] = await db
			.insert(trades)
			.values({
				asset: tradeData.asset,
				direction: tradeData.direction,
				timeframe: tradeData.timeframe,
				entryDate: tradeData.entryDate,
				exitDate: tradeData.exitDate,
				entryPrice: tradeData.entryPrice.toString(),
				exitPrice: tradeData.exitPrice?.toString(),
				positionSize: tradeData.positionSize.toString(),
				stopLoss: tradeData.stopLoss?.toString(),
				takeProfit: tradeData.takeProfit?.toString(),
				plannedRiskAmount: tradeData.plannedRiskAmount?.toString(),
				plannedRMultiple: tradeData.plannedRMultiple?.toString(),
				pnl: pnl?.toString(),
				outcome,
				realizedRMultiple: realizedR?.toString(),
				mfe: tradeData.mfe?.toString(),
				mae: tradeData.mae?.toString(),
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
		const validated = updateTradeSchema.parse(input)
		const { tagIds, ...tradeData } = validated

		// Get existing trade to merge data
		const existing = await db.query.trades.findFirst({
			where: eq(trades.id, id),
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
		const plannedRiskAmount =
			tradeData.plannedRiskAmount ?? (existing.plannedRiskAmount ? Number(existing.plannedRiskAmount) : undefined)

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

			if (plannedRiskAmount) {
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
		if (tradeData.timeframe !== undefined) updateData.timeframe = tradeData.timeframe
		if (tradeData.entryDate !== undefined) updateData.entryDate = tradeData.entryDate
		if (tradeData.exitDate !== undefined) updateData.exitDate = tradeData.exitDate
		if (tradeData.entryPrice !== undefined) updateData.entryPrice = tradeData.entryPrice.toString()
		if (tradeData.exitPrice !== undefined) updateData.exitPrice = tradeData.exitPrice.toString()
		if (tradeData.positionSize !== undefined) updateData.positionSize = tradeData.positionSize.toString()
		if (tradeData.stopLoss !== undefined) updateData.stopLoss = tradeData.stopLoss.toString()
		if (tradeData.takeProfit !== undefined) updateData.takeProfit = tradeData.takeProfit.toString()
		if (tradeData.plannedRiskAmount !== undefined) updateData.plannedRiskAmount = tradeData.plannedRiskAmount.toString()
		if (tradeData.plannedRMultiple !== undefined) updateData.plannedRMultiple = tradeData.plannedRMultiple.toString()
		if (tradeData.mfe !== undefined) updateData.mfe = tradeData.mfe.toString()
		if (tradeData.mae !== undefined) updateData.mae = tradeData.mae.toString()
		if (tradeData.followedPlan !== undefined) updateData.followedPlan = tradeData.followedPlan
		if (tradeData.strategyId !== undefined) updateData.strategyId = tradeData.strategyId
		if (tradeData.preTradeThoughts !== undefined) updateData.preTradeThoughts = tradeData.preTradeThoughts
		if (tradeData.postTradeReflection !== undefined) updateData.postTradeReflection = tradeData.postTradeReflection
		if (tradeData.lessonLearned !== undefined) updateData.lessonLearned = tradeData.lessonLearned
		if (tradeData.disciplineNotes !== undefined) updateData.disciplineNotes = tradeData.disciplineNotes

		// Always include calculated fields when we have exit data
		if (exitPrice) {
			updateData.pnl = pnl?.toString() ?? null
			updateData.outcome = outcome
			updateData.realizedRMultiple = realizedR?.toString() ?? null
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
		const existing = await db.query.trades.findFirst({
			where: eq(trades.id, id),
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
			.where(eq(trades.id, id))

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
		const trade = await db.query.trades.findFirst({
			where: and(eq(trades.id, id), eq(trades.isArchived, false)),
			with: {
				strategy: true,
				tradeTags: {
					with: {
						tag: true,
					},
				},
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
		const validatedFilters = filters ? tradeFiltersSchema.parse(filters) : {}
		const validatedPagination = pagination
			? paginationSchema.parse(pagination)
			: paginationSchema.parse({})

		const { limit, offset, sortBy, sortOrder } = validatedPagination

		// Build where conditions
		const conditions = [eq(trades.isArchived, false)]

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
		if (validatedFilters.timeframes?.length) {
			conditions.push(inArray(trades.timeframe, validatedFilters.timeframes))
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
		const startOfDay = getStartOfDay(date)
		const endOfDay = getEndOfDay(date)

		const result = await db.query.trades.findMany({
			where: and(
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
		const result = await db
			.selectDistinct({ asset: trades.asset })
			.from(trades)
			.where(eq(trades.isArchived, false))
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
	inputs: CreateTradeInput[]
): Promise<ActionResponse<BulkCreateResult>> => {
	const result: BulkCreateResult = {
		successCount: 0,
		failedCount: 0,
		errors: [],
	}

	try {
		// Process trades in batches to avoid overwhelming the database
		const BATCH_SIZE = 50
		const batches: CreateTradeInput[][] = []

		for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
			batches.push(inputs.slice(i, i + BATCH_SIZE))
		}

		for (const batch of batches) {
			const tradeValues: Array<typeof trades.$inferInsert> = []

			for (let i = 0; i < batch.length; i++) {
				const input = batch[i]
				const globalIndex = inputs.indexOf(input)

				try {
					const validated = createTradeSchema.parse(input)
					const { tagIds, ...tradeData } = validated

					// Calculate derived fields
					let pnl = tradeData.pnl
					let outcome: "win" | "loss" | "breakeven" | undefined
					let realizedR = tradeData.realizedRMultiple

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

					if (pnl !== undefined && tradeData.plannedRiskAmount) {
						realizedR = calculateRMultiple(pnl, tradeData.plannedRiskAmount)
					}

					tradeValues.push({
						asset: tradeData.asset,
						direction: tradeData.direction,
						timeframe: tradeData.timeframe,
						entryDate: tradeData.entryDate,
						exitDate: tradeData.exitDate,
						entryPrice: tradeData.entryPrice.toString(),
						exitPrice: tradeData.exitPrice?.toString(),
						positionSize: tradeData.positionSize.toString(),
						stopLoss: tradeData.stopLoss?.toString(),
						takeProfit: tradeData.takeProfit?.toString(),
						plannedRiskAmount: tradeData.plannedRiskAmount?.toString(),
						plannedRMultiple: tradeData.plannedRMultiple?.toString(),
						pnl: pnl?.toString(),
						outcome,
						realizedRMultiple: realizedR?.toString(),
						mfe: tradeData.mfe?.toString(),
						mae: tradeData.mae?.toString(),
						followedPlan: tradeData.followedPlan,
						strategyId: tradeData.strategyId || null,
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
