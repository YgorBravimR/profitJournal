-- Drop the old unique index first
DROP INDEX IF EXISTS "daily_asset_settings_unique_idx";--> statement-breakpoint

-- Add date column as nullable first
ALTER TABLE "daily_asset_settings" ADD COLUMN "date" timestamp with time zone;--> statement-breakpoint

-- Update existing records to have today's date
UPDATE "daily_asset_settings" SET "date" = CURRENT_DATE WHERE "date" IS NULL;--> statement-breakpoint

-- Now make date NOT NULL
ALTER TABLE "daily_asset_settings" ALTER COLUMN "date" SET NOT NULL;--> statement-breakpoint

-- Add bias column
ALTER TABLE "daily_asset_settings" ADD COLUMN "bias" varchar(10);--> statement-breakpoint

-- Create date index
CREATE INDEX "daily_asset_settings_date_idx" ON "daily_asset_settings" USING btree ("date");--> statement-breakpoint

-- Create new unique index with date
CREATE UNIQUE INDEX "daily_asset_settings_unique_idx" ON "daily_asset_settings" USING btree ("account_id","asset_id","date");
