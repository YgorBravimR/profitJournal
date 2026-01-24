"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db/drizzle"
import { strategies, trades } from "@/db/schema"
import type { Strategy } from "@/db/schema"
import type { ActionResponse } from "@/types"
import { eq, and, desc, asc } from "drizzle-orm"
import { z } from "zod"
import {
	createStrategySchema,
	updateStrategySchema,
	type CreateStrategyInput,
	type UpdateStrategyInput,
} from "@/lib/validations/strategy"
import { calculateWinRate, calculateProfitFactor } from "@/lib/calculations"

export interface StrategyWithStats extends Strategy {
	tradeCount: number
	winCount: number
	lossCount: number
	compliance: number
	totalPnl: number
	winRate: number
	profitFactor: number
	avgR: number
}

export interface ComplianceOverview {
	overallCompliance: number
	totalTrackedTrades: number
	followedPlanCount: number
	notFollowedCount: number
	strategiesCount: number
	topPerformingStrategy: { name: string; compliance: number } | null
	needsAttentionStrategy: { name: string; compliance: number } | null
}

/**
 * Create a new strategy
 */
export const createStrategy = async (
	input: CreateStrategyInput
): Promise<ActionResponse<Strategy>> => {
	try {
		const validated = createStrategySchema.parse(input)

		const [strategy] = await db
			.insert(strategies)
			.values({
				code: validated.code,
				name: validated.name,
				description: validated.description || null,
				entryCriteria: validated.entryCriteria || null,
				exitCriteria: validated.exitCriteria || null,
				riskRules: validated.riskRules || null,
				targetRMultiple: validated.targetRMultiple?.toString() || null,
				maxRiskPercent: validated.maxRiskPercent?.toString() || null,
				screenshotUrl: validated.screenshotUrl || null,
				notes: validated.notes || null,
				isActive: validated.isActive ?? true,
			})
			.returning()

		revalidatePath("/playbook")
		revalidatePath("/journal")

		return {
			status: "success",
			message: "Strategy created successfully",
			data: strategy,
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				status: "error",
				message: "Validation failed",
				errors: error.issues.map((e) => ({
					code: "VALIDATION_ERROR",
					detail: `${e.path.join(".")}: ${e.message}`,
				})),
			}
		}

		// Check for unique constraint violation
		if (error instanceof Error && error.message.includes("unique")) {
			return {
				status: "error",
				message: "A strategy with this code already exists",
				errors: [{ code: "DUPLICATE_STRATEGY", detail: "Strategy code must be unique" }],
			}
		}

		console.error("Create strategy error:", error)
		return {
			status: "error",
			message: "Failed to create strategy",
			errors: [{ code: "CREATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Update an existing strategy
 */
export const updateStrategy = async (
	id: string,
	input: UpdateStrategyInput
): Promise<ActionResponse<Strategy>> => {
	try {
		const existing = await db.query.strategies.findFirst({
			where: eq(strategies.id, id),
		})

		if (!existing) {
			return {
				status: "error",
				message: "Strategy not found",
				errors: [{ code: "NOT_FOUND", detail: "Strategy does not exist" }],
			}
		}

		const validated = updateStrategySchema.parse(input)

		const [strategy] = await db
			.update(strategies)
			.set({
				...(validated.code !== undefined && { code: validated.code }),
				...(validated.name !== undefined && { name: validated.name }),
				...(validated.description !== undefined && { description: validated.description || null }),
				...(validated.entryCriteria !== undefined && { entryCriteria: validated.entryCriteria || null }),
				...(validated.exitCriteria !== undefined && { exitCriteria: validated.exitCriteria || null }),
				...(validated.riskRules !== undefined && { riskRules: validated.riskRules || null }),
				...(validated.targetRMultiple !== undefined && { targetRMultiple: validated.targetRMultiple?.toString() || null }),
				...(validated.maxRiskPercent !== undefined && { maxRiskPercent: validated.maxRiskPercent?.toString() || null }),
				...(validated.screenshotUrl !== undefined && { screenshotUrl: validated.screenshotUrl || null }),
				...(validated.notes !== undefined && { notes: validated.notes || null }),
				...(validated.isActive !== undefined && { isActive: validated.isActive }),
				updatedAt: new Date(),
			})
			.where(eq(strategies.id, id))
			.returning()

		revalidatePath("/playbook")
		revalidatePath("/journal")

		return {
			status: "success",
			message: "Strategy updated successfully",
			data: strategy,
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				status: "error",
				message: "Validation failed",
				errors: error.issues.map((e) => ({
					code: "VALIDATION_ERROR",
					detail: `${e.path.join(".")}: ${e.message}`,
				})),
			}
		}

		console.error("Update strategy error:", error)
		return {
			status: "error",
			message: "Failed to update strategy",
			errors: [{ code: "UPDATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Delete a strategy (soft delete by setting isActive to false, or hard delete)
 */
export const deleteStrategy = async (
	id: string,
	hardDelete = false
): Promise<ActionResponse<void>> => {
	try {
		const existing = await db.query.strategies.findFirst({
			where: eq(strategies.id, id),
		})

		if (!existing) {
			return {
				status: "error",
				message: "Strategy not found",
				errors: [{ code: "NOT_FOUND", detail: "Strategy does not exist" }],
			}
		}

		if (hardDelete) {
			// Note: trades referencing this strategy will have strategyId set to null (onDelete: "set null")
			await db.delete(strategies).where(eq(strategies.id, id))
		} else {
			// Soft delete - just deactivate
			await db
				.update(strategies)
				.set({ isActive: false, updatedAt: new Date() })
				.where(eq(strategies.id, id))
		}

		revalidatePath("/playbook")
		revalidatePath("/journal")

		return {
			status: "success",
			message: hardDelete ? "Strategy deleted permanently" : "Strategy deactivated",
		}
	} catch (error) {
		console.error("Delete strategy error:", error)
		return {
			status: "error",
			message: "Failed to delete strategy",
			errors: [{ code: "DELETE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get all strategies with stats
 */
export const getStrategies = async (
	includeInactive = false
): Promise<ActionResponse<StrategyWithStats[]>> => {
	try {
		const conditions = includeInactive ? undefined : eq(strategies.isActive, true)

		const allStrategies = await db.query.strategies.findMany({
			where: conditions,
			orderBy: [desc(strategies.createdAt)],
		})

		if (allStrategies.length === 0) {
			return {
				status: "success",
				message: "No strategies found",
				data: [],
			}
		}

		// Calculate stats for each strategy
		const strategiesWithStats: StrategyWithStats[] = await Promise.all(
			allStrategies.map(async (strategy) => {
				const strategyTrades = await db.query.trades.findMany({
					where: and(
						eq(trades.strategyId, strategy.id),
						eq(trades.isArchived, false)
					),
				})

				let winCount = 0
				let lossCount = 0
				let totalPnl = 0
				let totalR = 0
				let rCount = 0
				let followedPlanCount = 0
				let trackedPlanCount = 0
				let grossProfit = 0
				let grossLoss = 0

				for (const trade of strategyTrades) {
					const pnl = Number(trade.pnl) || 0
					totalPnl += pnl

					if (trade.outcome === "win") {
						winCount++
						grossProfit += pnl
					} else if (trade.outcome === "loss") {
						lossCount++
						grossLoss += Math.abs(pnl)
					}

					if (trade.realizedRMultiple) {
						totalR += Number(trade.realizedRMultiple)
						rCount++
					}

					if (trade.followedPlan !== null) {
						trackedPlanCount++
						if (trade.followedPlan) {
							followedPlanCount++
						}
					}
				}

				const compliance = trackedPlanCount > 0
					? (followedPlanCount / trackedPlanCount) * 100
					: 0

				return {
					...strategy,
					tradeCount: strategyTrades.length,
					winCount,
					lossCount,
					compliance,
					totalPnl,
					winRate: calculateWinRate(winCount, winCount + lossCount),
					profitFactor: calculateProfitFactor(grossProfit, grossLoss),
					avgR: rCount > 0 ? totalR / rCount : 0,
				}
			})
		)

		return {
			status: "success",
			message: "Strategies retrieved successfully",
			data: strategiesWithStats,
		}
	} catch (error) {
		console.error("Get strategies error:", error)
		return {
			status: "error",
			message: "Failed to retrieve strategies",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get a single strategy by ID with stats
 */
export const getStrategy = async (
	id: string
): Promise<ActionResponse<StrategyWithStats>> => {
	try {
		const strategy = await db.query.strategies.findFirst({
			where: eq(strategies.id, id),
		})

		if (!strategy) {
			return {
				status: "error",
				message: "Strategy not found",
				errors: [{ code: "NOT_FOUND", detail: "Strategy does not exist" }],
			}
		}

		// Get trades for this strategy
		const strategyTrades = await db.query.trades.findMany({
			where: and(
				eq(trades.strategyId, strategy.id),
				eq(trades.isArchived, false)
			),
		})

		let winCount = 0
		let lossCount = 0
		let totalPnl = 0
		let totalR = 0
		let rCount = 0
		let followedPlanCount = 0
		let trackedPlanCount = 0
		let grossProfit = 0
		let grossLoss = 0

		for (const trade of strategyTrades) {
			const pnl = Number(trade.pnl) || 0
			totalPnl += pnl

			if (trade.outcome === "win") {
				winCount++
				grossProfit += pnl
			} else if (trade.outcome === "loss") {
				lossCount++
				grossLoss += Math.abs(pnl)
			}

			if (trade.realizedRMultiple) {
				totalR += Number(trade.realizedRMultiple)
				rCount++
			}

			if (trade.followedPlan !== null) {
				trackedPlanCount++
				if (trade.followedPlan) {
					followedPlanCount++
				}
			}
		}

		const compliance = trackedPlanCount > 0
			? (followedPlanCount / trackedPlanCount) * 100
			: 0

		return {
			status: "success",
			message: "Strategy retrieved successfully",
			data: {
				...strategy,
				tradeCount: strategyTrades.length,
				winCount,
				lossCount,
				compliance,
				totalPnl,
				winRate: calculateWinRate(winCount, winCount + lossCount),
				profitFactor: calculateProfitFactor(grossProfit, grossLoss),
				avgR: rCount > 0 ? totalR / rCount : 0,
			},
		}
	} catch (error) {
		console.error("Get strategy error:", error)
		return {
			status: "error",
			message: "Failed to retrieve strategy",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get overall compliance overview
 */
export const getComplianceOverview = async (): Promise<ActionResponse<ComplianceOverview>> => {
	try {
		// Get all active strategies
		const allStrategies = await db.query.strategies.findMany({
			where: eq(strategies.isActive, true),
		})

		// Get all non-archived trades with followedPlan data
		const allTrades = await db.query.trades.findMany({
			where: eq(trades.isArchived, false),
		})

		// Calculate overall compliance
		const trackedTrades = allTrades.filter((t) => t.followedPlan !== null)
		const followedPlanCount = trackedTrades.filter((t) => t.followedPlan === true).length
		const notFollowedCount = trackedTrades.filter((t) => t.followedPlan === false).length
		const overallCompliance = trackedTrades.length > 0
			? (followedPlanCount / trackedTrades.length) * 100
			: 0

		// Calculate per-strategy compliance for finding top/needs attention
		const strategyCompliances: Array<{ name: string; compliance: number; tradeCount: number }> = []

		for (const strategy of allStrategies) {
			const strategyTrades = allTrades.filter((t) => t.strategyId === strategy.id)
			const strategyTracked = strategyTrades.filter((t) => t.followedPlan !== null)
			const strategyFollowed = strategyTracked.filter((t) => t.followedPlan === true).length

			if (strategyTracked.length > 0) {
				strategyCompliances.push({
					name: strategy.name,
					compliance: (strategyFollowed / strategyTracked.length) * 100,
					tradeCount: strategyTracked.length,
				})
			}
		}

		// Find top performing (highest compliance with at least 3 trades)
		const qualifiedStrategies = strategyCompliances.filter((s) => s.tradeCount >= 3)
		const sortedByCompliance = [...qualifiedStrategies].sort((a, b) => b.compliance - a.compliance)

		const topPerformingStrategy = sortedByCompliance.length > 0
			? { name: sortedByCompliance[0].name, compliance: sortedByCompliance[0].compliance }
			: null

		// Find needs attention (lowest compliance with at least 3 trades)
		const needsAttentionStrategy = sortedByCompliance.length > 0
			? { name: sortedByCompliance[sortedByCompliance.length - 1].name, compliance: sortedByCompliance[sortedByCompliance.length - 1].compliance }
			: null

		return {
			status: "success",
			message: "Compliance overview retrieved",
			data: {
				overallCompliance,
				totalTrackedTrades: trackedTrades.length,
				followedPlanCount,
				notFollowedCount,
				strategiesCount: allStrategies.length,
				topPerformingStrategy,
				needsAttentionStrategy: needsAttentionStrategy?.compliance !== topPerformingStrategy?.compliance
					? needsAttentionStrategy
					: null,
			},
		}
	} catch (error) {
		console.error("Get compliance overview error:", error)
		return {
			status: "error",
			message: "Failed to retrieve compliance overview",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}
