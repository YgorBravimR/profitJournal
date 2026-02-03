import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
	experimental: {
		// Optimize package imports for better tree-shaking and faster dev boot
		// recharts: ~300KB, lucide-react: ~2.8s dev cost without optimization
		optimizePackageImports: ["recharts", "lucide-react"],
	},
}

export default withNextIntl(nextConfig)
