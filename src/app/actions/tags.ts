"use server"

import type { ActionResponse, TagStats, TagType } from "@/types"
import type { Tag } from "@/db/schema"

/**
 * Create a new tag
 * Implementation in Phase 4
 */
export const createTag = async (
	_input: Partial<Tag>
): Promise<ActionResponse<Tag>> => {
	return {
		status: "error",
		message: "Not implemented - coming in Phase 4",
		errors: [{ code: "NOT_IMPLEMENTED", detail: "Tag creation coming soon" }],
	}
}

/**
 * Get all tags, optionally filtered by type
 * Implementation in Phase 4
 */
export const getTags = async (
	_type?: TagType
): Promise<ActionResponse<Tag[]>> => {
	return {
		status: "success",
		message: "No tags found",
		data: [],
	}
}

/**
 * Get tag statistics (usage and performance)
 * Implementation in Phase 4
 */
export const getTagStats = async (): Promise<ActionResponse<TagStats[]>> => {
	return {
		status: "success",
		message: "No tag stats available",
		data: [],
	}
}

/**
 * Delete a tag
 * Implementation in Phase 4
 */
export const deleteTag = async (_id: string): Promise<ActionResponse<void>> => {
	return {
		status: "error",
		message: "Not implemented - coming in Phase 4",
		errors: [{ code: "NOT_IMPLEMENTED", detail: "Tag deletion coming soon" }],
	}
}
