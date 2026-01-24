"use server"

import type { ActionResponse } from "@/types"
import type { Strategy } from "@/db/schema"

export interface StrategyWithStats extends Strategy {
	tradeCount: number
	compliance: number
	totalPnl: number
}

/**
 * Create a new strategy
 * Implementation in Phase 5
 */
export const createStrategy = async (
	_input: Partial<Strategy>
): Promise<ActionResponse<Strategy>> => {
	return {
		status: "error",
		message: "Not implemented - coming in Phase 5",
		errors: [
			{ code: "NOT_IMPLEMENTED", detail: "Strategy creation coming soon" },
		],
	}
}

/**
 * Update an existing strategy
 * Implementation in Phase 5
 */
export const updateStrategy = async (
	_id: string,
	_input: Partial<Strategy>
): Promise<ActionResponse<Strategy>> => {
	return {
		status: "error",
		message: "Not implemented - coming in Phase 5",
		errors: [{ code: "NOT_IMPLEMENTED", detail: "Strategy update coming soon" }],
	}
}

/**
 * Delete a strategy
 * Implementation in Phase 5
 */
export const deleteStrategy = async (
	_id: string
): Promise<ActionResponse<void>> => {
	return {
		status: "error",
		message: "Not implemented - coming in Phase 5",
		errors: [
			{ code: "NOT_IMPLEMENTED", detail: "Strategy deletion coming soon" },
		],
	}
}

/**
 * Get all strategies with stats
 * Implementation in Phase 5
 */
export const getStrategies = async (): Promise<
	ActionResponse<StrategyWithStats[]>
> => {
	return {
		status: "success",
		message: "No strategies found",
		data: [],
	}
}

/**
 * Get a single strategy by ID
 * Implementation in Phase 5
 */
export const getStrategy = async (
	_id: string
): Promise<ActionResponse<StrategyWithStats>> => {
	return {
		status: "error",
		message: "Not implemented - coming in Phase 5",
		errors: [{ code: "NOT_IMPLEMENTED", detail: "Strategy fetch coming soon" }],
	}
}
