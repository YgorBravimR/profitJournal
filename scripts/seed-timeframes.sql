-- Seed Timeframes
-- Run with: psql $DATABASE_URL -f scripts/seed-timeframes.sql

-- Time-based timeframes
INSERT INTO timeframes (id, code, name, type, value, unit, sort_order, is_active) VALUES
  (gen_random_uuid(), '1M', '1 Minute', 'time_based', 1, 'minutes', 10, true),
  (gen_random_uuid(), '2M', '2 Minutes', 'time_based', 2, 'minutes', 20, true),
  (gen_random_uuid(), '3M', '3 Minutes', 'time_based', 3, 'minutes', 30, true),
  (gen_random_uuid(), '5M', '5 Minutes', 'time_based', 5, 'minutes', 40, true),
  (gen_random_uuid(), '10M', '10 Minutes', 'time_based', 10, 'minutes', 50, true),
  (gen_random_uuid(), '15M', '15 Minutes', 'time_based', 15, 'minutes', 60, true),
  (gen_random_uuid(), '30M', '30 Minutes', 'time_based', 30, 'minutes', 70, true),
  (gen_random_uuid(), '1H', '1 Hour', 'time_based', 1, 'hours', 80, true),
  (gen_random_uuid(), '2H', '2 Hours', 'time_based', 2, 'hours', 90, true),
  (gen_random_uuid(), '4H', '4 Hours', 'time_based', 4, 'hours', 100, true),
  (gen_random_uuid(), '1D', 'Daily', 'time_based', 1, 'days', 110, true),
  (gen_random_uuid(), '1W', 'Weekly', 'time_based', 1, 'weeks', 120, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  unit = EXCLUDED.unit,
  sort_order = EXCLUDED.sort_order;

-- Renko timeframes
INSERT INTO timeframes (id, code, name, type, value, unit, sort_order, is_active) VALUES
  (gen_random_uuid(), '5R', 'Renko 5 ticks', 'renko', 5, 'ticks', 200, true),
  (gen_random_uuid(), '10R', 'Renko 10 ticks', 'renko', 10, 'ticks', 210, true),
  (gen_random_uuid(), '13R', 'Renko 13 ticks', 'renko', 13, 'ticks', 220, true),
  (gen_random_uuid(), '15R', 'Renko 15 ticks', 'renko', 15, 'ticks', 230, true),
  (gen_random_uuid(), '20R', 'Renko 20 ticks', 'renko', 20, 'ticks', 240, true),
  (gen_random_uuid(), '25R', 'Renko 25 ticks', 'renko', 25, 'ticks', 250, true),
  (gen_random_uuid(), '50R', 'Renko 50 ticks', 'renko', 50, 'ticks', 260, true),
  (gen_random_uuid(), '5RP', 'Renko 5 points', 'renko', 5, 'points', 300, true),
  (gen_random_uuid(), '10RP', 'Renko 10 points', 'renko', 10, 'points', 310, true),
  (gen_random_uuid(), '25RP', 'Renko 25 points', 'renko', 25, 'points', 320, true),
  (gen_random_uuid(), '50RP', 'Renko 50 points', 'renko', 50, 'points', 330, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  unit = EXCLUDED.unit,
  sort_order = EXCLUDED.sort_order;
