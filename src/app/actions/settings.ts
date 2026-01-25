"use server"

import { db } from "@/db/drizzle"
import { settings } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { ActionResponse } from "@/types"

export interface RiskSettings {
	defaultRiskPercent: number
	accountBalance: number
}

export const getRiskSettings = async (): Promise<ActionResponse<RiskSettings>> => {
	try {
		const [riskSetting, balanceSetting] = await Promise.all([
			db.query.settings.findFirst({
				where: eq(settings.key, "default_risk_percent"),
			}),
			db.query.settings.findFirst({
				where: eq(settings.key, "account_balance"),
			}),
		])

		return {
			status: "success",
			message: "Settings retrieved successfully",
			data: {
				defaultRiskPercent: riskSetting ? Number(riskSetting.value) : 1.0,
				accountBalance: balanceSetting ? Number(balanceSetting.value) : 10000,
			},
		}
	} catch (error) {
		console.error("Failed to get risk settings:", error)
		return {
			status: "error",
			message: "Failed to retrieve settings",
		}
	}
}

export const updateRiskSettings = async (
	data: RiskSettings
): Promise<ActionResponse<RiskSettings>> => {
	try {
		const now = new Date()

		// Upsert default_risk_percent
		const existingRisk = await db.query.settings.findFirst({
			where: eq(settings.key, "default_risk_percent"),
		})

		if (existingRisk) {
			await db
				.update(settings)
				.set({ value: String(data.defaultRiskPercent), updatedAt: now })
				.where(eq(settings.key, "default_risk_percent"))
		} else {
			await db.insert(settings).values({
				key: "default_risk_percent",
				value: String(data.defaultRiskPercent),
				description: "Default position risk percentage",
				updatedAt: now,
			})
		}

		// Upsert account_balance
		const existingBalance = await db.query.settings.findFirst({
			where: eq(settings.key, "account_balance"),
		})

		if (existingBalance) {
			await db
				.update(settings)
				.set({ value: String(data.accountBalance), updatedAt: now })
				.where(eq(settings.key, "account_balance"))
		} else {
			await db.insert(settings).values({
				key: "account_balance",
				value: String(data.accountBalance),
				description: "Initial/current trading capital",
				updatedAt: now,
			})
		}

		return {
			status: "success",
			message: "Settings updated successfully",
			data,
		}
	} catch (error) {
		console.error("Failed to update risk settings:", error)
		return {
			status: "error",
			message: "Failed to update settings",
		}
	}
}
