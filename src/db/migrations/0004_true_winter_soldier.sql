ALTER TABLE "daily_targets" ADD COLUMN "account_balance" integer;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "max_monthly_loss" integer;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "allow_second_op_after_loss" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "reduce_risk_after_loss" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "risk_reduction_factor" numeric(5, 2);