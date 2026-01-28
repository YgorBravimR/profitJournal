import "dotenv/config"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

/**
 * Seed script for profitJournal
 * Run with: pnpm db:seed
 *
 * Creates:
 * - 1 Admin user (admin@profitjournal.com / Admin123!)
 * - 3 Trading accounts:
 *   1. Personal (default) - with trades
 *   2. Atom Prop Firm - with trades
 *   3. Demo Account - empty (no trades)
 *
 * January 2026 Calendar Reference:
 * Thu 1, Fri 2, Sat 3, Sun 4, Mon 5, Tue 6, Wed 7, Thu 8, Fri 9, Sat 10, Sun 11,
 * Mon 12, Tue 13, Wed 14, Thu 15, Fri 16, Sat 17, Sun 18, Mon 19, Tue 20, Wed 21,
 * Thu 22, Fri 23, Sat 24, Sun 25, Mon 26, Tue 27, Wed 28, Thu 29, Fri 30, Sat 31
 */

const ADMIN_EMAIL = "admin@profitjournal.com"
const ADMIN_PASSWORD = "Admin123!"
const SALT_ROUNDS = 12

const runSeed = async () => {
	const databaseUrl = process.env.DATABASE_URL
	if (!databaseUrl) {
		console.error("❌ DATABASE_URL environment variable is not set")
		process.exit(1)
	}

	const sql = neon(databaseUrl)
	console.log("🔗 Connected to database\n")

	// Helper to convert dollars to cents
	const toCents = (dollars: number | null) =>
		dollars !== null ? Math.round(dollars * 100) : null

	// Helper to calculate planned risk amount and realized R-multiple
	const calculateRiskValues = (
		direction: string,
		entryPrice: number,
		stopLoss: number | null,
		positionSize: number,
		pnl: number
	) => {
		if (!stopLoss) return { plannedRiskAmount: null, realizedRMultiple: null }

		const riskPerUnit =
			direction === "long"
				? entryPrice - stopLoss
				: stopLoss - entryPrice
		const plannedRiskAmount = Math.abs(riskPerUnit * positionSize)
		const realizedRMultiple = plannedRiskAmount > 0 ? pnl / plannedRiskAmount : null

		return {
			plannedRiskAmount: toCents(plannedRiskAmount),
			realizedRMultiple: realizedRMultiple?.toFixed(2) ?? null,
		}
	}

	// ==========================================
	// 1. Clean up existing data (in order due to FK constraints)
	// ==========================================
	console.log("🧹 Cleaning existing data...")
	await sql`DELETE FROM trade_tags`
	await sql`DELETE FROM trade_executions`
	await sql`DELETE FROM trades`
	await sql`DELETE FROM strategies WHERE account_id IS NOT NULL`
	await sql`DELETE FROM tags WHERE account_id IS NOT NULL`
	await sql`DELETE FROM account_assets`
	await sql`DELETE FROM account_timeframes`
	await sql`DELETE FROM sessions`
	await sql`DELETE FROM trading_accounts`
	await sql`DELETE FROM users`
	console.log("✅ Existing user data cleaned")

	// ==========================================
	// 2. Create Admin User
	// ==========================================
	console.log("\n👤 Creating admin user...")
	const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS)

	const [adminUser] = await sql`
		INSERT INTO users (id, name, email, password_hash, is_admin, preferred_locale, theme)
		VALUES (gen_random_uuid(), 'Admin User', ${ADMIN_EMAIL}, ${passwordHash}, true, 'en', 'dark')
		RETURNING id
	`
	console.log(`✅ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)

	// ==========================================
	// 3. Create Trading Accounts
	// ==========================================
	console.log("\n💼 Creating trading accounts...")

	// Account 1: Personal (default)
	const [personalAccount] = await sql`
		INSERT INTO trading_accounts (
			id, user_id, name, description, is_default, account_type,
			default_commission, default_fees, default_currency, max_daily_loss
		) VALUES (
			gen_random_uuid(), ${adminUser.id}, 'Personal', 'My personal trading account',
			true, 'personal', 30, 5, 'BRL', 50000
		)
		RETURNING id
	`
	console.log("   ✅ Personal account created (default)")

	// Account 2: Prop Firm (Atom)
	const [propAccount] = await sql`
		INSERT INTO trading_accounts (
			id, user_id, name, description, is_default, account_type,
			prop_firm_name, profit_share_percentage, default_commission, default_fees,
			default_currency, max_daily_loss, show_prop_calculations
		) VALUES (
			gen_random_uuid(), ${adminUser.id}, 'Atom Funded', 'My Atom prop firm account',
			false, 'prop', 'Atom', 80.00, 30, 5, 'BRL', 100000, true
		)
		RETURNING id
	`
	console.log("   ✅ Atom Prop account created (80% profit share)")

	// Account 3: Demo (empty)
	const [demoAccount] = await sql`
		INSERT INTO trading_accounts (
			id, user_id, name, description, is_default, account_type,
			default_commission, default_fees, default_currency
		) VALUES (
			gen_random_uuid(), ${adminUser.id}, 'Demo Account', 'Practice account - no real trades',
			false, 'personal', 0, 0, 'BRL'
		)
		RETURNING id
	`
	console.log("   ✅ Demo account created (empty)")

	// ==========================================
	// 4. Asset Types
	// ==========================================
	console.log("\n📦 Seeding asset types...")
	await sql`
		INSERT INTO asset_types (id, code, name, description, is_active) VALUES
			(gen_random_uuid(), 'FUTURE_INDEX', 'Future Index', 'Index futures contracts', true),
			(gen_random_uuid(), 'FUTURE_FX', 'Future FX', 'Currency futures contracts', true)
		ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
	`
	console.log("✅ Asset types seeded")

	// ==========================================
	// 5. Assets
	// ==========================================
	console.log("\n📦 Seeding assets...")
	const assetTypes = await sql`SELECT id, code FROM asset_types`
	const typeMap = new Map(assetTypes.map((t) => [t.code, t.id]))

	await sql`
		INSERT INTO assets (id, symbol, name, asset_type_id, tick_size, tick_value, currency, multiplier, is_active) VALUES
			(gen_random_uuid(), 'WINFUT', 'Mini Índice Bovespa', ${typeMap.get("FUTURE_INDEX")}, 5, 2000, 'BRL', 1, true),
			(gen_random_uuid(), 'WDOFUT', 'Mini Dólar', ${typeMap.get("FUTURE_FX")}, 0.5, 1000, 'BRL', 1, true)
		ON CONFLICT (symbol) DO UPDATE SET name = EXCLUDED.name, tick_size = EXCLUDED.tick_size, tick_value = EXCLUDED.tick_value
	`
	console.log("✅ Assets seeded")

	// Get asset IDs for account_assets
	const assetsData = await sql`SELECT id, symbol FROM assets`
	const assetMap = new Map(assetsData.map((a) => [a.symbol, a.id]))

	// ==========================================
	// 5.1 Account Assets (commission/fees per account)
	// ==========================================
	console.log("\n📦 Seeding account assets...")

	// Personal account - enable both assets with standard fees
	await sql`
		INSERT INTO account_assets (id, account_id, asset_id, is_enabled, commission_override, fees_override) VALUES
			(gen_random_uuid(), ${personalAccount.id}, ${assetMap.get("WINFUT")}, true, 30, 5),
			(gen_random_uuid(), ${personalAccount.id}, ${assetMap.get("WDOFUT")}, true, 30, 5)
	`

	// Prop account - enable both assets with slightly lower fees
	await sql`
		INSERT INTO account_assets (id, account_id, asset_id, is_enabled, commission_override, fees_override) VALUES
			(gen_random_uuid(), ${propAccount.id}, ${assetMap.get("WINFUT")}, true, 25, 4),
			(gen_random_uuid(), ${propAccount.id}, ${assetMap.get("WDOFUT")}, true, 25, 4)
	`

	// Demo account - enable both assets with zero fees
	await sql`
		INSERT INTO account_assets (id, account_id, asset_id, is_enabled, commission_override, fees_override) VALUES
			(gen_random_uuid(), ${demoAccount.id}, ${assetMap.get("WINFUT")}, true, 0, 0),
			(gen_random_uuid(), ${demoAccount.id}, ${assetMap.get("WDOFUT")}, true, 0, 0)
	`
	console.log("✅ Account assets seeded")

	// ==========================================
	// 6. Timeframes
	// ==========================================
	console.log("\n📦 Seeding timeframes...")
	await sql`
		INSERT INTO timeframes (id, code, name, type, value, unit, sort_order, is_active) VALUES
			(gen_random_uuid(), '1m', '1 Minute', 'time_based', 1, 'minutes', 1, true),
			(gen_random_uuid(), '5m', '5 Minutes', 'time_based', 5, 'minutes', 2, true),
			(gen_random_uuid(), '15m', '15 Minutes', 'time_based', 15, 'minutes', 3, true),
			(gen_random_uuid(), '1h', '1 Hour', 'time_based', 1, 'hours', 5, true),
			(gen_random_uuid(), '1d', 'Daily', 'time_based', 1, 'days', 7, true)
		ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order
	`
	console.log("✅ Timeframes seeded")

	// ==========================================
	// 7. Strategies (per account)
	// ==========================================
	console.log("\n📦 Seeding strategies...")

	// Delete existing global strategies and recreate per-account
	await sql`DELETE FROM strategies`

	// Personal account strategies
	await sql`
		INSERT INTO strategies (id, account_id, name, code, description, target_r_multiple, max_risk_percent, is_active) VALUES
			(gen_random_uuid(), ${personalAccount.id}, 'Breakout', 'BREAKOUT', 'Trade breakouts from consolidation', 2.0, 1.0, true),
			(gen_random_uuid(), ${personalAccount.id}, 'Trend Following', 'TREND', 'Follow established trends', 3.0, 2.0, true),
			(gen_random_uuid(), ${personalAccount.id}, 'Mean Reversion', 'REVERSION', 'Fade extreme moves back to mean', 1.5, 0.5, true),
			(gen_random_uuid(), ${personalAccount.id}, 'Support/Resistance', 'SR', 'Trade bounces from key levels', 2.0, 1.0, true)
	`

	// Prop account strategies (similar but separate)
	await sql`
		INSERT INTO strategies (id, account_id, name, code, description, target_r_multiple, max_risk_percent, is_active) VALUES
			(gen_random_uuid(), ${propAccount.id}, 'Breakout', 'BREAKOUT', 'Trade breakouts from consolidation', 2.0, 0.5, true),
			(gen_random_uuid(), ${propAccount.id}, 'Trend Following', 'TREND', 'Follow established trends', 3.0, 1.0, true),
			(gen_random_uuid(), ${propAccount.id}, 'Scalping', 'SCALP', 'Quick in-and-out trades', 1.0, 0.25, true)
	`

	// Demo account strategies
	await sql`
		INSERT INTO strategies (id, account_id, name, code, description, target_r_multiple, max_risk_percent, is_active) VALUES
			(gen_random_uuid(), ${demoAccount.id}, 'Test Strategy', 'TEST', 'For testing purposes', 1.0, 1.0, true)
	`
	console.log("✅ Strategies seeded (per account)")

	// ==========================================
	// 8. Tags (per account)
	// ==========================================
	console.log("\n📦 Seeding tags...")

	// Delete existing global tags and recreate per-account
	await sql`DELETE FROM tags`

	// Personal account tags
	await sql`
		INSERT INTO tags (id, account_id, name, type, color, description) VALUES
			(gen_random_uuid(), ${personalAccount.id}, 'Breakout', 'setup', '#22c55e', 'Price breaking out of consolidation'),
			(gen_random_uuid(), ${personalAccount.id}, 'Pullback', 'setup', '#3b82f6', 'Entry on pullback in trend'),
			(gen_random_uuid(), ${personalAccount.id}, 'Reversal', 'setup', '#8b5cf6', 'Counter-trend reversal trade'),
			(gen_random_uuid(), ${personalAccount.id}, 'Momentum', 'setup', '#f59e0b', 'Trading strong momentum moves'),
			(gen_random_uuid(), ${personalAccount.id}, 'FOMO', 'mistake', '#ef4444', 'Entered due to fear of missing out'),
			(gen_random_uuid(), ${personalAccount.id}, 'Revenge Trade', 'mistake', '#991b1b', 'Traded to recover losses'),
			(gen_random_uuid(), ${personalAccount.id}, 'No Plan', 'mistake', '#b91c1c', 'Entered without clear plan'),
			(gen_random_uuid(), ${personalAccount.id}, 'Overtrading', 'mistake', '#f97316', 'Took too many trades')
	`

	// Prop account tags
	await sql`
		INSERT INTO tags (id, account_id, name, type, color, description) VALUES
			(gen_random_uuid(), ${propAccount.id}, 'A+ Setup', 'setup', '#22c55e', 'Perfect textbook setup'),
			(gen_random_uuid(), ${propAccount.id}, 'B Setup', 'setup', '#3b82f6', 'Good setup, minor flaws'),
			(gen_random_uuid(), ${propAccount.id}, 'Scalp', 'setup', '#8b5cf6', 'Quick scalping trade'),
			(gen_random_uuid(), ${propAccount.id}, 'Risk Violation', 'mistake', '#ef4444', 'Violated risk rules'),
			(gen_random_uuid(), ${propAccount.id}, 'Early Exit', 'mistake', '#f97316', 'Exited too early')
	`

	// Demo account tags
	await sql`
		INSERT INTO tags (id, account_id, name, type, color, description) VALUES
			(gen_random_uuid(), ${demoAccount.id}, 'Test Tag', 'general', '#6b7280', 'For testing')
	`
	console.log("✅ Tags seeded (per account)")

	// ==========================================
	// 9. Settings (global)
	// ==========================================
	console.log("\n📦 Seeding settings...")
	await sql`
		INSERT INTO settings (id, key, value, description) VALUES
			(gen_random_uuid(), 'default_risk_percent', '1.0', 'Default risk percentage per trade'),
			(gen_random_uuid(), 'default_currency', 'BRL', 'Default currency for P&L display'),
			(gen_random_uuid(), 'timezone', 'America/Sao_Paulo', 'User timezone')
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
	`
	console.log("✅ Settings seeded")

	// ==========================================
	// 10. Trades - Personal Account (Week 1-2)
	// ==========================================
	console.log("\n📦 Seeding trades for Personal account...")

	// Get strategy IDs for personal account
	const personalStrategies = await sql`SELECT id, code FROM strategies WHERE account_id = ${personalAccount.id}`
	const personalStrategyMap = new Map(personalStrategies.map((s) => [s.code, s.id]))
	const timeframes = await sql`SELECT id, code FROM timeframes`
	const timeframeMap = new Map(timeframes.map((t) => [t.code, t.id]))

	const personalTrades = [
		// Jan 2 (Fri) - Big winning day
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-02 09:15:00+00", exit: "2026-01-02 10:45:00+00", entryP: 127500, exitP: 128200, size: 5, sl: 127200, tp: 128500, pnl: 700, outcome: "win", plan: true, strat: "BREAKOUT", thoughts: "Opening momentum breakout" },
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-02 11:30:00+00", exit: "2026-01-02 14:00:00+00", entryP: 128050, exitP: 129100, size: 8, sl: 127700, tp: 129500, pnl: 1680, outcome: "win", plan: true, strat: "TREND", thoughts: "Trend continuation" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-02 10:00:00+00", exit: "2026-01-02 11:30:00+00", entryP: 4985, exitP: 4962, size: 3, sl: 4995, tp: 4950, pnl: 1380, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar weakness" },

		// Jan 5 (Mon) - Breakeven day
		{ asset: "WINFUT", dir: "short", tf: "5m", entry: "2026-01-05 09:30:00+00", exit: "2026-01-05 10:15:00+00", entryP: 129200, exitP: 129450, size: 4, sl: 129500, tp: 128800, pnl: -200, outcome: "loss", plan: true, strat: "REVERSION", thoughts: "Failed breakdown" },
		{ asset: "WDOFUT", dir: "long", tf: "15m", entry: "2026-01-05 11:00:00+00", exit: "2026-01-05 13:30:00+00", entryP: 4958, exitP: 4975, size: 2, sl: 4945, tp: 4990, pnl: 340, outcome: "win", plan: true, strat: "SR", thoughts: "Dollar recovery" },

		// Jan 6 (Tue) - HUGE DRAWDOWN (revenge trading)
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-06 09:10:00+00", exit: "2026-01-06 09:35:00+00", entryP: 128800, exitP: 128200, size: 10, sl: 128500, tp: 129500, pnl: -1200, outcome: "loss", plan: false, strat: null, thoughts: "FOMO entry on gap" },
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-06 09:45:00+00", exit: "2026-01-06 10:10:00+00", entryP: 128100, exitP: 127500, size: 15, sl: 127800, tp: 128800, pnl: -1800, outcome: "loss", plan: false, strat: null, thoughts: "Revenge trade. Doubled down" },
		{ asset: "WINFUT", dir: "short", tf: "5m", entry: "2026-01-06 10:30:00+00", exit: "2026-01-06 11:00:00+00", entryP: 127600, exitP: 128000, size: 12, sl: 128100, tp: 127000, pnl: -960, outcome: "loss", plan: false, strat: null, thoughts: "Another revenge trade" },

		// Jan 7 (Wed) - Recovery
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-07 09:30:00+00", exit: "2026-01-07 12:30:00+00", entryP: 127200, exitP: 128500, size: 6, sl: 126800, tp: 128800, pnl: 1560, outcome: "win", plan: true, strat: "BREAKOUT", thoughts: "Clean setup. Waited for confirmation" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-07 10:00:00+00", exit: "2026-01-07 11:30:00+00", entryP: 5025, exitP: 4995, size: 4, sl: 5040, tp: 4980, pnl: 1200, outcome: "win", plan: true, strat: "REVERSION", thoughts: "Dollar reversal at resistance" },

		// Jan 8 (Thu) - Consistent wins
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-08 09:20:00+00", exit: "2026-01-08 10:45:00+00", entryP: 128600, exitP: 129200, size: 5, sl: 128300, tp: 129500, pnl: 600, outcome: "win", plan: true, strat: "BREAKOUT", thoughts: "Breakout with volume" },
		{ asset: "WINFUT", dir: "short", tf: "15m", entry: "2026-01-08 13:00:00+00", exit: "2026-01-08 15:00:00+00", entryP: 129500, exitP: 128800, size: 6, sl: 129800, tp: 128500, pnl: 840, outcome: "win", plan: true, strat: "REVERSION", thoughts: "End of day reversal" },

		// Jan 9 (Fri) - Bad day
		{ asset: "WDOFUT", dir: "long", tf: "5m", entry: "2026-01-09 09:30:00+00", exit: "2026-01-09 10:00:00+00", entryP: 4980, exitP: 4955, size: 5, sl: 4965, tp: 5010, pnl: -1250, outcome: "loss", plan: false, strat: null, thoughts: "Wrong read on dollar" },
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-09 10:30:00+00", exit: "2026-01-09 11:15:00+00", entryP: 128200, exitP: 127700, size: 8, sl: 127900, tp: 128700, pnl: -800, outcome: "loss", plan: true, strat: "BREAKOUT", thoughts: "Stopped on volatility spike" },
	]

	for (const t of personalTrades) {
		const timeframeId = timeframeMap.get(t.tf) || null
		const strategyId = t.strat ? personalStrategyMap.get(t.strat) : null
		const riskValues = calculateRiskValues(t.dir, t.entryP, t.sl, t.size, t.pnl)

		await sql`
			INSERT INTO trades (
				id, account_id, asset, direction, timeframe_id, entry_date, exit_date,
				entry_price, exit_price, position_size, stop_loss, take_profit,
				planned_risk_amount, realized_r_multiple,
				pnl, outcome, followed_plan, strategy_id, pre_trade_thoughts, is_archived
			) VALUES (
				gen_random_uuid(), ${personalAccount.id}, ${t.asset}, ${t.dir}, ${timeframeId}, ${t.entry}, ${t.exit},
				${t.entryP}, ${t.exitP}, ${t.size}, ${t.sl}, ${t.tp},
				${riskValues.plannedRiskAmount}, ${riskValues.realizedRMultiple},
				${toCents(t.pnl)}, ${t.outcome}, ${t.plan}, ${strategyId}, ${t.thoughts}, false
			)
		`
	}
	console.log(`✅ Personal account trades seeded (${personalTrades.length} trades)`)

	// ==========================================
	// 11. Trades - Prop Account (Week 2-3)
	// ==========================================
	console.log("\n📦 Seeding trades for Prop account...")

	// Get strategy IDs for prop account
	const propStrategies = await sql`SELECT id, code FROM strategies WHERE account_id = ${propAccount.id}`
	const propStrategyMap = new Map(propStrategies.map((s) => [s.code, s.id]))

	const propTrades = [
		// Jan 12 (Mon) - BIG WINNING DAY
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-12 09:15:00+00", exit: "2026-01-12 11:00:00+00", entryP: 127000, exitP: 128500, size: 10, sl: 126700, tp: 129000, pnl: 3000, outcome: "win", plan: true, strat: "TREND", thoughts: "Perfect trend day" },
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-12 11:30:00+00", exit: "2026-01-12 14:30:00+00", entryP: 128400, exitP: 129800, size: 12, sl: 128100, tp: 130000, pnl: 3360, outcome: "win", plan: true, strat: "TREND", thoughts: "Trend continuation" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-12 10:00:00+00", exit: "2026-01-12 12:00:00+00", entryP: 5050, exitP: 4990, size: 6, sl: 5070, tp: 4970, pnl: 3600, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar collapse" },

		// Jan 13 (Tue) - Mixed day
		{ asset: "WINFUT", dir: "short", tf: "5m", entry: "2026-01-13 09:30:00+00", exit: "2026-01-13 10:30:00+00", entryP: 129800, exitP: 129300, size: 5, sl: 130100, tp: 129000, pnl: 500, outcome: "win", plan: true, strat: "SCALP", thoughts: "Quick scalp on overbought" },
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-13 11:00:00+00", exit: "2026-01-13 11:45:00+00", entryP: 129200, exitP: 128800, size: 6, sl: 128900, tp: 129800, pnl: -480, outcome: "loss", plan: true, strat: "BREAKOUT", thoughts: "False breakout" },
		{ asset: "WDOFUT", dir: "long", tf: "15m", entry: "2026-01-13 13:00:00+00", exit: "2026-01-13 15:30:00+00", entryP: 4975, exitP: 5010, size: 4, sl: 4960, tp: 5030, pnl: 1400, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar afternoon rally" },

		// Jan 14 (Wed) - HUGE WINNING DAY
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-14 09:10:00+00", exit: "2026-01-14 12:00:00+00", entryP: 128000, exitP: 130200, size: 15, sl: 127700, tp: 130500, pnl: 6600, outcome: "win", plan: true, strat: "BREAKOUT", thoughts: "Gap up continuation. A+ setup" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-14 09:30:00+00", exit: "2026-01-14 11:30:00+00", entryP: 5080, exitP: 5020, size: 8, sl: 5100, tp: 5000, pnl: 4800, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar weakness correlation" },

		// Jan 15 (Thu) - Small loss
		{ asset: "WINFUT", dir: "short", tf: "5m", entry: "2026-01-15 09:30:00+00", exit: "2026-01-15 10:15:00+00", entryP: 130100, exitP: 130400, size: 5, sl: 130500, tp: 129600, pnl: -300, outcome: "loss", plan: true, strat: "SCALP", thoughts: "Counter-trend fade failed" },
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-15 11:00:00+00", exit: "2026-01-15 13:00:00+00", entryP: 130300, exitP: 130150, size: 4, sl: 130000, tp: 130800, pnl: -120, outcome: "loss", plan: true, strat: "BREAKOUT", thoughts: "Chopped out on range day" },

		// Jan 16 (Fri) - Solid day
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-16 09:20:00+00", exit: "2026-01-16 11:00:00+00", entryP: 129800, exitP: 130700, size: 8, sl: 129500, tp: 131000, pnl: 1440, outcome: "win", plan: true, strat: "BREAKOUT", thoughts: "Strong open momentum" },
		{ asset: "WDOFUT", dir: "long", tf: "5m", entry: "2026-01-16 10:00:00+00", exit: "2026-01-16 12:00:00+00", entryP: 5005, exitP: 5045, size: 5, sl: 4990, tp: 5060, pnl: 2000, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar strength on risk-off" },

		// Jan 19 (Mon) - Controlled day (unlike personal account)
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-19 10:30:00+00", exit: "2026-01-19 13:00:00+00", entryP: 130200, exitP: 131000, size: 6, sl: 129900, tp: 131500, pnl: 960, outcome: "win", plan: true, strat: "TREND", thoughts: "Waited for confirmation, paid off" },

		// Jan 20 (Tue) - Nice day
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-20 09:30:00+00", exit: "2026-01-20 13:00:00+00", entryP: 129500, exitP: 131000, size: 6, sl: 129100, tp: 131500, pnl: 1800, outcome: "win", plan: true, strat: "TREND", thoughts: "Patient entry" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-20 10:30:00+00", exit: "2026-01-20 12:00:00+00", entryP: 5080, exitP: 5050, size: 4, sl: 5095, tp: 5030, pnl: 1200, outcome: "win", plan: true, strat: "SCALP", thoughts: "Dollar weakness scalp" },

		// Jan 21 (Wed) - Consistent
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-21 09:20:00+00", exit: "2026-01-21 10:30:00+00", entryP: 130800, exitP: 131400, size: 5, sl: 130500, tp: 131800, pnl: 600, outcome: "win", plan: true, strat: "BREAKOUT", thoughts: "Breakout continuation" },
		{ asset: "WINFUT", dir: "short", tf: "5m", entry: "2026-01-21 13:00:00+00", exit: "2026-01-21 14:00:00+00", entryP: 131600, exitP: 131200, size: 4, sl: 131900, tp: 130800, pnl: 320, outcome: "win", plan: true, strat: "SCALP", thoughts: "End of day profit taking scalp" },

		// Jan 22 (Thu) - Small loss
		{ asset: "WDOFUT", dir: "long", tf: "5m", entry: "2026-01-22 09:30:00+00", exit: "2026-01-22 10:15:00+00", entryP: 5040, exitP: 5020, size: 3, sl: 5025, tp: 5070, pnl: -600, outcome: "loss", plan: true, strat: "BREAKOUT", thoughts: "Wrong direction. Quick exit" },
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-22 11:00:00+00", exit: "2026-01-22 14:00:00+00", entryP: 131000, exitP: 131600, size: 5, sl: 130700, tp: 132000, pnl: 600, outcome: "win", plan: true, strat: "TREND", thoughts: "Recovered with clean setup" },

		// Jan 23 (Fri) - Good day
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-23 09:15:00+00", exit: "2026-01-23 11:30:00+00", entryP: 131200, exitP: 132500, size: 8, sl: 130900, tp: 132800, pnl: 2080, outcome: "win", plan: true, strat: "TREND", thoughts: "Strong trend day" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-23 10:00:00+00", exit: "2026-01-23 12:00:00+00", entryP: 5065, exitP: 5025, size: 5, sl: 5080, tp: 5000, pnl: 2000, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar selloff with index rally" },
	]

	for (const t of propTrades) {
		const timeframeId = timeframeMap.get(t.tf) || null
		const strategyId = t.strat ? propStrategyMap.get(t.strat) : null
		const riskValues = calculateRiskValues(t.dir, t.entryP, t.sl, t.size, t.pnl)

		await sql`
			INSERT INTO trades (
				id, account_id, asset, direction, timeframe_id, entry_date, exit_date,
				entry_price, exit_price, position_size, stop_loss, take_profit,
				planned_risk_amount, realized_r_multiple,
				pnl, outcome, followed_plan, strategy_id, pre_trade_thoughts, is_archived
			) VALUES (
				gen_random_uuid(), ${propAccount.id}, ${t.asset}, ${t.dir}, ${timeframeId}, ${t.entry}, ${t.exit},
				${t.entryP}, ${t.exitP}, ${t.size}, ${t.sl}, ${t.tp},
				${riskValues.plannedRiskAmount}, ${riskValues.realizedRMultiple},
				${toCents(t.pnl)}, ${t.outcome}, ${t.plan}, ${strategyId}, ${t.thoughts}, false
			)
		`
	}
	console.log(`✅ Prop account trades seeded (${propTrades.length} trades)`)

	// ==========================================
	// 12. Verify
	// ==========================================
	console.log("\n📊 Verifying seeded data...")
	const counts = await sql`
		SELECT
			(SELECT COUNT(*) FROM users) as users,
			(SELECT COUNT(*) FROM trading_accounts) as accounts,
			(SELECT COUNT(*) FROM asset_types) as asset_types,
			(SELECT COUNT(*) FROM assets) as assets,
			(SELECT COUNT(*) FROM timeframes) as timeframes,
			(SELECT COUNT(*) FROM strategies) as strategies,
			(SELECT COUNT(*) FROM tags) as tags,
			(SELECT COUNT(*) FROM trades) as trades,
			(SELECT COUNT(*) FROM settings) as settings
	`

	const c = counts[0]
	console.log(`   Users:          ${c.users}`)
	console.log(`   Accounts:       ${c.accounts}`)
	console.log(`   Asset Types:    ${c.asset_types}`)
	console.log(`   Assets:         ${c.assets}`)
	console.log(`   Timeframes:     ${c.timeframes}`)
	console.log(`   Strategies:     ${c.strategies}`)
	console.log(`   Tags:           ${c.tags}`)
	console.log(`   Trades:         ${c.trades}`)
	console.log(`   Settings:       ${c.settings}`)

	// Account-specific counts
	const accountCounts = await sql`
		SELECT
			ta.name as account_name,
			ta.account_type,
			(SELECT COUNT(*) FROM trades WHERE account_id = ta.id) as trade_count,
			(SELECT COUNT(*) FROM strategies WHERE account_id = ta.id) as strategy_count,
			(SELECT COUNT(*) FROM tags WHERE account_id = ta.id) as tag_count
		FROM trading_accounts ta
		ORDER BY ta.is_default DESC, ta.name
	`

	console.log("\n📊 Per-account breakdown:")
	for (const acc of accountCounts) {
		console.log(`   ${acc.account_name} (${acc.account_type}):`)
		console.log(`      - Trades: ${acc.trade_count}`)
		console.log(`      - Strategies: ${acc.strategy_count}`)
		console.log(`      - Tags: ${acc.tag_count}`)
	}

	console.log("\n🎉 Seed completed!")
	console.log("\n📝 Login credentials:")
	console.log(`   Email:    ${ADMIN_EMAIL}`)
	console.log(`   Password: ${ADMIN_PASSWORD}`)
}

runSeed().catch((error) => {
	console.error("Seed failed:", error)
	process.exit(1)
})
