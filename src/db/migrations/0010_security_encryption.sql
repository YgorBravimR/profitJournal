-- Migration: Security Encryption
-- Converts numeric/decimal columns to text for AES-256-GCM encrypted storage.
-- Adds encrypted_dek column to users for envelope encryption.
-- After applying this migration, run: pnpm tsx scripts/migrate-encrypt-existing-data.ts

-- ==========================================
-- USERS TABLE
-- ==========================================
ALTER TABLE "users" ADD COLUMN "encrypted_dek" text;
ALTER TABLE "users" ALTER COLUMN "name" TYPE text;

-- ==========================================
-- TRADES TABLE
-- ==========================================
ALTER TABLE "trades" ALTER COLUMN "entry_price" TYPE text;
ALTER TABLE "trades" ALTER COLUMN "exit_price" TYPE text;
ALTER TABLE "trades" ALTER COLUMN "position_size" TYPE text;
ALTER TABLE "trades" ALTER COLUMN "stop_loss" TYPE text;
ALTER TABLE "trades" ALTER COLUMN "take_profit" TYPE text;
ALTER TABLE "trades" ALTER COLUMN "planned_risk_amount" TYPE text;
ALTER TABLE "trades" ALTER COLUMN "planned_r_multiple" TYPE text;
ALTER TABLE "trades" ALTER COLUMN "pnl" TYPE text;
ALTER TABLE "trades" ALTER COLUMN "commission" TYPE text;
ALTER TABLE "trades" ALTER COLUMN "fees" TYPE text;

-- ==========================================
-- TRADE EXECUTIONS TABLE
-- ==========================================
ALTER TABLE "trade_executions" ALTER COLUMN "price" TYPE text;
ALTER TABLE "trade_executions" ALTER COLUMN "quantity" TYPE text;
ALTER TABLE "trade_executions" ALTER COLUMN "commission" TYPE text;
ALTER TABLE "trade_executions" ALTER COLUMN "fees" TYPE text;
ALTER TABLE "trade_executions" ALTER COLUMN "slippage" TYPE text;
ALTER TABLE "trade_executions" ALTER COLUMN "execution_value" TYPE text;

-- ==========================================
-- TRADING ACCOUNTS TABLE
-- ==========================================
ALTER TABLE "trading_accounts" ALTER COLUMN "prop_firm_name" TYPE text;
ALTER TABLE "trading_accounts" ALTER COLUMN "profit_share_percentage" TYPE text;
ALTER TABLE "trading_accounts" ALTER COLUMN "day_trade_tax_rate" TYPE text;
ALTER TABLE "trading_accounts" ALTER COLUMN "swing_trade_tax_rate" TYPE text;
ALTER TABLE "trading_accounts" ALTER COLUMN "default_commission" TYPE text;
ALTER TABLE "trading_accounts" ALTER COLUMN "default_fees" TYPE text;
ALTER TABLE "trading_accounts" ALTER COLUMN "max_daily_loss" TYPE text;
ALTER TABLE "trading_accounts" ALTER COLUMN "max_monthly_loss" TYPE text;

-- ==========================================
-- MONTHLY PLANS TABLE
-- ==========================================
ALTER TABLE "monthly_plans" ALTER COLUMN "account_balance" TYPE text;
ALTER TABLE "monthly_plans" ALTER COLUMN "risk_per_trade_cents" TYPE text;
ALTER TABLE "monthly_plans" ALTER COLUMN "daily_loss_cents" TYPE text;
ALTER TABLE "monthly_plans" ALTER COLUMN "monthly_loss_cents" TYPE text;
ALTER TABLE "monthly_plans" ALTER COLUMN "weekly_loss_cents" TYPE text;
