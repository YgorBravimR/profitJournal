import {
	pgTable,
	uuid,
	varchar,
	text,
	decimal,
	integer,
	bigint,
	timestamp,
	boolean,
	pgEnum,
	index,
	uniqueIndex,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const tradeDirectionEnum = pgEnum("trade_direction", ["long", "short"])
export const tradeOutcomeEnum = pgEnum("trade_outcome", ["win", "loss", "breakeven"])
export const tagTypeEnum = pgEnum("tag_type", ["setup", "mistake", "general"])
export const timeframeTypeEnum = pgEnum("timeframe_type", [
	"time_based",
	"renko",
])
export const timeframeUnitEnum = pgEnum("timeframe_unit", [
	"minutes",
	"hours",
	"days",
	"weeks",
	"ticks",
	"points",
])

// Execution Mode Enum (simple = legacy single entry/exit, scaled = multiple executions)
export const executionModeEnum = pgEnum("execution_mode", ["simple", "scaled"])

// Execution Type Enum (entry or exit)
export const executionTypeEnum = pgEnum("execution_type", ["entry", "exit"])

// Order Type Enum
export const orderTypeEnum = pgEnum("order_type", [
	"market",
	"limit",
	"stop",
	"stop_limit",
])

// Account Type Enum
export const accountTypeEnum = pgEnum("account_type", ["personal", "prop"])

// ==========================================
// AUTH TABLES (Phase 10)
// ==========================================

// Users Table
export const users = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: varchar("name", { length: 255 }).notNull(),
		email: varchar("email", { length: 255 }).notNull().unique(),
		emailVerified: timestamp("email_verified", { withTimezone: true }),
		passwordHash: varchar("password_hash", { length: 255 }).notNull(),
		image: varchar("image", { length: 255 }),
		isAdmin: boolean("is_admin").default(false).notNull(),

		// General user settings (not account-specific)
		preferredLocale: varchar("preferred_locale", { length: 10 }).default("pt-BR").notNull(),
		theme: varchar("theme", { length: 20 }).default("dark").notNull(),
		dateFormat: varchar("date_format", { length: 20 }).default("DD/MM/YYYY").notNull(),

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("users_email_idx").on(table.email)]
)

// Trading Accounts Table (each user can have multiple)
export const tradingAccounts = pgTable(
	"trading_accounts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		// Account identification
		name: varchar("name", { length: 100 }).notNull(),
		description: text("description"),
		isDefault: boolean("is_default").default(false).notNull(),
		isActive: boolean("is_active").default(true).notNull(),

		// Trading account type
		accountType: accountTypeEnum("account_type").default("personal").notNull(),
		propFirmName: varchar("prop_firm_name", { length: 100 }),
		profitSharePercentage: decimal("profit_share_percentage", { precision: 5, scale: 2 })
			.default("100.00")
			.notNull(),

		// Tax settings (per account)
		dayTradeTaxRate: decimal("day_trade_tax_rate", { precision: 5, scale: 2 })
			.default("20.00")
			.notNull(),
		swingTradeTaxRate: decimal("swing_trade_tax_rate", { precision: 5, scale: 2 })
			.default("15.00")
			.notNull(),

		// Risk settings (per account)
		defaultRiskPerTrade: decimal("default_risk_per_trade", { precision: 5, scale: 2 }),
		maxDailyLoss: integer("max_daily_loss"), // cents
		maxDailyTrades: integer("max_daily_trades"),
		defaultCurrency: varchar("default_currency", { length: 3 }).default("BRL").notNull(),

		// Global default fees for this account (user-managed)
		defaultCommission: integer("default_commission").default(0).notNull(), // cents per contract
		defaultFees: integer("default_fees").default(0).notNull(), // cents per contract

		// Display preferences
		showTaxEstimates: boolean("show_tax_estimates").default(true).notNull(),
		showPropCalculations: boolean("show_prop_calculations").default(true).notNull(),

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("trading_accounts_user_idx").on(table.userId),
		uniqueIndex("trading_accounts_user_name_idx").on(table.userId, table.name),
	]
)

// Sessions Table (for Auth.js)
export const sessions = pgTable(
	"sessions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		currentAccountId: uuid("current_account_id").references(() => tradingAccounts.id, {
			onDelete: "set null",
		}),
		expires: timestamp("expires", { withTimezone: true }).notNull(),
	},
	(table) => [
		index("sessions_token_idx").on(table.sessionToken),
		index("sessions_user_idx").on(table.userId),
	]
)

// OAuth Accounts Table (for future OAuth support)
export const oauthAccounts = pgTable(
	"oauth_accounts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: varchar("type", { length: 255 }).notNull(),
		provider: varchar("provider", { length: 255 }).notNull(),
		providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
		refreshToken: text("refresh_token"),
		accessToken: text("access_token"),
		expiresAt: integer("expires_at"),
		tokenType: varchar("token_type", { length: 255 }),
		scope: varchar("scope", { length: 255 }),
		idToken: text("id_token"),
		sessionState: varchar("session_state", { length: 255 }),
	},
	(table) => [
		index("oauth_accounts_user_idx").on(table.userId),
		uniqueIndex("oauth_accounts_provider_idx").on(table.provider, table.providerAccountId),
	]
)

// Verification Tokens (for email verification)
export const verificationTokens = pgTable(
	"verification_tokens",
	{
		identifier: varchar("identifier", { length: 255 }).notNull(),
		token: varchar("token", { length: 255 }).notNull().unique(),
		expires: timestamp("expires", { withTimezone: true }).notNull(),
	},
	(table) => [uniqueIndex("verification_tokens_idx").on(table.identifier, table.token)]
)

// Account Assets Table (per-account asset configuration)
export const accountAssets = pgTable(
	"account_assets",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id")
			.notNull()
			.references(() => tradingAccounts.id, { onDelete: "cascade" }),
		assetId: uuid("asset_id")
			.notNull()
			.references(() => assets.id, { onDelete: "cascade" }),

		isEnabled: boolean("is_enabled").default(true).notNull(),

		// Per-asset fee overrides (NULL = use account default)
		commissionOverride: integer("commission_override"), // cents, NULL = use account default
		feesOverride: integer("fees_override"), // cents, NULL = use account default

		notes: text("notes"),

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("account_assets_account_idx").on(table.accountId),
		uniqueIndex("account_assets_unique_idx").on(table.accountId, table.assetId),
	]
)

// Account Timeframes Table (per-account timeframe configuration)
export const accountTimeframes = pgTable(
	"account_timeframes",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id")
			.notNull()
			.references(() => tradingAccounts.id, { onDelete: "cascade" }),
		timeframeId: uuid("timeframe_id")
			.notNull()
			.references(() => timeframes.id, { onDelete: "cascade" }),

		isEnabled: boolean("is_enabled").default(true).notNull(),

		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("account_timeframes_account_idx").on(table.accountId),
		uniqueIndex("account_timeframes_unique_idx").on(table.accountId, table.timeframeId),
	]
)

// Asset Types Table
export const assetTypes = pgTable("asset_types", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: varchar("code", { length: 50 }).notNull().unique(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
})

// Assets Table (admin-managed, no commission/fees - those are per-account)
// Money field (tickValue) stored as integer in cents
export const assets = pgTable(
	"assets",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		symbol: varchar("symbol", { length: 20 }).notNull().unique(),
		name: varchar("name", { length: 100 }).notNull(),
		assetTypeId: uuid("asset_type_id")
			.notNull()
			.references(() => assetTypes.id, { onDelete: "restrict" }),
		tickSize: decimal("tick_size", { precision: 18, scale: 8 }).notNull(),
		tickValue: integer("tick_value").notNull(), // cents per tick
		currency: varchar("currency", { length: 10 }).notNull().default("BRL"),
		multiplier: decimal("multiplier", { precision: 18, scale: 4 }).default("1"),
		// Note: commission/fees removed - now managed per-account in account_assets table
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("assets_symbol_idx").on(table.symbol),
		index("assets_asset_type_idx").on(table.assetTypeId),
	]
)

// Timeframes Table
export const timeframes = pgTable("timeframes", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: varchar("code", { length: 20 }).notNull().unique(),
	name: varchar("name", { length: 50 }).notNull(),
	type: timeframeTypeEnum("type").notNull(),
	value: integer("value").notNull(),
	unit: timeframeUnitEnum("unit").notNull(),
	sortOrder: integer("sort_order").notNull().default(0),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
})

// Strategies Table
export const strategies = pgTable(
	"strategies",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id").references(() => tradingAccounts.id, {
			onDelete: "cascade",
		}),
		code: varchar("code").notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		description: text("description"),
		entryCriteria: text("entry_criteria"),
		exitCriteria: text("exit_criteria"),
		riskRules: text("risk_rules"),
		targetRMultiple: decimal("target_r_multiple", { precision: 8, scale: 2 }),
		maxRiskPercent: decimal("max_risk_percent", { precision: 5, scale: 2 }),
		screenshotUrl: varchar("screenshot_url", { length: 500 }),
		notes: text("notes"),
		isActive: boolean("is_active").default(true),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("strategies_account_idx").on(table.accountId),
		uniqueIndex("strategies_account_code_idx").on(table.accountId, table.code),
	]
)

// Trades Table
// Money fields (pnl, plannedRiskAmount, commission, fees) stored as integers in cents
export const trades = pgTable(
	"trades",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id").references(() => tradingAccounts.id, {
			onDelete: "cascade",
		}),

		// Basic Info
		asset: varchar("asset", { length: 20 }).notNull(),
		direction: tradeDirectionEnum("direction").notNull(),
		timeframeId: uuid("timeframe_id").references(() => timeframes.id, {
			onDelete: "set null",
		}),

		// Timing
		entryDate: timestamp("entry_date", { withTimezone: true }).notNull(),
		exitDate: timestamp("exit_date", { withTimezone: true }),

		// Execution (prices kept as decimal for precision)
		entryPrice: decimal("entry_price", { precision: 18, scale: 8 }).notNull(),
		exitPrice: decimal("exit_price", { precision: 18, scale: 8 }),
		positionSize: decimal("position_size", {
			precision: 18,
			scale: 8,
		}).notNull(),

		// Risk Management
		stopLoss: decimal("stop_loss", { precision: 18, scale: 8 }),
		takeProfit: decimal("take_profit", { precision: 18, scale: 8 }),
		plannedRiskAmount: bigint("planned_risk_amount", { mode: "number" }), // cents
		plannedRMultiple: decimal("planned_r_multiple", { precision: 8, scale: 2 }),

		// Results (pnl in cents, ratios as decimal)
		pnl: bigint("pnl", { mode: "number" }), // cents
		pnlPercent: decimal("pnl_percent", { precision: 8, scale: 4 }),
		realizedRMultiple: decimal("realized_r_multiple", {
			precision: 8,
			scale: 2,
		}),
		outcome: tradeOutcomeEnum("outcome"),

		// MFE/MAE (prices, not money)
		mfe: decimal("mfe", { precision: 18, scale: 8 }),
		mae: decimal("mae", { precision: 18, scale: 8 }),
		mfeR: decimal("mfe_r", { precision: 8, scale: 2 }),
		maeR: decimal("mae_r", { precision: 8, scale: 2 }),

		// Fees (in cents)
		commission: bigint("commission", { mode: "number" }).default(0), // cents per contract
		fees: bigint("fees", { mode: "number" }).default(0), // cents per contract
		// Total contracts executed (entry + exit + any intra-trade scaling)
		// Default is positionSize * 2 (1 entry + 1 exit per contract)
		contractsExecuted: decimal("contracts_executed", { precision: 18, scale: 8 }),

		// Narrative
		preTradeThoughts: text("pre_trade_thoughts"),
		postTradeReflection: text("post_trade_reflection"),
		lessonLearned: text("lesson_learned"),

		// Strategy Reference
		strategyId: uuid("strategy_id").references(() => strategies.id, {
			onDelete: "set null",
		}),

		// Compliance
		followedPlan: boolean("followed_plan"),
		disciplineNotes: text("discipline_notes"),

		// Execution Mode (for position scaling support)
		executionMode: executionModeEnum("execution_mode").default("simple").notNull(),

		// Aggregated execution data (populated when executionMode = 'scaled')
		totalEntryQuantity: decimal("total_entry_quantity", { precision: 20, scale: 8 }),
		totalExitQuantity: decimal("total_exit_quantity", { precision: 20, scale: 8 }),
		avgEntryPrice: decimal("avg_entry_price", { precision: 20, scale: 8 }),
		avgExitPrice: decimal("avg_exit_price", { precision: 20, scale: 8 }),
		remainingQuantity: decimal("remaining_quantity", { precision: 20, scale: 8 }).default("0"),

		// Metadata
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		isArchived: boolean("is_archived").default(false),
	},
	(table) => [
		index("trades_account_idx").on(table.accountId),
		index("trades_asset_idx").on(table.asset),
		index("trades_entry_date_idx").on(table.entryDate),
		index("trades_outcome_idx").on(table.outcome),
		index("trades_strategy_idx").on(table.strategyId),
		index("trades_timeframe_idx").on(table.timeframeId),
	]
)

// Trade Executions Table (for scaled position management)
// Money fields (commission, fees, slippage, executionValue) stored as integers in cents
export const tradeExecutions = pgTable(
	"trade_executions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		tradeId: uuid("trade_id")
			.notNull()
			.references(() => trades.id, { onDelete: "cascade" }),

		// Execution details
		executionType: executionTypeEnum("execution_type").notNull(),
		executionDate: timestamp("execution_date", { withTimezone: true }).notNull(),
		price: decimal("price", { precision: 20, scale: 8 }).notNull(),
		quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),

		// Optional metadata
		orderType: orderTypeEnum("order_type"),
		notes: text("notes"),

		// Costs for this specific execution (in cents)
		commission: integer("commission").default(0),
		fees: integer("fees").default(0),
		slippage: integer("slippage").default(0), // difference from intended price in cents

		// Calculated field (stored for performance) - quantity * price in cents
		executionValue: bigint("execution_value", { mode: "number" }).notNull(),

		// Timestamps
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("trade_executions_trade_idx").on(table.tradeId),
		index("trade_executions_type_idx").on(table.executionType),
		index("trade_executions_date_idx").on(table.executionDate),
	]
)

// Tags Table
export const tags = pgTable(
	"tags",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		accountId: uuid("account_id").references(() => tradingAccounts.id, {
			onDelete: "cascade",
		}),
		name: varchar("name", { length: 50 }).notNull(),
		type: tagTypeEnum("type").notNull(),
		color: varchar("color", { length: 7 }),
		description: text("description"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("tags_account_idx").on(table.accountId),
		uniqueIndex("tags_account_name_idx").on(table.accountId, table.name),
	]
)

// Trade Tags Junction Table
export const tradeTags = pgTable(
	"trade_tags",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		tradeId: uuid("trade_id")
			.notNull()
			.references(() => trades.id, { onDelete: "cascade" }),
		tagId: uuid("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("trade_tags_trade_idx").on(table.tradeId),
		index("trade_tags_tag_idx").on(table.tagId),
	]
)

// Daily Journals Table
// Money fields (totalPnl) stored as integers in cents
export const dailyJournals = pgTable(
	"daily_journals",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		date: timestamp("date", { withTimezone: true }).notNull().unique(),

		// Pre-Session
		marketOutlook: text("market_outlook"),
		focusGoals: text("focus_goals"),
		mentalState: integer("mental_state"),

		// Post-Session
		sessionReview: text("session_review"),
		emotionalState: integer("emotional_state"),
		keyTakeaways: text("key_takeaways"),

		// Metrics (totalPnl in cents)
		totalPnl: bigint("total_pnl", { mode: "number" }), // cents
		tradeCount: integer("trade_count"),
		winCount: integer("win_count"),
		lossCount: integer("loss_count"),

		// Metadata
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("daily_journals_date_idx").on(table.date)]
)

// Settings Table (key-value store for misc settings)
export const settings = pgTable("settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	key: varchar("key", { length: 50 }).notNull().unique(),
	value: text("value").notNull(),
	description: text("description"),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
})

// User Settings Table (structured settings for trading account)
export const userSettings = pgTable("user_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: varchar("user_id", { length: 50 }).notNull().unique().default("default"),

	// Prop Trading Settings
	isPropAccount: boolean("is_prop_account").default(false).notNull(),
	propFirmName: varchar("prop_firm_name", { length: 100 }),
	profitSharePercentage: decimal("profit_share_percentage", {
		precision: 5,
		scale: 2,
	})
		.default("100.00")
		.notNull(),

	// Tax Settings
	dayTradeTaxRate: decimal("day_trade_tax_rate", { precision: 5, scale: 2 })
		.default("20.00")
		.notNull(),
	swingTradeTaxRate: decimal("swing_trade_tax_rate", { precision: 5, scale: 2 })
		.default("15.00")
		.notNull(),
	taxExemptThreshold: integer("tax_exempt_threshold").default(0).notNull(), // cents

	// Display Preferences
	defaultCurrency: varchar("default_currency", { length: 3 })
		.default("BRL")
		.notNull(),
	showTaxEstimates: boolean("show_tax_estimates").default(true).notNull(),
	showPropCalculations: boolean("show_prop_calculations").default(true).notNull(),

	// Multi-Account Preferences
	showAllAccounts: boolean("show_all_accounts").default(false).notNull(),

	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
})

// ==========================================
// RELATIONS
// ==========================================

// User Relations
export const usersRelations = relations(users, ({ many }) => ({
	tradingAccounts: many(tradingAccounts),
	sessions: many(sessions),
	oauthAccounts: many(oauthAccounts),
}))

// Trading Account Relations
export const tradingAccountsRelations = relations(tradingAccounts, ({ one, many }) => ({
	user: one(users, {
		fields: [tradingAccounts.userId],
		references: [users.id],
	}),
	trades: many(trades),
	strategies: many(strategies),
	tags: many(tags),
	accountAssets: many(accountAssets),
	accountTimeframes: many(accountTimeframes),
}))

// Session Relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
	currentAccount: one(tradingAccounts, {
		fields: [sessions.currentAccountId],
		references: [tradingAccounts.id],
	}),
}))

// OAuth Account Relations
export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
	user: one(users, {
		fields: [oauthAccounts.userId],
		references: [users.id],
	}),
}))

// Account Assets Relations
export const accountAssetsRelations = relations(accountAssets, ({ one }) => ({
	account: one(tradingAccounts, {
		fields: [accountAssets.accountId],
		references: [tradingAccounts.id],
	}),
	asset: one(assets, {
		fields: [accountAssets.assetId],
		references: [assets.id],
	}),
}))

// Account Timeframes Relations
export const accountTimeframesRelations = relations(accountTimeframes, ({ one }) => ({
	account: one(tradingAccounts, {
		fields: [accountTimeframes.accountId],
		references: [tradingAccounts.id],
	}),
	timeframe: one(timeframes, {
		fields: [accountTimeframes.timeframeId],
		references: [timeframes.id],
	}),
}))

// Trade Relations
export const tradesRelations = relations(trades, ({ one, many }) => ({
	account: one(tradingAccounts, {
		fields: [trades.accountId],
		references: [tradingAccounts.id],
	}),
	strategy: one(strategies, {
		fields: [trades.strategyId],
		references: [strategies.id],
	}),
	timeframe: one(timeframes, {
		fields: [trades.timeframeId],
		references: [timeframes.id],
	}),
	tradeTags: many(tradeTags),
	executions: many(tradeExecutions),
}))

export const tradeExecutionsRelations = relations(tradeExecutions, ({ one }) => ({
	trade: one(trades, {
		fields: [tradeExecutions.tradeId],
		references: [trades.id],
	}),
}))

export const timeframesRelations = relations(timeframes, ({ many }) => ({
	trades: many(trades),
	accountTimeframes: many(accountTimeframes),
}))

export const strategiesRelations = relations(strategies, ({ one, many }) => ({
	account: one(tradingAccounts, {
		fields: [strategies.accountId],
		references: [tradingAccounts.id],
	}),
	trades: many(trades),
}))

export const tagsRelations = relations(tags, ({ one, many }) => ({
	account: one(tradingAccounts, {
		fields: [tags.accountId],
		references: [tradingAccounts.id],
	}),
	tradeTags: many(tradeTags),
}))

export const tradeTagsRelations = relations(tradeTags, ({ one }) => ({
	trade: one(trades, {
		fields: [tradeTags.tradeId],
		references: [trades.id],
	}),
	tag: one(tags, {
		fields: [tradeTags.tagId],
		references: [tags.id],
	}),
}))

export const assetTypesRelations = relations(assetTypes, ({ many }) => ({
	assets: many(assets),
}))

export const assetsRelations = relations(assets, ({ one, many }) => ({
	assetType: one(assetTypes, {
		fields: [assets.assetTypeId],
		references: [assetTypes.id],
	}),
	accountAssets: many(accountAssets),
}))

// ==========================================
// TYPE EXPORTS
// ==========================================

// Auth Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type TradingAccount = typeof tradingAccounts.$inferSelect
export type NewTradingAccount = typeof tradingAccounts.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type OAuthAccount = typeof oauthAccounts.$inferSelect
export type NewOAuthAccount = typeof oauthAccounts.$inferInsert

export type VerificationToken = typeof verificationTokens.$inferSelect
export type NewVerificationToken = typeof verificationTokens.$inferInsert

export type AccountAsset = typeof accountAssets.$inferSelect
export type NewAccountAsset = typeof accountAssets.$inferInsert

export type AccountTimeframe = typeof accountTimeframes.$inferSelect
export type NewAccountTimeframe = typeof accountTimeframes.$inferInsert

// Trading Types
export type Trade = typeof trades.$inferSelect
export type NewTrade = typeof trades.$inferInsert

export type Strategy = typeof strategies.$inferSelect
export type NewStrategy = typeof strategies.$inferInsert

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type TradeTag = typeof tradeTags.$inferSelect
export type NewTradeTag = typeof tradeTags.$inferInsert

export type DailyJournal = typeof dailyJournals.$inferSelect
export type NewDailyJournal = typeof dailyJournals.$inferInsert

export type Setting = typeof settings.$inferSelect
export type NewSetting = typeof settings.$inferInsert

export type AssetType = typeof assetTypes.$inferSelect
export type NewAssetType = typeof assetTypes.$inferInsert

export type Asset = typeof assets.$inferSelect
export type NewAsset = typeof assets.$inferInsert

export type Timeframe = typeof timeframes.$inferSelect
export type NewTimeframe = typeof timeframes.$inferInsert

export type UserSettings = typeof userSettings.$inferSelect
export type NewUserSettings = typeof userSettings.$inferInsert

export type TradeExecution = typeof tradeExecutions.$inferSelect
export type NewTradeExecution = typeof tradeExecutions.$inferInsert
