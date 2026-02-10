import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"
import { authConfig } from "@/auth.config"

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware(routing)

// Create auth middleware with edge-compatible config (no database)
const { auth } = NextAuth(authConfig)

// Public paths that don't require authentication
const publicPaths = ["/login", "/register", "/api/auth", "/painel", "/api/market"]

// Check if a path is public
const isPublicPath = (pathname: string): boolean => {
	// Remove locale prefix
	const pathWithoutLocale = pathname.replace(/^\/(en|pt-BR)/, "") || "/"
	return publicPaths.some((path) => pathWithoutLocale.startsWith(path))
}

export default auth((req) => {
	const { pathname } = req.nextUrl

	// Allow API routes to pass through
	if (pathname.startsWith("/api/")) {
		return NextResponse.next()
	}

	// If authenticated and on auth page (login/register), redirect to dashboard
	const pathWithoutLocale = pathname.replace(/^\/(en|pt-BR)/, "") || "/"
	if (req.auth && (pathWithoutLocale === "/login" || pathWithoutLocale === "/register")) {
		return NextResponse.redirect(new URL("/", req.url))
	}

	// If authenticated but no account selected, redirect to login
	// This happens if user's account was deleted or session is malformed
	if (
		req.auth &&
		!req.auth.user?.accountId &&
		!isPublicPath(pathname)
	) {
		return NextResponse.redirect(new URL("/login", req.url))
	}

	// Apply i18n middleware
	return intlMiddleware(req)
})

export const config = {
	// Match all pathnames except for:
	// - API routes (handled separately above)
	// - Static files (_next, images, favicon, etc.)
	matcher: ["/((?!_next|.*\\..*).*)"],
}
