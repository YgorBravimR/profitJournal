/**
 * Error sanitization utility.
 * Prevents leaking internal details (DB schema, constraint names, stack traces) to the client.
 *
 * Server-side: always log the full error for debugging + report to Sentry.
 * Client-side: return a generic message so users never see raw DB errors.
 */
import { reportError, ErrorCategory } from "@/lib/sentry"
import type { ErrorCategoryValue } from "@/lib/sentry"

const GENERIC_MESSAGE = "An unexpected error occurred"

/**
 * Converts any caught error into a safe string for client-facing responses.
 * Logs the full error server-side for debugging and reports to Sentry.
 *
 * @param error - The caught error
 * @param context - Dot-separated context path, e.g. "trades.create"
 * @param category - Optional Sentry category for dashboard filtering (defaults to UNKNOWN)
 */
const toSafeErrorMessage = (
	error: unknown,
	context?: string,
	category?: ErrorCategoryValue,
): string => {
	if (context) {
		console.error(`[${context}]`, error)
	} else {
		console.error(error)
	}

	reportError(error, {
		category: category ?? ErrorCategory.UNKNOWN,
		context,
	})

	return GENERIC_MESSAGE
}

export { toSafeErrorMessage }
