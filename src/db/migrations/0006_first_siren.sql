CREATE TABLE "monthly_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"account_balance" integer NOT NULL,
	"risk_per_trade_percent" numeric(5, 2) NOT NULL,
	"daily_loss_percent" numeric(5, 2) NOT NULL,
	"monthly_loss_percent" numeric(5, 2) NOT NULL,
	"daily_profit_target_percent" numeric(5, 2),
	"max_daily_trades" integer,
	"max_consecutive_losses" integer,
	"allow_second_op_after_loss" boolean DEFAULT true,
	"reduce_risk_after_loss" boolean DEFAULT false,
	"risk_reduction_factor" numeric(5, 2),
	"increase_risk_after_win" boolean DEFAULT false,
	"profit_reinvestment_percent" numeric(5, 2),
	"notes" text,
	"risk_per_trade_cents" integer NOT NULL,
	"daily_loss_cents" integer NOT NULL,
	"monthly_loss_cents" integer NOT NULL,
	"daily_profit_target_cents" integer,
	"derived_max_daily_trades" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monthly_plans" ADD CONSTRAINT "monthly_plans_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "monthly_plans_account_idx" ON "monthly_plans" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "monthly_plans_account_year_month_idx" ON "monthly_plans" USING btree ("account_id","year","month");