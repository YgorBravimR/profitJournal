-- Seed Assets
-- Run AFTER seed-asset-types.sql
-- Run with: psql $DATABASE_URL -f scripts/seed-assets.sql
-- NOTE: tick_value, commission, fees are stored in CENTS (integers)

-- Brazilian Market (B3)
INSERT INTO assets (id, symbol, name, asset_type_id, tick_size, tick_value, currency, multiplier, commission, fees, is_active) VALUES
  -- Futures (tick_value in cents: 0.20 = 20 cents, 10.00 = 1000 cents, etc.)
  (gen_random_uuid(), 'WINFUT', 'Mini Índice Bovespa', (SELECT id FROM asset_types WHERE code = 'FUTURE_INDEX'), 5, 20, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'WDOFUT', 'Mini Dólar', (SELECT id FROM asset_types WHERE code = 'FUTURE_FX'), 0.5, 1000, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'INDFUT', 'Índice Cheio', (SELECT id FROM asset_types WHERE code = 'FUTURE_INDEX'), 5, 100, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'DOLFUT', 'Dólar Cheio', (SELECT id FROM asset_types WHERE code = 'FUTURE_FX'), 0.5, 5000, 'BRL', 1, 0, 0, true),

  -- Stocks (Blue Chips) - tick_value 0.01 = 1 cent
  (gen_random_uuid(), 'PETR4', 'Petrobras PN', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'VALE3', 'Vale ON', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'ITUB4', 'Itaú Unibanco PN', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'BBDC4', 'Bradesco PN', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'ABEV3', 'Ambev ON', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'B3SA3', 'B3 ON', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'MGLU3', 'Magazine Luiza ON', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'BBAS3', 'Banco do Brasil ON', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'WEGE3', 'WEG ON', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true),
  (gen_random_uuid(), 'RENT3', 'Localiza ON', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'BRL', 1, 0, 0, true)
ON CONFLICT (symbol) DO UPDATE SET
  name = EXCLUDED.name,
  tick_size = EXCLUDED.tick_size,
  tick_value = EXCLUDED.tick_value,
  currency = EXCLUDED.currency;

-- International Market
INSERT INTO assets (id, symbol, name, asset_type_id, tick_size, tick_value, currency, multiplier, commission, fees, is_active) VALUES
  -- US Futures (tick_value in cents: 12.50 = 1250 cents, etc.)
  (gen_random_uuid(), 'ES', 'E-mini S&P 500', (SELECT id FROM asset_types WHERE code = 'FUTURE_INDEX'), 0.25, 1250, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'NQ', 'E-mini Nasdaq 100', (SELECT id FROM asset_types WHERE code = 'FUTURE_INDEX'), 0.25, 500, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'MES', 'Micro E-mini S&P 500', (SELECT id FROM asset_types WHERE code = 'FUTURE_INDEX'), 0.25, 125, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'MNQ', 'Micro E-mini Nasdaq', (SELECT id FROM asset_types WHERE code = 'FUTURE_INDEX'), 0.25, 50, 'USD', 1, 0, 0, true),

  -- Crypto (tick_value 0.01 = 1 cent)
  (gen_random_uuid(), 'BTCUSD', 'Bitcoin/USD', (SELECT id FROM asset_types WHERE code = 'CRYPTO'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'ETHUSD', 'Ethereum/USD', (SELECT id FROM asset_types WHERE code = 'CRYPTO'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'SOLUSD', 'Solana/USD', (SELECT id FROM asset_types WHERE code = 'CRYPTO'), 0.01, 1, 'USD', 1, 0, 0, true),

  -- Forex (tick_value 10.00 = 1000 cents)
  (gen_random_uuid(), 'EURUSD', 'EUR/USD', (SELECT id FROM asset_types WHERE code = 'FOREX'), 0.0001, 1000, 'USD', 100000, 0, 0, true),
  (gen_random_uuid(), 'GBPUSD', 'GBP/USD', (SELECT id FROM asset_types WHERE code = 'FOREX'), 0.0001, 1000, 'USD', 100000, 0, 0, true),
  (gen_random_uuid(), 'USDJPY', 'USD/JPY', (SELECT id FROM asset_types WHERE code = 'FOREX'), 0.01, 100000, 'JPY', 100000, 0, 0, true),

  -- US Stocks (tick_value 0.01 = 1 cent)
  (gen_random_uuid(), 'AAPL', 'Apple Inc', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'MSFT', 'Microsoft Corp', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'NVDA', 'NVIDIA Corp', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'TSLA', 'Tesla Inc', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'AMZN', 'Amazon.com Inc', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'GOOGL', 'Alphabet Inc', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'META', 'Meta Platforms Inc', (SELECT id FROM asset_types WHERE code = 'STOCK'), 0.01, 1, 'USD', 1, 0, 0, true),

  -- ETFs (tick_value 0.01 = 1 cent)
  (gen_random_uuid(), 'SPY', 'SPDR S&P 500 ETF', (SELECT id FROM asset_types WHERE code = 'ETF'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'QQQ', 'Invesco QQQ Trust', (SELECT id FROM asset_types WHERE code = 'ETF'), 0.01, 1, 'USD', 1, 0, 0, true),
  (gen_random_uuid(), 'IWM', 'iShares Russell 2000', (SELECT id FROM asset_types WHERE code = 'ETF'), 0.01, 1, 'USD', 1, 0, 0, true)
ON CONFLICT (symbol) DO UPDATE SET
  name = EXCLUDED.name,
  tick_size = EXCLUDED.tick_size,
  tick_value = EXCLUDED.tick_value,
  currency = EXCLUDED.currency;
