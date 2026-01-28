CREATE TYPE "public"."account_type" AS ENUM('personal', 'prop');--> statement-breakpoint
CREATE TYPE "public"."execution_mode" AS ENUM('simple', 'scaled');--> statement-breakpoint
CREATE TYPE "public"."execution_type" AS ENUM('entry', 'exit');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('market', 'limit', 'stop', 'stop_limit');--> statement-breakpoint
CREATE TYPE "public"."tag_type" AS ENUM('setup', 'mistake', 'general');--> statement-breakpoint
CREATE TYPE "public"."timeframe_type" AS ENUM('time_based', 'renko');--> statement-breakpoint
CREATE TYPE "public"."timeframe_unit" AS ENUM('minutes', 'hours', 'days', 'weeks', 'ticks', 'points');--> statement-breakpoint
CREATE TYPE "public"."trade_direction" AS ENUM('long', 'short');--> statement-breakpoint
CREATE TYPE "public"."trade_outcome" AS ENUM('win', 'loss', 'breakeven');--> statement-breakpoint
CREATE TABLE "account_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"commission_override" integer,
	"fees_override" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_timeframes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"timeframe_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"current_account_id" uuid,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
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
	"account_id" uuid,
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid,
	"name" varchar(50) NOT NULL,
	"type" "tag_type" NOT NULL,
	"color" varchar(7),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "trade_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" uuid NOT NULL,
	"execution_type" "execution_type" NOT NULL,
	"execution_date" timestamp with time zone NOT NULL,
	"price" numeric(20, 8) NOT NULL,
	"quantity" numeric(20, 8) NOT NULL,
	"order_type" "order_type",
	"notes" text,
	"commission" integer DEFAULT 0,
	"fees" integer DEFAULT 0,
	"slippage" integer DEFAULT 0,
	"execution_value" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"account_id" uuid,
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
	"contracts_executed" numeric(18, 8),
	"pre_trade_thoughts" text,
	"post_trade_reflection" text,
	"lesson_learned" text,
	"strategy_id" uuid,
	"followed_plan" boolean,
	"discipline_notes" text,
	"execution_mode" "execution_mode" DEFAULT 'simple' NOT NULL,
	"total_entry_quantity" numeric(20, 8),
	"total_exit_quantity" numeric(20, 8),
	"avg_entry_price" numeric(20, 8),
	"avg_exit_price" numeric(20, 8),
	"remaining_quantity" numeric(20, 8) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_archived" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "trading_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"account_type" "account_type" DEFAULT 'personal' NOT NULL,
	"prop_firm_name" varchar(100),
	"profit_share_percentage" numeric(5, 2) DEFAULT '100.00' NOT NULL,
	"day_trade_tax_rate" numeric(5, 2) DEFAULT '20.00' NOT NULL,
	"swing_trade_tax_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"default_risk_per_trade" numeric(5, 2),
	"max_daily_loss" integer,
	"max_daily_trades" integer,
	"default_currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"default_commission" integer DEFAULT 0 NOT NULL,
	"default_fees" integer DEFAULT 0 NOT NULL,
	"show_tax_estimates" boolean DEFAULT true NOT NULL,
	"show_prop_calculations" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(50) DEFAULT 'default' NOT NULL,
	"is_prop_account" boolean DEFAULT false NOT NULL,
	"prop_firm_name" varchar(100),
	"profit_share_percentage" numeric(5, 2) DEFAULT '100.00' NOT NULL,
	"day_trade_tax_rate" numeric(5, 2) DEFAULT '20.00' NOT NULL,
	"swing_trade_tax_rate" numeric(5, 2) DEFAULT '15.00' NOT NULL,
	"tax_exempt_threshold" integer DEFAULT 0 NOT NULL,
	"default_currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"show_tax_estimates" boolean DEFAULT true NOT NULL,
	"show_prop_calculations" boolean DEFAULT true NOT NULL,
	"show_all_accounts" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone,
	"password_hash" varchar(255) NOT NULL,
	"image" varchar(255),
	"is_admin" boolean DEFAULT false NOT NULL,
	"preferred_locale" varchar(10) DEFAULT 'pt-BR' NOT NULL,
	"theme" varchar(20) DEFAULT 'dark' NOT NULL,
	"date_format" varchar(20) DEFAULT 'DD/MM/YYYY' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "account_assets" ADD CONSTRAINT "account_assets_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_assets" ADD CONSTRAINT "account_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_timeframes" ADD CONSTRAINT "account_timeframes_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_timeframes" ADD CONSTRAINT "account_timeframes_timeframe_id_timeframes_id_fk" FOREIGN KEY ("timeframe_id") REFERENCES "public"."timeframes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_asset_type_id_asset_types_id_fk" FOREIGN KEY ("asset_type_id") REFERENCES "public"."asset_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_current_account_id_trading_accounts_id_fk" FOREIGN KEY ("current_account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_executions" ADD CONSTRAINT "trade_executions_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_tags" ADD CONSTRAINT "trade_tags_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_tags" ADD CONSTRAINT "trade_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_timeframe_id_timeframes_id_fk" FOREIGN KEY ("timeframe_id") REFERENCES "public"."timeframes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_assets_account_idx" ON "account_assets" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_assets_unique_idx" ON "account_assets" USING btree ("account_id","asset_id");--> statement-breakpoint
CREATE INDEX "account_timeframes_account_idx" ON "account_timeframes" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_timeframes_unique_idx" ON "account_timeframes" USING btree ("account_id","timeframe_id");--> statement-breakpoint
CREATE INDEX "assets_symbol_idx" ON "assets" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "assets_asset_type_idx" ON "assets" USING btree ("asset_type_id");--> statement-breakpoint
CREATE INDEX "daily_journals_date_idx" ON "daily_journals" USING btree ("date");--> statement-breakpoint
CREATE INDEX "oauth_accounts_user_idx" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_accounts_provider_idx" ON "oauth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "strategies_account_idx" ON "strategies" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "strategies_account_code_idx" ON "strategies" USING btree ("account_id","code");--> statement-breakpoint
CREATE INDEX "tags_account_idx" ON "tags" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_account_name_idx" ON "tags" USING btree ("account_id","name");--> statement-breakpoint
CREATE INDEX "trade_executions_trade_idx" ON "trade_executions" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "trade_executions_type_idx" ON "trade_executions" USING btree ("execution_type");--> statement-breakpoint
CREATE INDEX "trade_executions_date_idx" ON "trade_executions" USING btree ("execution_date");--> statement-breakpoint
CREATE INDEX "trade_tags_trade_idx" ON "trade_tags" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "trade_tags_tag_idx" ON "trade_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "trades_account_idx" ON "trades" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "trades_asset_idx" ON "trades" USING btree ("asset");--> statement-breakpoint
CREATE INDEX "trades_entry_date_idx" ON "trades" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "trades_outcome_idx" ON "trades" USING btree ("outcome");--> statement-breakpoint
CREATE INDEX "trades_strategy_idx" ON "trades" USING btree ("strategy_id");--> statement-breakpoint
CREATE INDEX "trades_timeframe_idx" ON "trades" USING btree ("timeframe_id");--> statement-breakpoint
CREATE INDEX "trading_accounts_user_idx" ON "trading_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trading_accounts_user_name_idx" ON "trading_accounts" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_idx" ON "verification_tokens" USING btree ("identifier","token");