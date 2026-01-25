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

// Assets Table
// Money fields (tickValue, commission, fees) stored as integers in cents
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
		commission: integer("commission").default(0), // cents per contract
		fees: integer("fees").default(0), // cents per contract
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
export const strategies = pgTable("strategies", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: varchar("code").notNull().unique(),
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
})

// Trades Table
// Money fields (pnl, plannedRiskAmount, commission, fees) stored as integers in cents
export const trades = pgTable(
	"trades",
	{
		id: uuid("id").primaryKey().defaultRandom(),

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
		commission: bigint("commission", { mode: "number" }).default(0), // cents
		fees: bigint("fees", { mode: "number" }).default(0), // cents

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
		index("trades_asset_idx").on(table.asset),
		index("trades_entry_date_idx").on(table.entryDate),
		index("trades_outcome_idx").on(table.outcome),
		index("trades_strategy_idx").on(table.strategyId),
		index("trades_timeframe_idx").on(table.timeframeId),
	]
)

// Tags Table
export const tags = pgTable("tags", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	type: tagTypeEnum("type").notNull(),
	color: varchar("color", { length: 7 }),
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
})

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

// Settings Table
export const settings = pgTable("settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	key: varchar("key", { length: 50 }).notNull().unique(),
	value: text("value").notNull(),
	description: text("description"),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
})

// Relations
export const tradesRelations = relations(trades, ({ one, many }) => ({
	strategy: one(strategies, {
		fields: [trades.strategyId],
		references: [strategies.id],
	}),
	timeframe: one(timeframes, {
		fields: [trades.timeframeId],
		references: [timeframes.id],
	}),
	tradeTags: many(tradeTags),
}))

export const timeframesRelations = relations(timeframes, ({ many }) => ({
	trades: many(trades),
}))

export const strategiesRelations = relations(strategies, ({ many }) => ({
	trades: many(trades),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
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

export const assetsRelations = relations(assets, ({ one }) => ({
	assetType: one(assetTypes, {
		fields: [assets.assetTypeId],
		references: [assetTypes.id],
	}),
}))

// Type Exports
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
