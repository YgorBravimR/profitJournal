/**
 * Sentry edge runtime configuration.
 * Loaded via instrumentation.ts when NEXT_RUNTIME === "edge".
 *
 * Minimal config — edge runtime has limited API surface.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
import * as Sentry from "@sentry/nextjs"

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

	enabled: process.env.NODE_ENV === "production",

	environment: process.env.NODE_ENV,

	sampleRate: 1.0,

	tracesSampleRate: 0.1,
})
