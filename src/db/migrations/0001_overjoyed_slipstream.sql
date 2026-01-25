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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
