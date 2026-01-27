import "dotenv/config"
import { neon } from "@neondatabase/serverless"

/**
 * Seed script for profitJournal
 * Run with: pnpm db:seed
 *
 * January 2026 Calendar Reference:
 * Thu 1, Fri 2, Sat 3, Sun 4, Mon 5, Tue 6, Wed 7, Thu 8, Fri 9, Sat 10, Sun 11,
 * Mon 12, Tue 13, Wed 14, Thu 15, Fri 16, Sat 17, Sun 18, Mon 19, Tue 20, Wed 21,
 * Thu 22, Fri 23, Sat 24, Sun 25, Mon 26, Tue 27, Wed 28, Thu 29, Fri 30, Sat 31
 */

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

	// 1. Asset Types (only futures)
	console.log("📦 Seeding asset types...")
	await sql`
		INSERT INTO asset_types (id, code, name, description, is_active) VALUES
			(gen_random_uuid(), 'FUTURE_INDEX', 'Future Index', 'Index futures contracts', true),
			(gen_random_uuid(), 'FUTURE_FX', 'Future FX', 'Currency futures contracts', true)
		ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
	`
	console.log("✅ Asset types seeded")

	// 2. Assets (only WINFUT and WDOFUT)
	console.log("\n📦 Seeding assets...")
	const assetTypes = await sql`SELECT id, code FROM asset_types`
	const typeMap = new Map(assetTypes.map((t) => [t.code, t.id]))

	await sql`
		INSERT INTO assets (id, symbol, name, asset_type_id, tick_size, tick_value, currency, multiplier, commission, fees, is_active) VALUES
			(gen_random_uuid(), 'WINFUT', 'Mini Índice Bovespa', ${typeMap.get("FUTURE_INDEX")}, 5, 20, 'BRL', 1, 30, 5, true),
			(gen_random_uuid(), 'WDOFUT', 'Mini Dólar', ${typeMap.get("FUTURE_FX")}, 0.5, 1000, 'BRL', 1, 30, 5, true)
		ON CONFLICT (symbol) DO UPDATE SET name = EXCLUDED.name, tick_size = EXCLUDED.tick_size, tick_value = EXCLUDED.tick_value
	`
	console.log("✅ Assets seeded")

	// 3. Timeframes
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

	// 4. Strategies
	console.log("\n📦 Seeding strategies...")
	await sql`
		INSERT INTO strategies (id, name, code, description, target_r_multiple, max_risk_percent, is_active) VALUES
			(gen_random_uuid(), 'Breakout', 'BREAKOUT', 'Trade breakouts from consolidation', 2.0, 1.0, true),
			(gen_random_uuid(), 'Trend Following', 'TREND', 'Follow established trends', 3.0, 2.0, true),
			(gen_random_uuid(), 'Mean Reversion', 'REVERSION', 'Fade extreme moves back to mean', 1.5, 0.5, true),
			(gen_random_uuid(), 'Support/Resistance', 'SR', 'Trade bounces from key levels', 2.0, 1.0, true)
		ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
	`
	console.log("✅ Strategies seeded")

	// 5. Tags
	console.log("\n📦 Seeding tags...")
	await sql`
		INSERT INTO tags (id, name, type, color, description) VALUES
			(gen_random_uuid(), 'Breakout', 'setup', '#22c55e', 'Price breaking out of consolidation'),
			(gen_random_uuid(), 'Pullback', 'setup', '#3b82f6', 'Entry on pullback in trend'),
			(gen_random_uuid(), 'Reversal', 'setup', '#8b5cf6', 'Counter-trend reversal trade'),
			(gen_random_uuid(), 'Momentum', 'setup', '#f59e0b', 'Trading strong momentum moves'),
			(gen_random_uuid(), 'FOMO', 'mistake', '#ef4444', 'Entered due to fear of missing out'),
			(gen_random_uuid(), 'Revenge Trade', 'mistake', '#991b1b', 'Traded to recover losses'),
			(gen_random_uuid(), 'No Plan', 'mistake', '#b91c1c', 'Entered without clear plan'),
			(gen_random_uuid(), 'Overtrading', 'mistake', '#f97316', 'Took too many trades')
		ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, color = EXCLUDED.color
	`
	console.log("✅ Tags seeded")

	// 6. Settings
	console.log("\n📦 Seeding settings...")
	await sql`
		INSERT INTO settings (id, key, value, description) VALUES
			(gen_random_uuid(), 'default_risk_percent', '1.0', 'Default risk percentage per trade'),
			(gen_random_uuid(), 'default_currency', 'BRL', 'Default currency for P&L display'),
			(gen_random_uuid(), 'account_balance', '10000', 'Current account balance'),
			(gen_random_uuid(), 'max_daily_loss', '500', 'Maximum allowed daily loss'),
			(gen_random_uuid(), 'timezone', 'America/Sao_Paulo', 'User timezone')
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
	`
	console.log("✅ Settings seeded")

	// 7. Trades
	console.log("\n📦 Seeding trades...")

	const strategies = await sql`SELECT id, code FROM strategies`
	const strategyMap = new Map(strategies.map((s) => [s.code, s.id]))
	const timeframes = await sql`SELECT id, code FROM timeframes`
	const timeframeMap = new Map(timeframes.map((t) => [t.code, t.id]))

	// Clear existing trades
	await sql`DELETE FROM trade_tags`
	await sql`DELETE FROM trades`

	const trades = [
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

		// Jan 12 (Mon) - BIG WINNING DAY
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-12 09:15:00+00", exit: "2026-01-12 11:00:00+00", entryP: 127000, exitP: 128500, size: 10, sl: 126700, tp: 129000, pnl: 3000, outcome: "win", plan: true, strat: "TREND", thoughts: "Perfect trend day" },
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-12 11:30:00+00", exit: "2026-01-12 14:30:00+00", entryP: 128400, exitP: 129800, size: 12, sl: 128100, tp: 130000, pnl: 3360, outcome: "win", plan: true, strat: "TREND", thoughts: "Trend continuation" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-12 10:00:00+00", exit: "2026-01-12 12:00:00+00", entryP: 5050, exitP: 4990, size: 6, sl: 5070, tp: 4970, pnl: 3600, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar collapse" },

		// Jan 13 (Tue) - Mixed day
		{ asset: "WINFUT", dir: "short", tf: "5m", entry: "2026-01-13 09:30:00+00", exit: "2026-01-13 10:30:00+00", entryP: 129800, exitP: 129300, size: 5, sl: 130100, tp: 129000, pnl: 500, outcome: "win", plan: true, strat: "REVERSION", thoughts: "Overbought reversal" },
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-13 11:00:00+00", exit: "2026-01-13 11:45:00+00", entryP: 129200, exitP: 128800, size: 6, sl: 128900, tp: 129800, pnl: -480, outcome: "loss", plan: true, strat: "BREAKOUT", thoughts: "False breakout" },
		{ asset: "WDOFUT", dir: "long", tf: "15m", entry: "2026-01-13 13:00:00+00", exit: "2026-01-13 15:30:00+00", entryP: 4975, exitP: 5010, size: 4, sl: 4960, tp: 5030, pnl: 1400, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar afternoon rally" },

		// Jan 14 (Wed) - HUGE WINNING DAY
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-14 09:10:00+00", exit: "2026-01-14 12:00:00+00", entryP: 128000, exitP: 130200, size: 15, sl: 127700, tp: 130500, pnl: 6600, outcome: "win", plan: true, strat: "BREAKOUT", thoughts: "Gap up continuation. A+ setup" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-14 09:30:00+00", exit: "2026-01-14 11:30:00+00", entryP: 5080, exitP: 5020, size: 8, sl: 5100, tp: 5000, pnl: 4800, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar weakness correlation" },

		// Jan 15 (Thu) - Small loss
		{ asset: "WINFUT", dir: "short", tf: "5m", entry: "2026-01-15 09:30:00+00", exit: "2026-01-15 10:15:00+00", entryP: 130100, exitP: 130400, size: 5, sl: 130500, tp: 129600, pnl: -300, outcome: "loss", plan: true, strat: "REVERSION", thoughts: "Counter-trend fade failed" },
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-15 11:00:00+00", exit: "2026-01-15 13:00:00+00", entryP: 130300, exitP: 130150, size: 4, sl: 130000, tp: 130800, pnl: -120, outcome: "loss", plan: true, strat: "SR", thoughts: "Chopped out on range day" },

		// Jan 16 (Fri) - Solid day
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-16 09:20:00+00", exit: "2026-01-16 11:00:00+00", entryP: 129800, exitP: 130700, size: 8, sl: 129500, tp: 131000, pnl: 1440, outcome: "win", plan: true, strat: "BREAKOUT", thoughts: "Strong open momentum" },
		{ asset: "WDOFUT", dir: "long", tf: "5m", entry: "2026-01-16 10:00:00+00", exit: "2026-01-16 12:00:00+00", entryP: 5005, exitP: 5045, size: 5, sl: 4990, tp: 5060, pnl: 2000, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar strength on risk-off" },

		// Jan 19 (Mon) - DRAWDOWN (overtrading)
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-19 09:10:00+00", exit: "2026-01-19 09:30:00+00", entryP: 130500, exitP: 130100, size: 8, sl: 130200, tp: 131000, pnl: -640, outcome: "loss", plan: false, strat: null, thoughts: "Early entry no confirmation" },
		{ asset: "WINFUT", dir: "short", tf: "5m", entry: "2026-01-19 09:45:00+00", exit: "2026-01-19 10:15:00+00", entryP: 130200, exitP: 130600, size: 10, sl: 130700, tp: 129700, pnl: -800, outcome: "loss", plan: false, strat: null, thoughts: "Flip-flopping direction" },
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-19 10:30:00+00", exit: "2026-01-19 11:00:00+00", entryP: 130500, exitP: 130000, size: 8, sl: 130100, tp: 131000, pnl: -800, outcome: "loss", plan: false, strat: null, thoughts: "More revenge trading" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-19 11:30:00+00", exit: "2026-01-19 12:30:00+00", entryP: 5035, exitP: 5055, size: 5, sl: 5055, tp: 5000, pnl: -1000, outcome: "loss", plan: false, strat: "REVERSION", thoughts: "Stopped at the exact high" },

		// Jan 20 (Tue) - Recovery
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-20 09:30:00+00", exit: "2026-01-20 13:00:00+00", entryP: 129500, exitP: 131000, size: 6, sl: 129100, tp: 131500, pnl: 1800, outcome: "win", plan: true, strat: "TREND", thoughts: "Patient entry. Waited for setup" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-20 10:30:00+00", exit: "2026-01-20 12:00:00+00", entryP: 5080, exitP: 5050, size: 4, sl: 5095, tp: 5030, pnl: 1200, outcome: "win", plan: true, strat: "REVERSION", thoughts: "Dollar weakness on index strength" },

		// Jan 21 (Wed) - Consistent
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-21 09:20:00+00", exit: "2026-01-21 10:30:00+00", entryP: 130800, exitP: 131400, size: 5, sl: 130500, tp: 131800, pnl: 600, outcome: "win", plan: true, strat: "BREAKOUT", thoughts: "Breakout continuation" },
		{ asset: "WINFUT", dir: "short", tf: "5m", entry: "2026-01-21 13:00:00+00", exit: "2026-01-21 14:00:00+00", entryP: 131600, exitP: 131200, size: 4, sl: 131900, tp: 130800, pnl: 320, outcome: "win", plan: true, strat: "REVERSION", thoughts: "End of day profit taking" },

		// Jan 22 (Thu) - Small loss
		{ asset: "WDOFUT", dir: "long", tf: "5m", entry: "2026-01-22 09:30:00+00", exit: "2026-01-22 10:15:00+00", entryP: 5040, exitP: 5020, size: 3, sl: 5025, tp: 5070, pnl: -600, outcome: "loss", plan: true, strat: "BREAKOUT", thoughts: "Wrong direction. Quick exit" },
		{ asset: "WINFUT", dir: "long", tf: "15m", entry: "2026-01-22 11:00:00+00", exit: "2026-01-22 14:00:00+00", entryP: 131000, exitP: 131600, size: 5, sl: 130700, tp: 132000, pnl: 600, outcome: "win", plan: true, strat: "TREND", thoughts: "Recovered with clean setup" },

		// Jan 23 (Fri) - Good day
		{ asset: "WINFUT", dir: "long", tf: "5m", entry: "2026-01-23 09:15:00+00", exit: "2026-01-23 11:30:00+00", entryP: 131200, exitP: 132500, size: 8, sl: 130900, tp: 132800, pnl: 2080, outcome: "win", plan: true, strat: "TREND", thoughts: "Strong trend day" },
		{ asset: "WDOFUT", dir: "short", tf: "5m", entry: "2026-01-23 10:00:00+00", exit: "2026-01-23 12:00:00+00", entryP: 5065, exitP: 5025, size: 5, sl: 5080, tp: 5000, pnl: 2000, outcome: "win", plan: true, strat: "TREND", thoughts: "Dollar selloff with index rally" },
	]

	for (const t of trades) {
		const timeframeId = timeframeMap.get(t.tf) || null
		const strategyId = t.strat ? strategyMap.get(t.strat) : null

		await sql`
			INSERT INTO trades (
				id, asset, direction, timeframe_id, entry_date, exit_date,
				entry_price, exit_price, position_size, stop_loss, take_profit,
				pnl, outcome, followed_plan, strategy_id, pre_trade_thoughts, is_archived
			) VALUES (
				gen_random_uuid(), ${t.asset}, ${t.dir}, ${timeframeId}, ${t.entry}, ${t.exit},
				${t.entryP}, ${t.exitP}, ${t.size}, ${t.sl}, ${t.tp},
				${toCents(t.pnl)}, ${t.outcome}, ${t.plan}, ${strategyId}, ${t.thoughts}, false
			)
		`
	}
	console.log(`✅ Trades seeded (${trades.length} trades)`)

	// 8. Verify
	console.log("\n📊 Verifying seeded data...")
	const counts = await sql`
		SELECT
			(SELECT COUNT(*) FROM asset_types) as asset_types,
			(SELECT COUNT(*) FROM assets) as assets,
			(SELECT COUNT(*) FROM timeframes) as timeframes,
			(SELECT COUNT(*) FROM strategies) as strategies,
			(SELECT COUNT(*) FROM tags) as tags,
			(SELECT COUNT(*) FROM trades) as trades,
			(SELECT COUNT(*) FROM settings) as settings
	`

	const c = counts[0]
	console.log(`   Asset Types: ${c.asset_types}`)
	console.log(`   Assets:      ${c.assets}`)
	console.log(`   Timeframes:  ${c.timeframes}`)
	console.log(`   Strategies:  ${c.strategies}`)
	console.log(`   Tags:        ${c.tags}`)
	console.log(`   Trades:      ${c.trades}`)
	console.log(`   Settings:    ${c.settings}`)

	console.log("\n🎉 Seed completed!")
}

runSeed().catch((error) => {
	console.error("Seed failed:", error)
	process.exit(1)
})
