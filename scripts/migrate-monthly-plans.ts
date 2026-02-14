import "dotenv/config"
import { neon } from "@neondatabase/serverless"

/**
 * Migration script: Create monthly plans from existing risk configuration
 * Run with: pnpm tsx scripts/migrate-monthly-plans.ts
 *
 * For each active trading account with risk config:
 * 1. Reads trading_accounts risk fields + daily_targets
 * 2. Reverse-calculates percentages from cents values
 * 3. Creates a monthly_plan for February 2026
 */

const MIGRATION_YEAR = 2026
const MIGRATION_MONTH = 2

interface AccountRow {
	id: string
	name: string
	default_risk_per_trade: string | null
	max_daily_loss: number | null
	max_daily_trades: number | null
	max_monthly_loss: number | null
	allow_second_op_after_loss: boolean | null
	reduce_risk_after_loss: boolean | null
	risk_reduction_factor: string | null
}

interface DailyTargetRow {
	profit_target: number | null
	loss_limit: number | null
	max_trades: number | null
	max_consecutive_losses: number | null
	account_balance: number | null
}

interface ExistingPlanRow {
	id: string
}

const main = async () => {
	const sql = neon(process.env.DATABASE_URL!)

	console.log("Starting monthly plans migration...")

	// 1. Get all active trading accounts with their risk fields
	const accounts = (await sql`
		SELECT id, name, default_risk_per_trade, max_daily_loss, max_daily_trades,
			   max_monthly_loss, allow_second_op_after_loss, reduce_risk_after_loss,
			   risk_reduction_factor
		FROM trading_accounts
		WHERE is_active = true
	`) as AccountRow[]

	console.log(`Found ${accounts.length} active trading accounts`)

	let created = 0
	let skipped = 0

	for (const account of accounts) {
		// 2. Get daily targets for this account
		const targetRows = (await sql`
			SELECT profit_target, loss_limit, max_trades, max_consecutive_losses, account_balance
			FROM daily_targets
			WHERE account_id = ${account.id} AND is_active = true
			LIMIT 1
		`) as DailyTargetRow[]

		const targets = targetRows[0] ?? null

		// 3. Check if this account has any risk configuration worth migrating
		const hasRiskConfig =
			account.max_daily_loss !== null || targets?.loss_limit !== null

		if (!hasRiskConfig) {
			console.log(
				`  Skipping "${account.name}" - no max_daily_loss or loss_limit configured`
			)
			skipped++
			continue
		}

		// 4. Determine account balance (from daily_targets)
		const accountBalance = targets?.account_balance ?? null

		if (!accountBalance || accountBalance <= 0) {
			console.log(`  Skipping "${account.name}" - no account balance set`)
			skipped++
			continue
		}

		// 5. Check if monthly plan already exists for this month
		const existingRows = (await sql`
			SELECT id FROM monthly_plans
			WHERE account_id = ${account.id}
			  AND year = ${MIGRATION_YEAR}
			  AND month = ${MIGRATION_MONTH}
		`) as ExistingPlanRow[]

		if (existingRows.length > 0) {
			console.log(
				`  Skipping "${account.name}" - plan already exists for ${MIGRATION_YEAR}-${String(MIGRATION_MONTH).padStart(2, "0")}`
			)
			skipped++
			continue
		}

		// 6. Reverse-calculate percentages from cents values
		// default_risk_per_trade is in DOLLARS/REAIS (decimal), NOT cents
		const riskPerTradeCents = account.default_risk_per_trade
			? Math.round(parseFloat(account.default_risk_per_trade) * 100)
			: 0

		const dailyLossCents = targets?.loss_limit ?? account.max_daily_loss ?? 0
		const monthlyLossCents = account.max_monthly_loss ?? 0
		const profitTargetCents = targets?.profit_target ?? 0

		// Calculate percentages from cents (avoid division by zero - already guarded above)
		const riskPerTradePercent =
			riskPerTradeCents > 0
				? ((riskPerTradeCents / accountBalance) * 100).toFixed(2)
				: "1.00" // Default 1% if not set

		const dailyLossPercent =
			dailyLossCents > 0
				? ((dailyLossCents / accountBalance) * 100).toFixed(2)
				: "3.00" // Default 3% if not set

		const monthlyLossPercent =
			monthlyLossCents > 0
				? ((monthlyLossCents / accountBalance) * 100).toFixed(2)
				: "10.00" // Default 10% if not set

		const dailyProfitTargetPercent =
			profitTargetCents > 0
				? ((profitTargetCents / accountBalance) * 100).toFixed(2)
				: null

		// 7. Recompute derived cent values from percentages (for consistency with the table contract)
		const computedRiskPerTradeCents = Math.round(
			(accountBalance * parseFloat(riskPerTradePercent)) / 100
		)
		const computedDailyLossCents = Math.round(
			(accountBalance * parseFloat(dailyLossPercent)) / 100
		)
		const computedMonthlyLossCents = Math.round(
			(accountBalance * parseFloat(monthlyLossPercent)) / 100
		)
		const computedProfitTargetCents = dailyProfitTargetPercent
			? Math.round(
					(accountBalance * parseFloat(dailyProfitTargetPercent)) / 100
				)
			: null
		const derivedMaxDailyTrades =
			computedRiskPerTradeCents > 0
				? Math.floor(computedDailyLossCents / computedRiskPerTradeCents)
				: null

		// Resolve max_daily_trades: prefer explicit account setting, then daily_targets, then null
		const maxDailyTrades =
			account.max_daily_trades ?? targets?.max_trades ?? null
		const maxConsecutiveLosses = targets?.max_consecutive_losses ?? null
		const allowSecondOpAfterLoss = account.allow_second_op_after_loss ?? true
		const reduceRiskAfterLoss = account.reduce_risk_after_loss ?? false
		const riskReductionFactor = account.risk_reduction_factor ?? null

		// 8. Insert monthly plan
		await sql`
			INSERT INTO monthly_plans (
				account_id, year, month,
				account_balance, risk_per_trade_percent, daily_loss_percent, monthly_loss_percent,
				daily_profit_target_percent, max_daily_trades, max_consecutive_losses,
				allow_second_op_after_loss, reduce_risk_after_loss, risk_reduction_factor,
				increase_risk_after_win, profit_reinvestment_percent,
				risk_per_trade_cents, daily_loss_cents, monthly_loss_cents,
				daily_profit_target_cents, derived_max_daily_trades,
				notes
			) VALUES (
				${account.id}, ${MIGRATION_YEAR}, ${MIGRATION_MONTH},
				${accountBalance}, ${riskPerTradePercent}, ${dailyLossPercent}, ${monthlyLossPercent},
				${dailyProfitTargetPercent}, ${maxDailyTrades}, ${maxConsecutiveLosses},
				${allowSecondOpAfterLoss}, ${reduceRiskAfterLoss}, ${riskReductionFactor},
				${false}, ${null},
				${computedRiskPerTradeCents}, ${computedDailyLossCents}, ${computedMonthlyLossCents},
				${computedProfitTargetCents}, ${derivedMaxDailyTrades},
				${"Migrated from legacy risk configuration"}
			)
		`

		const balanceFormatted = (accountBalance / 100).toFixed(2)
		console.log(
			`  Created plan for "${account.name}": balance=${balanceFormatted}, risk=${riskPerTradePercent}%, dailyLoss=${dailyLossPercent}%, monthlyLoss=${monthlyLossPercent}%`
		)
		created++
	}

	console.log(
		`\nMigration complete: ${created} plans created, ${skipped} accounts skipped`
	)
}

main().catch((error) => {
	console.error("Migration failed:", error)
	process.exit(1)
})
