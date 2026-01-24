CREATE TYPE "public"."timeframe_type" AS ENUM('time_based', 'renko');--> statement-breakpoint
CREATE TYPE "public"."timeframe_unit" AS ENUM('minutes', 'hours', 'days', 'weeks', 'ticks', 'points');--> statement-breakpoint
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
	"tick_value" numeric(18, 4) NOT NULL,
	"currency" varchar(10) DEFAULT 'BRL' NOT NULL,
	"multiplier" numeric(18, 4) DEFAULT '1',
	"commission" numeric(18, 4) DEFAULT '0',
	"fees" numeric(18, 4) DEFAULT '0',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_symbol_unique" UNIQUE("symbol")
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
ALTER TABLE "strategies" ALTER COLUMN "code" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_asset_type_id_asset_types_id_fk" FOREIGN KEY ("asset_type_id") REFERENCES "public"."asset_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_symbol_idx" ON "assets" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "assets_asset_type_idx" ON "assets" USING btree ("asset_type_id");