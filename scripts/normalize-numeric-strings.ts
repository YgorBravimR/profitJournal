/**
 * One-time normalization script for numeric text columns.
 *
 * Strips trailing zeros from decimal representations stored as text.
 * e.g., "187295.00000000" → "187295", "182990.50000000" → "182990.5"
 *
 * Uses PostgreSQL's ::numeric::text cast which natively strips trailing zeros.
 * Idempotent: safe to re-run — already-clean values are unchanged by the cast.
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env
 *   - Database backup taken (Neon branch snapshot or pg_dump)
 *
 * Usage: pnpm tsx scripts/normalize-numeric-strings.ts
 */

import "dotenv/config"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// ==========================================
// STEP 1: Count values that need normalization (before)
// ==========================================

const countDirty = async (): Promise<number> => {
	// A value needs normalization if casting to numeric and back changes it
	const results = await Promise.all([
		sql`SELECT COUNT(*) as cnt FROM trades WHERE entry_price IS NOT NULL AND entry_price != entry_price::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trades WHERE exit_price IS NOT NULL AND exit_price != exit_price::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trades WHERE position_size IS NOT NULL AND position_size != position_size::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trades WHERE stop_loss IS NOT NULL AND stop_loss != stop_loss::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trades WHERE take_profit IS NOT NULL AND take_profit != take_profit::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trades WHERE planned_r_multiple IS NOT NULL AND planned_r_multiple != planned_r_multiple::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trades WHERE pnl IS NOT NULL AND pnl != pnl::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trades WHERE planned_risk_amount IS NOT NULL AND planned_risk_amount != planned_risk_amount::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trades WHERE commission IS NOT NULL AND commission != commission::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trades WHERE fees IS NOT NULL AND fees != fees::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trade_executions WHERE price != price::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trade_executions WHERE quantity != quantity::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trade_executions WHERE commission IS NOT NULL AND commission != commission::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trade_executions WHERE fees IS NOT NULL AND fees != fees::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trade_executions WHERE slippage IS NOT NULL AND slippage != slippage::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trade_executions WHERE execution_value != execution_value::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trading_accounts WHERE day_trade_tax_rate != day_trade_tax_rate::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trading_accounts WHERE swing_trade_tax_rate != swing_trade_tax_rate::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trading_accounts WHERE profit_share_percentage != profit_share_percentage::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trading_accounts WHERE default_commission != default_commission::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trading_accounts WHERE default_fees != default_fees::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trading_accounts WHERE max_daily_loss IS NOT NULL AND max_daily_loss != max_daily_loss::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM trading_accounts WHERE max_monthly_loss IS NOT NULL AND max_monthly_loss != max_monthly_loss::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM monthly_plans WHERE account_balance IS NOT NULL AND account_balance != account_balance::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM monthly_plans WHERE risk_per_trade_cents IS NOT NULL AND risk_per_trade_cents != risk_per_trade_cents::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM monthly_plans WHERE daily_loss_cents IS NOT NULL AND daily_loss_cents != daily_loss_cents::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM monthly_plans WHERE monthly_loss_cents IS NOT NULL AND monthly_loss_cents != monthly_loss_cents::numeric::text`,
		sql`SELECT COUNT(*) as cnt FROM monthly_plans WHERE weekly_loss_cents IS NOT NULL AND weekly_loss_cents != weekly_loss_cents::numeric::text`,
	])

	let total = 0
	for (const result of results) {
		total += Number(result[0]?.cnt ?? 0)
	}
	return total
}

// ==========================================
// STEP 2: Normalize all text columns
// ==========================================

const normalizeAll = async (): Promise<void> => {
	// trades (text columns only — decimal columns like mfe, mae, realized_r_multiple are excluded)
	await Promise.all([
		sql`UPDATE trades SET entry_price = entry_price::numeric::text WHERE entry_price IS NOT NULL AND entry_price != entry_price::numeric::text`,
		sql`UPDATE trades SET exit_price = exit_price::numeric::text WHERE exit_price IS NOT NULL AND exit_price != exit_price::numeric::text`,
		sql`UPDATE trades SET position_size = position_size::numeric::text WHERE position_size IS NOT NULL AND position_size != position_size::numeric::text`,
		sql`UPDATE trades SET stop_loss = stop_loss::numeric::text WHERE stop_loss IS NOT NULL AND stop_loss != stop_loss::numeric::text`,
		sql`UPDATE trades SET take_profit = take_profit::numeric::text WHERE take_profit IS NOT NULL AND take_profit != take_profit::numeric::text`,
		sql`UPDATE trades SET planned_r_multiple = planned_r_multiple::numeric::text WHERE planned_r_multiple IS NOT NULL AND planned_r_multiple != planned_r_multiple::numeric::text`,
		sql`UPDATE trades SET pnl = pnl::numeric::text WHERE pnl IS NOT NULL AND pnl != pnl::numeric::text`,
		sql`UPDATE trades SET planned_risk_amount = planned_risk_amount::numeric::text WHERE planned_risk_amount IS NOT NULL AND planned_risk_amount != planned_risk_amount::numeric::text`,
		sql`UPDATE trades SET commission = commission::numeric::text WHERE commission IS NOT NULL AND commission != commission::numeric::text`,
		sql`UPDATE trades SET fees = fees::numeric::text WHERE fees IS NOT NULL AND fees != fees::numeric::text`,
	])

	// trade_executions
	await Promise.all([
		sql`UPDATE trade_executions SET price = price::numeric::text WHERE price != price::numeric::text`,
		sql`UPDATE trade_executions SET quantity = quantity::numeric::text WHERE quantity != quantity::numeric::text`,
		sql`UPDATE trade_executions SET commission = commission::numeric::text WHERE commission IS NOT NULL AND commission != commission::numeric::text`,
		sql`UPDATE trade_executions SET fees = fees::numeric::text WHERE fees IS NOT NULL AND fees != fees::numeric::text`,
		sql`UPDATE trade_executions SET slippage = slippage::numeric::text WHERE slippage IS NOT NULL AND slippage != slippage::numeric::text`,
		sql`UPDATE trade_executions SET execution_value = execution_value::numeric::text WHERE execution_value != execution_value::numeric::text`,
	])

	// trading_accounts
	await Promise.all([
		sql`UPDATE trading_accounts SET day_trade_tax_rate = day_trade_tax_rate::numeric::text WHERE day_trade_tax_rate != day_trade_tax_rate::numeric::text`,
		sql`UPDATE trading_accounts SET swing_trade_tax_rate = swing_trade_tax_rate::numeric::text WHERE swing_trade_tax_rate != swing_trade_tax_rate::numeric::text`,
		sql`UPDATE trading_accounts SET profit_share_percentage = profit_share_percentage::numeric::text WHERE profit_share_percentage != profit_share_percentage::numeric::text`,
		sql`UPDATE trading_accounts SET default_commission = default_commission::numeric::text WHERE default_commission != default_commission::numeric::text`,
		sql`UPDATE trading_accounts SET default_fees = default_fees::numeric::text WHERE default_fees != default_fees::numeric::text`,
		sql`UPDATE trading_accounts SET max_daily_loss = max_daily_loss::numeric::text WHERE max_daily_loss IS NOT NULL AND max_daily_loss != max_daily_loss::numeric::text`,
		sql`UPDATE trading_accounts SET max_monthly_loss = max_monthly_loss::numeric::text WHERE max_monthly_loss IS NOT NULL AND max_monthly_loss != max_monthly_loss::numeric::text`,
	])

	// monthly_plans
	await Promise.all([
		sql`UPDATE monthly_plans SET account_balance = account_balance::numeric::text WHERE account_balance IS NOT NULL AND account_balance != account_balance::numeric::text`,
		sql`UPDATE monthly_plans SET risk_per_trade_cents = risk_per_trade_cents::numeric::text WHERE risk_per_trade_cents IS NOT NULL AND risk_per_trade_cents != risk_per_trade_cents::numeric::text`,
		sql`UPDATE monthly_plans SET daily_loss_cents = daily_loss_cents::numeric::text WHERE daily_loss_cents IS NOT NULL AND daily_loss_cents != daily_loss_cents::numeric::text`,
		sql`UPDATE monthly_plans SET monthly_loss_cents = monthly_loss_cents::numeric::text WHERE monthly_loss_cents IS NOT NULL AND monthly_loss_cents != monthly_loss_cents::numeric::text`,
		sql`UPDATE monthly_plans SET weekly_loss_cents = weekly_loss_cents::numeric::text WHERE weekly_loss_cents IS NOT NULL AND weekly_loss_cents != weekly_loss_cents::numeric::text`,
	])
}

// ==========================================
// MAIN
// ==========================================

const main = async () => {
	console.log("========================================")
	console.log("ProfitJournal — Normalize Numeric Strings")
	console.log("========================================\n")

	// Count before
	console.log("[Step 1/3] Counting values that need normalization...")
	const dirtyBefore = await countDirty()
	console.log(`  Found ${dirtyBefore} values with trailing zeros\n`)

	if (dirtyBefore === 0) {
		console.log("  All values already clean — nothing to do!")
		process.exit(0)
	}

	// Normalize
	console.log("[Step 2/3] Normalizing...")
	await normalizeAll()
	console.log("  Done.\n")

	// Verify
	console.log("[Step 3/3] Verifying...")
	const dirtyAfter = await countDirty()

	// Summary
	console.log("\n========================================")
	console.log("SUMMARY")
	console.log("========================================")
	console.log(`Before:       ${dirtyBefore} values with trailing zeros`)
	console.log(`After:        ${dirtyAfter} values remaining`)
	console.log(`Normalized:   ${dirtyBefore - dirtyAfter} values`)
	console.log(`Verification: ${dirtyAfter === 0 ? "PASSED" : "FAILED"}`)
	console.log("\nDone!")

	process.exit(dirtyAfter === 0 ? 0 : 1)
}

main()
