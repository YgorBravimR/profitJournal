/**
 * Error sanitization utility.
 * Prevents leaking internal details (DB schema, constraint names, stack traces) to the client.
 *
 * Server-side: always log the full error for debugging.
 * Client-side: return a generic message so users never see raw DB errors.
 */

const GENERIC_MESSAGE = "An unexpected error occurred"

/**
 * Converts any caught error into a safe string for client-facing responses.
 * Logs the full error server-side for debugging.
 */
const toSafeErrorMessage = (error: unknown, context?: string): string => {
	if (context) {
		console.error(`[${context}]`, error)
	} else {
		console.error(error)
	}

	return GENERIC_MESSAGE
}

export { toSafeErrorMessage }
