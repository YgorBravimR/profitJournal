ALTER TABLE "account_assets" ADD COLUMN "breakeven_ticks_override" integer;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "default_breakeven_ticks" integer DEFAULT 2 NOT NULL;