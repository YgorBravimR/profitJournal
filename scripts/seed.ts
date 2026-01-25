import "dotenv/config"
import { neon } from "@neondatabase/serverless"

const runSeed = async () => {
	const databaseUrl = process.env.DATABASE_URL
	if (!databaseUrl) {
		console.error("❌ DATABASE_URL environment variable is not set")
		process.exit(1)
	}

	const sql = neon(databaseUrl)

	console.log("🔗 Connected to database\n")

	// 1. Seed Asset Types
	console.log("📦 Seeding asset types...")
	try {
		await sql`
			INSERT INTO asset_types (id, code, name, description, is_active) VALUES
				(gen_random_uuid(), 'FUTURE_INDEX', 'Future Index', 'Index futures contracts (e.g., Mini Índice, E-mini S&P)', true),
				(gen_random_uuid(), 'FUTURE_FX', 'Future FX', 'Currency futures contracts (e.g., Mini Dólar)', true),
				(gen_random_uuid(), 'STOCK', 'Stock', 'Individual equities and shares', true),
				(gen_random_uuid(), 'CRYPTO', 'Cryptocurrency', 'Digital currencies and tokens', true),
				(gen_random_uuid(), 'FOREX', 'Forex', 'Foreign exchange spot pairs', true),
				(gen_random_uuid(), 'OPTION', 'Option', 'Options contracts', true),
				(gen_random_uuid(), 'ETF', 'ETF', 'Exchange-traded funds', true)
			ON CONFLICT (code) DO UPDATE SET
				name = EXCLUDED.name,
				description = EXCLUDED.description
		`
		console.log("✅ Asset types seeded")
	} catch (error) {
		console.error("❌ Asset types error:", error)
	}

	// 2. Seed Assets
	console.log("\n📦 Seeding assets...")
	try {
		const assetTypes = await sql`SELECT id, code FROM asset_types`
		const typeMap = new Map(assetTypes.map((t) => [t.code, t.id]))

		const futureIndexId = typeMap.get("FUTURE_INDEX")
		const futureFxId = typeMap.get("FUTURE_FX")
		const stockId = typeMap.get("STOCK")
		const cryptoId = typeMap.get("CRYPTO")
		const forexId = typeMap.get("FOREX")

		// NOTE: tick_value, commission, fees stored in CENTS (integers)
		await sql`
			INSERT INTO assets (id, symbol, name, asset_type_id, tick_size, tick_value, currency, multiplier, commission, fees, is_active) VALUES
				(gen_random_uuid(), 'WINFUT', 'Mini Índice Bovespa', ${futureIndexId}, 5, 20, 'BRL', 1, 30, 5, true),
				(gen_random_uuid(), 'WDOFUT', 'Mini Dólar', ${futureFxId}, 0.5, 1000, 'BRL', 1, 30, 5, true),
				(gen_random_uuid(), 'INDFUT', 'Índice Cheio', ${futureIndexId}, 5, 100, 'BRL', 1, 30, 5, true),
				(gen_random_uuid(), 'DOLFUT', 'Dólar Cheio', ${futureFxId}, 0.5, 5000, 'BRL', 1, 30, 5, true),
				(gen_random_uuid(), 'PETR4', 'Petrobras PN', ${stockId}, 0.01, 1, 'BRL', 1, 0, 0, true),
				(gen_random_uuid(), 'VALE3', 'Vale ON', ${stockId}, 0.01, 1, 'BRL', 1, 0, 0, true),
				(gen_random_uuid(), 'ITUB4', 'Itaú Unibanco PN', ${stockId}, 0.01, 1, 'BRL', 1, 0, 0, true),
				(gen_random_uuid(), 'BBDC4', 'Bradesco PN', ${stockId}, 0.01, 1, 'BRL', 1, 0, 0, true),
				(gen_random_uuid(), 'BTCUSD', 'Bitcoin', ${cryptoId}, 0.01, 1, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'ETHUSD', 'Ethereum', ${cryptoId}, 0.01, 1, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'SOLUSD', 'Solana', ${cryptoId}, 0.01, 1, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'AVAXUSD', 'Avalanche', ${cryptoId}, 0.01, 1, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'LINKUSD', 'Chainlink', ${cryptoId}, 0.01, 1, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'DOGEUSD', 'Dogecoin', ${cryptoId}, 0.00001, 1, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'MATICUSD', 'Polygon', ${cryptoId}, 0.0001, 1, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'EURUSD', 'EUR/USD', ${forexId}, 0.0001, 1000, 'USD', 100000, 0, 0, true),
				(gen_random_uuid(), 'GBPUSD', 'GBP/USD', ${forexId}, 0.0001, 1000, 'USD', 100000, 0, 0, true),
				(gen_random_uuid(), 'XAUUSD', 'Gold', ${forexId}, 0.01, 1, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'ES', 'E-mini S&P 500', ${futureIndexId}, 0.25, 1250, 'USD', 1, 225, 0, true),
				(gen_random_uuid(), 'NQ', 'E-mini Nasdaq', ${futureIndexId}, 0.25, 500, 'USD', 1, 225, 0, true)
			ON CONFLICT (symbol) DO UPDATE SET
				name = EXCLUDED.name,
				tick_size = EXCLUDED.tick_size,
				tick_value = EXCLUDED.tick_value,
				commission = EXCLUDED.commission,
				fees = EXCLUDED.fees
		`
		console.log("✅ Assets seeded")
	} catch (error) {
		console.error("❌ Assets error:", error)
	}

	// 3. Seed Timeframes
	console.log("\n📦 Seeding timeframes...")
	try {
		await sql`
			INSERT INTO timeframes (id, code, name, type, value, unit, sort_order, is_active) VALUES
				(gen_random_uuid(), '1m', '1 Minute', 'time_based', 1, 'minutes', 1, true),
				(gen_random_uuid(), '5m', '5 Minutes', 'time_based', 5, 'minutes', 2, true),
				(gen_random_uuid(), '15m', '15 Minutes', 'time_based', 15, 'minutes', 3, true),
				(gen_random_uuid(), '30m', '30 Minutes', 'time_based', 30, 'minutes', 4, true),
				(gen_random_uuid(), '1h', '1 Hour', 'time_based', 1, 'hours', 5, true),
				(gen_random_uuid(), '4h', '4 Hours', 'time_based', 4, 'hours', 6, true),
				(gen_random_uuid(), '1d', 'Daily', 'time_based', 1, 'days', 7, true),
				(gen_random_uuid(), '1w', 'Weekly', 'time_based', 1, 'weeks', 8, true),
				(gen_random_uuid(), '5R', 'Renko 5', 'renko', 5, 'ticks', 10, true),
				(gen_random_uuid(), '10R', 'Renko 10', 'renko', 10, 'ticks', 11, true),
				(gen_random_uuid(), '13R', 'Renko 13', 'renko', 13, 'ticks', 12, true),
				(gen_random_uuid(), '15R', 'Renko 15', 'renko', 15, 'ticks', 13, true)
			ON CONFLICT (code) DO UPDATE SET
				name = EXCLUDED.name,
				sort_order = EXCLUDED.sort_order
		`
		console.log("✅ Timeframes seeded")
	} catch (error) {
		console.error("❌ Timeframes error:", error)
	}

	// 4. Seed Strategies
	console.log("\n📦 Seeding strategies...")
	try {
		await sql`
			INSERT INTO strategies (id, name, code, description, entry_criteria, exit_criteria, risk_rules, target_r_multiple, max_risk_percent, is_active) VALUES
				(gen_random_uuid(), 'Breakout', 'BREAKOUT', 'Trade breakouts from consolidation patterns',
					'Price breaks above resistance with volume confirmation. Wait for retest if possible. Look for increasing volume on breakout candle.',
					'Exit at 2R target or when momentum fades. Trail stop to breakeven after 1R. Consider partial profits at 1.5R.',
					'Max 1% risk per trade. Stop below breakout level or last swing low. Never move stop further away.',
					2.0, 1.0, true),
				(gen_random_uuid(), 'Trend Following', 'TREND', 'Follow established trends using moving averages',
					'Enter on pullback to 20/50 EMA in trend direction. Price must be above/below 200 EMA for trend confirmation. Wait for rejection candle.',
					'Trail stop using ATR or swing points. Let winners run. Exit when price closes below trailing MA.',
					'Max 2% risk. Scale in on strength. Add to winners only, never to losers.',
					3.0, 2.0, true),
				(gen_random_uuid(), 'Mean Reversion', 'REVERSION', 'Fade extreme moves back to mean',
					'Enter when price deviates 2+ standard deviations from VWAP or moving average. Look for exhaustion candles and divergence.',
					'Exit at mean (VWAP/MA) or opposite deviation. Quick exits if momentum continues against position.',
					'Tight stops, quick exits if momentum continues. Smaller position sizes due to counter-trend nature.',
					1.5, 0.5, true),
				(gen_random_uuid(), 'Scalping', 'SCALP', 'Quick in-and-out trades on small timeframes',
					'Level 2 and tape reading for entries. Focus on high-volume moments. Trade with momentum, not against it.',
					'Quick profit targets of 5-10 ticks. Cut losses immediately if trade doesnt work within 30 seconds.',
					'Very tight risk, high win rate required. Max 0.25% risk per trade. Many small wins.',
					1.0, 0.25, true),
				(gen_random_uuid(), 'Support/Resistance', 'SR', 'Trade bounces from key S/R levels',
					'Identify strong S/R levels from daily/weekly charts. Wait for price action confirmation at level. Look for wicks and rejection.',
					'Target next S/R level. Use fixed R:R of 2:1 minimum. Trail stop if target is far.',
					'Stop loss just beyond the S/R level. Account for normal noise/wicks. Risk 1% max.',
					2.0, 1.0, true),
				(gen_random_uuid(), 'Gap and Go', 'GAP', 'Trade opening gaps with momentum',
					'Gap up/down with catalyst (earnings, news). Volume must be 2x+ average. Enter on first pullback that holds.',
					'First target at pre-market high/low. Second target at prior day range. Exit if gap fills.',
					'Smaller size due to volatility. Stop below/above first 5-min candle. Max 0.5% risk.',
					2.5, 0.5, true)
			ON CONFLICT (code) DO UPDATE SET
				name = EXCLUDED.name,
				description = EXCLUDED.description,
				entry_criteria = EXCLUDED.entry_criteria,
				exit_criteria = EXCLUDED.exit_criteria,
				risk_rules = EXCLUDED.risk_rules
		`
		console.log("✅ Strategies seeded")
	} catch (error) {
		console.error("❌ Strategies error:", error)
	}

	// 5. Seed Tags
	console.log("\n📦 Seeding tags...")
	try {
		await sql`
			INSERT INTO tags (id, name, type, color, description) VALUES
				-- Setup Tags (what kind of trade)
				(gen_random_uuid(), 'Breakout', 'setup', '#22c55e', 'Price breaking out of consolidation or resistance'),
				(gen_random_uuid(), 'Pullback', 'setup', '#3b82f6', 'Entry on pullback to support in uptrend'),
				(gen_random_uuid(), 'Reversal', 'setup', '#8b5cf6', 'Counter-trend reversal trade'),
				(gen_random_uuid(), 'Range Trade', 'setup', '#06b6d4', 'Trading within established range'),
				(gen_random_uuid(), 'Momentum', 'setup', '#f59e0b', 'Trading strong momentum moves'),
				(gen_random_uuid(), 'Gap Play', 'setup', '#ec4899', 'Trading opening gaps'),
				(gen_random_uuid(), 'Scalp', 'setup', '#84cc16', 'Quick in-and-out scalp trade'),
				(gen_random_uuid(), 'Swing', 'setup', '#14b8a6', 'Multi-day swing trade'),

				-- Mistake Tags (what went wrong)
				(gen_random_uuid(), 'FOMO', 'mistake', '#ef4444', 'Entered due to fear of missing out'),
				(gen_random_uuid(), 'Overtrading', 'mistake', '#f97316', 'Took too many trades'),
				(gen_random_uuid(), 'Early Exit', 'mistake', '#eab308', 'Exited too early, left money on table'),
				(gen_random_uuid(), 'Moved Stop', 'mistake', '#dc2626', 'Moved stop loss further away'),
				(gen_random_uuid(), 'No Plan', 'mistake', '#b91c1c', 'Entered without clear plan'),
				(gen_random_uuid(), 'Revenge Trade', 'mistake', '#991b1b', 'Traded to recover losses'),
				(gen_random_uuid(), 'Size Too Big', 'mistake', '#c2410c', 'Position size too large for risk'),
				(gen_random_uuid(), 'Ignored Stop', 'mistake', '#9a3412', 'Did not honor stop loss'),
				(gen_random_uuid(), 'Chased Entry', 'mistake', '#ea580c', 'Chased price, bad entry'),
				(gen_random_uuid(), 'Counter Trend', 'mistake', '#d97706', 'Traded against the trend'),

				-- General Tags (context)
				(gen_random_uuid(), 'News Event', 'general', '#6366f1', 'Trade during news release'),
				(gen_random_uuid(), 'High Volume', 'general', '#8b5cf6', 'Higher than average volume'),
				(gen_random_uuid(), 'Low Liquidity', 'general', '#a855f7', 'Lower than normal liquidity'),
				(gen_random_uuid(), 'Pre-Market', 'general', '#7c3aed', 'Pre-market session trade'),
				(gen_random_uuid(), 'After Hours', 'general', '#6d28d9', 'After-hours session trade'),
				(gen_random_uuid(), 'Earnings', 'general', '#5b21b6', 'Around earnings announcement'),
				(gen_random_uuid(), 'FOMC', 'general', '#4c1d95', 'Around Fed announcement'),
				(gen_random_uuid(), 'Opening Range', 'general', '#7e22ce', 'First 30 min of session')
			ON CONFLICT (name) DO UPDATE SET
				type = EXCLUDED.type,
				color = EXCLUDED.color,
				description = EXCLUDED.description
		`
		console.log("✅ Tags seeded")
	} catch (error) {
		console.error("❌ Tags error:", error)
	}

	// 6. Seed Settings
	console.log("\n📦 Seeding settings...")
	try {
		await sql`
			INSERT INTO settings (id, key, value, description) VALUES
				(gen_random_uuid(), 'default_risk_percent', '1.0', 'Default risk percentage per trade'),
				(gen_random_uuid(), 'default_currency', 'USD', 'Default currency for P&L display'),
				(gen_random_uuid(), 'account_balance', '10000', 'Current account balance for position sizing'),
				(gen_random_uuid(), 'max_daily_loss', '300', 'Maximum allowed daily loss before stopping'),
				(gen_random_uuid(), 'max_daily_trades', '10', 'Maximum trades per day'),
				(gen_random_uuid(), 'theme', 'dark', 'UI theme preference'),
				(gen_random_uuid(), 'timezone', 'America/Sao_Paulo', 'User timezone for date display'),
				(gen_random_uuid(), 'date_format', 'DD/MM/YYYY', 'Preferred date format'),
				(gen_random_uuid(), 'show_r_multiple', 'true', 'Show R-multiple in trade displays'),
				(gen_random_uuid(), 'auto_calculate_pnl', 'true', 'Auto-calculate P&L from prices')
			ON CONFLICT (key) DO UPDATE SET
				value = EXCLUDED.value,
				description = EXCLUDED.description
		`
		console.log("✅ Settings seeded")
	} catch (error) {
		console.error("❌ Settings error:", error)
	}

	// 7. Seed Trades with strategy links and full data
	// NOTE: pnl is stored in CENTS (integers)
	console.log("\n📦 Seeding trades...")
	try {
		// Get strategy IDs
		const strategies = await sql`SELECT id, code FROM strategies`
		const strategyMap = new Map(strategies.map((s) => [s.code, s.id]))

		// Get timeframe IDs
		const timeframes = await sql`SELECT id, code FROM timeframes`
		const timeframeMap = new Map(timeframes.map((t) => [t.code, t.id]))

		const breakoutId = strategyMap.get("BREAKOUT")
		const trendId = strategyMap.get("TREND")
		const reversionId = strategyMap.get("REVERSION")
		const scalpId = strategyMap.get("SCALP")
		const srId = strategyMap.get("SR")
		const gapId = strategyMap.get("GAP")

		// Clear existing trades for clean seed
		await sql`DELETE FROM trade_tags`
		await sql`DELETE FROM trades`

		// Helper to convert dollars to cents
		const toCents = (dollars: number | null) => dollars !== null ? Math.round(dollars * 100) : null

		// Only WINFUT and WDOFUT trades with dramatic P&L swings
		const tradesData = [
			// January 2nd - Big winning day
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-02 09:15:00+00', exit: '2026-01-02 10:45:00+00', entryP: 127500, exitP: 128200, size: 5, sl: 127200, tp: 128500, pnl: 700, rr: 2.33, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'Opening momentum. Clean breakout above 127500', reflection: 'Great start to day', lesson: 'Morning breakouts have momentum' },
			{ asset: 'WINFUT', dir: 'long', tf: '15m', entry: '2026-01-02 11:30:00+00', exit: '2026-01-02 14:00:00+00', entryP: 128050, exitP: 129100, size: 8, sl: 127700, tp: 129500, pnl: 1680, rr: 3.0, outcome: 'win', plan: true, strat: trendId, thoughts: 'Trend continuation after pullback to 128000', reflection: 'Perfect execution', lesson: 'Add to winners on pullbacks' },
			{ asset: 'WDOFUT', dir: 'short', tf: '5m', entry: '2026-01-02 10:00:00+00', exit: '2026-01-02 11:30:00+00', entryP: 4985, exitP: 4962, size: 3, sl: 4995, tp: 4950, pnl: 1380, rr: 2.3, outcome: 'win', plan: true, strat: trendId, thoughts: 'Dollar weakness after USD data', reflection: 'Good correlation read', lesson: 'Index strength = dollar weakness' },
			// January 3rd - Breakeven day
			{ asset: 'WINFUT', dir: 'short', tf: '5m', entry: '2026-01-03 09:30:00+00', exit: '2026-01-03 10:15:00+00', entryP: 129200, exitP: 129450, size: 4, sl: 129500, tp: 128800, pnl: -200, rr: -0.5, outcome: 'loss', plan: true, strat: reversionId, thoughts: 'Failed breakdown attempt', reflection: 'Setup was weak', lesson: 'Need confirmation on breakdowns' },
			{ asset: 'WDOFUT', dir: 'long', tf: '15m', entry: '2026-01-03 11:00:00+00', exit: '2026-01-03 13:30:00+00', entryP: 4958, exitP: 4975, size: 2, sl: 4945, tp: 4990, pnl: 340, rr: 1.3, outcome: 'win', plan: true, strat: srId, thoughts: 'Dollar recovery play', reflection: 'Patient entry worked', lesson: 'Wait for setup completion' },
			// January 6th - HUGE DRAWDOWN (revenge trading disaster)
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-06 09:10:00+00', exit: '2026-01-06 09:35:00+00', entryP: 128800, exitP: 128200, size: 10, sl: 128500, tp: 129500, pnl: -1200, rr: -2.0, outcome: 'loss', plan: false, strat: null, thoughts: 'FOMO entry on gap. No confirmation', reflection: 'Impulsive mistake', lesson: 'Wait for confirmation' },
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-06 09:45:00+00', exit: '2026-01-06 10:10:00+00', entryP: 128100, exitP: 127500, size: 15, sl: 127800, tp: 128800, pnl: -1800, rr: -2.0, outcome: 'loss', plan: false, strat: null, thoughts: 'Revenge trade. Doubled down on losing position', reflection: 'Disaster. Should have stopped', lesson: 'NEVER revenge trade' },
			{ asset: 'WINFUT', dir: 'short', tf: '5m', entry: '2026-01-06 10:30:00+00', exit: '2026-01-06 11:00:00+00', entryP: 127600, exitP: 128000, size: 12, sl: 128100, tp: 127000, pnl: -960, rr: -0.8, outcome: 'loss', plan: false, strat: null, thoughts: 'Another revenge trade. Should have stopped', reflection: 'Total meltdown', lesson: 'Walk away after 2 losses' },
			// January 7th - Recovery day
			{ asset: 'WINFUT', dir: 'long', tf: '15m', entry: '2026-01-07 09:30:00+00', exit: '2026-01-07 12:30:00+00', entryP: 127200, exitP: 128500, size: 6, sl: 126800, tp: 128800, pnl: 1560, rr: 3.25, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'Clean setup. Waited for confirmation', reflection: 'Discipline restored', lesson: 'Patience is profitable' },
			{ asset: 'WDOFUT', dir: 'short', tf: '5m', entry: '2026-01-07 10:00:00+00', exit: '2026-01-07 11:30:00+00', entryP: 5025, exitP: 4995, size: 4, sl: 5040, tp: 4980, pnl: 1200, rr: 2.0, outcome: 'win', plan: true, strat: reversionId, thoughts: 'Dollar reversal at resistance', reflection: 'Good read', lesson: 'Dollar correlations work' },
			// January 8th - Consistent wins
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-08 09:20:00+00', exit: '2026-01-08 10:45:00+00', entryP: 128600, exitP: 129200, size: 5, sl: 128300, tp: 129500, pnl: 600, rr: 2.0, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'Breakout with volume', reflection: 'Textbook trade', lesson: 'Volume confirms breakouts' },
			{ asset: 'WINFUT', dir: 'short', tf: '15m', entry: '2026-01-08 13:00:00+00', exit: '2026-01-08 15:00:00+00', entryP: 129500, exitP: 128800, size: 6, sl: 129800, tp: 128500, pnl: 840, rr: 2.33, outcome: 'win', plan: true, strat: reversionId, thoughts: 'End of day reversal setup', reflection: 'Good timing', lesson: 'EOD reversals reliable' },
			// January 9th - Another bad day
			{ asset: 'WDOFUT', dir: 'long', tf: '5m', entry: '2026-01-09 09:30:00+00', exit: '2026-01-09 10:00:00+00', entryP: 4980, exitP: 4955, size: 5, sl: 4965, tp: 5010, pnl: -1250, rr: -1.67, outcome: 'loss', plan: false, strat: null, thoughts: 'Wrong read on dollar direction', reflection: 'Fought the trend', lesson: 'Dont fight dollar trends' },
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-09 10:30:00+00', exit: '2026-01-09 11:15:00+00', entryP: 128200, exitP: 127700, size: 8, sl: 127900, tp: 128700, pnl: -800, rr: -1.67, outcome: 'loss', plan: true, strat: breakoutId, thoughts: 'Stopped out on volatility spike', reflection: 'Market too choppy', lesson: 'Reduce size on volatile days' },
			// January 10th - BIG WINNING DAY
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-10 09:15:00+00', exit: '2026-01-10 11:00:00+00', entryP: 127000, exitP: 128500, size: 10, sl: 126700, tp: 129000, pnl: 3000, rr: 5.0, outcome: 'win', plan: true, strat: trendId, thoughts: 'Perfect trend day. Scaled in properly', reflection: 'Best trade of month', lesson: 'Let winners run' },
			{ asset: 'WINFUT', dir: 'long', tf: '15m', entry: '2026-01-10 11:30:00+00', exit: '2026-01-10 14:30:00+00', entryP: 128400, exitP: 129800, size: 12, sl: 128100, tp: 130000, pnl: 3360, rr: 4.67, outcome: 'win', plan: true, strat: trendId, thoughts: 'Trend continuation. Added on strength', reflection: 'Perfect add', lesson: 'Add to winners ONLY' },
			{ asset: 'WDOFUT', dir: 'short', tf: '5m', entry: '2026-01-10 10:00:00+00', exit: '2026-01-10 12:00:00+00', entryP: 5050, exitP: 4990, size: 6, sl: 5070, tp: 4970, pnl: 3600, rr: 3.0, outcome: 'win', plan: true, strat: trendId, thoughts: 'Dollar collapse. Rode the move', reflection: 'Great correlation play', lesson: 'Strong trends correlate' },
			// January 13th - Mixed day
			{ asset: 'WINFUT', dir: 'short', tf: '5m', entry: '2026-01-13 09:30:00+00', exit: '2026-01-13 10:30:00+00', entryP: 129800, exitP: 129300, size: 5, sl: 130100, tp: 129000, pnl: 500, rr: 1.67, outcome: 'win', plan: true, strat: reversionId, thoughts: 'Overbought reversal setup', reflection: 'Good fade', lesson: 'Overbought can reverse' },
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-13 11:00:00+00', exit: '2026-01-13 11:45:00+00', entryP: 129200, exitP: 128800, size: 6, sl: 128900, tp: 129800, pnl: -480, rr: -1.33, outcome: 'loss', plan: true, strat: breakoutId, thoughts: 'False breakout. Tight stop hit', reflection: 'Good stop placement', lesson: 'False breakouts happen' },
			{ asset: 'WDOFUT', dir: 'long', tf: '15m', entry: '2026-01-13 13:00:00+00', exit: '2026-01-13 15:30:00+00', entryP: 4975, exitP: 5010, size: 4, sl: 4960, tp: 5030, pnl: 1400, rr: 2.33, outcome: 'win', plan: true, strat: trendId, thoughts: 'Dollar afternoon rally', reflection: 'Patient entry', lesson: 'Afternoon moves can work' },
			// January 14th - HUGE WINNING DAY (best day)
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-14 09:10:00+00', exit: '2026-01-14 12:00:00+00', entryP: 128000, exitP: 130200, size: 15, sl: 127700, tp: 130500, pnl: 6600, rr: 7.33, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'Gap up continuation. Heavy size on A+ setup', reflection: 'Perfect execution', lesson: 'Size up on A+ setups' },
			{ asset: 'WDOFUT', dir: 'short', tf: '5m', entry: '2026-01-14 09:30:00+00', exit: '2026-01-14 11:30:00+00', entryP: 5080, exitP: 5020, size: 8, sl: 5100, tp: 5000, pnl: 4800, rr: 3.0, outcome: 'win', plan: true, strat: trendId, thoughts: 'Dollar weakness correlation with index strength', reflection: 'Great correlation', lesson: 'Index/dollar inverse' },
			// January 15th - Small loss day
			{ asset: 'WINFUT', dir: 'short', tf: '5m', entry: '2026-01-15 09:30:00+00', exit: '2026-01-15 10:15:00+00', entryP: 130100, exitP: 130400, size: 5, sl: 130500, tp: 129600, pnl: -300, rr: -0.75, outcome: 'loss', plan: true, strat: reversionId, thoughts: 'Counter-trend fade failed', reflection: 'Setup was marginal', lesson: 'A setups only' },
			{ asset: 'WINFUT', dir: 'long', tf: '15m', entry: '2026-01-15 11:00:00+00', exit: '2026-01-15 13:00:00+00', entryP: 130300, exitP: 130150, size: 4, sl: 130000, tp: 130800, pnl: -120, rr: -0.5, outcome: 'loss', plan: true, strat: srId, thoughts: 'Chopped out on range day', reflection: 'Should have sat out', lesson: 'Avoid range days' },
			// January 16th - Solid day
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-16 09:20:00+00', exit: '2026-01-16 11:00:00+00', entryP: 129800, exitP: 130700, size: 8, sl: 129500, tp: 131000, pnl: 1440, rr: 3.0, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'Strong open. Rode the momentum', reflection: 'Good entry timing', lesson: 'Morning momentum reliable' },
			{ asset: 'WDOFUT', dir: 'long', tf: '5m', entry: '2026-01-16 10:00:00+00', exit: '2026-01-16 12:00:00+00', entryP: 5005, exitP: 5045, size: 5, sl: 4990, tp: 5060, pnl: 2000, rr: 2.67, outcome: 'win', plan: true, strat: trendId, thoughts: 'Dollar strength on risk-off', reflection: 'Macro read worked', lesson: 'Watch risk sentiment' },
			// January 17th - DRAWDOWN (overtrading)
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-17 09:10:00+00', exit: '2026-01-17 09:30:00+00', entryP: 130500, exitP: 130100, size: 8, sl: 130200, tp: 131000, pnl: -640, rr: -1.33, outcome: 'loss', plan: false, strat: null, thoughts: 'Early entry no confirmation', reflection: 'Impatient', lesson: 'Wait for setup' },
			{ asset: 'WINFUT', dir: 'short', tf: '5m', entry: '2026-01-17 09:45:00+00', exit: '2026-01-17 10:15:00+00', entryP: 130200, exitP: 130600, size: 10, sl: 130700, tp: 129700, pnl: -800, rr: -0.8, outcome: 'loss', plan: false, strat: null, thoughts: 'Flip-flopping direction', reflection: 'No plan', lesson: 'Stick to one direction' },
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-17 10:30:00+00', exit: '2026-01-17 11:00:00+00', entryP: 130500, exitP: 130000, size: 8, sl: 130100, tp: 131000, pnl: -800, rr: -1.25, outcome: 'loss', plan: false, strat: null, thoughts: 'More revenge trading. Disaster', reflection: 'Should have stopped', lesson: 'Max 3 trades per day' },
			{ asset: 'WDOFUT', dir: 'short', tf: '5m', entry: '2026-01-17 11:30:00+00', exit: '2026-01-17 12:30:00+00', entryP: 5035, exitP: 5055, size: 5, sl: 5055, tp: 5000, pnl: -1000, rr: -1.0, outcome: 'loss', plan: false, strat: reversionId, thoughts: 'Stopped at the exact high. Bad day', reflection: 'Murphy day', lesson: 'Accept bad days happen' },
			// January 20th - Recovery and discipline
			{ asset: 'WINFUT', dir: 'long', tf: '15m', entry: '2026-01-20 09:30:00+00', exit: '2026-01-20 13:00:00+00', entryP: 129500, exitP: 131000, size: 6, sl: 129100, tp: 131500, pnl: 1800, rr: 3.75, outcome: 'win', plan: true, strat: trendId, thoughts: 'Patient entry. Waited for setup', reflection: 'Back on track', lesson: 'Discipline wins' },
			{ asset: 'WDOFUT', dir: 'short', tf: '5m', entry: '2026-01-20 10:30:00+00', exit: '2026-01-20 12:00:00+00', entryP: 5080, exitP: 5050, size: 4, sl: 5095, tp: 5030, pnl: 1200, rr: 2.0, outcome: 'win', plan: true, strat: reversionId, thoughts: 'Dollar weakness on index strength', reflection: 'Good correlation', lesson: 'Stay with correlations' },
			// January 21st - Consistent
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-21 09:20:00+00', exit: '2026-01-21 10:30:00+00', entryP: 130800, exitP: 131400, size: 5, sl: 130500, tp: 131800, pnl: 600, rr: 2.0, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'Breakout continuation', reflection: 'Clean trade', lesson: 'Continuation setups work' },
			{ asset: 'WINFUT', dir: 'short', tf: '5m', entry: '2026-01-21 13:00:00+00', exit: '2026-01-21 14:00:00+00', entryP: 131600, exitP: 131200, size: 4, sl: 131900, tp: 130800, pnl: 320, rr: 1.33, outcome: 'win', plan: true, strat: reversionId, thoughts: 'End of day profit taking', reflection: 'Good exit', lesson: 'EOD profit taking normal' },
			// January 22nd - Small loss
			{ asset: 'WDOFUT', dir: 'long', tf: '5m', entry: '2026-01-22 09:30:00+00', exit: '2026-01-22 10:15:00+00', entryP: 5040, exitP: 5020, size: 3, sl: 5025, tp: 5070, pnl: -600, rr: -1.33, outcome: 'loss', plan: true, strat: breakoutId, thoughts: 'Wrong direction. Quick exit', reflection: 'Good stop discipline', lesson: 'Cut losers fast' },
			{ asset: 'WINFUT', dir: 'long', tf: '15m', entry: '2026-01-22 11:00:00+00', exit: '2026-01-22 14:00:00+00', entryP: 131000, exitP: 131600, size: 5, sl: 130700, tp: 132000, pnl: 600, rr: 2.0, outcome: 'win', plan: true, strat: trendId, thoughts: 'Recovered with clean setup', reflection: 'Patience paid', lesson: 'Wait for good setups' },
			// January 23rd - Good day
			{ asset: 'WINFUT', dir: 'long', tf: '5m', entry: '2026-01-23 09:15:00+00', exit: '2026-01-23 11:30:00+00', entryP: 131200, exitP: 132500, size: 8, sl: 130900, tp: 132800, pnl: 2080, rr: 4.33, outcome: 'win', plan: true, strat: trendId, thoughts: 'Strong trend day. Scaled in', reflection: 'Great execution', lesson: 'Trend days for scaling' },
			{ asset: 'WDOFUT', dir: 'short', tf: '5m', entry: '2026-01-23 10:00:00+00', exit: '2026-01-23 12:00:00+00', entryP: 5065, exitP: 5025, size: 5, sl: 5080, tp: 5000, pnl: 2000, rr: 2.67, outcome: 'win', plan: true, strat: trendId, thoughts: 'Dollar selloff with index rally', reflection: 'Perfect correlation', lesson: 'Correlations consistent' },
			// January 24th - Open position
			{ asset: 'WINFUT', dir: 'long', tf: '15m', entry: '2026-01-24 09:30:00+00', exit: null, entryP: 132300, exitP: null, size: 6, sl: 131900, tp: 133500, pnl: null, rr: null, outcome: null, plan: true, strat: trendId, thoughts: 'Trend continuation setup. Position open', reflection: null, lesson: null },
		]

		for (const t of tradesData) {
			const timeframeId = timeframeMap.get(t.tf) || null
			await sql`
				INSERT INTO trades (
					id, asset, direction, timeframe_id, entry_date, exit_date,
					entry_price, exit_price, position_size, stop_loss, take_profit,
					pnl, realized_r_multiple, outcome, followed_plan, strategy_id,
					pre_trade_thoughts, post_trade_reflection, lesson_learned, is_archived
				) VALUES (
					gen_random_uuid(), ${t.asset}, ${t.dir}, ${timeframeId}, ${t.entry}, ${t.exit},
					${t.entryP}, ${t.exitP}, ${t.size}, ${t.sl}, ${t.tp},
					${toCents(t.pnl)}, ${t.rr}, ${t.outcome}, ${t.plan}, ${t.strat},
					${t.thoughts}, ${t.reflection}, ${t.lesson}, false
				)
			`
		}
		console.log(`✅ Trades seeded (${tradesData.length} trades)`)
	} catch (error) {
		console.error("❌ Trades error:", error)
	}

	// 8. Seed Trade-Tag Links
	console.log("\n📦 Seeding trade tags...")
	try {
		const trades = await sql`SELECT id, pre_trade_thoughts, outcome, followed_plan FROM trades ORDER BY entry_date`
		const tags = await sql`SELECT id, name, type FROM tags`
		const tagMap = new Map(tags.map((t) => [t.name, t.id]))

		// Link each trade to appropriate tags based on context
		for (const trade of trades) {
			const tagsToAdd: string[] = []

			// Setup tags based on thoughts
			const thoughts = (trade.pre_trade_thoughts || "").toLowerCase()
			if (thoughts.includes("breakout")) tagsToAdd.push("Breakout")
			if (thoughts.includes("pullback")) tagsToAdd.push("Pullback")
			if (thoughts.includes("reversal") || thoughts.includes("reversion"))
				tagsToAdd.push("Reversal")
			if (thoughts.includes("range")) tagsToAdd.push("Range Trade")
			if (thoughts.includes("momentum")) tagsToAdd.push("Momentum")
			if (thoughts.includes("gap")) tagsToAdd.push("Gap Play")
			if (thoughts.includes("scalp")) tagsToAdd.push("Scalp")
			if (thoughts.includes("swing")) tagsToAdd.push("Swing")

			// Mistake tags for losses without plan
			if (trade.outcome === "loss" && !trade.followed_plan) {
				if (thoughts.includes("fomo")) tagsToAdd.push("FOMO")
				if (thoughts.includes("revenge")) tagsToAdd.push("Revenge Trade")
				if (thoughts.includes("no plan") || thoughts.includes("no setup"))
					tagsToAdd.push("No Plan")
				if (thoughts.includes("counter")) tagsToAdd.push("Counter Trend")
				if (thoughts.includes("chased") || thoughts.includes("chase"))
					tagsToAdd.push("Chased Entry")
			}

			// General context tags
			if (thoughts.includes("news") || thoughts.includes("nfp") || thoughts.includes("ecb"))
				tagsToAdd.push("News Event")
			if (thoughts.includes("volume")) tagsToAdd.push("High Volume")
			if (thoughts.includes("earnings")) tagsToAdd.push("Earnings")
			if (thoughts.includes("opening") || thoughts.includes("london"))
				tagsToAdd.push("Opening Range")

			// Add at least one tag if none matched
			if (tagsToAdd.length === 0) {
				tagsToAdd.push("Momentum") // Default
			}

			for (const tagName of tagsToAdd) {
				const tagId = tagMap.get(tagName)
				if (tagId) {
					await sql`
						INSERT INTO trade_tags (id, trade_id, tag_id)
						VALUES (gen_random_uuid(), ${trade.id}, ${tagId})
						ON CONFLICT DO NOTHING
					`
				}
			}
		}
		console.log("✅ Trade tags seeded")
	} catch (error) {
		console.error("❌ Trade tags error:", error)
	}

	// 9. Seed Daily Journals - WINFUT/WDOFUT trading
	// NOTE: total_pnl is stored in CENTS (integers)
	console.log("\n📦 Seeding daily journals...")
	try {
		await sql`
			INSERT INTO daily_journals (id, date, market_outlook, focus_goals, mental_state, session_review, emotional_state, key_takeaways, total_pnl, trade_count, win_count, loss_count) VALUES
				(gen_random_uuid(), '2026-01-02',
					'IBOV showing strength. Dollar weak. Good day for mini contracts.',
					'Trade morning momentum on WINFUT. Watch dollar correlation for WDOFUT.',
					8,
					'INCREDIBLE day! Three winners. WINFUT breakout + continuation, WDOFUT short worked perfectly.',
					9,
					'Morning momentum reliable on WINFUT. Dollar correlation with index is key.',
					376000, 3, 3, 0),

				(gen_random_uuid(), '2026-01-03',
					'Market consolidating after yesterday move. Look for range trades.',
					'Be patient. Wait for clear setups. Small size on range day.',
					7,
					'Mixed day. One loss on WINFUT, recovered with WDOFUT. Broke even essentially.',
					6,
					'Range days are tough. Patience required.',
					14000, 2, 1, 1),

				(gen_random_uuid(), '2026-01-06',
					'Gap down expected. Careful on open.',
					'WAIT for gap to settle. NO FOMO trades. Max 3 trades.',
					5,
					'DISASTER. Complete meltdown. Revenge traded after first loss. Down R$39.60 on the day.',
					1,
					'NEVER revenge trade. Walk away after 2 losses. This was a major failure.',
					-396000, 3, 0, 3),

				(gen_random_uuid(), '2026-01-07',
					'After yesterday disaster, need to rebuild. Look for clean A+ setups only.',
					'DISCIPLINE. Only trade perfect setups. Small size until confident.',
					6,
					'Good recovery day. Followed plan, waited for setups. Two clean wins.',
					8,
					'Discipline is everything. Patient entries work.',
					276000, 2, 2, 0),

				(gen_random_uuid(), '2026-01-08',
					'Market trending well. Continue with trend following.',
					'Ride WINFUT trends. Add on pullbacks.',
					8,
					'Solid day. Two wins on WINFUT, morning breakout and EOD reversal.',
					8,
					'EOD reversals can be reliable. Volume confirms breakouts.',
					144000, 2, 2, 0),

				(gen_random_uuid(), '2026-01-09',
					'Volatile day expected. Reduce size.',
					'Smaller positions. Tight stops. Quick exits.',
					6,
					'Bad day. Dollar read was wrong, WINFUT got stopped on spike.',
					4,
					'Some days market is just choppy. Accept losses and move on.',
					-205000, 2, 0, 2),

				(gen_random_uuid(), '2026-01-10',
					'Strong trend day setup. Gap up with momentum.',
					'This is THE day. Size up on A+ setups. Let winners run.',
					9,
					'BEST DAY EVER! Perfect trend day. Scaled in on WINFUT, nailed WDOFUT short. R$99.60 profit!',
					10,
					'Trend days are for making money. Scale in on strength. Let winners run.',
					996000, 3, 3, 0),

				(gen_random_uuid(), '2026-01-13',
					'Consolidation after big move. Mixed signals.',
					'Be selective. Take what market gives.',
					7,
					'Mixed day. False breakout on WINFUT but WDOFUT rally worked.',
					6,
					'False breakouts happen. Have backup plans.',
					142000, 3, 2, 1),

				(gen_random_uuid(), '2026-01-14',
					'Gap up continuation expected. Heavy focus on WINFUT.',
					'Size up on gap continuation. Watch WDOFUT correlation.',
					9,
					'INCREDIBLE! Best day of month. WINFUT gap play + WDOFUT short = R$114.00 profit!',
					10,
					'A+ setups deserve A+ size. Gap continuations are high probability.',
					1140000, 2, 2, 0),

				(gen_random_uuid(), '2026-01-15',
					'Extended market. Watch for reversal.',
					'Counter-trend fades possible but be careful.',
					6,
					'Small losses. Fade failed, range day chop. Nothing worked.',
					5,
					'Dont force trades on range days. Sometimes sitting out is best.',
					-42000, 2, 0, 2),

				(gen_random_uuid(), '2026-01-16',
					'Fresh week. Market ready for continuation.',
					'Focus on morning momentum. Watch risk sentiment for WDOFUT.',
					8,
					'Great day. Morning WINFUT breakout and WDOFUT strength on risk-off.',
					9,
					'Morning momentum is most reliable setup.',
					344000, 2, 2, 0),

				(gen_random_uuid(), '2026-01-17',
					'Consolidation day. Be careful.',
					'No forcing trades. Wait for clear direction.',
					5,
					'DISASTER AGAIN. Flip-flopping direction. Four losses. Down R$32.40.',
					1,
					'Overtrading kills. Max 3 trades rule MUST be followed.',
					-324000, 4, 0, 4),

				(gen_random_uuid(), '2026-01-20',
					'After disaster, rebuild with discipline.',
					'ONLY A+ setups. Patient entries. Let trades come to you.',
					6,
					'Good recovery. Two clean wins. Discipline restored.',
					8,
					'After bad days, discipline is the only way back.',
					300000, 2, 2, 0),

				(gen_random_uuid(), '2026-01-21',
					'Trending market. Continue with momentum.',
					'Trade breakouts. Take profits at targets.',
					8,
					'Solid day. WINFUT breakout and EOD profit taking worked.',
					8,
					'Consistent small wins add up. EOD reversals reliable.',
					92000, 2, 2, 0),

				(gen_random_uuid(), '2026-01-22',
					'Mixed signals. Be selective.',
					'Quick exits on losers. Let winners run.',
					7,
					'Small loss on WDOFUT but recovered on WINFUT. Essentially flat.',
					6,
					'Cut losers fast. Wait for clean setups to recover.',
					0, 2, 1, 1),

				(gen_random_uuid(), '2026-01-23',
					'Strong trend setup. Index rallying.',
					'This is a trend day. Scale in properly.',
					9,
					'Excellent day! WINFUT trend + WDOFUT correlation = R$40.80 profit.',
					9,
					'Trend days with correlation are the best setups.',
					408000, 2, 2, 0),

				(gen_random_uuid(), '2026-01-24',
					'Continuation expected. Position open overnight.',
					'Hold position. Trail stop. Let it run.',
					8,
					'Position still open. Trend intact. Good setup.',
					8,
					'Sometimes holding overnight is right move.',
					0, 1, 0, 0)
			ON CONFLICT (date) DO UPDATE SET
				market_outlook = EXCLUDED.market_outlook,
				focus_goals = EXCLUDED.focus_goals,
				session_review = EXCLUDED.session_review,
				key_takeaways = EXCLUDED.key_takeaways,
				total_pnl = EXCLUDED.total_pnl
		`
		console.log("✅ Daily journals seeded")
	} catch (error) {
		console.error("❌ Daily journals error:", error)
	}

	// Verify data
	console.log("\n📊 Verifying seeded data...")
	const counts = await sql`
		SELECT
			(SELECT COUNT(*) FROM asset_types) as asset_types,
			(SELECT COUNT(*) FROM assets) as assets,
			(SELECT COUNT(*) FROM timeframes) as timeframes,
			(SELECT COUNT(*) FROM strategies) as strategies,
			(SELECT COUNT(*) FROM tags) as tags,
			(SELECT COUNT(*) FROM trades) as trades,
			(SELECT COUNT(*) FROM trade_tags) as trade_tags,
			(SELECT COUNT(*) FROM daily_journals) as daily_journals,
			(SELECT COUNT(*) FROM settings) as settings
	`

	const c = counts[0]
	console.log(`   Asset Types:    ${c.asset_types}`)
	console.log(`   Assets:         ${c.assets}`)
	console.log(`   Timeframes:     ${c.timeframes}`)
	console.log(`   Strategies:     ${c.strategies}`)
	console.log(`   Tags:           ${c.tags}`)
	console.log(`   Trades:         ${c.trades}`)
	console.log(`   Trade Tags:     ${c.trade_tags}`)
	console.log(`   Daily Journals: ${c.daily_journals}`)
	console.log(`   Settings:       ${c.settings}`)

	console.log("\n🎉 All seed data inserted successfully!")
}

runSeed().catch((error) => {
	console.error("Seed failed:", error)
	process.exit(1)
})
