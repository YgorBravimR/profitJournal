"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db/drizzle"
import { tags, tradeTags, trades } from "@/db/schema"
import type { Tag, NewTag } from "@/db/schema"
import type { ActionResponse, TagStats, TagType, TradeFilters } from "@/types"
import { eq, and, asc, sql, inArray } from "drizzle-orm"
import { z } from "zod"
import { calculateWinRate } from "@/lib/calculations"
import { fromCents } from "@/lib/money"
import { requireAuth } from "@/app/actions/auth"

// Validation schema for creating a tag
const createTagSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(50, "Name must be 50 characters or less"),
	type: z.enum(["setup", "mistake", "general"]),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
		.optional(),
	description: z.string().max(500).optional(),
})

type CreateTagInput = z.infer<typeof createTagSchema>

/**
 * Create a new tag (user-level, shared across all accounts)
 */
export const createTag = async (
	input: CreateTagInput
): Promise<ActionResponse<Tag>> => {
	try {
		const { userId } = await requireAuth()
		const validated = createTagSchema.parse(input)

		const [tag] = await db
			.insert(tags)
			.values({
				userId,
				name: validated.name,
				type: validated.type,
				color: validated.color,
				description: validated.description,
			})
			.returning()

		revalidatePath("/analytics")
		revalidatePath("/journal")
		revalidatePath("/settings")

		return {
			status: "success",
			message: "Tag created successfully",
			data: tag,
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				status: "error",
				message: "Validation failed",
				errors: [{ code: "VALIDATION_ERROR", detail: error.message }],
			}
		}

		// Check for unique constraint violation
		if (error instanceof Error && error.message.includes("unique")) {
			return {
				status: "error",
				message: "A tag with this name already exists",
				errors: [{ code: "DUPLICATE_TAG", detail: "Tag name must be unique" }],
			}
		}

		console.error("Create tag error:", error)
		return {
			status: "error",
			message: "Failed to create tag",
			errors: [{ code: "CREATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Update an existing tag
 */
export const updateTag = async (
	id: string,
	input: Partial<CreateTagInput>
): Promise<ActionResponse<Tag>> => {
	try {
		const { userId } = await requireAuth()

		const existing = await db.query.tags.findFirst({
			where: and(eq(tags.id, id), eq(tags.userId, userId)),
		})

		if (!existing) {
			return {
				status: "error",
				message: "Tag not found",
				errors: [{ code: "NOT_FOUND", detail: "Tag does not exist" }],
			}
		}

		const [tag] = await db
			.update(tags)
			.set({
				...(input.name && { name: input.name }),
				...(input.type && { type: input.type }),
				...(input.color !== undefined && { color: input.color }),
				...(input.description !== undefined && { description: input.description }),
			})
			.where(and(eq(tags.id, id), eq(tags.userId, userId)))
			.returning()

		revalidatePath("/analytics")
		revalidatePath("/journal")
		revalidatePath("/settings")

		return {
			status: "success",
			message: "Tag updated successfully",
			data: tag,
		}
	} catch (error) {
		console.error("Update tag error:", error)
		return {
			status: "error",
			message: "Failed to update tag",
			errors: [{ code: "UPDATE_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get all tags for the current user, optionally filtered by type.
 * Tags are user-level (shared across all accounts).
 */
export const getTags = async (
	type?: TagType
): Promise<ActionResponse<Tag[]>> => {
	try {
		const { userId } = await requireAuth()

		const conditions = type
			? and(eq(tags.userId, userId), eq(tags.type, type))
			: eq(tags.userId, userId)

		const result = await db.query.tags.findMany({
			where: conditions,
			orderBy: [asc(tags.name)],
		})

		return {
			status: "success",
			message: "Tags retrieved successfully",
			data: result,
		}
	} catch (error) {
		console.error("Get tags error:", error)
		return {
			status: "error",
			message: "Failed to retrieve tags",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Get tag statistics (usage and performance).
 * Stats are calculated from trades in the current account (or all accounts).
 */
export const getTagStats = async (
	filters?: TradeFilters
): Promise<ActionResponse<TagStats[]>> => {
	try {
		const authContext = await requireAuth()

		// Tags are user-level — get all tags for this user
		const allTags = await db.query.tags.findMany({
			where: eq(tags.userId, authContext.userId),
			orderBy: [asc(tags.name)],
		})

		if (allTags.length === 0) {
			return {
				status: "success",
				message: "No tags found",
				data: [],
			}
		}

		const tagStats: TagStats[] = []

		for (const tag of allTags) {
			// Get all trades with this tag
			const tradeTagsResult = await db.query.tradeTags.findMany({
				where: eq(tradeTags.tagId, tag.id),
				with: {
					trade: true,
				},
			})

			// Filter by account ownership and other filter criteria
			const filteredTrades = tradeTagsResult
				.map((tt) => tt.trade)
				.filter((trade) => {
					if (trade.isArchived) return false
					if (!trade.accountId) return false
					// Check account ownership based on showAllAccounts mode
					const accountMatch = authContext.showAllAccounts
						? authContext.allAccountIds.includes(trade.accountId)
						: trade.accountId === authContext.accountId
					if (!accountMatch) return false
					if (filters?.dateFrom && trade.entryDate < filters.dateFrom) return false
					if (filters?.dateTo && trade.entryDate > filters.dateTo) return false
					if (filters?.assets && filters.assets.length > 0 && !filters.assets.includes(trade.asset)) return false
					if (filters?.directions && filters.directions.length > 0 && !filters.directions.includes(trade.direction)) return false
					if (filters?.outcomes && filters.outcomes.length > 0 && trade.outcome && !filters.outcomes.includes(trade.outcome)) return false
					if (filters?.timeframeIds && filters.timeframeIds.length > 0 && trade.timeframeId && !filters.timeframeIds.includes(trade.timeframeId)) return false
					return true
				})

			if (filteredTrades.length === 0) {
				tagStats.push({
					tagId: tag.id,
					tagName: tag.name,
					tagType: tag.type,
					tradeCount: 0,
					totalPnl: 0,
					winRate: 0,
					avgR: 0,
				})
				continue
			}

			// Calculate stats
			let totalPnl = 0
			let totalR = 0
			let rCount = 0
			let winCount = 0
			let lossCount = 0

			for (const trade of filteredTrades) {
				totalPnl += fromCents(trade.pnl)

				if (trade.realizedRMultiple) {
					totalR += Number(trade.realizedRMultiple)
					rCount++
				}

				if (trade.outcome === "win") winCount++
				else if (trade.outcome === "loss") lossCount++
			}

			tagStats.push({
				tagId: tag.id,
				tagName: tag.name,
				tagType: tag.type,
				tradeCount: filteredTrades.length,
				totalPnl,
				winRate: calculateWinRate(winCount, winCount + lossCount),
				avgR: rCount > 0 ? totalR / rCount : 0,
			})
		}

		// Sort by trade count descending (using toSorted for immutability)
		const sortedTagStats = tagStats.toSorted((a, b) => b.tradeCount - a.tradeCount)

		return {
			status: "success",
			message: "Tag stats retrieved successfully",
			data: sortedTagStats,
		}
	} catch (error) {
		console.error("Get tag stats error:", error)
		return {
			status: "error",
			message: "Failed to retrieve tag stats",
			errors: [{ code: "FETCH_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Delete a tag
 */
export const deleteTag = async (id: string): Promise<ActionResponse<void>> => {
	try {
		const { userId } = await requireAuth()

		const existing = await db.query.tags.findFirst({
			where: and(eq(tags.id, id), eq(tags.userId, userId)),
		})

		if (!existing) {
			return {
				status: "error",
				message: "Tag not found",
				errors: [{ code: "NOT_FOUND", detail: "Tag does not exist" }],
			}
		}

		// Delete will cascade to trade_tags due to onDelete: "cascade"
		await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)))

		revalidatePath("/analytics")
		revalidatePath("/journal")
		revalidatePath("/settings")

		return {
			status: "success",
			message: "Tag deleted successfully",
		}
	} catch (error) {
		console.error("Delete tag error:", error)
		return {
			status: "error",
			message: "Failed to delete tag",
			errors: [{ code: "DELETE_FAILED", detail: String(error) }],
		}
	}
}
