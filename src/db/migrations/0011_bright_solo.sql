CREATE TABLE "nota_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_hash" varchar(64) NOT NULL,
	"nota_date" timestamp with time zone NOT NULL,
	"broker_name" varchar(100),
	"total_fills" integer DEFAULT 0 NOT NULL,
	"matched_fills" integer DEFAULT 0 NOT NULL,
	"unmatched_fills" integer DEFAULT 0 NOT NULL,
	"trades_enriched" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "deduplication_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "nota_imports" ADD CONSTRAINT "nota_imports_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "nota_imports_account_idx" ON "nota_imports" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "nota_imports_file_hash_idx" ON "nota_imports" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "nota_imports_date_idx" ON "nota_imports" USING btree ("nota_date");--> statement-breakpoint
CREATE INDEX "trades_dedup_hash_idx" ON "trades" USING btree ("deduplication_hash");