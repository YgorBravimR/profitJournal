/**
 * Database-backed rate limiter — survives serverless cold starts.
 *
 * Stores attempt timestamps in `rate_limit_attempts` table.
 * Probabilistic cleanup (1-in-100 chance) removes rows older than 24h
 * to prevent unbounded table growth without needing a cron job.
 */

import { db } from "@/db/drizzle"
import { rateLimitAttempts } from "@/db/schema"
import { eq, and, gt, lt, sql, count } from "drizzle-orm"

interface DbRateLimiterConfig {
	/** Maximum number of attempts allowed within the window */
	maxAttempts: number
	/** Time window in milliseconds */
	windowMs: number
}

interface RateLimitResult {
	allowed: boolean
	remaining: number
	retryAfterMs: number
}

const CLEANUP_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours
const CLEANUP_PROBABILITY = 0.01 // 1-in-100

const createDbRateLimiter = (config: DbRateLimiterConfig) => {
	const check = async (key: string): Promise<RateLimitResult> => {
		const windowStart = new Date(Date.now() - config.windowMs)

		// Count attempts in current window
		const [result] = await db
			.select({ total: count() })
			.from(rateLimitAttempts)
			.where(
				and(
					eq(rateLimitAttempts.identifier, key),
					gt(rateLimitAttempts.createdAt, windowStart)
				)
			)

		const currentCount = result?.total ?? 0

		// If over limit, compute retry-after from oldest attempt in window
		if (currentCount >= config.maxAttempts) {
			const [oldest] = await db
				.select({ createdAt: rateLimitAttempts.createdAt })
				.from(rateLimitAttempts)
				.where(
					and(
						eq(rateLimitAttempts.identifier, key),
						gt(rateLimitAttempts.createdAt, windowStart)
					)
				)
				.orderBy(rateLimitAttempts.createdAt)
				.limit(1)

			const retryAfterMs = oldest
				? config.windowMs - (Date.now() - oldest.createdAt.getTime())
				: config.windowMs

			return { allowed: false, remaining: 0, retryAfterMs: Math.max(retryAfterMs, 0) }
		}

		// Under limit — record this attempt
		await db.insert(rateLimitAttempts).values({ identifier: key })

		// Probabilistic cleanup: 1-in-100 chance, fire-and-forget
		if (Math.random() < CLEANUP_PROBABILITY) {
			const cutoff = new Date(Date.now() - CLEANUP_MAX_AGE_MS)
			db.delete(rateLimitAttempts)
				.where(lt(rateLimitAttempts.createdAt, cutoff))
				.then(() => {})
				.catch(() => {})
		}

		return {
			allowed: true,
			remaining: config.maxAttempts - currentCount - 1,
			retryAfterMs: 0,
		}
	}

	const reset = async (key: string): Promise<void> => {
		await db
			.delete(rateLimitAttempts)
			.where(eq(rateLimitAttempts.identifier, key))
	}

	/**
	 * Count attempts within a custom window without recording a new one.
	 * Used by the account lockout system to check failure history.
	 */
	const countAttempts = async (key: string, windowMs?: number): Promise<number> => {
		const windowStart = new Date(Date.now() - (windowMs ?? config.windowMs))
		const [result] = await db
			.select({ total: count() })
			.from(rateLimitAttempts)
			.where(
				and(
					eq(rateLimitAttempts.identifier, key),
					gt(rateLimitAttempts.createdAt, windowStart)
				)
			)
		return result?.total ?? 0
	}

	/**
	 * Record an attempt without checking the limit.
	 * Used by the lockout system to log failures independently from rate limiting.
	 */
	const record = async (key: string): Promise<void> => {
		await db.insert(rateLimitAttempts).values({ identifier: key })
	}

	/**
	 * Get the timestamp of the most recent attempt for a given key.
	 */
	const getLatest = async (key: string): Promise<Date | null> => {
		const [row] = await db
			.select({ createdAt: rateLimitAttempts.createdAt })
			.from(rateLimitAttempts)
			.where(eq(rateLimitAttempts.identifier, key))
			.orderBy(sql`${rateLimitAttempts.createdAt} DESC`)
			.limit(1)
		return row?.createdAt ?? null
	}

	return { check, reset, countAttempts, record, getLatest }
}

export { createDbRateLimiter }
export type { DbRateLimiterConfig, RateLimitResult }
