import { NextResponse } from "next/server"
import { signOut } from "@/auth"

/**
 * Force sign-out route handler.
 *
 * Used when server components detect a deleted user or account during rendering.
 * Server components can't call signOut() directly (cookie modification is forbidden
 * outside Server Actions / Route Handlers), so they redirect here instead.
 *
 * Flow: server component → redirect("/api/auth/force-signout") → clear session → redirect("/login")
 */
export const GET = async (request: Request): Promise<NextResponse> => {
	try {
		await signOut({ redirect: false })
	} catch {
		// Session may already be invalid — proceed to redirect regardless
	}

	const url = new URL("/login", request.url)
	return NextResponse.redirect(url)
}
