ALTER TABLE "strategies" ADD COLUMN "code" varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_code_unique" UNIQUE("code");