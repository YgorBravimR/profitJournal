ALTER TABLE "strategies" DROP CONSTRAINT "strategies_account_id_trading_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_account_id_trading_accounts_id_fk";
--> statement-breakpoint
DROP INDEX "strategies_account_code_idx";--> statement-breakpoint
DROP INDEX "tags_account_name_idx";--> statement-breakpoint
ALTER TABLE "strategies" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "user_id" uuid;--> statement-breakpoint
-- Backfill user_id from account owner
UPDATE "strategies" SET "user_id" = (SELECT "user_id" FROM "trading_accounts" WHERE "trading_accounts"."id" = "strategies"."account_id") WHERE "account_id" IS NOT NULL;--> statement-breakpoint
UPDATE "tags" SET "user_id" = (SELECT "user_id" FROM "trading_accounts" WHERE "trading_accounts"."id" = "tags"."account_id") WHERE "account_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strategies_user_idx" ON "strategies" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "strategies_user_code_idx" ON "strategies" USING btree ("user_id","code");--> statement-breakpoint
CREATE INDEX "tags_user_idx" ON "tags" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_name_idx" ON "tags" USING btree ("user_id","name");