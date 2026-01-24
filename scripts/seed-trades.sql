-- Seed data for trades table
-- Generated from sample-trades.csv
-- Run with: psql $DATABASE_URL -f scripts/seed-trades.sql

INSERT INTO trades (
  id, asset, direction, timeframe, entry_date, exit_date,
  entry_price, exit_price, position_size, stop_loss, take_profit,
  pnl, outcome, followed_plan, pre_trade_thoughts, is_archived
) VALUES
  -- BTCUSD long 2026-01-02
  (gen_random_uuid(), 'BTCUSD', 'long', '4h', '2026-01-02 10:00:00+00', '2026-01-02 18:00:00+00',
   42150, 42580, 0.5, 41800, 43000, 215, 'win', true, 'Breakout above resistance', false),

  -- ETHUSD long 2026-01-02
  (gen_random_uuid(), 'ETHUSD', 'long', '1h', '2026-01-02 14:00:00+00', '2026-01-03 10:00:00+00',
   2280, 2195, 2, 2200, 2400, -170, 'loss', true, 'Failed support bounce', false),

  -- EURUSD short 2026-01-03
  (gen_random_uuid(), 'EURUSD', 'short', '15m', '2026-01-03 09:00:00+00', '2026-01-03 15:00:00+00',
   1.0892, 1.0845, 50000, 1.0920, 1.0820, 235, 'win', true, 'News driven move', false),

  -- BTCUSD short 2026-01-04
  (gen_random_uuid(), 'BTCUSD', 'short', '4h', '2026-01-04 10:00:00+00', '2026-01-04 18:00:00+00',
   43200, 43850, 0.3, 43500, 42600, -195, 'loss', false, 'Counter trend mistake', false),

  -- SOLUSD long 2026-01-05
  (gen_random_uuid(), 'SOLUSD', 'long', '1h', '2026-01-05 11:00:00+00', '2026-01-06 14:00:00+00',
   98.50, 105.20, 15, 95.00, 110.00, 100.50, 'win', true, 'Momentum play', false),

  -- GBPUSD long 2026-01-06
  (gen_random_uuid(), 'GBPUSD', 'long', '1h', '2026-01-06 08:00:00+00', '2026-01-06 16:00:00+00',
   1.2520, 1.2580, 30000, 1.2480, 1.2620, 180, 'win', true, 'Clean breakout', false),

  -- ETHUSD short 2026-01-07
  (gen_random_uuid(), 'ETHUSD', 'short', '4h', '2026-01-07 10:00:00+00', '2026-01-07 18:00:00+00',
   2150, 2090, 3, 2200, 2050, 180, 'win', true, 'Rejection at resistance', false),

  -- BTCUSD long 2026-01-07
  (gen_random_uuid(), 'BTCUSD', 'long', '1d', '2026-01-07 12:00:00+00', '2026-01-08 12:00:00+00',
   41800, 42400, 0.4, 41200, 43000, 240, 'win', true, 'Daily support hold', false),

  -- XAUUSD long 2026-01-08
  (gen_random_uuid(), 'XAUUSD', 'long', '15m', '2026-01-08 09:00:00+00', '2026-01-08 11:00:00+00',
   2045, 2038, 5, 2035, 2065, -35, 'loss', true, 'Stopped out early', false),

  -- SOLUSD short 2026-01-09
  (gen_random_uuid(), 'SOLUSD', 'short', '1h', '2026-01-09 10:00:00+00', '2026-01-09 16:00:00+00',
   102.30, 99.80, 20, 105.00, 97.00, 50, 'win', true, 'Bearish divergence', false),

  -- BTCUSD long 2026-01-09
  (gen_random_uuid(), 'BTCUSD', 'long', '4h', '2026-01-09 14:00:00+00', '2026-01-10 10:00:00+00',
   42600, 41900, 0.5, 42000, 44000, -350, 'loss', false, 'Breakdown surprise', false),

  -- EURUSD long 2026-01-10
  (gen_random_uuid(), 'EURUSD', 'long', '1h', '2026-01-10 08:00:00+00', '2026-01-10 14:00:00+00',
   1.0780, 1.0825, 40000, 1.0750, 1.0850, 180, 'win', true, 'Reversal setup', false),

  -- ETHUSD long 2026-01-11
  (gen_random_uuid(), 'ETHUSD', 'long', '4h', '2026-01-11 10:00:00+00', '2026-01-11 18:00:00+00',
   2050, 2120, 4, 2000, 2150, 280, 'win', true, 'Oversold bounce', false),

  -- AVAXUSD long 2026-01-11
  (gen_random_uuid(), 'AVAXUSD', 'long', '1h', '2026-01-11 14:00:00+00', '2026-01-12 10:00:00+00',
   35.20, 37.80, 50, 33.50, 40.00, 130, 'win', true, 'Alt season play', false),

  -- BTCUSD short 2026-01-12
  (gen_random_uuid(), 'BTCUSD', 'short', '1h', '2026-01-12 09:00:00+00', '2026-01-12 15:00:00+00',
   43500, 43200, 0.6, 44000, 42500, 180, 'win', true, 'Double top pattern', false),

  -- GBPUSD short 2026-01-13
  (gen_random_uuid(), 'GBPUSD', 'short', '15m', '2026-01-13 10:00:00+00', '2026-01-13 14:00:00+00',
   1.2680, 1.2720, 25000, 1.2720, 1.2600, -100, 'loss', false, 'False breakdown', false),

  -- LINKUSD long 2026-01-13
  (gen_random_uuid(), 'LINKUSD', 'long', '4h', '2026-01-13 12:00:00+00', '2026-01-14 16:00:00+00',
   14.50, 15.80, 100, 13.80, 16.50, 130, 'win', true, 'Accumulation breakout', false),

  -- BTCUSD long 2026-01-14
  (gen_random_uuid(), 'BTCUSD', 'long', '1h', '2026-01-14 11:00:00+00', '2026-01-14 17:00:00+00',
   42800, 43350, 0.4, 42200, 44000, 220, 'win', true, 'Higher low formation', false),

  -- ETHUSD short 2026-01-15
  (gen_random_uuid(), 'ETHUSD', 'short', '1h', '2026-01-15 09:00:00+00', '2026-01-15 15:00:00+00',
   2180, 2220, 2.5, 2230, 2100, -100, 'loss', false, 'Wrong direction call', false),

  -- SOLUSD long 2026-01-15
  (gen_random_uuid(), 'SOLUSD', 'long', '4h', '2026-01-15 14:00:00+00', '2026-01-16 10:00:00+00',
   95.40, 99.20, 25, 92.00, 102.00, 95, 'win', true, 'Support bounce', false),

  -- XAUUSD short 2026-01-16
  (gen_random_uuid(), 'XAUUSD', 'short', '1h', '2026-01-16 08:00:00+00', '2026-01-16 14:00:00+00',
   2058, 2048, 8, 2068, 2038, 80, 'win', true, 'Resistance rejection', false),

  -- BTCUSD long 2026-01-16
  (gen_random_uuid(), 'BTCUSD', 'long', '4h', '2026-01-16 10:00:00+00', '2026-01-17 14:00:00+00',
   43100, 44200, 0.5, 42500, 45000, 550, 'win', true, 'Trend continuation', false),

  -- EURUSD short 2026-01-17
  (gen_random_uuid(), 'EURUSD', 'short', '1h', '2026-01-17 13:00:00+00', '2026-01-17 17:00:00+00',
   1.0920, 1.0880, 60000, 1.0950, 1.0850, 240, 'win', true, 'ECB speech reaction', false),

  -- DOGEUSD long 2026-01-17
  (gen_random_uuid(), 'DOGEUSD', 'long', '1h', '2026-01-17 16:00:00+00', '2026-01-18 10:00:00+00',
   0.0820, 0.0795, 10000, 0.0780, 0.0880, -250, 'loss', false, 'Meme pump fade', false),

  -- BTCUSD short 2026-01-18
  (gen_random_uuid(), 'BTCUSD', 'short', '15m', '2026-01-18 09:00:00+00', '2026-01-18 10:30:00+00',
   44500, 44100, 0.3, 45000, 43500, 120, 'win', true, 'Scalp trade', false),

  -- ETHUSD long 2026-01-18
  (gen_random_uuid(), 'ETHUSD', 'long', '4h', '2026-01-18 14:00:00+00', '2026-01-19 10:00:00+00',
   2240, 2320, 3, 2180, 2380, 240, 'win', true, 'ETH/BTC ratio play', false),

  -- MATICUSD long 2026-01-19
  (gen_random_uuid(), 'MATICUSD', 'long', '1h', '2026-01-19 11:00:00+00', '2026-01-19 17:00:00+00',
   0.92, 0.88, 500, 0.85, 1.00, -200, 'loss', true, 'Layer 2 narrative', false),

  -- BTCUSD long 2026-01-19
  (gen_random_uuid(), 'BTCUSD', 'long', '4h', '2026-01-19 15:00:00+00', '2026-01-20 11:00:00+00',
   44800, 45600, 0.4, 44200, 46500, 320, 'win', true, 'Weekend breakout', false),

  -- GBPUSD long 2026-01-20
  (gen_random_uuid(), 'GBPUSD', 'long', '1h', '2026-01-20 08:00:00+00', '2026-01-20 14:00:00+00',
   1.2750, 1.2810, 35000, 1.2700, 1.2850, 210, 'win', true, 'Clean setup', false),

  -- SOLUSD short 2026-01-20
  (gen_random_uuid(), 'SOLUSD', 'short', '4h', '2026-01-20 14:00:00+00', '2026-01-21 10:00:00+00',
   108.50, 105.20, 20, 112.00, 100.00, 66, 'win', true, 'Overbought condition', false),

  -- BTCUSD short 2026-01-21
  (gen_random_uuid(), 'BTCUSD', 'short', '1h', '2026-01-21 09:00:00+00', '2026-01-21 13:00:00+00',
   45800, 46200, 0.25, 46500, 44500, -100, 'loss', false, 'Caught in squeeze', false),

  -- ETHUSD long 2026-01-21
  (gen_random_uuid(), 'ETHUSD', 'long', '4h', '2026-01-21 14:00:00+00', '2026-01-22 10:00:00+00',
   2380, 2450, 2, 2320, 2500, 140, 'win', true, 'Bullish continuation', false),

  -- XAUUSD long 2026-01-22
  (gen_random_uuid(), 'XAUUSD', 'long', '1h', '2026-01-22 09:00:00+00', '2026-01-22 15:00:00+00',
   2072, 2085, 6, 2060, 2095, 78, 'win', true, 'Risk off move', false),

  -- BTCUSD long 2026-01-22
  (gen_random_uuid(), 'BTCUSD', 'long', '4h', '2026-01-22 11:00:00+00', '2026-01-23 11:00:00+00',
   45200, 46100, 0.5, 44500, 47000, 450, 'win', true, 'Institutional buying', false),

  -- AVAXUSD short 2026-01-22
  (gen_random_uuid(), 'AVAXUSD', 'short', '1h', '2026-01-22 15:00:00+00', '2026-01-23 09:00:00+00',
   42.50, 44.20, 30, 45.00, 38.00, -51, 'loss', false, 'Misjudged momentum', false),

  -- EURUSD long 2026-01-23
  (gen_random_uuid(), 'EURUSD', 'long', '15m', '2026-01-23 13:30:00+00', '2026-01-23 15:00:00+00',
   1.0850, 1.0890, 50000, 1.0820, 1.0920, 200, 'win', true, 'NFP reaction', false),

  -- BTCUSD long 2026-01-23
  (gen_random_uuid(), 'BTCUSD', 'long', '4h', '2026-01-23 14:00:00+00', '2026-01-24 10:00:00+00',
   46500, 47200, 0.6, 45800, 48000, 420, 'win', true, 'ATH attempt', false),

  -- ETHUSD short 2026-01-24
  (gen_random_uuid(), 'ETHUSD', 'short', '1h', '2026-01-24 09:00:00+00', '2026-01-24 13:00:00+00',
   2520, 2480, 2, 2580, 2420, 80, 'win', true, 'Profit taking setup', false),

  -- SOLUSD long 2026-01-24
  (gen_random_uuid(), 'SOLUSD', 'long', '1h', '2026-01-24 11:00:00+00', '2026-01-24 15:00:00+00',
   112.80, 115.40, 15, 109.00, 120.00, 39, 'win', true, 'Alt momentum', false),

  -- BTCUSD long 2026-01-24 (open position)
  (gen_random_uuid(), 'BTCUSD', 'long', '4h', '2026-01-24 14:00:00+00', NULL,
   47500, NULL, 0.4, 46500, 49000, NULL, NULL, true, 'Open position', false);
