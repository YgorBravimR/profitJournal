ALTER TYPE "public"."account_type" ADD VALUE 'replay';--> statement-breakpoint
CREATE TABLE "account_asset_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"account_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"bias" varchar(10),
	"max_daily_trades" integer,
	"max_position_size" integer,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "replay_current_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account_asset_settings" ADD CONSTRAINT "account_asset_settings_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_asset_settings" ADD CONSTRAINT "account_asset_settings_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_asset_settings_user_idx" ON "account_asset_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_asset_settings_account_idx" ON "account_asset_settings" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "account_asset_settings_asset_idx" ON "account_asset_settings" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_asset_settings_unique_idx" ON "account_asset_settings" USING btree ("account_id","asset_id");--> statement-breakpoint
INSERT INTO "account_asset_settings" ("user_id", "account_id", "asset_id", "bias", "max_daily_trades", "max_position_size", "notes", "is_active", "created_at", "updated_at")
SELECT DISTINCT ON (das."account_id", das."asset_id")
  das."user_id",
  das."account_id",
  das."asset_id",
  das."bias",
  das."max_daily_trades",
  das."max_position_size",
  das."notes",
  das."is_active",
  das."created_at",
  das."updated_at"
FROM "daily_asset_settings" das
WHERE das."is_active" = true
ORDER BY das."account_id", das."asset_id", das."date" DESC;