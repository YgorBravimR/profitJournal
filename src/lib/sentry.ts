/**
 * Centralized Sentry error reporting with categorization.
 *
 * Every error that reaches Sentry is tagged with a category and severity,
 * making it trivial to filter/alert in the dashboard without drowning in noise.
 *
 * Usage:
 *   import { reportError, ErrorCategory } from "@/lib/sentry"
 *   reportError(error, { category: ErrorCategory.DATABASE, context: "trades.create" })
 */
import * as Sentry from "@sentry/nextjs"

/** Error categories map 1:1 to Sentry tags for dashboard filtering. */
const ErrorCategory = {
	AUTH: "auth",
	DATABASE: "database",
	VALIDATION: "validation",
	API: "api",
	IMPORT: "import",
	ENCRYPTION: "encryption",
	MARKET_DATA: "market_data",
	UI: "ui",
	NETWORK: "network",
	UNKNOWN: "unknown",
} as const

type ErrorCategoryValue = (typeof ErrorCategory)[keyof typeof ErrorCategory]

interface ReportErrorOptions {
	/** Which subsystem the error belongs to */
	category: ErrorCategoryValue
	/** Dot-separated context path, e.g. "trades.create" or "csv.parse" */
	context?: string
	/** Extra key-value pairs attached to the Sentry event */
	extra?: Record<string, unknown>
	/** Override automatic severity detection */
	level?: Sentry.SeverityLevel
	/** The authenticated user ID (set automatically by middleware when available) */
	userId?: string
}

/**
 * Maps error categories to default severity levels.
 * Fatal/error categories trigger alerts; warnings are tracked silently.
 */
const CATEGORY_SEVERITY: Record<ErrorCategoryValue, Sentry.SeverityLevel> = {
	auth: "warning",
	database: "error",
	validation: "info",
	api: "error",
	import: "warning",
	encryption: "fatal",
	market_data: "warning",
	ui: "error",
	network: "warning",
	unknown: "error",
}

/**
 * Patterns that should never consume our Sentry quota.
 * These are expected errors (user typos, bots, network flakes).
 */
const IGNORED_MESSAGES = [
	// Next.js navigation (not real errors)
	"NEXT_REDIRECT",
	"NEXT_NOT_FOUND",
	// Browser extensions / bot noise
	"ResizeObserver loop",
	"Loading chunk",
	"ChunkLoadError",
	// Network flakes the user will just retry
	"Failed to fetch",
	"NetworkError",
	"AbortError",
	"Load failed",
	// Auth expected flows
	"NEXT_HTTP_ERROR", // NextAuth redirect errors
]

/**
 * Returns true if this error should be silently dropped.
 */
const shouldIgnore = (error: unknown): boolean => {
	const message = error instanceof Error ? error.message : String(error)
	return IGNORED_MESSAGES.some((pattern) => message.includes(pattern))
}

/**
 * Report an error to Sentry with category tagging and smart fingerprinting.
 *
 * @param error - The caught error (Error object, string, or unknown)
 * @param options - Category, context, and optional extras
 *
 * @example
 * ```ts
 * try {
 *   await db.insert(trades).values(data)
 * } catch (error) {
 *   reportError(error, { category: ErrorCategory.DATABASE, context: "trades.create" })
 * }
 * ```
 */
const reportError = (error: unknown, options: ReportErrorOptions): void => {
	if (shouldIgnore(error)) {
		return
	}

	// Validation errors are expected (user input) — skip Sentry on free tier
	if (options.category === ErrorCategory.VALIDATION) {
		return
	}

	const level = options.level ?? CATEGORY_SEVERITY[options.category]
	const errorObj = error instanceof Error ? error : new Error(String(error))

	Sentry.withScope((scope) => {
		scope.setLevel(level)
		scope.setTag("error.category", options.category)

		if (options.context) {
			scope.setTag("error.context", options.context)
		}

		if (options.userId) {
			scope.setUser({ id: options.userId })
		}

		if (options.extra) {
			scope.setExtras(options.extra)
		}

		// Custom fingerprint: group by category + context so the same bug
		// from different users counts as ONE issue, not N issues.
		const fingerprint: string[] = [options.category]
		if (options.context) {
			fingerprint.push(options.context)
		}
		fingerprint.push(errorObj.message)
		scope.setFingerprint(fingerprint)

		Sentry.captureException(errorObj)
	})
}

/**
 * Add breadcrumb for non-error events that provide debugging context.
 * These are free (don't count against quota) and show up in the error timeline.
 *
 * @example
 * ```ts
 * addBreadcrumb("User switched trading account", { accountId: "abc123" })
 * ```
 */
const addBreadcrumb = (
	message: string,
	data?: Record<string, unknown>,
	category?: string,
): void => {
	Sentry.addBreadcrumb({
		message,
		data,
		category: category ?? "app",
		level: "info",
	})
}

export { ErrorCategory, reportError, addBreadcrumb, shouldIgnore }
export type { ErrorCategoryValue, ReportErrorOptions }
