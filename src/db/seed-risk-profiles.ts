/**
 * Seed script for risk management profiles.
 * Run with: npx tsx src/db/seed-risk-profiles.ts
 *
 * Creates two built-in profiles from the risk management documentation:
 * 1. Standard Risk Management (R$500 base, anti-martingale recovery, 30% compounding)
 * 2. TSR Iniciante (R$80 base, 2 contracts max, single-target gain mode)
 */

import { db } from "@/db/drizzle"
import { riskManagementProfiles, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import type { DecisionTreeConfig } from "@/types/risk-profile"

const seedRiskProfiles = async () => {
	// Find the first admin user to set as creator
	const adminUser = await db.query.users.findFirst({
		where: eq(users.isAdmin, true),
	})

	if (!adminUser) {
		console.error("No admin user found. Create an admin user first.")
		process.exit(1)
	}

	const createdByUserId = adminUser.id

	// ==========================================
	// PROFILE 1: Standard Risk Management
	// @see docs/riskManagement/risk-management-flowchart.md
	// ==========================================
	const standardTree: DecisionTreeConfig = {
		baseTrade: {
			riskCents: 50000, // R$500
			maxContracts: 20,
			minStopPoints: 100,
		},
		lossRecovery: {
			sequence: [
				{
					riskCalculation: { type: "percentOfBase", percent: 50 }, // R$250
					maxContractsOverride: null,
				},
				{
					riskCalculation: { type: "percentOfBase", percent: 25 }, // R$125
					maxContractsOverride: null,
				},
				{
					riskCalculation: { type: "percentOfBase", percent: 25 }, // R$125
					maxContractsOverride: null,
				},
			],
			executeAllRegardless: false,
			stopAfterSequence: true,
		},
		gainMode: {
			type: "compounding",
			reinvestmentPercent: 30,
			stopOnFirstLoss: true,
			dailyTargetCents: 150000, // R$1,500
		},
		cascadingLimits: {
			weeklyLossCents: 200000, // R$2,000
			weeklyAction: "stopTrading",
			monthlyLossCents: 750000, // R$7,500
			monthlyAction: "stopTrading",
		},
		executionConstraints: {
			minStopPoints: 100,
			maxContracts: 20,
			operatingHoursStart: "09:01",
			operatingHoursEnd: "17:00",
		},
	}

	// ==========================================
	// PROFILE 2: TSR Iniciante
	// @see docs/riskManagement/tsr-iniciante-flowchart.md
	// ==========================================
	const tsrInicianteTree: DecisionTreeConfig = {
		baseTrade: {
			riskCents: 8000, // R$80 (2 contracts × 200pts × R$0.20)
			maxContracts: 2,
			minStopPoints: 100,
		},
		lossRecovery: {
			sequence: [
				{
					riskCalculation: { type: "fixedCents", amountCents: 4000 }, // 1 contract × 200pts
					maxContractsOverride: 1,
				},
				{
					riskCalculation: { type: "fixedCents", amountCents: 4000 },
					maxContractsOverride: 1,
				},
				{
					riskCalculation: { type: "fixedCents", amountCents: 4000 },
					maxContractsOverride: 1,
				},
			],
			executeAllRegardless: false,
			stopAfterSequence: true,
		},
		gainMode: {
			type: "singleTarget",
			dailyTargetCents: 22000, // R$220
		},
		cascadingLimits: {
			weeklyLossCents: null,
			weeklyAction: "stopTrading",
			monthlyLossCents: 150000, // R$1,500
			monthlyAction: "stopTrading",
		},
		executionConstraints: {
			minStopPoints: 100,
			maxContracts: 2,
			operatingHoursStart: "09:01",
			operatingHoursEnd: "17:00",
		},
	}

	// Insert profiles
	const profiles = [
		{
			name: "Standard Risk Management",
			description: "Anti-martingale loss recovery with 30% gain compounding. Base risk R$500, daily target R$1,500. Suitable for experienced traders with larger accounts.",
			createdByUserId,
			baseRiskCents: 50000,
			dailyLossCents: 100000, // R$1,000
			weeklyLossCents: 200000, // R$2,000
			monthlyLossCents: 750000, // R$7,500
			dailyProfitTargetCents: 150000, // R$1,500
			decisionTree: JSON.stringify(standardTree),
		},
		{
			name: "TSR Iniciante",
			description: "Conservative plan for beginners. Max 2 contracts, R$80 base risk, single-target gain mode (1 winning T1 = daily goal). Recovery trades use 1 contract.",
			createdByUserId,
			baseRiskCents: 8000,
			dailyLossCents: 20000, // R$200
			weeklyLossCents: null,
			monthlyLossCents: 150000, // R$1,500
			dailyProfitTargetCents: 22000, // R$220
			decisionTree: JSON.stringify(tsrInicianteTree),
		},
	]

	for (const profile of profiles) {
		// Check if profile already exists by name
		const existing = await db.query.riskManagementProfiles.findFirst({
			where: eq(riskManagementProfiles.name, profile.name),
		})

		if (existing) {
			console.log(`Profile "${profile.name}" already exists, skipping.`)
			continue
		}

		await db.insert(riskManagementProfiles).values(profile)
		console.log(`Created profile: "${profile.name}"`)
	}

	console.log("Seed complete.")
	process.exit(0)
}

seedRiskProfiles().catch((error) => {
	console.error("Seed failed:", error)
	process.exit(1)
})
