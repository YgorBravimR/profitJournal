CREATE TYPE "public"."tag_type" AS ENUM('setup', 'mistake', 'general');--> statement-breakpoint
CREATE TYPE "public"."timeframe_type" AS ENUM('time_based', 'renko');--> statement-breakpoint
CREATE TYPE "public"."timeframe_unit" AS ENUM('minutes', 'hours', 'days', 'weeks', 'ticks', 'points');--> statement-breakpoint
CREATE TYPE "public"."trade_direction" AS ENUM('long', 'short');--> statement-breakpoint
CREATE TYPE "public"."trade_outcome" AS ENUM('win', 'loss', 'breakeven');--> statement-breakpoint
CREATE TABLE "asset_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "asset_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"asset_type_id" uuid NOT NULL,
	"tick_size" numeric(18, 8) NOT NULL,
	"tick_value" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'BRL' NOT NULL,
	"multiplier" numeric(18, 4) DEFAULT '1',
	"commission" integer DEFAULT 0,
	"fees" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "daily_journals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"market_outlook" text,
	"focus_goals" text,
	"mental_state" integer,
	"session_review" text,
	"emotional_state" integer,
	"key_takeaways" text,
	"total_pnl" bigint,
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
	"code" varchar NOT NULL,
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "strategies_code_unique" UNIQUE("code")
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
CREATE TABLE "timeframes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(50) NOT NULL,
	"type" timeframe_type NOT NULL,
	"value" integer NOT NULL,
	"unit" timeframe_unit NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "timeframes_code_unique" UNIQUE("code")
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
	"timeframe_id" uuid,
	"entry_date" timestamp with time zone NOT NULL,
	"exit_date" timestamp with time zone,
	"entry_price" numeric(18, 8) NOT NULL,
	"exit_price" numeric(18, 8),
	"position_size" numeric(18, 8) NOT NULL,
	"stop_loss" numeric(18, 8),
	"take_profit" numeric(18, 8),
	"planned_risk_amount" bigint,
	"planned_r_multiple" numeric(8, 2),
	"pnl" bigint,
	"pnl_percent" numeric(8, 4),
	"realized_r_multiple" numeric(8, 2),
	"outcome" "trade_outcome",
	"mfe" numeric(18, 8),
	"mae" numeric(18, 8),
	"mfe_r" numeric(8, 2),
	"mae_r" numeric(8, 2),
	"commission" bigint DEFAULT 0,
	"fees" bigint DEFAULT 0,
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
ALTER TABLE "assets" ADD CONSTRAINT "assets_asset_type_id_asset_types_id_fk" FOREIGN KEY ("asset_type_id") REFERENCES "public"."asset_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_tags" ADD CONSTRAINT "trade_tags_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_tags" ADD CONSTRAINT "trade_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_timeframe_id_timeframes_id_fk" FOREIGN KEY ("timeframe_id") REFERENCES "public"."timeframes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_symbol_idx" ON "assets" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "assets_asset_type_idx" ON "assets" USING btree ("asset_type_id");--> statement-breakpoint
CREATE INDEX "daily_journals_date_idx" ON "daily_journals" USING btree ("date");--> statement-breakpoint
CREATE INDEX "trade_tags_trade_idx" ON "trade_tags" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "trade_tags_tag_idx" ON "trade_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "trades_asset_idx" ON "trades" USING btree ("asset");--> statement-breakpoint
CREATE INDEX "trades_entry_date_idx" ON "trades" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "trades_outcome_idx" ON "trades" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "trades_strategy_idx" ON "trades" USING btree ("strategy_id");--> statement-breakpoint
CREATE INDEX "trades_timeframe_idx" ON "trades" USING btree ("timeframe_id");