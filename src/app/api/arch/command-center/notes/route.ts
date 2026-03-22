import type { NextRequest } from "next/server"
import { db } from "@/db/drizzle"
import { dailyAccountNotes } from "@/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"
import { z } from "zod"
import { dailyNotesSchema } from "@/lib/validations/command-center"
import { getUserDek, encryptDailyNotesFields, decryptDailyNotesFields } from "@/lib/user-crypto"
import { archAuth } from "../../_lib/auth"
import { archSuccess, archError } from "../../_lib/helpers"

/**
 * GET /api/arch/command-center/notes
 *
 * Returns the daily notes for a given date.
 *
 * Query params:
 * - date (optional): ISO date string, defaults to today
 */
const GET = async (request: NextRequest) => {
	const authResult = await archAuth(request)
	if (!authResult.success) return authResult.response

	const { userId, accountId } = authResult.auth

	try {
		const dateParam = request.nextUrl.searchParams.get("date")
		const today = dateParam ? new Date(dateParam) : new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		const rawNotes = await db.query.dailyAccountNotes.findFirst({
			where: and(
				eq(dailyAccountNotes.userId, userId),
				eq(dailyAccountNotes.accountId, accountId),
				gte(dailyAccountNotes.date, today),
				lte(dailyAccountNotes.date, tomorrow)
			),
		})

		const dek = await getUserDek(userId)
		const notes = rawNotes && dek
			? decryptDailyNotesFields(rawNotes as unknown as Record<string, unknown>, dek) as unknown as typeof rawNotes
			: rawNotes

		return archSuccess(
			notes ? "Notes retrieved" : "No notes found",
			notes ?? null
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error"
		return archError("Failed to retrieve notes", [
			{ code: "FETCH_FAILED", detail: message },
		], 500)
	}
}

/**
 * POST /api/arch/command-center/notes
 *
 * Creates or updates daily notes for a given date.
 *
 * Body: { date, preMarketNotes?, postMarketNotes?, mood? }
 */
const POST = async (request: NextRequest) => {
	const authResult = await archAuth(request)
	if (!authResult.success) return authResult.response

	const { userId, accountId } = authResult.auth

	try {
		const body = await request.json()
		const validated = dailyNotesSchema.parse(body)

		const noteDate = new Date(validated.date)
		noteDate.setHours(0, 0, 0, 0)
		const nextDay = new Date(noteDate)
		nextDay.setDate(nextDay.getDate() + 1)

		// Check if notes exist for this date
		const existing = await db.query.dailyAccountNotes.findFirst({
			where: and(
				eq(dailyAccountNotes.userId, userId),
				eq(dailyAccountNotes.accountId, accountId),
				gte(dailyAccountNotes.date, noteDate),
				lte(dailyAccountNotes.date, nextDay)
			),
		})

		// Encrypt notes fields if DEK is available
		const dek = await getUserDek(userId)
		const encryptedFields = dek
			? encryptDailyNotesFields({
				preMarketNotes: validated.preMarketNotes || null,
				postMarketNotes: validated.postMarketNotes || null,
			}, dek)
			: {}

		if (existing) {
			const [updatedNotes] = await db
				.update(dailyAccountNotes)
				.set({
					preMarketNotes: validated.preMarketNotes || null,
					postMarketNotes: validated.postMarketNotes || null,
					mood: validated.mood || null,
					updatedAt: new Date(),
					...encryptedFields,
				})
				.where(eq(dailyAccountNotes.id, existing.id))
				.returning()

			const decryptedNotes = dek
				? decryptDailyNotesFields(updatedNotes as unknown as Record<string, unknown>, dek) as unknown as typeof updatedNotes
				: updatedNotes

			return archSuccess("Notes updated", decryptedNotes)
		}

		const [newNotes] = await db
			.insert(dailyAccountNotes)
			.values({
				userId,
				accountId,
				date: noteDate,
				preMarketNotes: validated.preMarketNotes || null,
				postMarketNotes: validated.postMarketNotes || null,
				mood: validated.mood || null,
				...encryptedFields,
			})
			.returning()

		const decryptedNewNotes = dek
			? decryptDailyNotesFields(newNotes as unknown as Record<string, unknown>, dek) as unknown as typeof newNotes
			: newNotes

		return archSuccess("Notes created", decryptedNewNotes)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return archError("Validation failed", error.issues.map((issue) => ({
				code: "VALIDATION_ERROR",
				detail: `${issue.path.join(".")}: ${issue.message}`,
			})))
		}

		const message = error instanceof Error ? error.message : "Unknown error"
		return archError("Failed to save notes", [
			{ code: "SAVE_FAILED", detail: message },
		], 500)
	}
}

export { GET, POST }
