CREATE TYPE "public"."tag_type" AS ENUM('setup', 'mistake', 'general');--> statement-breakpoint
CREATE TYPE "public"."timeframe" AS ENUM('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w');--> statement-breakpoint
CREATE TYPE "public"."trade_direction" AS ENUM('long', 'short');--> statement-breakpoint
CREATE TYPE "public"."trade_outcome" AS ENUM('win', 'loss', 'breakeven');--> statement-breakpoint
CREATE TABLE "daily_journals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"market_outlook" text,
	"focus_goals" text,
	"mental_state" integer,
	"session_review" text,
	"emotional_state" integer,
	"key_takeaways" text,
	"total_pnl" numeric(18, 2),
	"trade_count" integer,
	"win_count" integer,
	"loss_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_journals_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(50) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"entry_criteria" text,
	"exit_criteria" text,
	"risk_rules" text,
	"target_r_multiple" numeric(8, 2),
	"max_risk_percent" numeric(5, 2),
	"screenshot_url" varchar(500),
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"type" "tag_type" NOT NULL,
	"color" varchar(7),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "trade_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset" varchar(20) NOT NULL,
	"direction" "trade_direction" NOT NULL,
	"timeframe" timeframe,
	"entry_date" timestamp with time zone NOT NULL,
	"exit_date" timestamp with time zone,
	"entry_price" numeric(18, 8) NOT NULL,
	"exit_price" numeric(18, 8),
	"position_size" numeric(18, 8) NOT NULL,
	"stop_loss" numeric(18, 8),
	"take_profit" numeric(18, 8),
	"planned_risk_amount" numeric(18, 2),
	"planned_r_multiple" numeric(8, 2),
	"pnl" numeric(18, 2),
	"pnl_percent" numeric(8, 4),
	"realized_r_multiple" numeric(8, 2),
	"outcome" "trade_outcome",
	"mfe" numeric(18, 8),
	"mae" numeric(18, 8),
	"mfe_r" numeric(8, 2),
	"mae_r" numeric(8, 2),
	"commission" numeric(18, 2) DEFAULT '0',
	"fees" numeric(18, 2) DEFAULT '0',
	"pre_trade_thoughts" text,
	"post_trade_reflection" text,
	"lesson_learned" text,
	"strategy_id" uuid,
	"followed_plan" boolean,
	"discipline_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_archived" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "trade_tags" ADD CONSTRAINT "trade_tags_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_tags" ADD CONSTRAINT "trade_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_journals_date_idx" ON "daily_journals" USING btree ("date");--> statement-breakpoint
CREATE INDEX "trade_tags_trade_idx" ON "trade_tags" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "trade_tags_tag_idx" ON "trade_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "trades_asset_idx" ON "trades" USING btree ("asset");--> statement-breakpoint
CREATE INDEX "trades_entry_date_idx" ON "trades" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "trades_outcome_idx" ON "trades" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "trades_strategy_idx" ON "trades" USING btree ("strategy_id");