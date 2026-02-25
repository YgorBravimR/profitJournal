ALTER TABLE "monthly_plans" ALTER COLUMN "account_balance" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "monthly_plans" ALTER COLUMN "weekly_loss_cents" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "monthly_plans" ALTER COLUMN "risk_per_trade_cents" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "monthly_plans" ALTER COLUMN "daily_loss_cents" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "monthly_plans" ALTER COLUMN "monthly_loss_cents" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trade_executions" ALTER COLUMN "price" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trade_executions" ALTER COLUMN "quantity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trade_executions" ALTER COLUMN "commission" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trade_executions" ALTER COLUMN "commission" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "trade_executions" ALTER COLUMN "fees" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trade_executions" ALTER COLUMN "fees" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "trade_executions" ALTER COLUMN "slippage" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trade_executions" ALTER COLUMN "slippage" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "trade_executions" ALTER COLUMN "execution_value" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "entry_price" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "exit_price" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "position_size" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "stop_loss" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "take_profit" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "planned_risk_amount" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "planned_r_multiple" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "pnl" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "commission" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "commission" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "fees" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "fees" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "prop_firm_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "profit_share_percentage" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "profit_share_percentage" SET DEFAULT '100.00';--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "day_trade_tax_rate" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "day_trade_tax_rate" SET DEFAULT '20.00';--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "swing_trade_tax_rate" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "swing_trade_tax_rate" SET DEFAULT '15.00';--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "max_daily_loss" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "max_monthly_loss" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "default_commission" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "default_commission" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "default_fees" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ALTER COLUMN "default_fees" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "encrypted_dek" text;