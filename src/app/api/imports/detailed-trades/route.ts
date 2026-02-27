/**
 * POST /api/imports/detailed-trades
 * Upload broker statement CSV and get import preview
 * Returns: ImportPreview with detected trades and warnings
 * Validates 30-minute cooldown between imports
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import {
	parseStatementCSV,
	validateStatementCSV,
	groupExecutionsIntoTrades,
	createImportPreview,
	type BrokerName,
} from "@/lib/csv-parsers"

// TODO: Add importLogs table to schema and enable rate limiting persistence
// For now, using in-memory rate limiting for MVP

// In-memory rate limiting (stores last import time per account)
const importRateLimitMap = new Map<string, Date>()

// Cache for import previews (1 hour TTL)
const previewCache = new Map<
	string,
	{ preview: any; timestamp: number; accountId: string }
>()

const CACHE_TTL = 3600000 // 1 hour
const RATE_LIMIT_MINUTES = 30

/**
 * Generate unique import ID for caching
 */
const generateImportId = (): string => {
	return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if user exceeded 30-minute cooldown (in-memory for MVP)
 * TODO: Use database table (importLogs) for persistent rate limiting
 */
const checkImportCooldown = (accountId: string): Date | null => {
	const lastImport = importRateLimitMap.get(accountId)
	if (!lastImport) return null

	const now = new Date()
	const cooldownEndTime = new Date(lastImport.getTime() + RATE_LIMIT_MINUTES * 60 * 1000)

	if (now < cooldownEndTime) {
		return lastImport
	}

	return null
}

export const POST = async (req: NextRequest) => {
	try {
		// Authenticate using NextAuth
		const session = await auth()
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}
		const userId = session.user.id

		// Parse request
		const body = await req.json()
		const {
			accountId,
			brokerName,
			csvContent,
		}: { accountId: string; brokerName: BrokerName; csvContent: string } = body

		// Validate inputs
		if (!accountId || !brokerName || !csvContent) {
			return NextResponse.json(
				{
					error: "Missing required fields: accountId, brokerName, csvContent",
				},
				{ status: 400 }
			)
		}

		if (!["CLEAR", "XP", "GENIAL"].includes(brokerName)) {
			return NextResponse.json(
				{ error: `Invalid broker: ${brokerName}` },
				{ status: 400 }
			)
		}

		// Check rate limit (30-minute cooldown)
		const lastImportDate = checkImportCooldown(accountId)
		if (lastImportDate) {
			const nextAvailableTime = new Date(
				lastImportDate.getTime() + RATE_LIMIT_MINUTES * 60 * 1000
			)
			return NextResponse.json(
				{
					error: "RATE_LIMITED",
					message: `Import in cooldown. Next available: ${nextAvailableTime.toISOString()}`,
					retryAfter: Math.ceil(
						(nextAvailableTime.getTime() - Date.now()) / 1000
					),
				},
				{ status: 429 }
			)
		}

		// Validate CSV format
		const validation = validateStatementCSV(brokerName, csvContent)
		if (!validation.valid) {
			return NextResponse.json(
				{ error: "Invalid CSV format", details: validation.error },
				{ status: 400 }
			)
		}

		// Parse CSV into executions
		const executions = parseStatementCSV({
			brokerName,
			csvContent,
		})

		// Group executions into trades
		const trades = groupExecutionsIntoTrades(executions)

		// Create import preview
		const importId = generateImportId()
		const preview = createImportPreview(trades, brokerName, executions.length, importId)

		// Record this import in rate limiter
		importRateLimitMap.set(accountId, new Date())

		// Cache preview for confirmation step (1 hour TTL)
		previewCache.set(importId, {
			preview,
			timestamp: Date.now(),
			accountId,
		})

		return NextResponse.json({
			success: true,
			preview,
		})
	} catch (error) {
		console.error("[POST /api/imports/detailed-trades]", error)

		let message = "Failed to parse CSV"
		if (error instanceof Error) {
			message = error.message
		}

		return NextResponse.json(
			{ error: "PARSE_ERROR", message },
			{ status: 400 }
		)
	}
}

/**
 * Clean up expired cache entries periodically
 */
export const cleanupExpiredCache = () => {
	const now = Date.now()
	for (const [key, data] of previewCache.entries()) {
		if (now - data.timestamp > CACHE_TTL) {
			previewCache.delete(key)
		}
	}
}

// Export cache for confirmation endpoint
export { previewCache }
