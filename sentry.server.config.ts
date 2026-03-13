/**
 * Sentry server-side configuration.
 * Loaded via instrumentation.ts when NEXT_RUNTIME === "nodejs".
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
import * as Sentry from "@sentry/nextjs"
import { shouldIgnore } from "@/lib/sentry"

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

	enabled: process.env.NODE_ENV === "production",

	environment: process.env.NODE_ENV,

	// Send all real errors (free tier: 5K/month)
	sampleRate: 1.0,

	// Performance: sample 10% of transactions (free tier: 10K/month)
	tracesSampleRate: 0.1,

	// Drop navigation/expected errors before they consume quota
	beforeSend(event) {
		const message = event.exception?.values?.[0]?.value ?? ""
		if (shouldIgnore(new Error(message))) {
			return null
		}
		return event
	},
})
