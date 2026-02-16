"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db/drizzle"
import { trades, tradeExecutions, assets } from "@/db/schema"
import type { Trade, TradeExecution } from "@/db/schema"
import type { ActionResponse } from "@/types"
import { eq, asc } from "drizzle-orm"
import { calculateAssetPnL, calculateRMultiple, determineOutcome } from "@/lib/calculations"
import { fromCents, toCents } from "@/lib/money"
import { requireAuth } from "@/app/actions/auth"
import { getBreakevenTicks } from "@/app/actions/accounts"
import { z } from "zod"

// ==========================================
// Validation Schema
// ==========================================

const ocrExecutionSchema = z.object({
	executionType: z.enum(["entry", "exit"]),
	executionDate: z.coerce.date(),
	price: z.coerce.number().positive(),
	quantity: z.coerce.number().positive(),
})

const ocrImportSchema = z.object({
	asset: z.string().min(1).max(20),
	originalContractCode: z.string().optional(),
	direction: z.enum(["long", "short"]),
	entryDate: z.coerce.date(),
	exitDate: z.coerce.date().optional(),
	executions: z.array(ocrExecutionSchema).min(1, "At least one execution is required"),
	strategyId: z.string().uuid().optional(),
	timeframeId: z.string().uuid().optional(),
	preTradeThoughts: z.string().max(2000).optional(),
})

export type OcrImportInput = z.input<typeof ocrImportSchema>

// ==========================================
// Helper Functions
// ==========================================

/**
 * Calculate execution value (price * quantity) in cents
 */
const calculateExecutionValue = (price: number, quantity: number): number => {
	return toCents(price * quantity)
}

/**
 * Calculate weighted average price from executions
 */
const calculateAvgPrice = (
	executions: Array<{ price: number; quantity: number }>,
	type: "entry" | "exit",
	allExecutions: Array<{ executionType: string; price: number; quantity: number }>
): number => {
	const filtered = allExecutions.filter((e) => e.executionType === type)
	if (filtered.length === 0) return 0

	let totalValue = 0
	let totalQty = 0
	for (const ex of filtered) {
		totalValue += ex.price * ex.quantity
		totalQty += ex.quantity
	}

	return totalQty > 0 ? totalValue / totalQty : 0
}

/**
 * Find asset by symbol (normalized or original)
 */
const findAsset = async (symbol: string, originalCode?: string) => {
	// Try exact match first
	let asset = await db.query.assets.findFirst({
		where: eq(assets.symbol, symbol.toUpperCase()),
	})

	// If not found and we have original code, try that
	if (!asset && originalCode && originalCode !== symbol) {
		asset = await db.query.assets.findFirst({
			where: eq(assets.symbol, originalCode.toUpperCase()),
		})
	}

	return asset
}

// ==========================================
// Main Import Action
// ==========================================

export interface OcrImportResult {
	trade: Trade
	executions: TradeExecution[]
	assetFound: boolean
}

/**
 * Create a trade from OCR-extracted data with multiple executions
 */
export const createTradeFromOcr = async (
	input: OcrImportInput
): Promise<ActionResponse<OcrImportResult>> => {
	try {
		const { accountId } = await requireAuth()
		const validated = ocrImportSchema.parse(input)

		// Look up asset configuration
		const assetConfig = await findAsset(validated.asset, validated.originalContractCode)

		// Calculate aggregates from executions
		const entries = validated.executions.filter((e) => e.executionType === "entry")
		const exits = validated.executions.filter((e) => e.executionType === "exit")

		const totalEntryQuantity = entries.reduce((sum, e) => sum + e.quantity, 0)
		const totalExitQuantity = exits.reduce((sum, e) => sum + e.quantity, 0)

		const avgEntryPrice = calculateAvgPrice(entries, "entry", validated.executions)
		const avgExitPrice = exits.length > 0
			? calculateAvgPrice(exits, "exit", validated.executions)
			: null

		// Sort executions by date to get first entry and last exit dates
		const sortedExecutions = [...validated.executions].sort(
			(a, b) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime()
		)

		const firstEntry = sortedExecutions.find((e) => e.executionType === "entry")
		const lastExit = [...sortedExecutions].reverse().find((e) => e.executionType === "exit")

		const entryDate = firstEntry ? new Date(firstEntry.executionDate) : validated.entryDate
		const exitDate = lastExit ? new Date(lastExit.executionDate) : validated.exitDate

		// Calculate PnL if we have exits
		let pnl: number | undefined
		let outcome: "win" | "loss" | "breakeven" | undefined

		if (avgExitPrice && totalExitQuantity > 0) {
			let ticksGained: number | null = null
			if (assetConfig) {
				// Use asset-based calculation
				const tickSize = parseFloat(assetConfig.tickSize)
				const tickValue = fromCents(assetConfig.tickValue)

				const result = calculateAssetPnL({
					entryPrice: avgEntryPrice,
					exitPrice: avgExitPrice,
					positionSize: Math.min(totalEntryQuantity, totalExitQuantity),
					direction: validated.direction,
					tickSize,
					tickValue,
					contractsExecuted: totalEntryQuantity + totalExitQuantity,
				})
				pnl = result.netPnl
				ticksGained = result.ticksGained
			} else {
				// Simple calculation
				const priceDiff = validated.direction === "long"
					? avgExitPrice - avgEntryPrice
					: avgEntryPrice - avgExitPrice
				pnl = priceDiff * Math.min(totalEntryQuantity, totalExitQuantity)
			}

			const breakevenTicks = await getBreakevenTicks(validated.asset)
			outcome = determineOutcome({ pnl, ticksGained, breakevenTicks })
		}

		// Build pre-trade thoughts with import note
		const importNote = validated.originalContractCode
			? `[Imported from ProfitChart screenshot. Original contract: ${validated.originalContractCode}]`
			: "[Imported from ProfitChart screenshot]"

		const preTradeThoughts = validated.preTradeThoughts
			? `${importNote}\n\n${validated.preTradeThoughts}`
			: importNote

		// Create trade with scaled execution mode
		const [trade] = await db
			.insert(trades)
			.values({
				accountId,
				asset: validated.asset.toUpperCase(),
				direction: validated.direction,
				timeframeId: validated.timeframeId ?? null,
				strategyId: validated.strategyId ?? null,
				entryDate,
				exitDate,
				entryPrice: avgEntryPrice.toString(),
				exitPrice: avgExitPrice?.toString() ?? null,
				positionSize: totalEntryQuantity.toString(),
				pnl: pnl !== undefined ? toCents(pnl) : null,
				outcome,
				preTradeThoughts,
				// Scaled trade fields
				executionMode: "scaled",
				totalEntryQuantity: totalEntryQuantity.toString(),
				totalExitQuantity: totalExitQuantity.toString(),
				avgEntryPrice: avgEntryPrice.toString(),
				avgExitPrice: avgExitPrice?.toString() ?? null,
				remainingQuantity: (totalEntryQuantity - totalExitQuantity).toString(),
				contractsExecuted: (totalEntryQuantity + totalExitQuantity).toString(),
			})
			.returning()

		// Insert all executions
		const executionValues = validated.executions.map((ex) => ({
			tradeId: trade.id,
			executionType: ex.executionType as "entry" | "exit",
			executionDate: new Date(ex.executionDate),
			price: ex.price.toString(),
			quantity: ex.quantity.toString(),
			orderType: "market" as const,
			commission: 0,
			fees: 0,
			slippage: 0,
			executionValue: calculateExecutionValue(ex.price, ex.quantity),
		}))

		const createdExecutions = await db
			.insert(tradeExecutions)
			.values(executionValues)
			.returning()

		// Revalidate pages
		revalidatePath("/journal")

		return {
			status: "success",
			message: `Trade imported successfully with ${createdExecutions.length} executions`,
			data: {
				trade,
				executions: createdExecutions,
				assetFound: !!assetConfig,
			},
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

		console.error("OCR import error:", error)
		return {
			status: "error",
			message: "Failed to import trade from OCR data",
			errors: [{ code: "IMPORT_FAILED", detail: String(error) }],
		}
	}
}

// ==========================================
// Bulk Import (Multiple Trades)
// ==========================================

export interface BulkOcrImportResult {
	successCount: number
	failedCount: number
	trades: Array<{
		trade: Trade
		executions: TradeExecution[]
		assetFound: boolean
	}>
	errors: Array<{
		index: number
		asset: string
		message: string
	}>
}

/**
 * Create multiple trades from OCR-extracted data
 */
export const bulkCreateTradesFromOcr = async (
	inputs: OcrImportInput[]
): Promise<ActionResponse<BulkOcrImportResult>> => {
	try {
		const { accountId } = await requireAuth()

		const result: BulkOcrImportResult = {
			successCount: 0,
			failedCount: 0,
			trades: [],
			errors: [],
		}

		// Process each trade
		for (let i = 0; i < inputs.length; i++) {
			const input = inputs[i]

			try {
				const validated = ocrImportSchema.parse(input)

				// Look up asset configuration
				const assetConfig = await findAsset(validated.asset, validated.originalContractCode)

				// Calculate aggregates from executions
				const entries = validated.executions.filter((e) => e.executionType === "entry")
				const exits = validated.executions.filter((e) => e.executionType === "exit")

				const totalEntryQuantity = entries.reduce((sum, e) => sum + e.quantity, 0)
				const totalExitQuantity = exits.reduce((sum, e) => sum + e.quantity, 0)

				const avgEntryPrice = calculateAvgPrice(entries, "entry", validated.executions)
				const avgExitPrice = exits.length > 0
					? calculateAvgPrice(exits, "exit", validated.executions)
					: null

				// Sort executions by date
				const sortedExecutions = [...validated.executions].sort(
					(a, b) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime()
				)

				const firstEntry = sortedExecutions.find((e) => e.executionType === "entry")
				const lastExit = [...sortedExecutions].reverse().find((e) => e.executionType === "exit")

				const entryDate = firstEntry ? new Date(firstEntry.executionDate) : validated.entryDate
				const exitDate = lastExit ? new Date(lastExit.executionDate) : validated.exitDate

				// Calculate PnL if we have exits
				let pnl: number | undefined
				let outcome: "win" | "loss" | "breakeven" | undefined

				if (avgExitPrice && totalExitQuantity > 0) {
					let ticksGained: number | null = null
					if (assetConfig) {
						const tickSize = parseFloat(assetConfig.tickSize)
						const tickValue = fromCents(assetConfig.tickValue)

						const calcResult = calculateAssetPnL({
							entryPrice: avgEntryPrice,
							exitPrice: avgExitPrice,
							positionSize: Math.min(totalEntryQuantity, totalExitQuantity),
							direction: validated.direction,
							tickSize,
							tickValue,
							contractsExecuted: totalEntryQuantity + totalExitQuantity,
						})
						pnl = calcResult.netPnl
						ticksGained = calcResult.ticksGained
					} else {
						const priceDiff = validated.direction === "long"
							? avgExitPrice - avgEntryPrice
							: avgEntryPrice - avgExitPrice
						pnl = priceDiff * Math.min(totalEntryQuantity, totalExitQuantity)
					}

					const breakevenTicks = await getBreakevenTicks(validated.asset)
					outcome = determineOutcome({ pnl, ticksGained, breakevenTicks })
				}

				// Build pre-trade thoughts with import note
				const importNote = validated.originalContractCode
					? `[Imported from ProfitChart screenshot. Original contract: ${validated.originalContractCode}]`
					: "[Imported from ProfitChart screenshot]"

				const preTradeThoughts = validated.preTradeThoughts
					? `${importNote}\n\n${validated.preTradeThoughts}`
					: importNote

				// Create trade
				const [trade] = await db
					.insert(trades)
					.values({
						accountId,
						asset: validated.asset.toUpperCase(),
						direction: validated.direction,
						timeframeId: validated.timeframeId ?? null,
						strategyId: validated.strategyId ?? null,
						entryDate,
						exitDate,
						entryPrice: avgEntryPrice.toString(),
						exitPrice: avgExitPrice?.toString() ?? null,
						positionSize: totalEntryQuantity.toString(),
						pnl: pnl !== undefined ? toCents(pnl) : null,
						outcome,
						preTradeThoughts,
						executionMode: "scaled",
						totalEntryQuantity: totalEntryQuantity.toString(),
						totalExitQuantity: totalExitQuantity.toString(),
						avgEntryPrice: avgEntryPrice.toString(),
						avgExitPrice: avgExitPrice?.toString() ?? null,
						remainingQuantity: (totalEntryQuantity - totalExitQuantity).toString(),
						contractsExecuted: (totalEntryQuantity + totalExitQuantity).toString(),
					})
					.returning()

				// Insert executions
				const executionValues = validated.executions.map((ex) => ({
					tradeId: trade.id,
					executionType: ex.executionType as "entry" | "exit",
					executionDate: new Date(ex.executionDate),
					price: ex.price.toString(),
					quantity: ex.quantity.toString(),
					orderType: "market" as const,
					commission: 0,
					fees: 0,
					slippage: 0,
					executionValue: calculateExecutionValue(ex.price, ex.quantity),
				}))

				const createdExecutions = await db
					.insert(tradeExecutions)
					.values(executionValues)
					.returning()

				result.trades.push({
					trade,
					executions: createdExecutions,
					assetFound: !!assetConfig,
				})
				result.successCount++
			} catch (error) {
				result.failedCount++
				result.errors.push({
					index: i,
					asset: input.asset,
					message: error instanceof Error ? error.message : String(error),
				})
			}
		}

		// Revalidate pages
		revalidatePath("/journal")

		const message = result.failedCount === 0
			? `Successfully imported ${result.successCount} trade(s)`
			: `Imported ${result.successCount} trade(s), ${result.failedCount} failed`

		return {
			status: result.failedCount === inputs.length ? "error" : "success",
			message,
			data: result,
		}
	} catch (error) {
		console.error("Bulk OCR import error:", error)
		return {
			status: "error",
			message: "Failed to import trades from OCR data",
			errors: [{ code: "IMPORT_FAILED", detail: String(error) }],
		}
	}
}

/**
 * Validate asset exists in database
 */
export const validateAsset = async (
	symbol: string
): Promise<ActionResponse<{ exists: boolean; asset: typeof assets.$inferSelect | null }>> => {
	try {
		await requireAuth()

		const asset = await db.query.assets.findFirst({
			where: eq(assets.symbol, symbol.toUpperCase()),
		})

		return {
			status: "success",
			message: asset ? "Asset found" : "Asset not found",
			data: {
				exists: !!asset,
				asset: asset ?? null,
			},
		}
	} catch (error) {
		console.error("Validate asset error:", error)
		return {
			status: "error",
			message: "Failed to validate asset",
			errors: [{ code: "VALIDATION_FAILED", detail: String(error) }],
		}
	}
}

// ==========================================
// Vision OCR (Server-side) - Cascade Handler
// ==========================================

import {
	extractTradesWithCascade,
	getProvidersStatus,
	hasAIVisionProvider,
	type ProviderStatus,
	type TradeExtractionResult,
} from "@/lib/vision"
import { normalizeB3Asset, parseProfitChartOcr } from "@/lib/ocr"
import type { OcrParseResult, OcrRawResult, ParsedTrade, ProfitChartSummary, ProfitChartExecution } from "@/lib/ocr"

/**
 * Get status of all vision providers
 */
export const getVisionProvidersStatus = async (): Promise<ActionResponse<{ providers: ProviderStatus[]; hasAI: boolean }>> => {
	const providers = getProvidersStatus()
	const hasAI = hasAIVisionProvider()

	console.log("[OCR SERVER] Vision providers status:")
	for (const p of providers) {
		console.log(`[OCR SERVER]   ${p.available ? "✅" : "❌"} ${p.name} (${p.envVar})`)
	}

	return {
		status: "success",
		message: hasAI ? "AI Vision available" : "No AI Vision configured - using Tesseract",
		data: { providers, hasAI },
	}
}

/**
 * Check if any AI Vision is available (legacy compatibility)
 */
export const checkVisionAvailability = async (): Promise<ActionResponse<{ available: boolean }>> => {
	const hasAI = hasAIVisionProvider()
	console.log("[OCR SERVER] Checking Vision availability...")
	console.log("[OCR SERVER] Any AI provider available:", hasAI)
	return {
		status: "success",
		message: hasAI ? "AI Vision available" : "No AI Vision - will use Tesseract",
		data: { available: hasAI },
	}
}

/**
 * Convert cascade result to OcrParseResult format
 */
const cascadeResultToParseResult = (result: TradeExtractionResult): OcrParseResult => {
	// If Google Vision returned raw text (no trades), parse it with the OCR parser
	if (result.provider === "google" && result.trades.length === 0 && result.rawText) {
		console.log("[OCR SERVER] Google returned raw text, parsing with OCR parser...")
		console.log("[OCR SERVER] Raw text length:", result.rawText.length)
		console.log("[OCR SERVER] Raw text preview:", result.rawText.substring(0, 300))

		const lines = result.rawText.split("\n").filter((l) => l.trim())
		console.log("[OCR SERVER] Split into", lines.length, "lines")
		console.log("[OCR SERVER] First 15 lines:", lines.slice(0, 15))

		const ocrRawResult: OcrRawResult = {
			text: result.rawText,
			confidence: result.confidence,
			lines,
		}
		const parsed = parseProfitChartOcr(ocrRawResult)
		console.log("[OCR SERVER] Parsed result:", {
			trades: parsed.trades.length,
			success: parsed.success,
			errors: parsed.errors,
			warnings: parsed.warnings,
		})
		return parsed
	}

	const trades: ParsedTrade[] = result.trades.map((trade, index) => {
		const assetInfo = normalizeB3Asset(trade.asset)

		const summary: ProfitChartSummary = {
			asset: assetInfo.normalizedSymbol,
			originalContractCode: assetInfo.originalCode,
			openingTime: trade.openingTime,
			closingTime: trade.closingTime,
			totalQuantity: trade.executions.reduce((sum, e) => sum + e.quantity, 0),
			avgBuyPrice: trade.avgBuyPrice,
			avgSellPrice: trade.avgSellPrice,
			direction: null,
		}

		// Determine direction
		const entries = trade.executions.filter((e) => e.type === "entry")
		summary.direction = entries.length > 0 ? "long" : "short"

		const executions: ProfitChartExecution[] = trade.executions.map((e, i) => ({
			time: e.time,
			quantity: e.quantity,
			price: e.price,
			type: e.type,
			rowIndex: i + 1,
		}))

		return {
			id: `trade-${result.provider}-${index}`,
			summary,
			executions,
		}
	})

	const firstTrade = trades[0]

	return {
		success: trades.length > 0,
		summary: firstTrade?.summary ?? null,
		executions: firstTrade?.executions ?? [],
		trades,
		rawText: result.rawText,
		confidence: result.confidence,
		columnDetection: {
			columns: [],
			missingRequired: [],
			hasAllRequired: true,
		},
		errors: [],
		warnings: [],
	}
}

/**
 * Extract trade data from image using cascade (OpenAI → Google → Claude → Groq → Tesseract)
 */
export const extractTradesWithVision = async (
	imageBase64: string,
	mimeType: string = "image/png"
): Promise<ActionResponse<OcrParseResult & { provider: string }>> => {
	console.log("[OCR SERVER] extractTradesWithVision called (cascade)")
	console.log("[OCR SERVER] mimeType:", mimeType)
	console.log("[OCR SERVER] base64 length:", imageBase64.length)

	try {
		await requireAuth()
		console.log("[OCR SERVER] Auth passed")

		if (!hasAIVisionProvider()) {
			console.log("[OCR SERVER] ❌ No AI Vision provider available - will use Tesseract on client")
			return {
				status: "error",
				message: "No AI Vision provider configured. Add API keys to .env (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GROQ_API_KEY)",
				errors: [{ code: "NO_VISION_PROVIDER", detail: "Configure at least one AI vision provider" }],
			}
		}

		console.log("[OCR SERVER] ✨ Starting cascade extraction...")
		const result = await extractTradesWithCascade(imageBase64, mimeType)

		if (result.trades.length === 0 && result.provider === "tesseract") {
			console.log("[OCR SERVER] ⚠️ All AI providers failed, returning for Tesseract fallback")
			return {
				status: "error",
				message: "AI extraction failed, falling back to Tesseract",
				errors: [{ code: "AI_EXTRACTION_FAILED", detail: "All AI providers failed" }],
			}
		}

		console.log(`[OCR SERVER] ✅ Extraction success via ${result.provider}`)
		console.log("[OCR SERVER] Trades found:", result.trades.length)
		console.log("[OCR SERVER] Confidence:", result.confidence)

		const parseResult = cascadeResultToParseResult(result)

		return {
			status: "success",
			message: `Extracted ${result.trades.length} trade(s) via ${result.provider} with ${result.confidence.toFixed(0)}% confidence`,
			data: { ...parseResult, provider: result.provider },
		}
	} catch (error) {
		console.error("[OCR SERVER] ❌ Vision OCR error:", error)
		return {
			status: "error",
			message: "Failed to extract trades from image",
			errors: [{ code: "VISION_FAILED", detail: error instanceof Error ? error.message : String(error) }],
		}
	}
}
