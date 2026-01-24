# Profit Journal - Database Schema Design

## Overview

This document defines the complete database schema for the Profit Journal trading platform. The schema is designed for **Drizzle ORM** with **PostgreSQL (Neon serverless)**.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   trades    │───────│ trade_tags  │───────│    tags     │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                           │
       │                                           │
       ▼                                           │
┌─────────────┐                                    │
│ strategies  │◄───────────────────────────────────┘
└─────────────┘

┌─────────────┐       ┌─────────────┐
│daily_journals│       │  settings   │
└─────────────┘       └─────────────┘
```

---

## Tables

### 1. trades

The core table storing all trade records.

```typescript
// src/db/schema.ts

import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core"

// Enums
export const tradeDirectionEnum = pgEnum("trade_direction", ["long", "short"])
export const tradeOutcomeEnum = pgEnum("trade_outcome", ["win", "loss", "breakeven"])
export const timeframeEnum = pgEnum("timeframe", ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"])

export const trades = pgTable("trades", {
  // Primary Key
  id: uuid("id").primaryKey().defaultRandom(),

  // Basic Info
  asset: varchar("asset", { length: 20 }).notNull(),        // e.g., "NVDA", "SPY", "BTC"
  direction: tradeDirectionEnum("direction").notNull(),     // long or short
  timeframe: timeframeEnum("timeframe"),                    // chart timeframe used

  // Timing
  entryDate: timestamp("entry_date", { withTimezone: true }).notNull(),
  exitDate: timestamp("exit_date", { withTimezone: true }),

  // Execution
  entryPrice: decimal("entry_price", { precision: 18, scale: 8 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 18, scale: 8 }),
  positionSize: decimal("position_size", { precision: 18, scale: 8 }).notNull(), // shares/contracts/units

  // Risk Management
  stopLoss: decimal("stop_loss", { precision: 18, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 18, scale: 8 }),
  plannedRiskAmount: decimal("planned_risk_amount", { precision: 18, scale: 2 }), // $ amount at risk
  plannedRMultiple: decimal("planned_r_multiple", { precision: 8, scale: 2 }),    // planned R target

  // Results (calculated or entered)
  pnl: decimal("pnl", { precision: 18, scale: 2 }),                // actual profit/loss in $
  pnlPercent: decimal("pnl_percent", { precision: 8, scale: 4 }),  // % return
  realizedRMultiple: decimal("realized_r_multiple", { precision: 8, scale: 2 }), // actual R achieved
  outcome: tradeOutcomeEnum("outcome"),                            // win/loss/breakeven

  // MFE/MAE (Maximum Favorable/Adverse Excursion)
  mfe: decimal("mfe", { precision: 18, scale: 8 }),  // highest price reached (for longs)
  mae: decimal("mae", { precision: 18, scale: 8 }),  // lowest price reached (for longs)
  mfeR: decimal("mfe_r", { precision: 8, scale: 2 }), // MFE in R terms
  maeR: decimal("mae_r", { precision: 8, scale: 2 }), // MAE in R terms

  // Commission & Fees
  commission: decimal("commission", { precision: 18, scale: 2 }).default("0"),
  fees: decimal("fees", { precision: 18, scale: 2 }).default("0"),

  // Narrative
  preTradeThoughts: text("pre_trade_thoughts"),   // "Why did I take this?"
  postTradeReflection: text("post_trade_reflection"), // "How did I feel?"
  lessonLearned: text("lesson_learned"),

  // Strategy Reference
  strategyId: uuid("strategy_id").references(() => strategies.id, { onDelete: "set null" }),

  // Compliance
  followedPlan: boolean("followed_plan"),              // did you follow your rules?
  disciplineNotes: text("discipline_notes"),           // what went wrong/right

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isArchived: boolean("is_archived").default(false),
})
```

**Key Fields Explained:**
- `plannedRMultiple` vs `realizedRMultiple`: Shows if you hit your target or cut early/late
- `mfe`/`mae`: Reveals if stops are too tight or if you're leaving money on the table
- `followedPlan`: Critical for discipline scoring

---

### 2. strategies

The playbook of trading setups and rules.

```typescript
export const strategies = pgTable("strategies", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Basic Info
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),

  // Criteria
  entryCriteria: text("entry_criteria"),   // when to enter
  exitCriteria: text("exit_criteria"),     // when to exit
  riskRules: text("risk_rules"),           // max R, stop placement rules

  // Target Metrics
  targetRMultiple: decimal("target_r_multiple", { precision: 8, scale: 2 }),
  maxRiskPercent: decimal("max_risk_percent", { precision: 5, scale: 2 }),

  // Reference
  screenshotUrl: varchar("screenshot_url", { length: 500 }), // "Gold Standard" example
  notes: text("notes"),

  // Status
  isActive: boolean("is_active").default(true),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
```

---

### 3. tags

Reusable tags for categorizing trades (setups and mistakes).

```typescript
export const tagTypeEnum = pgEnum("tag_type", ["setup", "mistake", "general"])

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 50 }).notNull().unique(),
  type: tagTypeEnum("type").notNull(),
  color: varchar("color", { length: 7 }),  // hex color for display
  description: text("description"),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
```

**Example Tags:**
- Setup: "Bull Flag", "Breakout", "VWAP Bounce", "Gap Fill"
- Mistake: "FOMO", "Revenge Trade", "Moved Stop", "Oversized", "No Plan"

---

### 4. trade_tags

Many-to-many relationship between trades and tags.

```typescript
export const tradeTags = pgTable("trade_tags", {
  id: uuid("id").primaryKey().defaultRandom(),

  tradeId: uuid("trade_id").notNull().references(() => trades.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
```

---

### 5. daily_journals

Separate journal entries for daily reflections (not tied to specific trades).

```typescript
export const dailyJournals = pgTable("daily_journals", {
  id: uuid("id").primaryKey().defaultRandom(),

  date: timestamp("date", { withTimezone: true }).notNull().unique(),

  // Pre-Session
  marketOutlook: text("market_outlook"),     // market bias for the day
  focusGoals: text("focus_goals"),           // what to focus on
  mentalState: integer("mental_state"),       // 1-10 rating

  // Post-Session
  sessionReview: text("session_review"),     // how did it go?
  emotionalState: integer("emotional_state"), // 1-10 rating after
  keyTakeaways: text("key_takeaways"),

  // Metrics (auto-calculated or entered)
  totalPnl: decimal("total_pnl", { precision: 18, scale: 2 }),
  tradeCount: integer("trade_count"),
  winCount: integer("win_count"),
  lossCount: integer("loss_count"),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
```

---

### 6. settings

User preferences and configuration.

```typescript
export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),

  key: varchar("key", { length: 50 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),

  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
```

**Example Settings:**
| Key | Value | Description |
|-----|-------|-------------|
| `default_risk_percent` | `1.0` | Default position risk % |
| `default_timeframe` | `15m` | Default chart timeframe |
| `account_balance` | `50000` | Current account balance |
| `currency` | `USD` | Display currency |
| `theme` | `dark` | UI theme preference |

---

## Relations

```typescript
// src/db/schema.ts - Relations

import { relations } from "drizzle-orm"

export const tradesRelations = relations(trades, ({ one, many }) => ({
  strategy: one(strategies, {
    fields: [trades.strategyId],
    references: [strategies.id],
  }),
  tags: many(tradeTags),
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
```

---

## Indexes

For optimal query performance:

```typescript
import { index } from "drizzle-orm/pg-core"

// Add to trades table definition
// (indexes as separate export or inline)

export const tradesAssetIdx = index("trades_asset_idx").on(trades.asset)
export const tradesEntryDateIdx = index("trades_entry_date_idx").on(trades.entryDate)
export const tradesOutcomeIdx = index("trades_outcome_idx").on(trades.outcome)
export const tradesStrategyIdx = index("trades_strategy_idx").on(trades.strategyId)

export const tradeTagsTradeIdx = index("trade_tags_trade_idx").on(tradeTags.tradeId)
export const tradeTagsTagIdx = index("trade_tags_tag_idx").on(tradeTags.tagId)

export const dailyJournalsDateIdx = index("daily_journals_date_idx").on(dailyJournals.date)
```

---

## Type Exports

```typescript
// src/db/schema.ts - Type exports

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
```

---

## Seed Data

Initial data for tags (common setups and mistakes):

```typescript
// src/db/seed.ts

const setupTags = [
  { name: "Breakout", type: "setup", color: "#00FF96" },
  { name: "Bull Flag", type: "setup", color: "#00FF96" },
  { name: "Bear Flag", type: "setup", color: "#8080FF" },
  { name: "VWAP Bounce", type: "setup", color: "#00FF96" },
  { name: "Gap Fill", type: "setup", color: "#00FF96" },
  { name: "Trend Continuation", type: "setup", color: "#00FF96" },
  { name: "Reversal", type: "setup", color: "#8080FF" },
  { name: "Range Break", type: "setup", color: "#00FF96" },
]

const mistakeTags = [
  { name: "FOMO", type: "mistake", color: "#FCD535" },
  { name: "Revenge Trade", type: "mistake", color: "#FCD535" },
  { name: "Moved Stop", type: "mistake", color: "#FCD535" },
  { name: "Oversized", type: "mistake", color: "#FCD535" },
  { name: "No Plan", type: "mistake", color: "#FCD535" },
  { name: "Early Entry", type: "mistake", color: "#FCD535" },
  { name: "Late Entry", type: "mistake", color: "#FCD535" },
  { name: "Held Too Long", type: "mistake", color: "#FCD535" },
  { name: "Cut Too Early", type: "mistake", color: "#FCD535" },
  { name: "Chased", type: "mistake", color: "#FCD535" },
]

const defaultSettings = [
  { key: "default_risk_percent", value: "1.0", description: "Default position risk %" },
  { key: "default_timeframe", value: "15m", description: "Default chart timeframe" },
  { key: "account_balance", value: "10000", description: "Starting account balance" },
  { key: "currency", value: "USD", description: "Display currency" },
]
```

---

## Migration Commands

```bash
# Generate migration from schema changes
pnpm db:generate

# Push schema directly to database (development)
pnpm db:push

# Run migrations (production)
pnpm db:migrate
```

---

## Query Examples

### Get trades with tags and strategy

```typescript
const tradesWithRelations = await db.query.trades.findMany({
  with: {
    strategy: true,
    tags: {
      with: {
        tag: true,
      },
    },
  },
  where: eq(trades.isArchived, false),
  orderBy: [desc(trades.entryDate)],
  limit: 50,
})
```

### Get trade stats by asset

```typescript
const statsByAsset = await db
  .select({
    asset: trades.asset,
    totalTrades: count(),
    totalPnl: sum(trades.pnl),
    winCount: sql<number>`count(*) filter (where ${trades.outcome} = 'win')`,
    avgR: avg(trades.realizedRMultiple),
  })
  .from(trades)
  .groupBy(trades.asset)
```

### Get mistake cost analysis

```typescript
const mistakeCosts = await db
  .select({
    tagName: tags.name,
    tradeCount: count(),
    totalLoss: sum(trades.pnl),
  })
  .from(tradeTags)
  .innerJoin(trades, eq(tradeTags.tradeId, trades.id))
  .innerJoin(tags, eq(tradeTags.tagId, tags.id))
  .where(and(
    eq(tags.type, "mistake"),
    lt(trades.pnl, 0)
  ))
  .groupBy(tags.name)
  .orderBy(asc(sum(trades.pnl)))
```

---

## Data Integrity Rules

1. **Trade Completion**: `exitDate`, `exitPrice`, `pnl`, and `outcome` should be set together when closing a trade
2. **R-Multiple Calculation**: `realizedRMultiple = pnl / plannedRiskAmount`
3. **MFE/MAE**: Only meaningful after trade is closed
4. **Discipline Score**: Calculated from `followedPlan` across trades
5. **Tag Constraints**: A trade can have multiple setup tags but ideally categorized properly

---

## Future Considerations

- **Images Table**: For storing trade screenshots and chart images
- **Account Snapshots**: Daily account balance history for accurate equity curve
- **Import History**: Track CSV imports for data lineage
- **Audit Log**: Track changes to trades for data integrity
