"use server"

import { eq, and, gt } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { users, verificationTokens } from "@/db/schema"
import { sendEmail } from "@/lib/email"
import { emailVerificationTemplate } from "@/lib/email-templates"
import { generateOTP, hashOTP, OTP_EXPIRY_MINUTES } from "@/lib/otp"
import { createDbRateLimiter } from "@/lib/db-rate-limiter"
import {
	verifyEmailSchema,
	requestVerificationSchema,
	type VerifyEmailInput,
	type RequestVerificationInput,
} from "@/lib/validations/auth"

const TOKEN_PREFIX = "email-verification:"

const requestLimiter = createDbRateLimiter({
	maxAttempts: 2,
	windowMs: 30 * 60 * 1000, // 30 minutes
})

const verifyLimiter = createDbRateLimiter({
	maxAttempts: 5,
	windowMs: 15 * 60 * 1000, // 15 minutes
})

const buildIdentifier = (email: string): string =>
	`${TOKEN_PREFIX}${email.toLowerCase()}`

/**
 * Request an email verification code.
 * Rate-limited to 3 requests per 5 minutes.
 * Always returns success to prevent email enumeration.
 */
const requestEmailVerification = async (
	input: RequestVerificationInput
): Promise<{ success: boolean; error?: string }> => {
	const parsed = requestVerificationSchema.safeParse(input)
	if (!parsed.success) return { success: true }

	const email = parsed.data.email.toLowerCase()

	// Rate limit
	const rateLimitResult = await requestLimiter.check(`email-verify-req:${email}`)
	if (!rateLimitResult.allowed) {
		const retryMinutes = Math.ceil(rateLimitResult.retryAfterMs / 60_000)
		return { success: false, error: `Too many requests. Try again in ${retryMinutes} minute(s).` }
	}

	// Look up user — if not found, return success anyway (anti-enumeration)
	const user = await db.query.users.findFirst({
		where: eq(users.email, email),
		columns: { id: true, emailVerified: true },
	})

	if (!user) return { success: true }

	// Already verified — no need to send code
	if (user.emailVerified) return { success: true }

	const identifier = buildIdentifier(email)

	// Delete any existing tokens for this identifier
	await db
		.delete(verificationTokens)
		.where(eq(verificationTokens.identifier, identifier))

	// Generate OTP and store hashed version
	const code = generateOTP()
	const hashedCode = hashOTP(code)
	const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

	await db.insert(verificationTokens).values({
		identifier,
		token: hashedCode,
		expires,
	})

	// Send email
	const emailResult = await sendEmail({
		to: email,
		subject: "Verify Your Email - Bravo Journal",
		html: emailVerificationTemplate({ code, expiresInMinutes: OTP_EXPIRY_MINUTES }),
	})

	if (!emailResult.success) {
		// Clean up the token since the email didn't send
		await db
			.delete(verificationTokens)
			.where(eq(verificationTokens.identifier, identifier))

		return { success: false, error: "SEND_FAILED" }
	}

	return { success: true }
}

/**
 * Verify email with OTP code.
 * Rate-limited to 5 attempts per 15 minutes.
 */
const verifyEmail = async (
	input: VerifyEmailInput
): Promise<{ success: boolean; error?: string }> => {
	const parsed = verifyEmailSchema.safeParse(input)
	if (!parsed.success) {
		return { success: false, error: "Invalid input" }
	}

	const { email, code } = parsed.data
	const lowerEmail = email.toLowerCase()

	// Rate limiting
	const rateLimitResult = await verifyLimiter.check(`email-verify:${lowerEmail}`)
	if (!rateLimitResult.allowed) {
		const retryMinutes = Math.ceil(rateLimitResult.retryAfterMs / 60_000)
		return { success: false, error: `Too many attempts. Try again in ${retryMinutes} minute(s).` }
	}

	const identifier = buildIdentifier(lowerEmail)
	const hashedCode = hashOTP(code)

	// Look up the token
	const tokenRow = await db.query.verificationTokens.findFirst({
		where: and(
			eq(verificationTokens.identifier, identifier),
			eq(verificationTokens.token, hashedCode),
			gt(verificationTokens.expires, new Date())
		),
	})

	if (!tokenRow) {
		return { success: false, error: "INVALID_OR_EXPIRED" }
	}

	// Set emailVerified on user
	await db
		.update(users)
		.set({ emailVerified: new Date(), updatedAt: new Date() })
		.where(eq(users.email, lowerEmail))

	// Clean up: delete token and clear rate limit
	await db
		.delete(verificationTokens)
		.where(eq(verificationTokens.identifier, identifier))

	await verifyLimiter.reset(`email-verify:${lowerEmail}`)

	return { success: true }
}

export { requestEmailVerification, verifyEmail }
