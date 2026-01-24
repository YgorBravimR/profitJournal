-- Seed Asset Types
-- Run with: psql $DATABASE_URL -f scripts/seed-asset-types.sql

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
  description = EXCLUDED.description;
