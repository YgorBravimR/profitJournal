/**
 * Trade deduplication via SHA-256 fingerprint.
 *
 * Because prices are AES-256-GCM encrypted in the database, direct comparison
 * for duplicate detection would require decrypting every row. Instead, we compute
 * a SHA-256 hash from plaintext values *before* encryption and store it alongside
 * the trade. This enables O(1) lookups via `WHERE deduplicationHash IN (...)`.
 *
 * The hash is NOT security-sensitive — it's a collision-resistant business fingerprint.
 */

import { createHash } from "crypto"
import { formatDateKey } from "@/lib/dates"

interface TradeHashInput {
	accountId: string
	asset: string
	direction: "long" | "short"
	entryDate: Date
	entryPrice: number
	exitPrice?: number | null
	positionSize: number
}

/**
 * Compute a SHA-256 deduplication hash for a trade.
 *
 * Fingerprint components (pipe-delimited):
 *   accountId | asset (uppercase) | direction | entryDate (YYYY-MM-DD) | entryPrice (2dp) | exitPrice (2dp) | positionSize
 *
 * Prices are rounded to 2 decimal places to avoid floating-point noise
 * (e.g., 128000.00000001 vs 128000.0 would otherwise produce different hashes).
 */
const computeTradeHash = (input: TradeHashInput): string => {
	const dateKey = formatDateKey(input.entryDate)
	const entryPriceNormalized = input.entryPrice.toFixed(2)
	const exitPriceNormalized = input.exitPrice != null ? input.exitPrice.toFixed(2) : "null"
	const positionSizeNormalized = input.positionSize.toString()

	const fingerprint = [
		input.accountId,
		input.asset.toUpperCase(),
		input.direction,
		dateKey,
		entryPriceNormalized,
		exitPriceNormalized,
		positionSizeNormalized,
	].join("|")

	return createHash("sha256").update(fingerprint).digest("hex")
}

/**
 * Compute a SHA-256 hash of a file's content (for nota PDF idempotency).
 */
const computeFileHash = (buffer: Buffer): string => {
	return createHash("sha256").update(buffer).digest("hex")
}

export { computeTradeHash, computeFileHash }
export type { TradeHashInput }
