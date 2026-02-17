CREATE TABLE "risk_management_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_by_user_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"base_risk_cents" integer NOT NULL,
	"daily_loss_cents" integer NOT NULL,
	"weekly_loss_cents" integer,
	"monthly_loss_cents" integer NOT NULL,
	"daily_profit_target_cents" integer,
	"decision_tree" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monthly_plans" ADD COLUMN "risk_profile_id" uuid;--> statement-breakpoint
ALTER TABLE "monthly_plans" ADD COLUMN "weekly_loss_percent" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "monthly_plans" ADD COLUMN "weekly_loss_cents" integer;--> statement-breakpoint
ALTER TABLE "risk_management_profiles" ADD CONSTRAINT "risk_management_profiles_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "risk_profiles_created_by_idx" ON "risk_management_profiles" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "risk_profiles_active_idx" ON "risk_management_profiles" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "monthly_plans" ADD CONSTRAINT "monthly_plans_risk_profile_id_risk_management_profiles_id_fk" FOREIGN KEY ("risk_profile_id") REFERENCES "public"."risk_management_profiles"("id") ON DELETE set null ON UPDATE no action;