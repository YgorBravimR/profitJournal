import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const securityHeaders = [
	{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
	{ key: "X-Frame-Options", value: "SAMEORIGIN" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
	{
		key: "Content-Security-Policy",
		value: [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob: https:",
			"font-src 'self' data:",
			"connect-src 'self' https:",
			"frame-ancestors 'self'",
		].join("; "),
	},
]

const nextConfig: NextConfig = {
	poweredByHeader: false,
	// Prevent turbopack from bundling native/Node.js-only modules.
	// bcryptjs and @neondatabase/serverless depend on Node.js built-ins
	// that must be resolved at runtime, not compile time.
	serverExternalPackages: ["bcryptjs"],
	experimental: {
		// Optimize package imports for better tree-shaking and faster dev boot
		// recharts: ~300KB, lucide-react: ~2.8s dev cost without optimization
		optimizePackageImports: ["recharts", "lucide-react"],
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: securityHeaders,
			},
		]
	},
}

export default withNextIntl(nextConfig)
