/**
 * Next.js instrumentation hook.
 *
 * This file is loaded once at server startup and initializes Sentry
 * for the appropriate runtime (Node.js or Edge).
 *
 * The `onRequestError` export auto-captures ALL unhandled server errors
 * (server components, API routes, server actions) without modifying each file.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import * as Sentry from "@sentry/nextjs"

const register = async () => {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("../sentry.server.config")
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		await import("../sentry.edge.config")
	}
}

const onRequestError = Sentry.captureRequestError

export { register, onRequestError }
