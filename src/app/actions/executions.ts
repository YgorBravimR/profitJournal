"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db/drizzle"
import { tradeExecutions, trades } from "@/db/schema"
import type { TradeExecution } from "@/db/schema"
import type { ActionResponse, ExecutionSummary, PositionStatus } from "@/types"
import {
	createExecutionSchema,
	updateExecutionSchema,
	type CreateExecutionInput,
	type UpdateExecutionInput,
} from "@/lib/validations/execution"
import { eq, asc, and } from "drizzle-orm"
import { toCents, fromCents } from "@/lib/money"
import { requireAuth } from "@/app/actions/auth"

/**
 * Calculate execution value (price * quantity) in cents
 */
const calculateExecutionValue = (price: number, quantity: number): number => {
	return toCents(price * quantity)
}

/**
 * Get position status based on executions
 */
const getPositionStatus = (
	totalEntryQty: number,
	totalExitQty: number
): PositionStatus => {
	if (totalExitQty === 0) return "open"
	if (totalExitQty < totalEntryQty) return "partial"
	if (totalExitQty === totalEntryQty) return "closed"
	return "over_exit"
}

/**
 * Calculate weighted average price
 */
const calculateAvgPrice = (
	executions: TradeExecution[],
	type: "entry" | "exit"
): number => {
	const filtered = executions.filter((e) => e.executionType === type)
	if (filtered.length === 0) return 0

	let totalValue = 0
	let totalQty = 0
	for (const ex of filtered) {
		const price = Number(ex.price)
		const qty = Number(ex.quantity)
		totalValue += price * qty
		totalQty += qty
	}

	return totalQty > 0 ? totalValue / totalQty : 0
}

/**
 * Calculate execution summary from executions
 */
const calculateExecutionSummary = (
	executions: TradeExecution[]
): ExecutionSummary => {
	const entries = executions.filter((e) => e.executionType === "entry")
	const exits = executions.filter((e) => e.executionType === "exit")

	const totalEntryQuantity = entries.reduce(
		(sum, e) => sum + Number(e.quantity),
		0
	)
	const totalExitQuantity = exits.reduce(
		(sum, e) => sum + Number(e.quantity),
		0
	)

	const avgEntryPrice = calculateAvgPrice(executions, "entry")
	const avgExitPrice = calculateAvgPrice(executions, "exit")

	const totalCommission = executions.reduce(
		(sum, e) => sum + (e.commission ?? 0),
		0
	)
	const totalFees = executions.reduce((sum, e) => sum + (e.fees ?? 0), 0)

	return {
		totalEntryQuantity,
		totalExitQuantity,
		avgEntryPrice,
		avgExitPrice,
		remainingQuantity: totalEntryQuantity - totalExitQuantity,
		positionStatus: getPositionStatus(totalEntryQuantity, totalExitQuantity),
		entryCount: entries.length,
		exitCount: exits.length,
		totalCommission,
		totalFees,
	}
}

/**
 * Update trade aggregates from executions
 */
const updateTradeAggregates = async (tradeId: string): Promise<void> => {
	const executions = await db.query.tradeExecutions.findMany({
		where: eq(tradeExecutions.tradeId, tradeId),
		orderBy: [asc(tradeExecutions.executionDate)],
	})

	if (executions.length === 0) {
		// No executions, reset aggregates
		await db
			.update(trades)
			.set({
				totalEntryQuantity: null,
				totalExitQuantity: null,
				avgEntryPrice: null,
				avgExitPrice: null,
				remainingQuantity: "0",
				updatedAt: new Date(),
			})
			.where(eq(trades.id, tradeId))
		return
	}

	const summary = calculateExecutionSummary(executions)

	// Update trade with aggregated data
	await db
		.update(trades)
		.set({
			totalEntryQuantity: summary.totalEntryQuantity.toString(),
			totalExitQuantity: summary.totalExitQuantity.toString(),
			avgEntryPrice: summary.avgEntryPrice.toString(),
			avgExitPrice: summary.avgExitPrice > 0 ? summary.avgExitPrice.toString() : null,
			remainingQuantity: summary.remainingQuantity.toString(),
			// Also update the main entry/exit fields for backwards compatibility
			entryPrice: summary.avgEntryPrice.toString(),
			exitPrice: summary.avgExitPrice > 0 ? summary.avgExitPrice.toString() : null,
			positionSize: summary.totalEntryQuantity.toString(),
			// Update contracts executed (total entry + exit count * quantity)
			contractsExecuted: (summary.totalEntryQuantity + summary.totalExitQuantity).toString(),
			updatedAt: new Date(),
		})
		.where(eq(trades.id, tradeId))
}

/**
 * Create a new execution
 */
export const createExecution = async (
	input: CreateExecutionInput
): Promise<ActionResponse<TradeExecution>> => {
	try {
		const { accountId } = await requireAuth()
		const validated = createExecutionSchema.parse(input)

		// Verify trade exists and belongs to the current account
		const trade = await db.query.trades.findFirst({
			where: and(
				eq(trades.id, validated.tradeId),
				eq(trades.accountId, accountId)
			),
		})

		if (!trade) {
			return {
				status: "error",
				message: "Trade not found",
				errors: [{ code: "NOT_FOUND", detail: "Trade does not exist" }],
			}
		}

		// Convert trade to scaled mode if not already
		if (trade.executionMode !== "scaled") {
			await db
				.update(trades)
				.set({ executionMode: "scaled", updatedAt: new Date() })
				.where(eq(trades.id, validated.tradeId))
		}

		// Calculate execution value
		const executionValue = calculateExecutionValue(
			validated.price,
			validated.quantity
		)

		// Insert execution
		const [execution] = await db
			.insert(tradeExecutions)
			.values({
				tradeId: validated.tradeId,
				executionType: validated.executionType,
				executionDate: validated.executionDate,
				price: validated.price.toString(),
				quantity: validated.quantity.toString(),
				orderType: validated.orderType,
				notes: validated.notes,
				commission: validated.commission,
				fees: validated.fees,
				slippage: validated.slippage,
				executionValue,
			})
			.returning()

		// Update trade aggregates
		await updateTradeAggregates(validated.tradeId)

		// Revalidate pages
		revalidatePath("/journal")
		revalidatePath(`/journal/${validated.tradeId}`)

		return {
			status: "success",
			message: "Execution created successfully",
			data: execution,
		}
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return {
				status: "error",
				message: "Validation failed",
				errors: [{ code: "VALIDATION_ERROR", detail: error.message }],
			}
		}

		console.error("Create execution error:", error)
		return {
			status: "error",
			message: "Failed to create execution",
			errors: [{ code: "CREATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Update an existing execution
 */
export const updateExecution = async (
	id: string,
	input: UpdateExecutionInput
): Promise<ActionResponse<TradeExecution>> => {
	try {
		const { accountId } = await requireAuth()
		const validated = updateExecutionSchema.parse(input)

		// Get existing execution with trade verification
		const existing = await db.query.tradeExecutions.findFirst({
			where: eq(tradeExecutions.id, id),
			with: { trade: true },
		})

		if (!existing || existing.trade?.accountId !== accountId) {
			return {
				status: "error",
				message: "Execution not found",
				errors: [{ code: "NOT_FOUND", detail: "Execution does not exist" }],
			}
		}

		// Calculate new execution value if price or quantity changed
		const price = validated.price ?? Number(existing.price)
		const quantity = validated.quantity ?? Number(existing.quantity)
		const executionValue = calculateExecutionValue(price, quantity)

		// Build update data
		const updateData: Record<string, unknown> = {
			executionValue,
			updatedAt: new Date(),
		}

		if (validated.executionType !== undefined)
			updateData.executionType = validated.executionType
		if (validated.executionDate !== undefined)
			updateData.executionDate = validated.executionDate
		if (validated.price !== undefined)
			updateData.price = validated.price.toString()
		if (validated.quantity !== undefined)
			updateData.quantity = validated.quantity.toString()
		if (validated.orderType !== undefined)
			updateData.orderType = validated.orderType
		if (validated.notes !== undefined) updateData.notes = validated.notes
		if (validated.commission !== undefined)
			updateData.commission = validated.commission
		if (validated.fees !== undefined) updateData.fees = validated.fees
		if (validated.slippage !== undefined)
			updateData.slippage = validated.slippage

		const [execution] = await db
			.update(tradeExecutions)
			.set(updateData)
			.where(eq(tradeExecutions.id, id))
			.returning()

		// Update trade aggregates
		await updateTradeAggregates(existing.tradeId)

		// Revalidate pages
		revalidatePath("/journal")
		revalidatePath(`/journal/${existing.tradeId}`)

		return {
			status: "success",
			message: "Execution updated successfully",
			data: execution,
		}
	} catch (error) {
		console.error("Update execution error:", error)
		return {
			status: "error",
			message: "Failed to update execution",
			errors: [{ code: "UPDATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Delete an execution
 */
export const deleteExecution = async (
	id: string
): Promise<ActionResponse<void>> => {
	try {
		const { accountId } = await requireAuth()

		// Get existing execution with trade verification
		const existing = await db.query.tradeExecutions.findFirst({
			where: eq(tradeExecutions.id, id),
			with: { trade: true },
		})

		if (!existing || existing.trade?.accountId !== accountId) {
			return {
				status: "error",
				message: "Execution not found",
				errors: [{ code: "NOT_FOUND", detail: "Execution does not exist" }],
			}
		}

		const tradeId = existing.tradeId

		// Delete the execution
		await db.delete(tradeExecutions).where(eq(tradeExecutions.id, id))

		// Update trade aggregates
		await updateTradeAggregates(tradeId)

		// Check if there are any executions left
		const remainingExecutions = await db.query.tradeExecutions.findMany({
			where: eq(tradeExecutions.tradeId, tradeId),
		})

		// If no executions left, convert trade back to simple mode
		if (remainingExecutions.length === 0) {
			await db
				.update(trades)
				.set({ executionMode: "simple", updatedAt: new Date() })
				.where(eq(trades.id, tradeId))
		}

		// Revalidate pages
		revalidatePath("/journal")
		revalidatePath(`/journal/${tradeId}`)

		return {
			status: "success",
			message: "Execution deleted successfully",
		}
	} catch (error) {
		console.error("Delete execution error:", error)
		return {
			status: "error",
			message: "Failed to delete execution",
			errors: [{ code: "DELETE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get all executions for a trade
 */
export const getExecutions = async (
	tradeId: string
): Promise<ActionResponse<TradeExecution[]>> => {
	try {
		const { accountId } = await requireAuth()

		// Verify trade ownership
		const trade = await db.query.trades.findFirst({
			where: and(eq(trades.id, tradeId), eq(trades.accountId, accountId)),
		})

		if (!trade) {
			return {
				status: "error",
				message: "Trade not found",
				errors: [{ code: "NOT_FOUND", detail: "Trade does not exist" }],
			}
		}

		const executions = await db.query.tradeExecutions.findMany({
			where: eq(tradeExecutions.tradeId, tradeId),
			orderBy: [asc(tradeExecutions.executionDate)],
		})

		return {
			status: "success",
			message: "Executions retrieved successfully",
			data: executions,
		}
	} catch (error) {
		console.error("Get executions error:", error)
		return {
			status: "error",
			message: "Failed to retrieve executions",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get execution summary for a trade
 */
export const getExecutionSummary = async (
	tradeId: string
): Promise<ActionResponse<ExecutionSummary>> => {
	try {
		const { accountId } = await requireAuth()

		// Verify trade ownership
		const trade = await db.query.trades.findFirst({
			where: and(eq(trades.id, tradeId), eq(trades.accountId, accountId)),
		})

		if (!trade) {
			return {
				status: "error",
				message: "Trade not found",
				errors: [{ code: "NOT_FOUND", detail: "Trade does not exist" }],
			}
		}

		const executions = await db.query.tradeExecutions.findMany({
			where: eq(tradeExecutions.tradeId, tradeId),
			orderBy: [asc(tradeExecutions.executionDate)],
		})

		const summary = calculateExecutionSummary(executions)

		return {
			status: "success",
			message: "Execution summary calculated successfully",
			data: summary,
		}
	} catch (error) {
		console.error("Get execution summary error:", error)
		return {
			status: "error",
			message: "Failed to calculate execution summary",
			errors: [{ code: "CALCULATION_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Convert a simple trade to scaled mode by creating executions from existing data
 */
export const convertToScaledMode = async (
	tradeId: string
): Promise<ActionResponse<TradeExecution[]>> => {
	try {
		const { accountId } = await requireAuth()

		const trade = await db.query.trades.findFirst({
			where: and(eq(trades.id, tradeId), eq(trades.accountId, accountId)),
		})

		if (!trade) {
			return {
				status: "error",
				message: "Trade not found",
				errors: [{ code: "NOT_FOUND", detail: "Trade does not exist" }],
			}
		}

		if (trade.executionMode === "scaled") {
			return {
				status: "error",
				message: "Trade is already in scaled mode",
				errors: [
					{ code: "ALREADY_SCALED", detail: "Trade is already in scaled mode" },
				],
			}
		}

		const createdExecutions: TradeExecution[] = []

		// Create entry execution from existing trade data
		const entryPrice = Number(trade.entryPrice)
		const positionSize = Number(trade.positionSize)

		const entryValue = calculateExecutionValue(entryPrice, positionSize)

		const [entryExecution] = await db
			.insert(tradeExecutions)
			.values({
				tradeId,
				executionType: "entry",
				executionDate: trade.entryDate,
				price: trade.entryPrice,
				quantity: trade.positionSize,
				orderType: "market",
				commission: trade.commission ? Number(trade.commission) : 0,
				fees: trade.fees ? Number(trade.fees) : 0,
				slippage: 0,
				executionValue: entryValue,
			})
			.returning()

		createdExecutions.push(entryExecution)

		// Create exit execution if trade has exit data
		if (trade.exitPrice && trade.exitDate) {
			const exitPrice = Number(trade.exitPrice)
			const exitValue = calculateExecutionValue(exitPrice, positionSize)

			const [exitExecution] = await db
				.insert(tradeExecutions)
				.values({
					tradeId,
					executionType: "exit",
					executionDate: trade.exitDate,
					price: trade.exitPrice,
					quantity: trade.positionSize,
					orderType: "market",
					commission: 0,
					fees: 0,
					slippage: 0,
					executionValue: exitValue,
				})
				.returning()

			createdExecutions.push(exitExecution)
		}

		// Update trade to scaled mode
		await db
			.update(trades)
			.set({ executionMode: "scaled", updatedAt: new Date() })
			.where(eq(trades.id, tradeId))

		// Update aggregates
		await updateTradeAggregates(tradeId)

		// Revalidate pages
		revalidatePath("/journal")
		revalidatePath(`/journal/${tradeId}`)

		return {
			status: "success",
			message: "Trade converted to scaled mode successfully",
			data: createdExecutions,
		}
	} catch (error) {
		console.error("Convert to scaled mode error:", error)
		return {
			status: "error",
			message: "Failed to convert trade to scaled mode",
			errors: [{ code: "CONVERT_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Recalculate trade aggregates from executions
 * Useful for fixing data integrity issues
 */
export const recalculateTradeFromExecutions = async (
	tradeId: string
): Promise<ActionResponse<ExecutionSummary>> => {
	try {
		const { accountId } = await requireAuth()

		const trade = await db.query.trades.findFirst({
			where: and(eq(trades.id, tradeId), eq(trades.accountId, accountId)),
		})

		if (!trade) {
			return {
				status: "error",
				message: "Trade not found",
				errors: [{ code: "NOT_FOUND", detail: "Trade does not exist" }],
			}
		}

		if (trade.executionMode !== "scaled") {
			return {
				status: "error",
				message: "Trade is not in scaled mode",
				errors: [
					{
						code: "NOT_SCALED",
						detail: "Trade must be in scaled mode to recalculate from executions",
					},
				],
			}
		}

		await updateTradeAggregates(tradeId)

		const executions = await db.query.tradeExecutions.findMany({
			where: eq(tradeExecutions.tradeId, tradeId),
		})

		const summary = calculateExecutionSummary(executions)

		// Revalidate pages
		revalidatePath("/journal")
		revalidatePath(`/journal/${tradeId}`)

		return {
			status: "success",
			message: "Trade recalculated from executions successfully",
			data: summary,
		}
	} catch (error) {
		console.error("Recalculate trade error:", error)
		return {
			status: "error",
			message: "Failed to recalculate trade from executions",
			errors: [{ code: "RECALCULATE_FAILED", detail: String(error) }],
		}
	}
}
