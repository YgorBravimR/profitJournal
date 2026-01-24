-- Seed data for strategies table
-- Run this SQL in your database to add sample playbook strategies

-- 15m Breakout Strategy
INSERT INTO strategies (id, code, name, description, entry_criteria, exit_criteria, risk_rules, target_r_multiple, max_risk_percent, is_active, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  '15BK',
  '15m Breakout',
  'Trade breakouts on the 15-minute timeframe after consolidation periods',
  '- Price consolidates for at least 6 candles
- Breakout candle closes above/below consolidation range
- Volume spike on breakout (1.5x average)
- Not against higher timeframe trend',
  '- Take profit at 2R target
- Move stop to breakeven at 1R
- Exit if price re-enters consolidation zone
- Time stop: exit if no follow-through within 8 candles',
  '- Max 1% account risk per trade
- No trading during major news events
- Max 2 breakout trades per session
- Avoid low volatility days',
  2.00,
  1.00,
  true,
  NOW(),
  NOW()
);

-- 4h Trend Continuation
INSERT INTO strategies (id, code, name, description, entry_criteria, exit_criteria, risk_rules, target_r_multiple, max_risk_percent, is_active, created_at, updated_at)
VALUES (
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  '4HTR',
  '4h Trend Continuation',
  'Ride the trend on 4-hour timeframe with pullback entries',
  '- Clear trend established (higher highs/lows or lower highs/lows)
- Pullback to key support/resistance or moving average
- Bullish/bearish engulfing or pin bar at entry zone
- RSI not overbought/oversold against entry direction',
  '- Initial target at previous swing high/low
- Trail stop below/above each new swing point
- Partial profit at 1.5R, let rest run
- Exit on trend break (lower low in uptrend, higher high in downtrend)',
  '- Max 2% account risk per trade
- Only trade with the daily trend
- Wait for pullback, no chasing
- One position per asset at a time',
  3.00,
  2.00,
  true,
  NOW(),
  NOW()
);

-- 1h Support/Resistance Reversal
INSERT INTO strategies (id, code, name, description, entry_criteria, exit_criteria, risk_rules, target_r_multiple, max_risk_percent, is_active, created_at, updated_at)
VALUES (
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  '1HSR',
  '1h S/R Reversal',
  'Counter-trend reversals at major support and resistance levels on 1-hour timeframe',
  '- Price reaches major daily S/R level
- Rejection candle (long wick, small body)
- Divergence on RSI or MACD preferred
- At least 2 previous touches of the level',
  '- Target opposite S/R level or 2R minimum
- Stop beyond the wick of rejection candle
- Move to breakeven after clear follow-through
- Exit if price closes beyond the level',
  '- Max 1.5% risk per trade
- Counter-trend = smaller size (50% of normal)
- Requires daily level, not intraday
- No reversal trades on trend days',
  2.50,
  1.50,
  true,
  NOW(),
  NOW()
);

-- Scalp Strategy
INSERT INTO strategies (id, code, name, description, entry_criteria, exit_criteria, risk_rules, target_r_multiple, max_risk_percent, is_active, created_at, updated_at)
VALUES (
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  'SCLP',
  'Quick Scalp',
  'Fast in-and-out trades on lower timeframes during high volatility',
  '- High volatility session (London/NY open)
- Clear momentum in one direction
- Entry on minor pullback (not chasing)
- Tight spread required',
  '- Fixed 1R target (quick exit)
- Stop at recent swing
- No holding through consolidation
- Max 15 minute hold time',
  '- Max 0.5% risk per scalp
- Max 5 scalps per session
- Stop trading after 2 consecutive losses
- Only during peak hours',
  1.00,
  0.50,
  true,
  NOW(),
  NOW()
);

-- Daily Swing Strategy
INSERT INTO strategies (id, code, name, description, entry_criteria, exit_criteria, risk_rules, target_r_multiple, max_risk_percent, is_active, created_at, updated_at)
VALUES (
  'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b',
  'DSWG',
  'Daily Swing',
  'Multi-day swing trades based on daily chart setups',
  '- Daily chart setup (engulfing, pin bar, inside bar breakout)
- In direction of weekly trend
- Not at major resistance/support against the trade
- Clean price action, no chop',
  '- Target at next major S/R level
- Trail with daily candle lows/highs
- Partial at 2R, full exit at structure
- Hold through minor pullbacks',
  '- Max 2% risk per trade
- Only 1-2 swing positions at a time
- Check weekly levels before entry
- Avoid earnings/major events',
  4.00,
  2.00,
  true,
  NOW(),
  NOW()
);
