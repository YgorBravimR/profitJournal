-- Seed data for trades table
-- Only Mini Índice (WINFUT) and Mini Dólar (WDOFUT) trades
-- Run with: psql $DATABASE_URL -f scripts/seed-trades.sql
-- NOTE: pnl is stored in CENTS (integers), timeframe_id is UUID FK

INSERT INTO trades (
  id, asset, direction, timeframe_id, entry_date, exit_date,
  entry_price, exit_price, position_size, stop_loss, take_profit,
  pnl, outcome, followed_plan, pre_trade_thoughts, is_archived
) VALUES
  -- WINFUT trades - January 2nd (Big winning day)
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-02 09:15:00+00', '2026-01-02 10:45:00+00',
   127500, 128200, 5, 127200, 128500, 70000, 'win', true, 'Opening momentum. Clean breakout above 127500', false),

  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-02 11:30:00+00', '2026-01-02 14:00:00+00',
   128050, 129100, 8, 127700, 129500, 168000, 'win', true, 'Trend continuation after pullback to 128000', false),

  -- WDOFUT trade - January 2nd
  (gen_random_uuid(), 'WDOFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-02 10:00:00+00', '2026-01-02 11:30:00+00',
   4985, 4962, 3, 4995, 4950, 138000, 'win', true, 'Dollar weakness after USD data', false),

  -- January 3rd - Breakeven day with small loss
  (gen_random_uuid(), 'WINFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-03 09:30:00+00', '2026-01-03 10:15:00+00',
   129200, 129450, 4, 129500, 128800, -20000, 'loss', true, 'Failed breakdown attempt', false),

  (gen_random_uuid(), 'WDOFUT', 'long', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-03 11:00:00+00', '2026-01-03 13:30:00+00',
   4958, 4975, 2, 4945, 4990, 34000, 'win', true, 'Dollar recovery play', false),

  -- January 6th - HUGE DRAWDOWN DAY (revenge trading disaster)
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-06 09:10:00+00', '2026-01-06 09:35:00+00',
   128800, 128200, 10, 128500, 129500, -120000, 'loss', false, 'FOMO entry on gap. No confirmation', false),

  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-06 09:45:00+00', '2026-01-06 10:10:00+00',
   128100, 127500, 15, 127800, 128800, -180000, 'loss', false, 'Revenge trade. Doubled down on losing position', false),

  (gen_random_uuid(), 'WINFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-06 10:30:00+00', '2026-01-06 11:00:00+00',
   127600, 128000, 12, 128100, 127000, -96000, 'loss', false, 'Another revenge trade. Should have stopped', false),

  -- January 7th - Recovery day
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-07 09:30:00+00', '2026-01-07 12:30:00+00',
   127200, 128500, 6, 126800, 128800, 156000, 'win', true, 'Clean setup. Waited for confirmation', false),

  (gen_random_uuid(), 'WDOFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-07 10:00:00+00', '2026-01-07 11:30:00+00',
   5025, 4995, 4, 5040, 4980, 120000, 'win', true, 'Dollar reversal at resistance', false),

  -- January 8th - Consistent wins
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-08 09:20:00+00', '2026-01-08 10:45:00+00',
   128600, 129200, 5, 128300, 129500, 60000, 'win', true, 'Breakout with volume', false),

  (gen_random_uuid(), 'WINFUT', 'short', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-08 13:00:00+00', '2026-01-08 15:00:00+00',
   129500, 128800, 6, 129800, 128500, 84000, 'win', true, 'End of day reversal setup', false),

  -- January 9th - Another bad day
  (gen_random_uuid(), 'WDOFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-09 09:30:00+00', '2026-01-09 10:00:00+00',
   4980, 4955, 5, 4965, 5010, -125000, 'loss', false, 'Wrong read on dollar direction', false),

  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-09 10:30:00+00', '2026-01-09 11:15:00+00',
   128200, 127700, 8, 127900, 128700, -80000, 'loss', true, 'Stopped out on volatility spike', false),

  -- January 10th - BIG WINNING DAY
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-10 09:15:00+00', '2026-01-10 11:00:00+00',
   127000, 128500, 10, 126700, 129000, 300000, 'win', true, 'Perfect trend day. Scaled in properly', false),

  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-10 11:30:00+00', '2026-01-10 14:30:00+00',
   128400, 129800, 12, 128100, 130000, 336000, 'win', true, 'Trend continuation. Added on strength', false),

  (gen_random_uuid(), 'WDOFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-10 10:00:00+00', '2026-01-10 12:00:00+00',
   5050, 4990, 6, 5070, 4970, 360000, 'win', true, 'Dollar collapse. Rode the move', false),

  -- January 13th - Mixed day
  (gen_random_uuid(), 'WINFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-13 09:30:00+00', '2026-01-13 10:30:00+00',
   129800, 129300, 5, 130100, 129000, 50000, 'win', true, 'Overbought reversal setup', false),

  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-13 11:00:00+00', '2026-01-13 11:45:00+00',
   129200, 128800, 6, 128900, 129800, -48000, 'loss', true, 'False breakout. Tight stop hit', false),

  (gen_random_uuid(), 'WDOFUT', 'long', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-13 13:00:00+00', '2026-01-13 15:30:00+00',
   4975, 5010, 4, 4960, 5030, 140000, 'win', true, 'Dollar afternoon rally', false),

  -- January 14th - HUGE WINNING DAY (best day of the month)
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-14 09:10:00+00', '2026-01-14 12:00:00+00',
   128000, 130200, 15, 127700, 130500, 660000, 'win', true, 'Gap up continuation. Heavy size on A+ setup', false),

  (gen_random_uuid(), 'WDOFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-14 09:30:00+00', '2026-01-14 11:30:00+00',
   5080, 5020, 8, 5100, 5000, 480000, 'win', true, 'Dollar weakness correlation with index strength', false),

  -- January 15th - Small loss day
  (gen_random_uuid(), 'WINFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-15 09:30:00+00', '2026-01-15 10:15:00+00',
   130100, 130400, 5, 130500, 129600, -30000, 'loss', true, 'Counter-trend fade failed', false),

  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-15 11:00:00+00', '2026-01-15 13:00:00+00',
   130300, 130150, 4, 130000, 130800, -12000, 'loss', true, 'Chopped out on range day', false),

  -- January 16th - Solid day
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-16 09:20:00+00', '2026-01-16 11:00:00+00',
   129800, 130700, 8, 129500, 131000, 144000, 'win', true, 'Strong open. Rode the momentum', false),

  (gen_random_uuid(), 'WDOFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-16 10:00:00+00', '2026-01-16 12:00:00+00',
   5005, 5045, 5, 4990, 5060, 200000, 'win', true, 'Dollar strength on risk-off', false),

  -- January 17th - Another drawdown (overtrading)
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-17 09:10:00+00', '2026-01-17 09:30:00+00',
   130500, 130100, 8, 130200, 131000, -64000, 'loss', false, 'Early entry no confirmation', false),

  (gen_random_uuid(), 'WINFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-17 09:45:00+00', '2026-01-17 10:15:00+00',
   130200, 130600, 10, 130700, 129700, -80000, 'loss', false, 'Flip-flopping direction', false),

  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-17 10:30:00+00', '2026-01-17 11:00:00+00',
   130500, 130000, 8, 130100, 131000, -80000, 'loss', false, 'More revenge trading. Disaster', false),

  (gen_random_uuid(), 'WDOFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-17 11:30:00+00', '2026-01-17 12:30:00+00',
   5035, 5055, 5, 5055, 5000, -100000, 'loss', false, 'Stopped at the exact high. Bad day', false),

  -- January 20th - Recovery and discipline
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-20 09:30:00+00', '2026-01-20 13:00:00+00',
   129500, 131000, 6, 129100, 131500, 180000, 'win', true, 'Patient entry. Waited for setup', false),

  (gen_random_uuid(), 'WDOFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-20 10:30:00+00', '2026-01-20 12:00:00+00',
   5080, 5050, 4, 5095, 5030, 120000, 'win', true, 'Dollar weakness on index strength', false),

  -- January 21st - Consistent
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-21 09:20:00+00', '2026-01-21 10:30:00+00',
   130800, 131400, 5, 130500, 131800, 60000, 'win', true, 'Breakout continuation', false),

  (gen_random_uuid(), 'WINFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-21 13:00:00+00', '2026-01-21 14:00:00+00',
   131600, 131200, 4, 131900, 130800, 32000, 'win', true, 'End of day profit taking', false),

  -- January 22nd - Small loss
  (gen_random_uuid(), 'WDOFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-22 09:30:00+00', '2026-01-22 10:15:00+00',
   5040, 5020, 3, 5025, 5070, -60000, 'loss', true, 'Wrong direction. Quick exit', false),

  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-22 11:00:00+00', '2026-01-22 14:00:00+00',
   131000, 131600, 5, 130700, 132000, 60000, 'win', true, 'Recovered with clean setup', false),

  -- January 23rd - Good day
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-23 09:15:00+00', '2026-01-23 11:30:00+00',
   131200, 132500, 8, 130900, 132800, 208000, 'win', true, 'Strong trend day. Scaled in', false),

  (gen_random_uuid(), 'WDOFUT', 'short', (SELECT id FROM timeframes WHERE code = '5m'), '2026-01-23 10:00:00+00', '2026-01-23 12:00:00+00',
   5065, 5025, 5, 5080, 5000, 200000, 'win', true, 'Dollar selloff with index rally', false),

  -- January 24th - Open position
  (gen_random_uuid(), 'WINFUT', 'long', (SELECT id FROM timeframes WHERE code = '15m'), '2026-01-24 09:30:00+00', NULL,
   132300, NULL, 6, 131900, 133500, NULL, NULL, true, 'Trend continuation setup. Position open', false);
