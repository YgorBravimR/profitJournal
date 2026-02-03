"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db/drizzle"
import {
	dailyChecklists,
	checklistCompletions,
	dailyTargets,
	dailyAccountNotes,
	dailyAssetSettings,
	trades,
	assets,
} from "@/db/schema"
import type {
	DailyChecklist,
	ChecklistCompletion,
	DailyTarget,
	DailyAccountNote,
	DailyAssetSetting,
	Asset,
} from "@/db/schema"
import type { ActionResponse } from "@/types"
import { eq, and, desc, gte, lte, inArray } from "drizzle-orm"
import { z } from "zod"
import {
	createChecklistSchema,
	updateChecklistSchema,
	updateCompletionSchema,
	dailyTargetsSchema,
	dailyNotesSchema,
	assetSettingsSchema,
	type CreateChecklistInput,
	type UpdateChecklistInput,
	type DailyTargetsInput,
	type DailyNotesInput,
	type AssetSettingsInput,
	type ChecklistItem,
	type CircuitBreakerStatus,
	type BiasType,
} from "@/lib/validations/command-center"
import { fromCents, toCents } from "@/lib/money"
import { requireAuth } from "@/app/actions/auth"

// ==========================================
// CHECKLIST ACTIONS
// ==========================================

/**
 * Get all checklists for the current account
 */
export const getChecklists = async (): Promise<ActionResponse<DailyChecklist[]>> => {
	try {
		const { userId, accountId } = await requireAuth()

		const checklists = await db.query.dailyChecklists.findMany({
			where: and(
				eq(dailyChecklists.userId, userId),
				eq(dailyChecklists.accountId, accountId),
				eq(dailyChecklists.isActive, true)
			),
			orderBy: [desc(dailyChecklists.createdAt)],
		})

		return {
			status: "success",
			message: "Checklists retrieved successfully",
			data: checklists,
		}
	} catch (error) {
		console.error("Get checklists error:", error)
		return {
			status: "error",
			message: "Failed to retrieve checklists",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Create a new checklist
 */
export const createChecklist = async (
	input: CreateChecklistInput
): Promise<ActionResponse<DailyChecklist>> => {
	try {
		const { userId, accountId } = await requireAuth()
		const validated = createChecklistSchema.parse(input)

		const [checklist] = await db
			.insert(dailyChecklists)
			.values({
				userId,
				accountId,
				name: validated.name,
				items: JSON.stringify(validated.items),
				isActive: validated.isActive ?? true,
			})
			.returning()

		revalidatePath("/command-center")

		return {
			status: "success",
			message: "Checklist created successfully",
			data: checklist,
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

		console.error("Create checklist error:", error)
		return {
			status: "error",
			message: "Failed to create checklist",
			errors: [{ code: "CREATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Update an existing checklist
 */
export const updateChecklist = async (
	id: string,
	input: UpdateChecklistInput
): Promise<ActionResponse<DailyChecklist>> => {
	try {
		const { userId, accountId } = await requireAuth()

		const existing = await db.query.dailyChecklists.findFirst({
			where: and(
				eq(dailyChecklists.id, id),
				eq(dailyChecklists.userId, userId),
				eq(dailyChecklists.accountId, accountId)
			),
		})

		if (!existing) {
			return {
				status: "error",
				message: "Checklist not found",
				errors: [{ code: "NOT_FOUND", detail: "Checklist does not exist" }],
			}
		}

		const validated = updateChecklistSchema.parse(input)

		const [checklist] = await db
			.update(dailyChecklists)
			.set({
				...(validated.name !== undefined && { name: validated.name }),
				...(validated.items !== undefined && { items: JSON.stringify(validated.items) }),
				...(validated.isActive !== undefined && { isActive: validated.isActive }),
				updatedAt: new Date(),
			})
			.where(eq(dailyChecklists.id, id))
			.returning()

		revalidatePath("/command-center")

		return {
			status: "success",
			message: "Checklist updated successfully",
			data: checklist,
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

		console.error("Update checklist error:", error)
		return {
			status: "error",
			message: "Failed to update checklist",
			errors: [{ code: "UPDATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Delete a checklist (soft delete)
 */
export const deleteChecklist = async (id: string): Promise<ActionResponse<void>> => {
	try {
		const { userId, accountId } = await requireAuth()

		const existing = await db.query.dailyChecklists.findFirst({
			where: and(
				eq(dailyChecklists.id, id),
				eq(dailyChecklists.userId, userId),
				eq(dailyChecklists.accountId, accountId)
			),
		})

		if (!existing) {
			return {
				status: "error",
				message: "Checklist not found",
				errors: [{ code: "NOT_FOUND", detail: "Checklist does not exist" }],
			}
		}

		await db
			.update(dailyChecklists)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(dailyChecklists.id, id))

		revalidatePath("/command-center")

		return {
			status: "success",
			message: "Checklist deleted successfully",
		}
	} catch (error) {
		console.error("Delete checklist error:", error)
		return {
			status: "error",
			message: "Failed to delete checklist",
			errors: [{ code: "DELETE_FAILED", detail: String(error) }],
		}
	}
}

// ==========================================
// COMPLETION ACTIONS
// ==========================================

export interface ChecklistWithCompletion extends DailyChecklist {
	parsedItems: ChecklistItem[]
	completion: ChecklistCompletion | null
	completedItemIds: string[]
}

/**
 * Get today's checklist completions
 */
export const getTodayCompletions = async (): Promise<ActionResponse<ChecklistWithCompletion[]>> => {
	try {
		const { userId, accountId } = await requireAuth()

		// Get start and end of today
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// Get all active checklists
		const checklists = await db.query.dailyChecklists.findMany({
			where: and(
				eq(dailyChecklists.userId, userId),
				eq(dailyChecklists.accountId, accountId),
				eq(dailyChecklists.isActive, true)
			),
			orderBy: [desc(dailyChecklists.createdAt)],
		})

		// Get today's completions for these checklists
		const checklistIds = checklists.map((c) => c.id)
		const completions = checklistIds.length > 0
			? await db.query.checklistCompletions.findMany({
					where: and(
						inArray(checklistCompletions.checklistId, checklistIds),
						gte(checklistCompletions.date, today),
						lte(checklistCompletions.date, tomorrow)
					),
				})
			: []

		// Map completions to checklists
		const checklistsWithCompletions: ChecklistWithCompletion[] = checklists.map((checklist) => {
			const completion = completions.find((c) => c.checklistId === checklist.id) || null
			const completedItemIds: string[] = completion
				? JSON.parse(completion.completedItems)
				: []

			return {
				...checklist,
				parsedItems: JSON.parse(checklist.items) as ChecklistItem[],
				completion,
				completedItemIds,
			}
		})

		return {
			status: "success",
			message: "Completions retrieved successfully",
			data: checklistsWithCompletions,
		}
	} catch (error) {
		console.error("Get today completions error:", error)
		return {
			status: "error",
			message: "Failed to retrieve completions",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Toggle a checklist item completion
 */
export const toggleChecklistItem = async (
	checklistId: string,
	itemId: string,
	completed: boolean
): Promise<ActionResponse<ChecklistCompletion>> => {
	try {
		const { userId } = await requireAuth()

		// Validate input
		const validated = updateCompletionSchema.parse({ checklistId, itemId, completed })

		// Get start and end of today
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// Check if completion record exists for today
		const existing = await db.query.checklistCompletions.findFirst({
			where: and(
				eq(checklistCompletions.checklistId, validated.checklistId),
				gte(checklistCompletions.date, today),
				lte(checklistCompletions.date, tomorrow)
			),
		})

		if (existing) {
			// Update existing completion
			const currentItems: string[] = JSON.parse(existing.completedItems)
			let newItems: string[]

			if (validated.completed) {
				// Add item if not already present
				newItems = currentItems.includes(validated.itemId)
					? currentItems
					: [...currentItems, validated.itemId]
			} else {
				// Remove item
				newItems = currentItems.filter((id) => id !== validated.itemId)
			}

			// Get the checklist to check if all items are completed
			const checklist = await db.query.dailyChecklists.findFirst({
				where: eq(dailyChecklists.id, validated.checklistId),
			})
			const allItems: ChecklistItem[] = checklist ? JSON.parse(checklist.items) : []
			const allCompleted = allItems.every((item) => newItems.includes(item.id))

			const [completion] = await db
				.update(checklistCompletions)
				.set({
					completedItems: JSON.stringify(newItems),
					completedAt: allCompleted ? new Date() : null,
					updatedAt: new Date(),
				})
				.where(eq(checklistCompletions.id, existing.id))
				.returning()

			revalidatePath("/command-center")

			return {
				status: "success",
				message: "Item updated successfully",
				data: completion,
			}
		} else {
			// Create new completion record
			const newItems = validated.completed ? [validated.itemId] : []

			const [completion] = await db
				.insert(checklistCompletions)
				.values({
					checklistId: validated.checklistId,
					userId,
					date: today,
					completedItems: JSON.stringify(newItems),
					completedAt: null,
				})
				.returning()

			revalidatePath("/command-center")

			return {
				status: "success",
				message: "Completion created successfully",
				data: completion,
			}
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

		console.error("Toggle checklist item error:", error)
		return {
			status: "error",
			message: "Failed to toggle item",
			errors: [{ code: "UPDATE_FAILED", detail: String(error) }],
		}
	}
}

// ==========================================
// DAILY TARGETS ACTIONS
// ==========================================

/**
 * Get daily targets for the current account
 */
export const getDailyTargets = async (): Promise<ActionResponse<DailyTarget | null>> => {
	try {
		const { userId, accountId } = await requireAuth()

		const targets = await db.query.dailyTargets.findFirst({
			where: and(
				eq(dailyTargets.userId, userId),
				eq(dailyTargets.accountId, accountId),
				eq(dailyTargets.isActive, true)
			),
		})

		return {
			status: "success",
			message: targets ? "Targets retrieved successfully" : "No targets found",
			data: targets || null,
		}
	} catch (error) {
		console.error("Get daily targets error:", error)
		return {
			status: "error",
			message: "Failed to retrieve targets",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Upsert daily targets
 */
export const upsertDailyTargets = async (
	input: DailyTargetsInput
): Promise<ActionResponse<DailyTarget>> => {
	try {
		const { userId, accountId } = await requireAuth()
		const validated = dailyTargetsSchema.parse(input)

		// Check if targets exist for this account
		const existing = await db.query.dailyTargets.findFirst({
			where: and(
				eq(dailyTargets.userId, userId),
				eq(dailyTargets.accountId, accountId)
			),
		})

		if (existing) {
			// Update existing
			const [targets] = await db
				.update(dailyTargets)
				.set({
					profitTarget: validated.profitTarget ? toCents(validated.profitTarget) : null,
					lossLimit: validated.lossLimit ? toCents(validated.lossLimit) : null,
					maxTrades: validated.maxTrades || null,
					maxConsecutiveLosses: validated.maxConsecutiveLosses || null,
					isActive: validated.isActive ?? true,
					updatedAt: new Date(),
				})
				.where(eq(dailyTargets.id, existing.id))
				.returning()

			revalidatePath("/command-center")

			return {
				status: "success",
				message: "Targets updated successfully",
				data: targets,
			}
		} else {
			// Create new
			const [targets] = await db
				.insert(dailyTargets)
				.values({
					userId,
					accountId,
					profitTarget: validated.profitTarget ? toCents(validated.profitTarget) : null,
					lossLimit: validated.lossLimit ? toCents(validated.lossLimit) : null,
					maxTrades: validated.maxTrades || null,
					maxConsecutiveLosses: validated.maxConsecutiveLosses || null,
					isActive: validated.isActive ?? true,
				})
				.returning()

			revalidatePath("/command-center")

			return {
				status: "success",
				message: "Targets created successfully",
				data: targets,
			}
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

		console.error("Upsert daily targets error:", error)
		return {
			status: "error",
			message: "Failed to save targets",
			errors: [{ code: "SAVE_FAILED", detail: String(error) }],
		}
	}
}

// ==========================================
// DAILY NOTES ACTIONS
// ==========================================

/**
 * Get today's notes
 */
export const getTodayNotes = async (): Promise<ActionResponse<DailyAccountNote | null>> => {
	try {
		const { userId, accountId } = await requireAuth()

		// Get start and end of today
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		const notes = await db.query.dailyAccountNotes.findFirst({
			where: and(
				eq(dailyAccountNotes.userId, userId),
				eq(dailyAccountNotes.accountId, accountId),
				gte(dailyAccountNotes.date, today),
				lte(dailyAccountNotes.date, tomorrow)
			),
		})

		return {
			status: "success",
			message: notes ? "Notes retrieved successfully" : "No notes found",
			data: notes || null,
		}
	} catch (error) {
		console.error("Get today notes error:", error)
		return {
			status: "error",
			message: "Failed to retrieve notes",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Upsert daily notes
 */
export const upsertDailyNotes = async (
	input: DailyNotesInput
): Promise<ActionResponse<DailyAccountNote>> => {
	try {
		const { userId, accountId } = await requireAuth()
		const validated = dailyNotesSchema.parse(input)

		// Parse date
		const noteDate = new Date(validated.date)
		noteDate.setHours(0, 0, 0, 0)
		const nextDay = new Date(noteDate)
		nextDay.setDate(nextDay.getDate() + 1)

		// Check if notes exist for this date
		const existing = await db.query.dailyAccountNotes.findFirst({
			where: and(
				eq(dailyAccountNotes.userId, userId),
				eq(dailyAccountNotes.accountId, accountId),
				gte(dailyAccountNotes.date, noteDate),
				lte(dailyAccountNotes.date, nextDay)
			),
		})

		if (existing) {
			// Update existing
			const [notes] = await db
				.update(dailyAccountNotes)
				.set({
					preMarketNotes: validated.preMarketNotes || null,
					postMarketNotes: validated.postMarketNotes || null,
					mood: validated.mood || null,
					updatedAt: new Date(),
				})
				.where(eq(dailyAccountNotes.id, existing.id))
				.returning()

			revalidatePath("/command-center")

			return {
				status: "success",
				message: "Notes updated successfully",
				data: notes,
			}
		} else {
			// Create new
			const [notes] = await db
				.insert(dailyAccountNotes)
				.values({
					userId,
					accountId,
					date: noteDate,
					preMarketNotes: validated.preMarketNotes || null,
					postMarketNotes: validated.postMarketNotes || null,
					mood: validated.mood || null,
				})
				.returning()

			revalidatePath("/command-center")

			return {
				status: "success",
				message: "Notes created successfully",
				data: notes,
			}
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

		console.error("Upsert daily notes error:", error)
		return {
			status: "error",
			message: "Failed to save notes",
			errors: [{ code: "SAVE_FAILED", detail: String(error) }],
		}
	}
}

// ==========================================
// ASSET SETTINGS ACTIONS (Per-Day with Copy-from-Previous)
// ==========================================

export interface AssetSettingWithAsset extends DailyAssetSetting {
	asset: Asset
}

/**
 * Get today's asset settings for the current account.
 * If no settings exist for today, copies from the most recent previous day.
 */
export const getTodayAssetSettings = async (): Promise<ActionResponse<AssetSettingWithAsset[]>> => {
	try {
		const { userId, accountId } = await requireAuth()

		// Get start and end of today
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// Get today's active settings
		let settings = await db.query.dailyAssetSettings.findMany({
			where: and(
				eq(dailyAssetSettings.userId, userId),
				eq(dailyAssetSettings.accountId, accountId),
				eq(dailyAssetSettings.isActive, true),
				gte(dailyAssetSettings.date, today),
				lte(dailyAssetSettings.date, tomorrow)
			),
			with: {
				asset: true,
			},
		})

		// If no settings for today, copy from previous day
		if (settings.length === 0) {
			// Find the most recent day with settings
			const previousSettings = await db.query.dailyAssetSettings.findMany({
				where: and(
					eq(dailyAssetSettings.userId, userId),
					eq(dailyAssetSettings.accountId, accountId),
					eq(dailyAssetSettings.isActive, true),
					lte(dailyAssetSettings.date, today)
				),
				orderBy: [desc(dailyAssetSettings.date)],
				with: {
					asset: true,
				},
			})

			if (previousSettings.length > 0) {
				// Get the most recent date
				const mostRecentDate = previousSettings[0].date
				const mostRecentSettings = previousSettings.filter(
					(s) => s.date.toDateString() === mostRecentDate.toDateString()
				)

				// Copy each setting to today
				const newSettings = await Promise.all(
					mostRecentSettings.map(async (setting) => {
						const [newSetting] = await db
							.insert(dailyAssetSettings)
							.values({
								userId,
								accountId,
								assetId: setting.assetId,
								date: today,
								bias: setting.bias,
								maxDailyTrades: setting.maxDailyTrades,
								maxPositionSize: setting.maxPositionSize,
								notes: setting.notes,
								isActive: true,
							})
							.returning()
						return newSetting
					})
				)

				// Fetch with asset relation
				settings = await db.query.dailyAssetSettings.findMany({
					where: and(
						eq(dailyAssetSettings.userId, userId),
						eq(dailyAssetSettings.accountId, accountId),
						eq(dailyAssetSettings.isActive, true),
						gte(dailyAssetSettings.date, today),
						lte(dailyAssetSettings.date, tomorrow)
					),
					with: {
						asset: true,
					},
				})
			}
		}

		return {
			status: "success",
			message: "Asset settings retrieved successfully",
			data: settings as AssetSettingWithAsset[],
		}
	} catch (error) {
		console.error("Get today asset settings error:", error)
		return {
			status: "error",
			message: "Failed to retrieve asset settings",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use getTodayAssetSettings instead
 */
export const getAssetSettings = getTodayAssetSettings

/**
 * Upsert asset settings for today
 */
export const upsertAssetSettings = async (
	input: AssetSettingsInput
): Promise<ActionResponse<DailyAssetSetting>> => {
	try {
		const { userId, accountId } = await requireAuth()
		const validated = assetSettingsSchema.parse(input)

		// Get start and end of today
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// Check if settings exist for this asset TODAY
		const existing = await db.query.dailyAssetSettings.findFirst({
			where: and(
				eq(dailyAssetSettings.userId, userId),
				eq(dailyAssetSettings.accountId, accountId),
				eq(dailyAssetSettings.assetId, validated.assetId),
				gte(dailyAssetSettings.date, today),
				lte(dailyAssetSettings.date, tomorrow)
			),
		})

		if (existing) {
			// Update existing for today
			const [settings] = await db
				.update(dailyAssetSettings)
				.set({
					bias: validated.bias || null,
					maxDailyTrades: validated.maxDailyTrades || null,
					maxPositionSize: validated.maxPositionSize || null,
					notes: validated.notes || null,
					isActive: validated.isActive ?? true,
					updatedAt: new Date(),
				})
				.where(eq(dailyAssetSettings.id, existing.id))
				.returning()

			revalidatePath("/command-center")

			return {
				status: "success",
				message: "Asset settings updated successfully",
				data: settings,
			}
		} else {
			// Create new for today
			const [settings] = await db
				.insert(dailyAssetSettings)
				.values({
					userId,
					accountId,
					assetId: validated.assetId,
					date: today,
					bias: validated.bias || null,
					maxDailyTrades: validated.maxDailyTrades || null,
					maxPositionSize: validated.maxPositionSize || null,
					notes: validated.notes || null,
					isActive: validated.isActive ?? true,
				})
				.returning()

			revalidatePath("/command-center")

			return {
				status: "success",
				message: "Asset settings created successfully",
				data: settings,
			}
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

		console.error("Upsert asset settings error:", error)
		return {
			status: "error",
			message: "Failed to save asset settings",
			errors: [{ code: "SAVE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Delete asset settings for today (soft delete)
 */
export const deleteAssetSettings = async (assetId: string): Promise<ActionResponse<void>> => {
	try {
		const { userId, accountId } = await requireAuth()

		// Get start and end of today
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// Find today's setting for this asset
		const existing = await db.query.dailyAssetSettings.findFirst({
			where: and(
				eq(dailyAssetSettings.userId, userId),
				eq(dailyAssetSettings.accountId, accountId),
				eq(dailyAssetSettings.assetId, assetId),
				gte(dailyAssetSettings.date, today),
				lte(dailyAssetSettings.date, tomorrow)
			),
		})

		if (!existing) {
			return {
				status: "error",
				message: "Asset settings not found for today",
				errors: [{ code: "NOT_FOUND", detail: "Asset settings do not exist for today" }],
			}
		}

		await db
			.update(dailyAssetSettings)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(dailyAssetSettings.id, existing.id))

		revalidatePath("/command-center")

		return {
			status: "success",
			message: "Asset settings deleted successfully",
		}
	} catch (error) {
		console.error("Delete asset settings error:", error)
		return {
			status: "error",
			message: "Failed to delete asset settings",
			errors: [{ code: "DELETE_FAILED", detail: String(error) }],
		}
	}
}

// ==========================================
// CIRCUIT BREAKER STATUS
// ==========================================

export interface DailySummary {
	totalPnL: number
	tradesCount: number
	winCount: number
	lossCount: number
	winRate: number
	bestTrade: number
	worstTrade: number
	consecutiveLosses: number
}

/**
 * Get circuit breaker status for today
 */
export const getCircuitBreakerStatus = async (): Promise<ActionResponse<CircuitBreakerStatus>> => {
	try {
		const { userId, accountId } = await requireAuth()

		// Get start and end of today
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// Get today's trades
		const todaysTrades = await db.query.trades.findMany({
			where: and(
				eq(trades.accountId, accountId),
				gte(trades.entryDate, today),
				lte(trades.entryDate, tomorrow),
				eq(trades.isArchived, false)
			),
			orderBy: [desc(trades.entryDate)],
		})

		// Get daily targets
		const targets = await db.query.dailyTargets.findFirst({
			where: and(
				eq(dailyTargets.userId, userId),
				eq(dailyTargets.accountId, accountId),
				eq(dailyTargets.isActive, true)
			),
		})

		// Calculate metrics
		let dailyPnL = 0
		let consecutiveLosses = 0
		let maxConsecutiveLosses = 0

		// Sort trades by entry date to calculate consecutive losses properly (using toSorted for immutability)
		const sortedTrades = todaysTrades.toSorted(
			(a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
		)

		for (const trade of sortedTrades) {
			dailyPnL += fromCents(trade.pnl)

			if (trade.outcome === "loss") {
				consecutiveLosses++
				maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses)
			} else if (trade.outcome === "win") {
				consecutiveLosses = 0
			}
		}

		// Current consecutive losses (from the most recent trades)
		let currentConsecutiveLosses = 0
		for (let i = sortedTrades.length - 1; i >= 0; i--) {
			if (sortedTrades[i].outcome === "loss") {
				currentConsecutiveLosses++
			} else {
				break
			}
		}

		// Calculate circuit breaker triggers
		const profitTargetHit = targets?.profitTarget
			? dailyPnL >= fromCents(targets.profitTarget)
			: false
		const lossLimitHit = targets?.lossLimit
			? dailyPnL <= -fromCents(targets.lossLimit)
			: false
		const maxTradesHit = targets?.maxTrades
			? todaysTrades.length >= targets.maxTrades
			: false
		const maxConsecutiveLossesHit = targets?.maxConsecutiveLosses
			? currentConsecutiveLosses >= targets.maxConsecutiveLosses
			: false

		const shouldStopTrading = profitTargetHit || lossLimitHit || maxTradesHit || maxConsecutiveLossesHit

		// Build alerts
		const alerts: string[] = []
		if (profitTargetHit) alerts.push("profitTargetHit")
		if (lossLimitHit) alerts.push("lossLimitHit")
		if (maxTradesHit) alerts.push("maxTradesHit")
		if (maxConsecutiveLossesHit) alerts.push("maxConsecutiveLossesHit")

		return {
			status: "success",
			message: "Circuit breaker status retrieved",
			data: {
				dailyPnL,
				tradesCount: todaysTrades.length,
				consecutiveLosses: currentConsecutiveLosses,
				profitTargetHit,
				lossLimitHit,
				maxTradesHit,
				maxConsecutiveLossesHit,
				shouldStopTrading,
				alerts,
			},
		}
	} catch (error) {
		console.error("Get circuit breaker status error:", error)
		return {
			status: "error",
			message: "Failed to get circuit breaker status",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get daily summary
 */
export const getDailySummary = async (): Promise<ActionResponse<DailySummary>> => {
	try {
		const { accountId } = await requireAuth()

		// Get start and end of today
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// Get today's trades
		const todaysTrades = await db.query.trades.findMany({
			where: and(
				eq(trades.accountId, accountId),
				gte(trades.entryDate, today),
				lte(trades.entryDate, tomorrow),
				eq(trades.isArchived, false)
			),
			orderBy: [desc(trades.entryDate)],
		})

		// Calculate metrics
		let totalPnL = 0
		let winCount = 0
		let lossCount = 0
		let bestTrade = 0
		let worstTrade = 0
		let consecutiveLosses = 0
		let maxConsecutiveLosses = 0

		const sortedTrades = todaysTrades.toSorted(
			(a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
		)

		for (const trade of sortedTrades) {
			const pnl = fromCents(trade.pnl)
			totalPnL += pnl

			if (pnl > bestTrade) bestTrade = pnl
			if (pnl < worstTrade) worstTrade = pnl

			if (trade.outcome === "win") {
				winCount++
				consecutiveLosses = 0
			} else if (trade.outcome === "loss") {
				lossCount++
				consecutiveLosses++
				maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses)
			}
		}

		const winRate = winCount + lossCount > 0
			? (winCount / (winCount + lossCount)) * 100
			: 0

		return {
			status: "success",
			message: "Daily summary retrieved",
			data: {
				totalPnL,
				tradesCount: todaysTrades.length,
				winCount,
				lossCount,
				winRate,
				bestTrade,
				worstTrade,
				consecutiveLosses: maxConsecutiveLosses,
			},
		}
	} catch (error) {
		console.error("Get daily summary error:", error)
		return {
			status: "error",
			message: "Failed to get daily summary",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}
