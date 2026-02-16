"use server"

import { revalidatePath } from "next/cache"
import { eq, and } from "drizzle-orm"
import { db } from "@/db/drizzle"
import {
	tradingAccounts,
	accountAssets,
	accountTimeframes,
	assets,
	timeframes,
	type TradingAccount,
	type NewTradingAccount,
	type AccountAsset,
	type AccountTimeframe,
} from "@/db/schema"
import { auth } from "@/auth"

// ==========================================
// TYPES
// ==========================================

interface AccountInput {
	name: string
	description?: string
	accountType: "personal" | "prop" | "replay"
	propFirmName?: string
	profitSharePercentage?: number
	dayTradeTaxRate?: number
	swingTradeTaxRate?: number
	defaultRiskPerTrade?: number
	maxDailyLoss?: number
	maxDailyTrades?: number
	maxMonthlyLoss?: number
	allowSecondOpAfterLoss?: boolean
	reduceRiskAfterLoss?: boolean
	riskReductionFactor?: number
	defaultCurrency?: string
	defaultCommission?: number
	defaultFees?: number
	defaultBreakevenTicks?: number
	showTaxEstimates?: boolean
	showPropCalculations?: boolean
	replayStartDate?: string
}

interface AccountAssetInput {
	assetId: string
	isEnabled: boolean
	commissionOverride?: number | null
	feesOverride?: number | null
	breakevenTicksOverride?: number | null
	notes?: string
}

interface AccountAssetWithDetails extends AccountAsset {
	asset: {
		id: string
		symbol: string
		name: string
		tickSize: string
		tickValue: number
		currency: string
	}
}

interface AccountTimeframeWithDetails extends AccountTimeframe {
	timeframe: {
		id: string
		code: string
		name: string
		type: string
		value: number
		unit: string
	}
}

// ==========================================
// ACCOUNT CRUD
// ==========================================

export const createAccount = async (
	input: AccountInput
): Promise<{ status: "success" | "error"; data?: TradingAccount; error?: string }> => {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { status: "error", error: "Not authenticated" }
		}

		// Check if account name already exists for user
		const existing = await db.query.tradingAccounts.findFirst({
			where: and(
				eq(tradingAccounts.userId, session.user.id),
				eq(tradingAccounts.name, input.name)
			),
		})

		if (existing) {
			return { status: "error", error: "An account with this name already exists" }
		}

		const replayCurrentDate =
			input.accountType === "replay" && input.replayStartDate
				? new Date(input.replayStartDate)
				: null

		const [newAccount] = await db
			.insert(tradingAccounts)
			.values({
				userId: session.user.id,
				name: input.name,
				description: input.description,
				accountType: input.accountType,
				propFirmName: input.propFirmName,
				profitSharePercentage: input.profitSharePercentage?.toString() ?? "100.00",
				dayTradeTaxRate: input.dayTradeTaxRate?.toString() ?? "20.00",
				swingTradeTaxRate: input.swingTradeTaxRate?.toString() ?? "15.00",
				defaultRiskPerTrade: input.defaultRiskPerTrade?.toString(),
				maxDailyLoss: input.maxDailyLoss,
				maxDailyTrades: input.maxDailyTrades,
				defaultCurrency: input.defaultCurrency ?? "BRL",
				defaultCommission: input.defaultCommission ?? 0,
				defaultFees: input.defaultFees ?? 0,
				showTaxEstimates: input.showTaxEstimates ?? true,
				showPropCalculations: input.showPropCalculations ?? true,
				...(replayCurrentDate && { replayCurrentDate }),
			})
			.returning()

		revalidatePath("/settings")

		return { status: "success", data: newAccount }
	} catch (error) {
		console.error("Create account error:", error)
		return { status: "error", error: "An error occurred" }
	}
}

export const updateAccount = async (
	accountId: string,
	input: Partial<AccountInput>
): Promise<{ status: "success" | "error"; data?: TradingAccount; error?: string }> => {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { status: "error", error: "Not authenticated" }
		}

		// Verify ownership
		const account = await db.query.tradingAccounts.findFirst({
			where: and(
				eq(tradingAccounts.id, accountId),
				eq(tradingAccounts.userId, session.user.id)
			),
		})

		if (!account) {
			return { status: "error", error: "Account not found" }
		}

		// Check name uniqueness if changing
		if (input.name && input.name !== account.name) {
			const existing = await db.query.tradingAccounts.findFirst({
				where: and(
					eq(tradingAccounts.userId, session.user.id),
					eq(tradingAccounts.name, input.name)
				),
			})

			if (existing) {
				return { status: "error", error: "An account with this name already exists" }
			}
		}

		const updateData: Partial<NewTradingAccount> = {
			updatedAt: new Date(),
		}

		if (input.name !== undefined) updateData.name = input.name
		if (input.description !== undefined) updateData.description = input.description
		if (input.accountType !== undefined) updateData.accountType = input.accountType
		if (input.propFirmName !== undefined) updateData.propFirmName = input.propFirmName
		if (input.profitSharePercentage !== undefined)
			updateData.profitSharePercentage = input.profitSharePercentage.toString()
		if (input.dayTradeTaxRate !== undefined)
			updateData.dayTradeTaxRate = input.dayTradeTaxRate.toString()
		if (input.swingTradeTaxRate !== undefined)
			updateData.swingTradeTaxRate = input.swingTradeTaxRate.toString()
		if (input.defaultRiskPerTrade !== undefined)
			updateData.defaultRiskPerTrade = input.defaultRiskPerTrade?.toString()
		if (input.maxDailyLoss !== undefined) updateData.maxDailyLoss = input.maxDailyLoss
		if (input.maxDailyTrades !== undefined) updateData.maxDailyTrades = input.maxDailyTrades
		if (input.defaultCurrency !== undefined) updateData.defaultCurrency = input.defaultCurrency
		if (input.defaultCommission !== undefined) updateData.defaultCommission = input.defaultCommission
		if (input.defaultFees !== undefined) updateData.defaultFees = input.defaultFees
		if (input.defaultBreakevenTicks !== undefined) updateData.defaultBreakevenTicks = input.defaultBreakevenTicks
		if (input.showTaxEstimates !== undefined) updateData.showTaxEstimates = input.showTaxEstimates
		if (input.showPropCalculations !== undefined)
			updateData.showPropCalculations = input.showPropCalculations
		if (input.maxMonthlyLoss !== undefined) updateData.maxMonthlyLoss = input.maxMonthlyLoss
		if (input.allowSecondOpAfterLoss !== undefined)
			updateData.allowSecondOpAfterLoss = input.allowSecondOpAfterLoss
		if (input.reduceRiskAfterLoss !== undefined)
			updateData.reduceRiskAfterLoss = input.reduceRiskAfterLoss
		if (input.riskReductionFactor !== undefined)
			updateData.riskReductionFactor = input.riskReductionFactor?.toString()
		if (input.replayStartDate !== undefined && input.accountType === "replay") {
			updateData.replayCurrentDate = new Date(input.replayStartDate)
		}

		const [updated] = await db
			.update(tradingAccounts)
			.set(updateData)
			.where(eq(tradingAccounts.id, accountId))
			.returning()

		revalidatePath("/settings")

		return { status: "success", data: updated }
	} catch (error) {
		console.error("Update account error:", error)
		return { status: "error", error: "An error occurred" }
	}
}

export const deleteAccount = async (
	accountId: string
): Promise<{ status: "success" | "error"; error?: string }> => {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { status: "error", error: "Not authenticated" }
		}

		// Verify ownership
		const account = await db.query.tradingAccounts.findFirst({
			where: and(
				eq(tradingAccounts.id, accountId),
				eq(tradingAccounts.userId, session.user.id)
			),
		})

		if (!account) {
			return { status: "error", error: "Account not found" }
		}

		// Check if this is the only account
		const userAccounts = await db.query.tradingAccounts.findMany({
			where: eq(tradingAccounts.userId, session.user.id),
		})

		if (userAccounts.length === 1) {
			return { status: "error", error: "Cannot delete your only account" }
		}

		// Delete account (cascades to trades, strategies, tags)
		await db.delete(tradingAccounts).where(eq(tradingAccounts.id, accountId))

		revalidatePath("/settings")

		return { status: "success" }
	} catch (error) {
		console.error("Delete account error:", error)
		return { status: "error", error: "An error occurred" }
	}
}

export const setDefaultAccount = async (
	accountId: string
): Promise<{ status: "success" | "error"; error?: string }> => {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { status: "error", error: "Not authenticated" }
		}

		// Verify ownership
		const account = await db.query.tradingAccounts.findFirst({
			where: and(
				eq(tradingAccounts.id, accountId),
				eq(tradingAccounts.userId, session.user.id)
			),
		})

		if (!account) {
			return { status: "error", error: "Account not found" }
		}

		// Remove default from all user accounts
		await db
			.update(tradingAccounts)
			.set({ isDefault: false })
			.where(eq(tradingAccounts.userId, session.user.id))

		// Set this account as default
		await db
			.update(tradingAccounts)
			.set({ isDefault: true })
			.where(eq(tradingAccounts.id, accountId))

		revalidatePath("/settings")

		return { status: "success" }
	} catch (error) {
		console.error("Set default account error:", error)
		return { status: "error", error: "An error occurred" }
	}
}

// ==========================================
// REPLAY DATE
// ==========================================

/**
 * Advances the replay account's current date by one day.
 * Only valid for accounts with accountType === "replay".
 */
export const advanceReplayDate = async (): Promise<{
	status: "success" | "error"
	data?: TradingAccount
	error?: string
}> => {
	try {
		const session = await auth()
		if (!session?.user?.id || !session?.user?.accountId) {
			return { status: "error", error: "Not authenticated" }
		}

		const account = await db.query.tradingAccounts.findFirst({
			where: and(
				eq(tradingAccounts.id, session.user.accountId),
				eq(tradingAccounts.userId, session.user.id)
			),
		})

		if (!account) {
			return { status: "error", error: "Account not found" }
		}

		if (account.accountType !== "replay") {
			return { status: "error", error: "Only replay accounts can advance date" }
		}

		if (!account.replayCurrentDate) {
			return { status: "error", error: "Replay account has no start date" }
		}

		const currentDate = new Date(account.replayCurrentDate)
		currentDate.setDate(currentDate.getDate() + 1)

		const [updated] = await db
			.update(tradingAccounts)
			.set({ replayCurrentDate: currentDate, updatedAt: new Date() })
			.where(eq(tradingAccounts.id, account.id))
			.returning()

		revalidatePath("/command-center")

		return { status: "success", data: updated }
	} catch (error) {
		console.error("Advance replay date error:", error)
		return { status: "error", error: "An error occurred" }
	}
}

// ==========================================
// ACCOUNT ASSETS
// ==========================================

export const getAccountAssets = async (
	accountId?: string
): Promise<{ status: "success" | "error"; data?: AccountAssetWithDetails[]; error?: string }> => {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { status: "error", error: "Not authenticated" }
		}

		const targetAccountId = accountId || session.user.accountId
		if (!targetAccountId) {
			return { status: "error", error: "No account selected" }
		}

		// Verify ownership
		const account = await db.query.tradingAccounts.findFirst({
			where: and(
				eq(tradingAccounts.id, targetAccountId),
				eq(tradingAccounts.userId, session.user.id)
			),
		})

		if (!account) {
			return { status: "error", error: "Account not found" }
		}

		// Get all active assets
		const allAssets = await db.query.assets.findMany({
			where: eq(assets.isActive, true),
			orderBy: (assets, { asc }) => [asc(assets.symbol)],
		})

		// Get account's asset configurations
		const accountAssetConfigs = await db.query.accountAssets.findMany({
			where: eq(accountAssets.accountId, targetAccountId),
		})

		// Merge: all assets with their account-specific config
		const result: AccountAssetWithDetails[] = allAssets.map((asset) => {
			const config = accountAssetConfigs.find((c) => c.assetId === asset.id)

			return {
				id: config?.id ?? "",
				accountId: targetAccountId,
				assetId: asset.id,
				isEnabled: config?.isEnabled ?? false,
				commissionOverride: config?.commissionOverride ?? null,
				feesOverride: config?.feesOverride ?? null,
				breakevenTicksOverride: config?.breakevenTicksOverride ?? null,
				notes: config?.notes ?? null,
				createdAt: config?.createdAt ?? new Date(),
				updatedAt: config?.updatedAt ?? new Date(),
				asset: {
					id: asset.id,
					symbol: asset.symbol,
					name: asset.name,
					tickSize: asset.tickSize,
					tickValue: asset.tickValue,
					currency: asset.currency,
				},
			}
		})

		return { status: "success", data: result }
	} catch (error) {
		console.error("Get account assets error:", error)
		return { status: "error", error: "An error occurred" }
	}
}

export const updateAccountAsset = async (
	input: AccountAssetInput
): Promise<{ status: "success" | "error"; error?: string }> => {
	try {
		const session = await auth()
		if (!session?.user?.id || !session?.user?.accountId) {
			return { status: "error", error: "Not authenticated" }
		}

		// Verify ownership
		const account = await db.query.tradingAccounts.findFirst({
			where: and(
				eq(tradingAccounts.id, session.user.accountId),
				eq(tradingAccounts.userId, session.user.id)
			),
		})

		if (!account) {
			return { status: "error", error: "Account not found" }
		}

		// Check if config exists
		const existing = await db.query.accountAssets.findFirst({
			where: and(
				eq(accountAssets.accountId, session.user.accountId),
				eq(accountAssets.assetId, input.assetId)
			),
		})

		if (existing) {
			// Update
			await db
				.update(accountAssets)
				.set({
					isEnabled: input.isEnabled,
					commissionOverride: input.commissionOverride,
					feesOverride: input.feesOverride,
					breakevenTicksOverride: input.breakevenTicksOverride,
					notes: input.notes,
					updatedAt: new Date(),
				})
				.where(eq(accountAssets.id, existing.id))
		} else {
			// Insert
			await db.insert(accountAssets).values({
				accountId: session.user.accountId,
				assetId: input.assetId,
				isEnabled: input.isEnabled,
				commissionOverride: input.commissionOverride,
				feesOverride: input.feesOverride,
				breakevenTicksOverride: input.breakevenTicksOverride,
				notes: input.notes,
			})
		}

		revalidatePath("/settings")

		return { status: "success" }
	} catch (error) {
		console.error("Update account asset error:", error)
		return { status: "error", error: "An error occurred" }
	}
}

// ==========================================
// ACCOUNT TIMEFRAMES
// ==========================================

export const getAccountTimeframes = async (
	accountId?: string
): Promise<{ status: "success" | "error"; data?: AccountTimeframeWithDetails[]; error?: string }> => {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return { status: "error", error: "Not authenticated" }
		}

		const targetAccountId = accountId || session.user.accountId
		if (!targetAccountId) {
			return { status: "error", error: "No account selected" }
		}

		// Verify ownership
		const account = await db.query.tradingAccounts.findFirst({
			where: and(
				eq(tradingAccounts.id, targetAccountId),
				eq(tradingAccounts.userId, session.user.id)
			),
		})

		if (!account) {
			return { status: "error", error: "Account not found" }
		}

		// Get all active timeframes
		const allTimeframes = await db.query.timeframes.findMany({
			where: eq(timeframes.isActive, true),
			orderBy: (timeframes, { asc }) => [asc(timeframes.sortOrder)],
		})

		// Get account's timeframe configurations
		const accountTimeframeConfigs = await db.query.accountTimeframes.findMany({
			where: eq(accountTimeframes.accountId, targetAccountId),
		})

		// Merge: all timeframes with their account-specific config
		const result: AccountTimeframeWithDetails[] = allTimeframes.map((tf) => {
			const config = accountTimeframeConfigs.find((c) => c.timeframeId === tf.id)

			return {
				id: config?.id ?? "",
				accountId: targetAccountId,
				timeframeId: tf.id,
				isEnabled: config?.isEnabled ?? false,
				createdAt: config?.createdAt ?? new Date(),
				timeframe: {
					id: tf.id,
					code: tf.code,
					name: tf.name,
					type: tf.type,
					value: tf.value,
					unit: tf.unit,
				},
			}
		})

		return { status: "success", data: result }
	} catch (error) {
		console.error("Get account timeframes error:", error)
		return { status: "error", error: "An error occurred" }
	}
}

export const updateAccountTimeframe = async (
	timeframeId: string,
	isEnabled: boolean
): Promise<{ status: "success" | "error"; error?: string }> => {
	try {
		const session = await auth()
		if (!session?.user?.id || !session?.user?.accountId) {
			return { status: "error", error: "Not authenticated" }
		}

		// Verify ownership
		const account = await db.query.tradingAccounts.findFirst({
			where: and(
				eq(tradingAccounts.id, session.user.accountId),
				eq(tradingAccounts.userId, session.user.id)
			),
		})

		if (!account) {
			return { status: "error", error: "Account not found" }
		}

		// Check if config exists
		const existing = await db.query.accountTimeframes.findFirst({
			where: and(
				eq(accountTimeframes.accountId, session.user.accountId),
				eq(accountTimeframes.timeframeId, timeframeId)
			),
		})

		if (existing) {
			// Update
			await db
				.update(accountTimeframes)
				.set({ isEnabled })
				.where(eq(accountTimeframes.id, existing.id))
		} else {
			// Insert
			await db.insert(accountTimeframes).values({
				accountId: session.user.accountId,
				timeframeId,
				isEnabled,
			})
		}

		revalidatePath("/settings")

		return { status: "success" }
	} catch (error) {
		console.error("Update account timeframe error:", error)
		return { status: "error", error: "An error occurred" }
	}
}

// ==========================================
// FEE CALCULATION HELPER
// ==========================================

/**
 * Get the breakeven ticks threshold for an asset in the current account.
 * Priority: per-asset override > account default > fallback (2)
 */
export const getBreakevenTicks = async (
	assetSymbol: string,
	accountId?: string
): Promise<number> => {
	const session = await auth()
	const targetAccountId = accountId || session?.user?.accountId

	if (!targetAccountId) {
		return 2
	}

	// Get account defaults
	const account = await db.query.tradingAccounts.findFirst({
		where: eq(tradingAccounts.id, targetAccountId),
	})

	if (!account) {
		return 2
	}

	// Get asset
	const asset = await db.query.assets.findFirst({
		where: eq(assets.symbol, assetSymbol),
	})

	if (!asset) {
		return account.defaultBreakevenTicks
	}

	// Check for per-asset override
	const assetConfig = await db.query.accountAssets.findFirst({
		where: and(
			eq(accountAssets.accountId, targetAccountId),
			eq(accountAssets.assetId, asset.id)
		),
	})

	return assetConfig?.breakevenTicksOverride ?? account.defaultBreakevenTicks
}

/**
 * Get commission and fees for an asset in the current account.
 * Priority: per-asset override > account default
 */
export const getAssetFees = async (
	assetSymbol: string,
	accountId?: string
): Promise<{ commission: number; fees: number }> => {
	const session = await auth()
	const targetAccountId = accountId || session?.user?.accountId

	if (!targetAccountId) {
		return { commission: 0, fees: 0 }
	}

	// Get account defaults
	const account = await db.query.tradingAccounts.findFirst({
		where: eq(tradingAccounts.id, targetAccountId),
	})

	if (!account) {
		return { commission: 0, fees: 0 }
	}

	// Get asset
	const asset = await db.query.assets.findFirst({
		where: eq(assets.symbol, assetSymbol),
	})

	if (!asset) {
		return {
			commission: account.defaultCommission,
			fees: account.defaultFees,
		}
	}

	// Check for per-asset override
	const assetConfig = await db.query.accountAssets.findFirst({
		where: and(
			eq(accountAssets.accountId, targetAccountId),
			eq(accountAssets.assetId, asset.id)
		),
	})

	return {
		commission: assetConfig?.commissionOverride ?? account.defaultCommission,
		fees: assetConfig?.feesOverride ?? account.defaultFees,
	}
}
