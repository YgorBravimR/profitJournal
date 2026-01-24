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

		await sql`
			INSERT INTO assets (id, symbol, name, asset_type_id, tick_size, tick_value, currency, multiplier, commission, fees, is_active) VALUES
				(gen_random_uuid(), 'WINFUT', 'Mini Índice Bovespa', ${futureIndexId}, 5, 0.20, 'BRL', 1, 0.30, 0.05, true),
				(gen_random_uuid(), 'WDOFUT', 'Mini Dólar', ${futureFxId}, 0.5, 10.00, 'BRL', 1, 0.30, 0.05, true),
				(gen_random_uuid(), 'INDFUT', 'Índice Cheio', ${futureIndexId}, 5, 1.00, 'BRL', 1, 0.30, 0.05, true),
				(gen_random_uuid(), 'DOLFUT', 'Dólar Cheio', ${futureFxId}, 0.5, 50.00, 'BRL', 1, 0.30, 0.05, true),
				(gen_random_uuid(), 'PETR4', 'Petrobras PN', ${stockId}, 0.01, 0.01, 'BRL', 1, 0, 0, true),
				(gen_random_uuid(), 'VALE3', 'Vale ON', ${stockId}, 0.01, 0.01, 'BRL', 1, 0, 0, true),
				(gen_random_uuid(), 'ITUB4', 'Itaú Unibanco PN', ${stockId}, 0.01, 0.01, 'BRL', 1, 0, 0, true),
				(gen_random_uuid(), 'BBDC4', 'Bradesco PN', ${stockId}, 0.01, 0.01, 'BRL', 1, 0, 0, true),
				(gen_random_uuid(), 'BTCUSD', 'Bitcoin', ${cryptoId}, 0.01, 0.01, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'ETHUSD', 'Ethereum', ${cryptoId}, 0.01, 0.01, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'SOLUSD', 'Solana', ${cryptoId}, 0.01, 0.01, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'AVAXUSD', 'Avalanche', ${cryptoId}, 0.01, 0.01, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'LINKUSD', 'Chainlink', ${cryptoId}, 0.01, 0.01, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'DOGEUSD', 'Dogecoin', ${cryptoId}, 0.00001, 0.00001, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'MATICUSD', 'Polygon', ${cryptoId}, 0.0001, 0.0001, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'EURUSD', 'EUR/USD', ${forexId}, 0.0001, 10.00, 'USD', 100000, 0, 0, true),
				(gen_random_uuid(), 'GBPUSD', 'GBP/USD', ${forexId}, 0.0001, 10.00, 'USD', 100000, 0, 0, true),
				(gen_random_uuid(), 'XAUUSD', 'Gold', ${forexId}, 0.01, 0.01, 'USD', 1, 0, 0, true),
				(gen_random_uuid(), 'ES', 'E-mini S&P 500', ${futureIndexId}, 0.25, 12.50, 'USD', 1, 2.25, 0, true),
				(gen_random_uuid(), 'NQ', 'E-mini Nasdaq', ${futureIndexId}, 0.25, 5.00, 'USD', 1, 2.25, 0, true)
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
	console.log("\n📦 Seeding trades...")
	try {
		// Get strategy IDs
		const strategies = await sql`SELECT id, code FROM strategies`
		const strategyMap = new Map(strategies.map((s) => [s.code, s.id]))

		const breakoutId = strategyMap.get("BREAKOUT")
		const trendId = strategyMap.get("TREND")
		const reversionId = strategyMap.get("REVERSION")
		const scalpId = strategyMap.get("SCALP")
		const srId = strategyMap.get("SR")
		const gapId = strategyMap.get("GAP")

		// Clear existing trades for clean seed
		await sql`DELETE FROM trade_tags`
		await sql`DELETE FROM trades`

		// Insert trades with simpler format
		const tradesData = [
			// January 1st - New Year trading session
			{ asset: 'BTCUSD', dir: 'long', tf: '1h', entry: '2026-01-01 10:00:00+00', exit: '2026-01-01 14:00:00+00', entryP: 41800, exitP: 42150, size: 0.5, sl: 41500, tp: 42500, pnl: 175, rr: 1.17, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'New Year momentum. Clean breakout setup', reflection: 'Good start to the year', lesson: 'New Year often sees trend continuation' },
			{ asset: 'ETHUSD', dir: 'long', tf: '1h', entry: '2026-01-01 11:00:00+00', exit: '2026-01-01 15:00:00+00', entryP: 2250, exitP: 2290, size: 2, sl: 2220, tp: 2330, pnl: 80, rr: 1.33, outcome: 'win', plan: true, strat: trendId, thoughts: 'ETH following BTC momentum', reflection: 'Good correlation play', lesson: 'ETH follows BTC on trend days' },
			{ asset: 'SOLUSD', dir: 'long', tf: '15m', entry: '2026-01-01 13:00:00+00', exit: '2026-01-01 14:30:00+00', entryP: 96.50, exitP: 95.80, size: 10, sl: 95.00, tp: 99.00, pnl: -70, rr: -0.47, outcome: 'loss', plan: false, strat: null, thoughts: 'Quick scalp attempt. FOMO on alt rally', reflection: 'Chased the move', lesson: 'Dont FOMO into alts' },
			// January 2nd
			{ asset: 'BTCUSD', dir: 'long', tf: '4h', entry: '2026-01-02 10:00:00+00', exit: '2026-01-02 18:00:00+00', entryP: 42150, exitP: 42580, size: 0.5, sl: 41800, tp: 43000, pnl: 215, rr: 1.23, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'Clean breakout above 42000 resistance with volume', reflection: 'Good entry on retest', lesson: 'Patience on retest paid off' },
			{ asset: 'ETHUSD', dir: 'long', tf: '1h', entry: '2026-01-02 14:00:00+00', exit: '2026-01-03 10:00:00+00', entryP: 2280, exitP: 2195, size: 2, sl: 2200, tp: 2400, pnl: -170, rr: -1.06, outcome: 'loss', plan: true, strat: srId, thoughts: 'Support bounce setup at 2280', reflection: 'Support failed', lesson: 'Need more confirmation on support bounces' },
			{ asset: 'EURUSD', dir: 'short', tf: '15m', entry: '2026-01-03 09:00:00+00', exit: '2026-01-03 15:00:00+00', entryP: 1.0892, exitP: 1.0845, size: 50000, sl: 1.0920, tp: 1.0820, pnl: 235, rr: 1.68, outcome: 'win', plan: true, strat: trendId, thoughts: 'News driven move. ECB comments bearish', reflection: 'Perfect execution', lesson: 'News events accelerate trend moves' },
			{ asset: 'BTCUSD', dir: 'short', tf: '4h', entry: '2026-01-04 10:00:00+00', exit: '2026-01-04 18:00:00+00', entryP: 43200, exitP: 43850, size: 0.3, sl: 43500, tp: 42600, pnl: -195, rr: -2.17, outcome: 'loss', plan: false, strat: null, thoughts: 'Trying to catch the top. No real setup, FOMO', reflection: 'Counter trend disaster', lesson: 'NEVER trade counter trend without clear signal' },
			{ asset: 'SOLUSD', dir: 'long', tf: '1h', entry: '2026-01-05 11:00:00+00', exit: '2026-01-06 14:00:00+00', entryP: 98.50, exitP: 105.20, size: 15, sl: 95.00, tp: 110.00, pnl: 100.50, rr: 1.91, outcome: 'win', plan: true, strat: trendId, thoughts: 'SOL showing relative strength. Pullback to 20 EMA', reflection: 'Solid trend following', lesson: 'Relative strength helps find opportunities' },
			{ asset: 'GBPUSD', dir: 'long', tf: '1h', entry: '2026-01-06 08:00:00+00', exit: '2026-01-06 16:00:00+00', entryP: 1.2520, exitP: 1.2580, size: 30000, sl: 1.2480, tp: 1.2620, pnl: 180, rr: 1.5, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'London session breakout. Clean setup', reflection: 'Textbook breakout', lesson: 'London session best for GBP' },
			{ asset: 'ETHUSD', dir: 'short', tf: '4h', entry: '2026-01-07 10:00:00+00', exit: '2026-01-07 18:00:00+00', entryP: 2150, exitP: 2090, size: 3, sl: 2200, tp: 2050, pnl: 180, rr: 1.2, outcome: 'win', plan: true, strat: reversionId, thoughts: 'ETH overbought. Mean reversion short', reflection: 'Good exhaustion read', lesson: 'RSI divergence adds confidence' },
			{ asset: 'BTCUSD', dir: 'long', tf: '1d', entry: '2026-01-07 12:00:00+00', exit: '2026-01-08 12:00:00+00', entryP: 41800, exitP: 42400, size: 0.4, sl: 41200, tp: 43000, pnl: 240, rr: 1.0, outcome: 'win', plan: true, strat: srId, thoughts: 'Daily support at 41800. Third test', reflection: 'Clean bounce off daily support', lesson: 'Daily levels more reliable' },
			{ asset: 'XAUUSD', dir: 'long', tf: '15m', entry: '2026-01-08 09:00:00+00', exit: '2026-01-08 11:00:00+00', entryP: 2045, exitP: 2038, size: 5, sl: 2035, tp: 2065, pnl: -35, rr: -0.7, outcome: 'loss', plan: true, strat: scalpId, thoughts: 'Quick scalp on gold', reflection: 'Stopped out. Momentum faded', lesson: 'Gold choppy in early session' },
			{ asset: 'SOLUSD', dir: 'short', tf: '1h', entry: '2026-01-09 10:00:00+00', exit: '2026-01-09 16:00:00+00', entryP: 102.30, exitP: 99.80, size: 20, sl: 105.00, tp: 97.00, pnl: 50, rr: 0.93, outcome: 'win', plan: true, strat: reversionId, thoughts: 'Bearish divergence on 1H', reflection: 'Divergence played out', lesson: 'Divergence setups need patience' },
			{ asset: 'BTCUSD', dir: 'long', tf: '4h', entry: '2026-01-09 14:00:00+00', exit: '2026-01-10 10:00:00+00', entryP: 42600, exitP: 41900, size: 0.5, sl: 42000, tp: 44000, pnl: -350, rr: -1.17, outcome: 'loss', plan: false, strat: breakoutId, thoughts: 'Breakout attempt but volume was weak', reflection: 'Should have waited for volume', lesson: 'No volume = no breakout' },
			{ asset: 'EURUSD', dir: 'long', tf: '1h', entry: '2026-01-10 08:00:00+00', exit: '2026-01-10 14:00:00+00', entryP: 1.0780, exitP: 1.0825, size: 40000, sl: 1.0750, tp: 1.0850, pnl: 180, rr: 1.5, outcome: 'win', plan: true, strat: srId, thoughts: 'Support at 1.0780 held', reflection: 'Clean support bounce', lesson: 'Key levels from daily reliable' },
			{ asset: 'ETHUSD', dir: 'long', tf: '4h', entry: '2026-01-11 10:00:00+00', exit: '2026-01-11 18:00:00+00', entryP: 2050, exitP: 2120, size: 4, sl: 2000, tp: 2150, pnl: 280, rr: 1.4, outcome: 'win', plan: true, strat: trendId, thoughts: 'ETH oversold on 4H. Bounce setup', reflection: 'Good oversold bounce', lesson: 'Oversold in uptrend = opportunity' },
			{ asset: 'AVAXUSD', dir: 'long', tf: '1h', entry: '2026-01-11 14:00:00+00', exit: '2026-01-12 10:00:00+00', entryP: 35.20, exitP: 37.80, size: 50, sl: 33.50, tp: 40.00, pnl: 130, rr: 1.53, outcome: 'win', plan: true, strat: trendId, thoughts: 'AVAX showing strength. Alt season momentum', reflection: 'Good alt pick', lesson: 'Alts move together. Pick strongest' },
			{ asset: 'BTCUSD', dir: 'short', tf: '1h', entry: '2026-01-12 09:00:00+00', exit: '2026-01-12 15:00:00+00', entryP: 43500, exitP: 43200, size: 0.6, sl: 44000, tp: 42500, pnl: 180, rr: 0.6, outcome: 'win', plan: true, strat: reversionId, thoughts: 'Double top pattern forming', reflection: 'Pattern played out', lesson: 'Double tops at resistance reliable' },
			{ asset: 'GBPUSD', dir: 'short', tf: '15m', entry: '2026-01-13 10:00:00+00', exit: '2026-01-13 14:00:00+00', entryP: 1.2680, exitP: 1.2720, size: 25000, sl: 1.2720, tp: 1.2600, pnl: -100, rr: -1.0, outcome: 'loss', plan: false, strat: null, thoughts: 'Trying to short the top. No clear setup', reflection: 'Fighting the trend', lesson: 'Dont fight the trend' },
			{ asset: 'LINKUSD', dir: 'long', tf: '4h', entry: '2026-01-13 12:00:00+00', exit: '2026-01-14 16:00:00+00', entryP: 14.50, exitP: 15.80, size: 100, sl: 13.80, tp: 16.50, pnl: 130, rr: 1.86, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'LINK accumulation breakout. Volume increasing', reflection: 'Clean accumulation', lesson: 'Accumulation patterns need time' },
			{ asset: 'BTCUSD', dir: 'long', tf: '1h', entry: '2026-01-14 11:00:00+00', exit: '2026-01-14 17:00:00+00', entryP: 42800, exitP: 43350, size: 0.4, sl: 42200, tp: 44000, pnl: 220, rr: 0.92, outcome: 'win', plan: true, strat: trendId, thoughts: 'Higher low forming. Continuation', reflection: 'Good trend continuation', lesson: 'Higher lows confirm bullish structure' },
			{ asset: 'ETHUSD', dir: 'short', tf: '1h', entry: '2026-01-15 09:00:00+00', exit: '2026-01-15 15:00:00+00', entryP: 2180, exitP: 2220, size: 2.5, sl: 2230, tp: 2100, pnl: -100, rr: -0.8, outcome: 'loss', plan: false, strat: reversionId, thoughts: 'Looks overbought. Mean reversion', reflection: 'Trend too strong', lesson: 'Dont fade strong trends' },
			{ asset: 'SOLUSD', dir: 'long', tf: '4h', entry: '2026-01-15 14:00:00+00', exit: '2026-01-16 10:00:00+00', entryP: 95.40, exitP: 99.20, size: 25, sl: 92.00, tp: 102.00, pnl: 95, rr: 1.12, outcome: 'win', plan: true, strat: srId, thoughts: 'Support bounce at 95. Strong level', reflection: 'Good support recognition', lesson: 'Round numbers are psychological support' },
			{ asset: 'XAUUSD', dir: 'short', tf: '1h', entry: '2026-01-16 08:00:00+00', exit: '2026-01-16 14:00:00+00', entryP: 2058, exitP: 2048, size: 8, sl: 2068, tp: 2038, pnl: 80, rr: 1.0, outcome: 'win', plan: true, strat: reversionId, thoughts: 'Gold at resistance. Short for rejection', reflection: 'Clean rejection', lesson: 'Gold respects round numbers' },
			{ asset: 'BTCUSD', dir: 'long', tf: '4h', entry: '2026-01-16 10:00:00+00', exit: '2026-01-17 14:00:00+00', entryP: 43100, exitP: 44200, size: 0.5, sl: 42500, tp: 45000, pnl: 550, rr: 1.83, outcome: 'win', plan: true, strat: trendId, thoughts: 'Trend continuation. Pullback to 20 EMA', reflection: 'Great trend trade', lesson: 'Trust the trend' },
			{ asset: 'EURUSD', dir: 'short', tf: '1h', entry: '2026-01-17 13:00:00+00', exit: '2026-01-17 17:00:00+00', entryP: 1.0920, exitP: 1.0880, size: 60000, sl: 1.0950, tp: 1.0850, pnl: 240, rr: 1.33, outcome: 'win', plan: true, strat: gapId, thoughts: 'ECB speech reaction. News gap down', reflection: 'Good news trade', lesson: 'News moves provide momentum' },
			{ asset: 'DOGEUSD', dir: 'long', tf: '1h', entry: '2026-01-17 16:00:00+00', exit: '2026-01-18 10:00:00+00', entryP: 0.0820, exitP: 0.0795, size: 10000, sl: 0.0780, tp: 0.0880, pnl: -250, rr: -6.25, outcome: 'loss', plan: false, strat: null, thoughts: 'DOGE pumping on Twitter. FOMO entry', reflection: 'Classic FOMO mistake', lesson: 'NEVER chase meme coin pumps' },
			{ asset: 'BTCUSD', dir: 'short', tf: '15m', entry: '2026-01-18 09:00:00+00', exit: '2026-01-18 10:30:00+00', entryP: 44500, exitP: 44100, size: 0.3, sl: 45000, tp: 43500, pnl: 120, rr: 0.8, outcome: 'win', plan: true, strat: scalpId, thoughts: 'Quick scalp on morning weakness', reflection: 'Clean scalp', lesson: 'Morning scalps work on BTC' },
			{ asset: 'ETHUSD', dir: 'long', tf: '4h', entry: '2026-01-18 14:00:00+00', exit: '2026-01-19 10:00:00+00', entryP: 2240, exitP: 2320, size: 3, sl: 2180, tp: 2380, pnl: 240, rr: 1.33, outcome: 'win', plan: true, strat: trendId, thoughts: 'ETH/BTC ratio turning. Outperformance', reflection: 'Good ratio trade', lesson: 'Watch ETH/BTC ratio' },
			{ asset: 'MATICUSD', dir: 'long', tf: '1h', entry: '2026-01-19 11:00:00+00', exit: '2026-01-19 17:00:00+00', entryP: 0.92, exitP: 0.88, size: 500, sl: 0.85, tp: 1.00, pnl: -200, rr: -5.71, outcome: 'loss', plan: true, strat: trendId, thoughts: 'Layer 2 narrative play. MATIC pullback', reflection: 'Narrative didnt play out', lesson: 'Narrative needs market support' },
			{ asset: 'BTCUSD', dir: 'long', tf: '4h', entry: '2026-01-19 15:00:00+00', exit: '2026-01-20 11:00:00+00', entryP: 44800, exitP: 45600, size: 0.4, sl: 44200, tp: 46500, pnl: 320, rr: 1.33, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'Weekend breakout setup. Low resistance', reflection: 'Good weekend trade', lesson: 'Weekend moves cleaner' },
			{ asset: 'GBPUSD', dir: 'long', tf: '1h', entry: '2026-01-20 08:00:00+00', exit: '2026-01-20 14:00:00+00', entryP: 1.2750, exitP: 1.2810, size: 35000, sl: 1.2700, tp: 1.2850, pnl: 210, rr: 1.2, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'Clean breakout above 1.2745', reflection: 'Textbook breakout', lesson: 'Wait for breakout then ride' },
			{ asset: 'SOLUSD', dir: 'short', tf: '4h', entry: '2026-01-20 14:00:00+00', exit: '2026-01-21 10:00:00+00', entryP: 108.50, exitP: 105.20, size: 20, sl: 112.00, tp: 100.00, pnl: 66, rr: 0.94, outcome: 'win', plan: true, strat: reversionId, thoughts: 'SOL overbought. RSI divergence', reflection: 'Good counter-trend', lesson: 'Divergence at overbought works' },
			{ asset: 'BTCUSD', dir: 'short', tf: '1h', entry: '2026-01-21 09:00:00+00', exit: '2026-01-21 13:00:00+00', entryP: 45800, exitP: 46200, size: 0.25, sl: 46500, tp: 44500, pnl: -100, rr: -0.57, outcome: 'loss', plan: false, strat: reversionId, thoughts: 'Trying to short the top again', reflection: 'Caught in squeeze', lesson: 'Dont fight momentum' },
			{ asset: 'ETHUSD', dir: 'long', tf: '4h', entry: '2026-01-21 14:00:00+00', exit: '2026-01-22 10:00:00+00', entryP: 2380, exitP: 2450, size: 2, sl: 2320, tp: 2500, pnl: 140, rr: 1.17, outcome: 'win', plan: true, strat: trendId, thoughts: 'Bullish continuation. ETH holding', reflection: 'Good continuation', lesson: 'Strong trends have multiple entries' },
			{ asset: 'XAUUSD', dir: 'long', tf: '1h', entry: '2026-01-22 09:00:00+00', exit: '2026-01-22 15:00:00+00', entryP: 2072, exitP: 2085, size: 6, sl: 2060, tp: 2095, pnl: 78, rr: 1.08, outcome: 'win', plan: true, strat: srId, thoughts: 'Risk-off sentiment. Gold support bounce', reflection: 'Good macro read', lesson: 'Gold rallies on risk-off' },
			{ asset: 'BTCUSD', dir: 'long', tf: '4h', entry: '2026-01-22 11:00:00+00', exit: '2026-01-23 11:00:00+00', entryP: 45200, exitP: 46100, size: 0.5, sl: 44500, tp: 47000, pnl: 450, rr: 1.29, outcome: 'win', plan: true, strat: trendId, thoughts: 'Institutional buying evident. Large orders', reflection: 'Great order flow read', lesson: 'Watch institutional footprints' },
			{ asset: 'AVAXUSD', dir: 'short', tf: '1h', entry: '2026-01-22 15:00:00+00', exit: '2026-01-23 09:00:00+00', entryP: 42.50, exitP: 44.20, size: 30, sl: 45.00, tp: 38.00, pnl: -51, rr: -0.68, outcome: 'loss', plan: false, strat: reversionId, thoughts: 'AVAX looks overbought', reflection: 'Misjudged momentum', lesson: 'Alts can stay overbought longer' },
			{ asset: 'EURUSD', dir: 'long', tf: '15m', entry: '2026-01-23 13:30:00+00', exit: '2026-01-23 15:00:00+00', entryP: 1.0850, exitP: 1.0890, size: 50000, sl: 1.0820, tp: 1.0920, pnl: 200, rr: 1.33, outcome: 'win', plan: true, strat: gapId, thoughts: 'NFP reaction trade. Beat expectations', reflection: 'Good news reaction', lesson: 'NFP provides good setups' },
			{ asset: 'BTCUSD', dir: 'long', tf: '4h', entry: '2026-01-23 14:00:00+00', exit: '2026-01-24 10:00:00+00', entryP: 46500, exitP: 47200, size: 0.6, sl: 45800, tp: 48000, pnl: 420, rr: 1.0, outcome: 'win', plan: true, strat: breakoutId, thoughts: 'ATH attempt. Breakout from consolidation', reflection: 'Good breakout trade', lesson: 'ATH breakouts can run far' },
			{ asset: 'ETHUSD', dir: 'short', tf: '1h', entry: '2026-01-24 09:00:00+00', exit: '2026-01-24 13:00:00+00', entryP: 2520, exitP: 2480, size: 2, sl: 2580, tp: 2420, pnl: 80, rr: 0.67, outcome: 'win', plan: true, strat: reversionId, thoughts: 'Profit taking setup. ETH extended', reflection: 'Good profit taking read', lesson: 'After big moves profit taking predictable' },
			{ asset: 'SOLUSD', dir: 'long', tf: '1h', entry: '2026-01-24 11:00:00+00', exit: '2026-01-24 15:00:00+00', entryP: 112.80, exitP: 115.40, size: 15, sl: 109.00, tp: 120.00, pnl: 39, rr: 0.68, outcome: 'win', plan: true, strat: trendId, thoughts: 'Alt momentum continuing. SOL following BTC', reflection: 'Good correlation trade', lesson: 'Trade alts when BTC leading' },
			{ asset: 'BTCUSD', dir: 'long', tf: '4h', entry: '2026-01-24 14:00:00+00', exit: null, entryP: 47500, exitP: null, size: 0.4, sl: 46500, tp: 49000, pnl: null, rr: null, outcome: null, plan: true, strat: trendId, thoughts: 'Continuation trade. Trend intact', reflection: null, lesson: null },
		]

		for (const t of tradesData) {
			await sql`
				INSERT INTO trades (
					id, asset, direction, timeframe, entry_date, exit_date,
					entry_price, exit_price, position_size, stop_loss, take_profit,
					pnl, realized_r_multiple, outcome, followed_plan, strategy_id,
					pre_trade_thoughts, post_trade_reflection, lesson_learned, is_archived
				) VALUES (
					gen_random_uuid(), ${t.asset}, ${t.dir}, ${t.tf}, ${t.entry}, ${t.exit},
					${t.entryP}, ${t.exitP}, ${t.size}, ${t.sl}, ${t.tp},
					${t.pnl}, ${t.rr}, ${t.outcome}, ${t.plan}, ${t.strat},
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

	// 9. Seed Daily Journals
	console.log("\n📦 Seeding daily journals...")
	try {
		await sql`
			INSERT INTO daily_journals (id, date, market_outlook, focus_goals, mental_state, session_review, emotional_state, key_takeaways, total_pnl, trade_count, win_count, loss_count) VALUES
				(gen_random_uuid(), '2026-01-02',
					'BTC showing strength above 42k. Looking for continuation or pullback entries. EUR weak after ECB comments.',
					'Focus on trend following setups only. No counter-trend trades. Max 3 trades today.',
					8,
					'Good day overall. Two winning trades, one loss. Followed the plan mostly.',
					7,
					'Patience on entries paid off. Need to hold winners longer.',
					45, 2, 1, 1),

				(gen_random_uuid(), '2026-01-03',
					'Continuation expected in forex. Crypto consolidating. Wait for breakout.',
					'Only trade A+ setups. Focus on forex during London session.',
					7,
					'One solid trade on EURUSD. Stayed patient.',
					8,
					'News-driven moves provide good opportunities.',
					235, 1, 1, 0),

				(gen_random_uuid(), '2026-01-04',
					'BTC extended. Watch for reversal signs. No clear forex setups.',
					'Do NOT short BTC without clear reversal. Wait for setup.',
					5,
					'Made a revenge trade on BTC short. Stupid mistake.',
					3,
					'Revenge trading is a losing game. Walk away after losses.',
					-195, 1, 0, 1),

				(gen_random_uuid(), '2026-01-05',
					'SOL showing relative strength. BTC consolidating. Good alt setup.',
					'Focus on relative strength plays. Keep position sizes moderate.',
					8,
					'Great day. SOL trade worked perfectly.',
					9,
					'Relative strength analysis helps find the best opportunities.',
					100.50, 1, 1, 0),

				(gen_random_uuid(), '2026-01-06',
					'GBP strong on UK data. London session should provide opportunities.',
					'Trade the London session. Focus on GBP pairs.',
					8,
					'Perfect GBP breakout trade. Clean execution.',
					9,
					'London session is best for GBP volatility.',
					180, 1, 1, 0),

				(gen_random_uuid(), '2026-01-07',
					'ETH showing weakness relative to BTC. Mean reversion setup possible.',
					'Look for exhaustion patterns. Keep size small on counter-trend.',
					7,
					'Two good trades. ETH short and BTC long worked.',
					8,
					'RSI divergence adds confidence to reversal setups.',
					420, 2, 2, 0),

				(gen_random_uuid(), '2026-01-08',
					'Gold looking for direction. BTC at support. Mixed signals.',
					'Be selective. Only clear setups.',
					6,
					'Scalp on gold didnt work. Small loss.',
					5,
					'Gold can be choppy. Wait for clear direction.',
					-35, 1, 0, 1),

				(gen_random_uuid(), '2026-01-09',
					'SOL divergence forming. BTC at key level.',
					'Watch for divergence plays. Patience is key.',
					7,
					'SOL worked, BTC failed. Net negative day.',
					5,
					'Volume confirmation is essential for breakouts.',
					-300, 2, 1, 1),

				(gen_random_uuid(), '2026-01-10',
					'EUR at support. Looking for bounce.',
					'Focus on support/resistance trades.',
					8,
					'Clean EURUSD support bounce. Good day.',
					8,
					'Daily levels are more reliable than intraday.',
					180, 1, 1, 0),

				(gen_random_uuid(), '2026-01-11',
					'ETH oversold. AVAX showing strength in alts.',
					'Look for oversold bounces. Watch alt correlations.',
					8,
					'Two winning trades. Good alt selection.',
					9,
					'Alts move together. Pick the strongest one.',
					410, 2, 2, 0),

				(gen_random_uuid(), '2026-01-12',
					'BTC forming double top. Watch for rejection.',
					'Pattern recognition focus. Double tops are reliable.',
					7,
					'Double top played out perfectly.',
					8,
					'Chart patterns still work. Trust the process.',
					180, 1, 1, 0),

				(gen_random_uuid(), '2026-01-13',
					'GBP extended. LINK accumulating.',
					'Dont short strong trends. Wait for clear setups.',
					6,
					'Forced a GBPUSD short. Bad idea. LINK worked though.',
					5,
					'Dont fight the trend. Patience is crucial.',
					30, 2, 1, 1),

				(gen_random_uuid(), '2026-01-14',
					'BTC forming higher lows. Continuation expected.',
					'Look for trend continuation setups.',
					8,
					'Good BTC trade. Higher lows confirmed.',
					8,
					'Higher lows confirm bullish structure.',
					220, 1, 1, 0),

				(gen_random_uuid(), '2026-01-15',
					'ETH overbought but strong. SOL at support.',
					'Dont fade strong trends. Look for support plays.',
					6,
					'Forced ETH short. SOL worked. Net negative.',
					5,
					'Strong trends stay strong longer than expected.',
					-5, 2, 1, 1),

				(gen_random_uuid(), '2026-01-16',
					'Gold at resistance. BTC trending well.',
					'Focus on clear setups. Multiple timeframe analysis.',
					8,
					'Great day. Both trades worked.',
					9,
					'Patience and discipline pay off.',
					630, 2, 2, 0),

				(gen_random_uuid(), '2026-01-17',
					'ECB speech expected. DOGE pumping on social media.',
					'Trade the news. Avoid meme coins!',
					7,
					'EUR trade worked. FOMO into DOGE was stupid.',
					3,
					'NEVER chase meme coin pumps!',
					-10, 2, 1, 1),

				(gen_random_uuid(), '2026-01-18',
					'BTC consolidating. Quick scalp possible. ETH ratio turning.',
					'Focus on scalps and ratio plays.',
					8,
					'Both trades worked. Good day.',
					9,
					'ETH/BTC ratio is valuable signal.',
					360, 2, 2, 0),

				(gen_random_uuid(), '2026-01-19',
					'Layer 2 narrative. MATIC setup. BTC weekend breakout possible.',
					'Trade the narrative. Watch weekend moves.',
					7,
					'MATIC didnt work. BTC breakout was clean.',
					6,
					'Narrative trades need broad market support.',
					120, 2, 1, 1),

				(gen_random_uuid(), '2026-01-20',
					'GBP breakout forming. SOL overbought.',
					'Trade clear breakouts. Fade overbought carefully.',
					8,
					'Both trades worked perfectly.',
					9,
					'Clear setups lead to clean trades.',
					276, 2, 2, 0),

				(gen_random_uuid(), '2026-01-21',
					'BTC momentum strong. ETH continuation expected.',
					'Dont fight BTC momentum. Trade with trend.',
					7,
					'Tried shorting BTC again. ETH long worked.',
					6,
					'Stop trying to short strong markets.',
					40, 2, 1, 1),

				(gen_random_uuid(), '2026-01-22',
					'Risk-off sentiment. Gold could rally. Institutional BTC buying.',
					'Watch macro context. Follow institutional flows.',
					8,
					'Three winners. Great macro reads.',
					9,
					'Institutional footprints are valuable signals.',
					477, 3, 2, 1),

				(gen_random_uuid(), '2026-01-23',
					'NFP day. BTC at ATH attempt.',
					'Wait for NFP dust to settle. Trade the reaction.',
					8,
					'Perfect NFP trade and BTC breakout.',
					9,
					'News reactions provide great opportunities.',
					620, 2, 2, 0),

				(gen_random_uuid(), '2026-01-24',
					'Markets extended. Profit taking expected. SOL following.',
					'Take quick profits. Dont overstay.',
					7,
					'Good profit taking trades. One position still open.',
					8,
					'After big moves, profit taking is predictable.',
					119, 2, 2, 0)
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
