# Profit Journal - Implementation Plan

## Project Overview

A personal trading performance analysis platform with deep journaling, analytics, and behavioral correction features. The platform focuses on **Deep Insight and Behavioral Correction** - it doesn't just record what happened, but tells you **why** it happened and **how** to improve.

---

## Progress Tracker

| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Foundation | ✅ Complete | Jan 2025 |
| 2 | Trade Management | ✅ Complete | Jan 2025 |
| 3 | Command Center | ✅ Complete | Jan 2025 |
| 4 | Deep Analytics | ✅ Complete | Jan 2025 |
| 5 | Strategy Playbook | ✅ Complete | Jan 2025 |
| 6 | Settings & Configuration | ✅ Complete | Jan 2025 |
| 7 | i18n & Brazilian Market | ✅ Complete | Jan 2025 |
| 8 | Monthly Results & Prop Trading | 🔲 Planned | - |
| 9 | Position Scaling & Execution Management | 🔲 Planned | - |

---
- Functional trade CRUD operations
- Dashboard components (KPIs, Calendar, Equity Curve)
- Journal entry system with form
- Analytics engine with filtering
- Strategy playbook with compliance
- Performance reports
- CSV import/export

---

## Phase 1: Foundation ✅ COMPLETE

**Goal:** Establish database structure, update theming for trading context, create app shell with navigation.

### Completed Tasks

#### Backend
- [x] Database schema with 6 tables and relations
- [x] Migration generated (`0000_fat_justin_hammer.sql`)
- [x] Placeholder server actions for trades, strategies, tags, analytics
- [x] Type definitions in `src/types/index.ts`

#### Frontend
- [x] Trading colors added to globals.css (buy/sell/warning/muted)
- [x] Sidebar with collapsible navigation
- [x] MainLayout wrapper component
- [x] PageHeader component
- [x] All 8 route pages with placeholder UI

#### Utilities
- [x] `src/lib/dates.ts` - week/month boundaries, formatting
- [x] `src/lib/calculations.ts` - win rate, profit factor, EV, R-multiple, position sizing

### Files Created/Modified
```
src/
├── app/
│   ├── page.tsx                    # Dashboard placeholder
│   ├── layout.tsx                  # Updated with MainLayout
│   ├── globals.css                 # Trading colors added
│   ├── journal/
│   │   ├── page.tsx               # Trade list placeholder
│   │   ├── new/page.tsx           # New trade placeholder
│   │   └── [id]/page.tsx          # Trade detail placeholder
│   ├── analytics/page.tsx          # Analytics placeholder
│   ├── playbook/page.tsx           # Playbook placeholder
│   ├── reports/page.tsx            # Reports placeholder
│   ├── settings/page.tsx           # Settings placeholder
│   └── actions/
│       ├── trades.ts              # Trade actions (placeholder)
│       ├── strategies.ts          # Strategy actions (placeholder)
│       ├── tags.ts                # Tag actions (placeholder)
│       └── analytics.ts           # Analytics actions (placeholder)
├── components/
│   └── layout/
│       ├── sidebar.tsx            # Navigation sidebar
│       ├── main-layout.tsx        # App shell
│       ├── page-header.tsx        # Page headers
│       └── index.ts               # Barrel export
├── db/
│   ├── schema.ts                  # Full schema with 6 tables
│   └── migrations/
│       └── 0000_fat_justin_hammer.sql
├── lib/
│   ├── dates.ts                   # Date utilities
│   └── calculations.ts            # Trading calculations
├── types/
│   └── index.ts                   # TypeScript types
└── eslint.config.mjs              # ESLint 9 flat config
```

### To Run the App
```bash
pnpm dev          # Start dev server
pnpm db:push      # Push schema to database (requires DATABASE_URL)
```

---

## Phase 2: Trade Management ✅ COMPLETE

**Goal:** Build complete trade entry and journal system.

### Completed Tasks

#### Backend
- [x] `createTrade()` - validate with Zod, insert, handle tags, auto-calculate P&L/outcome/R
- [x] `updateTrade()` - partial update, recalculate derived fields
- [x] `deleteTrade()` - soft delete (isArchived)
- [x] `getTrade()` - fetch with strategy and tags relations
- [x] `getTrades()` - paginated list with filters (date, asset, direction, outcome, strategy, tags)
- [x] `getTradesForDate()` - for calendar integration
- [x] `getUniqueAssets()` - for filter dropdowns
- [x] Trade validation schemas with Zod (`src/lib/validations/trade.ts`)

#### Frontend
- [x] Trade list page with pagination and empty state (`src/app/journal/page.tsx`)
- [x] New trade form page (`src/app/journal/new/page.tsx`)
- [x] Trade detail page with full breakdown (`src/app/journal/[id]/page.tsx`)
- [x] Edit trade page (`src/app/journal/[id]/edit/page.tsx`)
- [x] Delete trade button with confirmation (`src/app/journal/[id]/delete-button.tsx`)

#### UI Components (`src/components/journal/`)
- [x] `TradeCard` - summary card with P&L, R, direction badge, tags
- [x] `TradeMetric` - reusable metric display
- [x] `PnLDisplay` - colored profit/loss with monospace font
- [x] `RMultipleBar` - visual planned vs realized R comparison
- [x] `TradeForm` - multi-tab form (Basic, Risk, Journal, Tags)

#### shadcn Components Added
- [x] Input, Label, Textarea
- [x] Select, SelectTrigger, SelectContent, SelectItem
- [x] Tabs, TabsList, TabsTrigger, TabsContent
- [x] Badge, Separator

### Files Created/Modified
```
src/
├── app/
│   ├── journal/
│   │   ├── page.tsx               # Trade list with pagination
│   │   ├── new/page.tsx           # New trade form
│   │   └── [id]/
│   │       ├── page.tsx           # Trade detail view
│   │       ├── edit/page.tsx      # Edit trade form
│   │       └── delete-button.tsx  # Client delete component
│   └── actions/
│       └── trades.ts              # Full CRUD implementation
├── components/
│   ├── ui/
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   └── separator.tsx
│   └── journal/
│       ├── index.ts
│       ├── trade-card.tsx
│       ├── trade-form.tsx
│       ├── trade-metric.tsx
│       ├── pnl-display.tsx
│       └── r-multiple-bar.tsx
├── db/
│   └── drizzle.ts                 # Added schema for typed queries
└── lib/
    └── validations/
        └── trade.ts               # Zod schemas for trades
```

### Deliverables
- ✅ Full trade CRUD functionality
- ✅ Trade list with filtering and pagination
- ✅ Trade detail view with all metrics
- ✅ Working trade entry/edit forms with validation

---

## Phase 3: Command Center ✅ COMPLETE

**Goal:** Build the main dashboard with KPIs and calendar.

### Completed Tasks

#### Backend
- [x] `getOverallStats()` - Net P&L, Win Rate, Profit Factor, Avg R, Win/Loss counts
- [x] `getStreakData()` - current streak, longest win/loss streaks, best/worst days
- [x] `getDailyPnL()` - daily P&L aggregation for calendar
- [x] `getEquityCurve()` - cumulative P&L with drawdown calculation
- [x] `getDisciplineScore()` - playbook compliance % with trend
- [x] `formatDateKey()` - timezone-safe date formatting helper
- [x] `bulkCreateTrades()` - batch import from CSV

#### Frontend
- [x] Dashboard page with real data fetching (`src/app/page.tsx`)
- [x] KPI Cards - Net P&L, Win Rate, Profit Factor, Avg R, Discipline Score
- [x] Trading Calendar - monthly grid, color-coded by P&L, month navigation
- [x] Equity Curve - Recharts area chart with gradient, drawdown tooltip
- [x] Quick Stats - current streak, best/worst day, longest streaks
- [x] CSV Import - drag & drop upload, preview table, bulk import

#### CSV Import Feature
- [x] CSV parser with flexible column mapping (`src/lib/csv-parser.ts`)
- [x] Support for multiple header name variations
- [x] Validation with detailed error/warning reporting
- [x] CSV template generator
- [x] Preview table before import
- [x] New trade page tabs (Single Entry / CSV Import)

### Files Created/Modified
```
src/
├── app/
│   ├── page.tsx                       # Dashboard with real data
│   ├── journal/new/page.tsx           # Updated with tabs
│   └── actions/
│       └── analytics.ts               # Full implementation
├── components/
│   ├── dashboard/
│   │   ├── index.ts
│   │   ├── kpi-cards.tsx
│   │   ├── trading-calendar.tsx
│   │   ├── equity-curve.tsx
│   │   ├── quick-stats.tsx
│   │   └── dashboard-content.tsx      # Client wrapper
│   └── journal/
│       ├── csv-import.tsx
│       └── new-trade-tabs.tsx
├── lib/
│   ├── dates.ts                       # Added formatDateKey()
│   └── csv-parser.ts                  # CSV parsing utility
└── types/
    └── index.ts                       # Added StreakData type
```

### Deliverables
- ✅ Fully functional dashboard with real-time data
- ✅ KPI calculations (P&L, Win Rate, Profit Factor, Avg R, Discipline)
- ✅ Interactive trading calendar with month navigation
- ✅ Equity curve visualization with Recharts
- ✅ Quick stats panel with streaks
- ✅ CSV bulk import with preview and validation

---

## Phase 4: Deep Analytics ✅ COMPLETE

**Goal:** Build filtering system and analytical tools.

### Completed Tasks

#### Backend
- [x] `createTag()` - add new tag with validation
- [x] `updateTag()` - edit tag name/type/color
- [x] `deleteTag()` - remove tag
- [x] `getTags()` - list all tags with optional type filter
- [x] `getTagStats()` - performance per tag (P&L, win rate, avg R, trade count) with full filter support
- [x] `getPerformanceByVariable()` - group by asset/timeframe/hour/dayOfWeek/strategy with full filter support
- [x] `getExpectedValue()` - EV calculation with win rate, avg win/loss, 100-trade projection with full filter support
- [x] `getRDistribution()` - R-multiple histogram buckets from <-2R to >3R with full filter support
- [x] `buildFilterConditions()` - helper function for applying TradeFilters (date, assets, directions, outcomes, timeframes)
- [x] `recalculateRValues()` - recalculate plannedRiskAmount, plannedRMultiple, realizedRMultiple for all trades

#### Frontend
- [x] Analytics page with server-side data fetching (`src/app/analytics/page.tsx`)
- [x] Filter Panel - date presets, custom date range, asset/direction/outcome/timeframe filters (all filters fully functional)
- [x] Variable Comparison - bar chart with metric selector (P&L, win rate, avg R, trade count, profit factor)
- [x] Tag Cloud - visual tag display by type with size/color coding and detailed stats table
- [x] Expected Value - EV display with formula breakdown and interpretation
- [x] R-Distribution Histogram - bar chart with Recharts, color-coded positive/negative R
- [x] Tooltips - informative tooltips on all analytics metrics using shadcn tooltip component
- [x] Profit Factor display - handles Infinity (∞) and zero edge cases properly

#### Risk Calculation Improvements
- [x] Auto-calculate `plannedRiskAmount` from stop loss (never user-inputted)
- [x] Auto-calculate `plannedRMultiple` from take profit / stop loss ratio (never user-inputted)
- [x] Removed plannedRiskAmount and plannedRMultiple from validation schema and CSV parser
- [x] Trade form shows calculated risk values as read-only fields
- [x] Settings page has "Recalculate R Values" button for fixing existing trades

#### UI/UX Improvements
- [x] Increased text contrast for better readability (txt-200, txt-300 colors brightened)
- [x] Added shadcn tooltip component for metric explanations

### Files Created/Modified
```
src/
├── app/
│   ├── analytics/page.tsx              # Full implementation with data
│   ├── settings/page.tsx               # Added recalculate R values button
│   ├── globals.css                     # Improved text contrast colors
│   └── actions/
│       ├── tags.ts                     # Full CRUD + stats with TradeFilters support
│       ├── analytics.ts                # Extended with filter support + recalculateRValues
│       └── trades.ts                   # Auto-calculate risk fields
├── components/
│   ├── ui/
│   │   └── tooltip.tsx                 # shadcn tooltip component
│   ├── analytics/
│   │   ├── index.ts                    # Barrel exports
│   │   ├── filter-panel.tsx            # Date/filter controls with FilterState type
│   │   ├── variable-comparison.tsx     # Performance chart with tooltips
│   │   ├── tag-cloud.tsx               # Tag visualization
│   │   ├── expected-value.tsx          # EV calculator with tooltips
│   │   ├── r-distribution.tsx          # R histogram with tooltips
│   │   └── analytics-content.tsx       # Client wrapper with full filter passing
│   └── journal/
│       └── trade-form.tsx              # Read-only calculated risk fields
├── lib/
│   └── validations/
│       └── trade.ts                    # Removed plannedRiskAmount/plannedRMultiple from schema
└── types/
    └── index.ts                        # TradeFilters, PerformanceByGroup, ExpectedValueData, RDistributionBucket
```

### Deliverables
- ✅ Full filtering system with date presets and multi-select filters (ALL filters functional)
- ✅ Variable comparison tool with 5 grouping options and 5 metrics
- ✅ Tag analysis with cloud visualization and detailed statistics table
- ✅ EV calculator with formula explanation and 100-trade projection
- ✅ R-distribution histogram with positive/negative color coding
- ✅ Informative tooltips on all analytics metrics
- ✅ Auto-calculated risk fields (plannedRiskAmount, plannedRMultiple)
- ✅ Recalculate R values utility for fixing existing trades
- ✅ Improved text contrast for better readability

---

## Phase 5: Strategy Playbook ✅ COMPLETE

**Goal:** Build strategy library and compliance tracking.

### Completed Tasks

#### Backend
- [x] `createStrategy()` - add playbook entry with validation
- [x] `updateStrategy()` - edit strategy with partial updates
- [x] `deleteStrategy()` - soft delete (deactivate) or hard delete
- [x] `getStrategies()` - list all with stats (tradeCount, winRate, PnL, avgR, compliance, profitFactor)
- [x] `getStrategy()` - single strategy by ID with full stats
- [x] `getComplianceOverview()` - overall compliance, tracked trades, top/needs attention strategies
- [x] Strategy validation schema with Zod (`src/lib/validations/strategy.ts`)

#### Frontend
- [x] Playbook Page (`src/app/playbook/page.tsx`) - server-side data fetching
- [x] Strategy Detail Page (`src/app/playbook/[id]/page.tsx`) - full strategy view with all rules and stats

#### UI Components (`src/components/playbook/`)
- [x] `StrategyCard` - name, description, stats grid (trades, P&L, win rate, avg R), compliance bar, target R/risk display
- [x] `StrategyForm` - multi-tab modal form (Basic Info, Rules & Criteria, Risk Settings) for create/edit
- [x] `ComplianceDashboard` - circular progress, followed/deviated breakdown, top performing/needs attention strategies
- [x] `PlaybookContent` - client wrapper with form state management

### Files Created/Modified
```
src/
├── app/
│   ├── playbook/
│   │   ├── page.tsx                   # Server component with data fetching
│   │   └── [id]/page.tsx              # Strategy detail page
│   └── actions/
│       └── strategies.ts              # Full CRUD + compliance actions
├── components/
│   └── playbook/
│       ├── index.ts                   # Barrel exports
│       ├── strategy-card.tsx          # Strategy summary card
│       ├── strategy-form.tsx          # Create/edit form modal
│       ├── compliance-dashboard.tsx   # Compliance overview widget
│       └── playbook-content.tsx       # Client wrapper
└── lib/
    └── validations/
        └── strategy.ts                # Zod validation schema
```

### Deliverables
- ✅ Full strategy CRUD functionality (create, update, soft/hard delete)
- ✅ Strategy statistics (trade count, P&L, win rate, profit factor, avg R)
- ✅ Compliance tracking per strategy and overall
- ✅ Compliance overview dashboard with visual progress ring
- ✅ Strategy detail page with full rules/criteria display
- ✅ Multi-tab form for strategy entry/edit
- ✅ Top performing and needs attention strategy highlights

---

## Phase 6: Settings, Configuration & Reports ✅ COMPLETE

**Goal:** Comprehensive asset/timeframe configuration, automated reports, and UX polish.

---

### 6.1 Asset Configuration System ✅ COMPLETE

**Goal:** Pre-defined assets with type-specific calculation logic.

#### Database Schema Changes

1. **Asset Types Table** (`asset_types`)
   - [x] `id` (uuid, PK)
   - [x] `code` (varchar, unique) - e.g., "FUTURE_INDEX", "STOCK", "CRYPTO", "FOREX"
   - [x] `name` (varchar) - e.g., "Future Index", "Stock", "Cryptocurrency"
   - [x] `description` (text)
   - [x] `isActive` (boolean)

2. **Assets Table** (`assets`)
   - [x] `id` (uuid, PK)
   - [x] `symbol` (varchar, unique) - e.g., "WINFUT", "BTCUSD", "AAPL"
   - [x] `name` (varchar) - e.g., "Mini Índice Bovespa"
   - [x] `assetTypeId` (uuid, FK → asset_types)
   - [x] `tickSize` (decimal) - minimum price variation (e.g., 5 for WINFUT)
   - [x] `tickValue` (decimal) - money value per tick per contract (e.g., 1.00 BRL for WINFUT)
   - [x] `currency` (varchar) - e.g., "BRL", "USD"
   - [x] `multiplier` (decimal) - contract multiplier if applicable
   - [x] `commission` (decimal) - default commission per contract
   - [x] `fees` (decimal) - default fees per contract
   - [x] `isActive` (boolean)
   - [x] `createdAt`, `updatedAt`

#### Backend Tasks (`src/app/actions/assets.ts`)

- [x] `getAssetTypes()` - list all asset types
- [x] `createAssetType()` - add new asset type (admin)
- [x] `getAssets()` - list all assets with type info
- [x] `getAsset()` - get single asset by symbol
- [x] `createAsset()` - add new asset with configuration
- [x] `updateAsset()` - edit asset configuration
- [x] `deleteAsset()` - deactivate asset
- [x] `getActiveAssets()` - for trade form dropdown (only active assets)

#### Calculation Logic

- [x] User enters prices in market terms (points/ticks)
- [x] P&L calculation: `(exitPrice - entryPrice) / tickSize * tickValue * positionSize`
- [x] Example WINFUT: Entry 128000, Exit 128050, Size 2 contracts
  - Points gained: (128050 - 128000) / 5 = 10 ticks
  - P&L: 10 ticks × R$1.00 × 2 contracts = R$20.00
- [x] Apply commission and fees from asset config

#### Seed Data - Brazilian Market ✅ Created in `scripts/seed-assets.sql`

| Symbol | Name | Type | Tick Size | Tick Value | Currency |
|--------|------|------|-----------|------------|----------|
| WINFUT | Mini Índice | Future Index | 5 | 1.00 | BRL |
| WDOFUT | Mini Dólar | Future FX | 0.5 | 5.00 | BRL |
| PETR4 | Petrobras PN | Stock | 0.01 | 0.01 | BRL |
| VALE3 | Vale ON | Stock | 0.01 | 0.01 | BRL |

#### Seed Data - International ✅ Created in `scripts/seed-assets.sql`

| Symbol | Name | Type | Tick Size | Tick Value | Currency |
|--------|------|------|-----------|------------|----------|
| BTCUSD | Bitcoin | Crypto | 0.01 | 0.01 | USD |
| ETHUSD | Ethereum | Crypto | 0.01 | 0.01 | USD |
| EURUSD | EUR/USD | Forex | 0.0001 | 10.00 | USD |
| ES | E-mini S&P 500 | Future Index | 0.25 | 12.50 | USD |
| NQ | E-mini Nasdaq | Future Index | 0.25 | 5.00 | USD |
| AAPL | Apple Inc | Stock | 0.01 | 0.01 | USD |

---

### 6.2 Timeframe Configuration System ✅ COMPLETE

**Goal:** Configurable timeframes including Renko support.

#### Database Schema Changes

1. **Timeframes Table** (`timeframes`)
   - [x] `id` (uuid, PK)
   - [x] `code` (varchar, unique) - e.g., "1M", "5M", "RENKO_10"
   - [x] `name` (varchar) - e.g., "1 Minute", "Renko 10 ticks"
   - [x] `type` (enum: "time_based", "renko")
   - [x] `value` (integer) - e.g., 1, 5, 15, 60 for time; brick size for Renko
   - [x] `unit` (enum: "minutes", "hours", "days", "weeks", "ticks", "points")
   - [x] `sortOrder` (integer) - for display ordering
   - [x] `isActive` (boolean)

#### Backend Tasks (`src/app/actions/timeframes.ts`)

- [x] `getTimeframes()` - list all timeframes
- [x] `createTimeframe()` - add new timeframe
- [x] `updateTimeframe()` - edit timeframe
- [x] `deleteTimeframe()` - deactivate timeframe
- [x] `getActiveTimeframes()` - for trade form dropdown

#### Seed Data - Time-Based ✅ Created in `scripts/seed-timeframes.sql`

| Code | Name | Type | Value | Unit |
|------|------|------|-------|------|
| 1M | 1 Minute | time_based | 1 | minutes |
| 5M | 5 Minutes | time_based | 5 | minutes |
| 15M | 15 Minutes | time_based | 15 | minutes |
| 30M | 30 Minutes | time_based | 30 | minutes |
| 1H | 1 Hour | time_based | 1 | hours |
| 4H | 4 Hours | time_based | 4 | hours |
| 1D | Daily | time_based | 1 | days |
| 1W | Weekly | time_based | 1 | weeks |

#### Seed Data - Renko ✅ Created in `scripts/seed-timeframes.sql`

| Code | Name | Type | Value | Unit |
|------|------|------|-------|------|
| 5R | Renko 5 ticks | renko | 5 | ticks |
| 10R | Renko 10 ticks | renko | 10 | ticks |
| 13R | Renko 13 ticks | renko | 13 | ticks |
| 15rR | Renko 15 ticks | renko | 15 | ticks |

---

### 6.3 Settings UI ✅ COMPLETE

#### Frontend Tasks (`src/app/settings/page.tsx`)

**Tab: Assets**
- [x] Asset list with search/filter
- [x] Add new asset button → form modal
- [x] Edit asset configuration (tick size, tick value, fees)
- [x] Toggle asset active/inactive
- [x] Asset type filter dropdown
- [ ] Bulk import assets (future enhancement)

**Tab: Timeframes**
- [x] Timeframe list (time-based and Renko separated)
- [x] Add new timeframe button → form modal
- [x] Edit timeframe
- [x] Toggle timeframe active/inactive
- [ ] Drag-and-drop reorder (future enhancement)

**Tab: General**
- [x] Default currency setting
- [x] Date format preference
- [x] Recalculate R Values button (existing)
- [x] Theme toggle (if applicable)

---

### 6.4 Trade Form Updates ✅ COMPLETE

- [x] Replace free-text asset input with searchable dropdown of active assets
- [x] Replace timeframe enum with dropdown of active timeframes
- [x] Show asset info tooltip (tick size, tick value, currency)
- [x] Auto-calculate money P&L from price difference based on asset config
- [x] Display both points/ticks P&L and money P&L
- [x] Show calculated commission/fees from asset defaults

---

### 6.5 Reports ✅ COMPLETE

#### Backend Tasks (`src/app/actions/reports.ts`)

- [x] `getWeeklyReport()` - week summary with day-by-day breakdown
- [x] `getMonthlyReport()` - month summary with week-by-week breakdown
- [x] `getMistakeCostAnalysis()` - sum losses grouped by mistake tag

#### Frontend Tasks

**Reports Page** (`src/app/reports/page.tsx`)
- [x] Weekly report card with expandable details
- [x] Monthly report card with expandable details
- [x] Mistake cost breakdown chart
- [ ] Export report as PDF (future enhancement)

**Report Components** (`src/components/reports/`)
- [x] `WeeklyReport` - summary stats, daily P&L table, top wins/losses
- [x] `MonthlyReport` - summary stats, weekly aggregates, performance trends
- [x] `MistakeCostAnalysis` - bar chart of losses by mistake tag

---

### 6.6 Migration Path ✅ COMPLETE

1. **Schema Migration**
   - [x] Create `asset_types` table
   - [x] Create `assets` table
   - [x] Create `timeframes` table
   - [x] Keep `trades.asset` (varchar) for backwards compatibility
   - [x] Keep `trades.timeframe` (varchar) for backwards compatibility

2. **Data Approach**
   - [x] Trade form uses dropdowns when assets/timeframes exist
   - [x] Falls back to free-text input for backwards compatibility
   - [x] Seed scripts provide initial asset/timeframe data

---

### Files Created/Modified ✅

```
src/
├── db/
│   ├── schema.ts                      # ✅ Added asset_types, assets, timeframes tables
│   └── migrations/
│       └── 0002_flimsy_moonstone.sql  # ✅ Migration for Phase 6 tables
├── app/
│   ├── settings/
│   │   └── page.tsx                   # ✅ Full settings with tabs
│   ├── reports/
│   │   └── page.tsx                   # ✅ Reports implementation
│   └── actions/
│       ├── assets.ts                  # ✅ Asset CRUD
│       ├── timeframes.ts              # ✅ Timeframe CRUD
│       └── reports.ts                 # ✅ Report generation
├── components/
│   ├── ui/
│   │   └── dialog.tsx                 # ✅ shadcn dialog component
│   ├── settings/
│   │   ├── index.ts                   # ✅ Barrel exports
│   │   ├── settings-content.tsx       # ✅ Tab container
│   │   ├── asset-list.tsx             # ✅ Asset management table
│   │   ├── asset-form.tsx             # ✅ Asset create/edit dialog
│   │   ├── timeframe-list.tsx         # ✅ Timeframe cards
│   │   ├── timeframe-form.tsx         # ✅ Timeframe create/edit dialog
│   │   └── general-settings.tsx       # ✅ Theme, risk, data maintenance
│   ├── reports/
│   │   ├── index.ts                   # ✅ Barrel exports
│   │   ├── reports-content.tsx        # ✅ Report container
│   │   ├── weekly-report-card.tsx     # ✅ Weekly report with navigation
│   │   ├── monthly-report-card.tsx    # ✅ Monthly report with breakdowns
│   │   └── mistake-cost-card.tsx      # ✅ Mistake analysis visualization
│   └── journal/
│       └── trade-form.tsx             # ✅ Updated with asset/timeframe dropdowns
├── lib/
│   ├── validations/
│   │   ├── asset.ts                   # ✅ Asset validation schema
│   │   └── timeframe.ts               # ✅ Timeframe validation schema
│   └── calculations.ts                # ✅ Added calculateAssetPnL
└── scripts/
    ├── seed-asset-types.sql           # ✅ 7 asset types
    ├── seed-assets.sql                # ✅ Brazilian B3 + international assets
    ├── seed-timeframes.sql            # ✅ Time-based + Renko timeframes
    ├── seed-strategies.sql            # ✅ Trading strategies
    ├── seed-trades.sql                # ✅ 40 sample trades from CSV
    └── seed-all.sql                   # ✅ Master seed script
```

---

### Deliverables

- [x] Asset configuration system with type-specific calculations
- [x] Pre-defined assets selectable in trade form (with free-text fallback)
- [x] Automatic P&L calculation from market price variation
- [x] Commission/fees automatically applied per asset
- [x] Extended timeframe support including Renko
- [x] Full settings page with asset/timeframe management
- [x] Weekly and monthly automated reports
- [x] Mistake cost analysis
- [x] Backwards-compatible approach for existing data
- [x] Seed scripts for assets, timeframes, strategies, and sample trades

---

### Note
CSV Import was completed in Phase 3. CSV parser will need update to support asset lookup by symbol.

---

## Phase 7: Internationalization & Brazilian Market Focus ✅ COMPLETE

**Goal:** Full i18n support with next-intl, Brazilian Portuguese as primary language, and complete B3 market adaptation.

---

### 7.1 Core i18n Framework ✅ COMPLETE

**Library:** `next-intl` (optimized for React Server Components)

**Routing Strategy:** Dynamic `[locale]` segment with `localePrefix: "as-needed"` for cleaner URLs.

#### Supported Locales

| Code | Language | Region | Primary |
|------|----------|--------|---------|
| `pt-BR` | Portuguese | Brazil | ✅ Default |
| `en` | English | International | Fallback |

---

### 7.2 Implementation Summary ✅ COMPLETE

#### Configuration Files Created

- [x] `src/i18n/config.ts` - Locale constants, currency, date format settings
- [x] `src/i18n/routing.ts` - Routing configuration with navigation helpers (Link, usePathname, useRouter)
- [x] `src/i18n/request.ts` - Server-side `getRequestConfig` for message loading
- [x] `src/middleware.ts` - next-intl middleware for locale detection
- [x] `next.config.ts` - i18n plugin configuration with `createNextIntlPlugin`

#### Message Files Structure ✅ COMPLETE

```
messages/
├── pt-BR.json               # Complete Portuguese translations (360+ lines)
└── en.json                  # Complete English translations (360+ lines)
```

Both files contain comprehensive translations for all namespaces:
- `common` - Shared UI (buttons, labels, errors)
- `nav` - Navigation items
- `trade` - Trade-related terms
- `dashboard` - Dashboard KPIs and widgets
- `journal` - Journal page
- `analytics` - Analytics filters and metrics
- `playbook` - Strategy playbook
- `reports` - Weekly/monthly reports
- `settings` - Settings pages
- `assetTypes` - Asset type names
- `timeframeUnits` - Time units
- `dayOfWeek` - Day names
- `months` - Month names
- `validation` - Form validation messages
- `tooltips` - Metric explanations

#### Route Structure Migration ✅ COMPLETE

All routes migrated to `[locale]` segment:

```
src/app/
├── layout.tsx               # Root layout (fonts, global styles)
├── globals.css
└── [locale]/
    ├── layout.tsx           # Locale-aware layout with NextIntlClientProvider
    ├── not-found.tsx        # 404 page
    ├── page.tsx             # Dashboard
    ├── journal/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [id]/
    │       ├── page.tsx
    │       └── edit/page.tsx
    ├── analytics/page.tsx
    ├── playbook/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [id]/
    │       ├── page.tsx
    │       └── edit/page.tsx
    ├── reports/page.tsx
    └── settings/page.tsx
```

---

### 7.3 Server & Client Components ✅ COMPLETE

**Server Components use `getTranslations()` (async):**

```typescript
import { getTranslations, setRequestLocale } from 'next-intl/server'

const DashboardPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('dashboard')
  return <h1>{t('title')}</h1>
}
```

**Client Components use `useTranslations()` hook:**

```typescript
'use client'
import { useTranslations } from 'next-intl'

export const Sidebar = () => {
  const t = useTranslations('nav')
  return <nav>{t('dashboard')}</nav>
}
```

---

### 7.4 Locale-Aware Formatting ✅ COMPLETE

Created `src/lib/formatting.ts` with locale-aware utilities:

- [x] `formatCurrency()` - BRL for pt-BR, USD for en
- [x] `formatCurrencyWithSign()` - With +/- prefix
- [x] `formatNumber()` - Thousands separator (dot for pt-BR, comma for en)
- [x] `formatPercent()` - Percentage formatting
- [x] `formatRMultiple()` - R-multiple formatting (+2.5R, -1.2R)
- [x] `formatDateLocale()` - Date formatting (dd/MM/yyyy for pt-BR)
- [x] `formatDateTimeLocale()` - Date and time
- [x] `formatShortDate()` - Short date (24/01)
- [x] `formatFullDate()` - Full date with weekday
- [x] `formatMonthYear()` - Month and year
- [x] `getRelativeTimeLocale()` - Relative time ("2 dias atrás")
- [x] `formatTime()` - Time formatting
- [x] `formatHourOfDay()` - Hour of day

Created `src/hooks/use-formatting.ts` hook for client components.

---

### 7.5 Brazilian Market Adaptation (B3) ✅ COMPLETE

#### Currency & Number Formatting

- [x] Default currency: BRL (R$)
- [x] Number format: `1.234,56` (dot for thousands, comma for decimals)
- [x] Date format: `DD/MM/YYYY`
- [x] Time format: 24-hour

#### B3 Pre-configured Assets

| Symbol | Name | Type | Tick Size | Tick Value |
|--------|------|------|-----------|------------|
| WINFUT | Mini Índice Bovespa | Future Index | 5 pts | R$ 0,20 |
| WDOFUT | Mini Dólar | Future FX | 0,5 pts | R$ 10,00 |
| INDFUT | Índice Cheio | Future Index | 5 pts | R$ 1,00 |
| DOLFUT | Dólar Cheio | Future FX | 0,5 pts | R$ 50,00 |
| PETR4 | Petrobras PN | Stock | R$ 0,01 | R$ 0,01 |
| VALE3 | Vale ON | Stock | R$ 0,01 | R$ 0,01 |
| ITUB4 | Itaú Unibanco PN | Stock | R$ 0,01 | R$ 0,01 |
| BBDC4 | Bradesco PN | Stock | R$ 0,01 | R$ 0,01 |
| ABEV3 | Ambev ON | Stock | R$ 0,01 | R$ 0,01 |
| B3SA3 | B3 ON | Stock | R$ 0,01 | R$ 0,01 |
| MGLU3 | Magazine Luiza ON | Stock | R$ 0,01 | R$ 0,01 |
| BBAS3 | Banco do Brasil ON | Stock | R$ 0,01 | R$ 0,01 |

#### B3 Trading Hours Context

- [ ] Pre-market: 09:00 - 10:00
- [ ] Regular session: 10:00 - 17:00
- [ ] After-market: 17:30 - 18:00
- [ ] Option to filter analytics by session type

#### Brazilian Tax Context (Future Enhancement)

- [ ] Day trade tax rate: 20%
- [ ] Swing trade tax rate: 15%
- [ ] Monthly exemption tracking for stocks (R$ 20,000)
- [ ] DARF generation helper (future)

---

### 7.7 Translation Keys Structure

#### Example: `messages/pt-BR/common.json`

```json
{
  "nav": {
    "dashboard": "Painel",
    "journal": "Diário",
    "analytics": "Análises",
    "playbook": "Playbook",
    "reports": "Relatórios",
    "settings": "Configurações"
  },
  "actions": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Excluir",
    "edit": "Editar",
    "create": "Criar",
    "confirm": "Confirmar"
  },
  "trade": {
    "direction": {
      "long": "Compra",
      "short": "Venda"
    },
    "outcome": {
      "win": "Gain",
      "loss": "Loss",
      "breakeven": "Empate"
    }
  },
  "currency": {
    "symbol": "R$",
    "code": "BRL"
  }
}
```

#### Example: `messages/pt-BR/dashboard.json`

```json
{
  "title": "Painel de Controle",
  "kpi": {
    "netPnl": "P&L Líquido",
    "winRate": "Taxa de Acerto",
    "profitFactor": "Fator de Lucro",
    "avgR": "R Médio",
    "discipline": "Disciplina"
  },
  "calendar": {
    "title": "Calendário de Trades",
    "noTrades": "Sem trades neste mês"
  },
  "equity": {
    "title": "Curva de Capital",
    "cumulative": "P&L Acumulado",
    "drawdown": "Drawdown"
  }
}
```

---

### 7.8 Files to Create/Modify

```
src/
├── i18n.ts                           # next-intl configuration
├── middleware.ts                     # Locale detection middleware
├── app/
│   └── [locale]/                     # All routes under locale segment
│       ├── layout.tsx                # Locale provider + mismatch guard
│       └── ...                       # All existing pages moved here
├── messages/
│   ├── pt-BR/
│   │   ├── common.json
│   │   ├── dashboard.json
│   │   ├── journal.json
│   │   ├── analytics.json
│   │   ├── playbook.json
│   │   ├── reports.json
│   │   ├── settings.json
│   │   └── validation.json
│   └── en/
│       └── ...                       # Same structure
├── lib/
│   ├── formatting.ts                 # Locale-aware number/date/currency formatting
│   └── locale.ts                     # Locale utilities (get/set preference)
└── scripts/
    └── seed-b3-assets.sql            # B3 market seed data
```

---

### 7.9 Dependencies

```bash
pnpm add next-intl
```

---

### Deliverables ✅ COMPLETE

- [x] Full i18n setup with next-intl
- [x] Portuguese (Brazil) as default language
- [x] English as fallback language
- [x] All UI strings externalized to message files (360+ translations per locale)
- [x] Locale-aware routing with `localePrefix: "as-needed"`
- [x] Middleware-based locale detection
- [x] Brazilian number/date/currency formatting utilities
- [x] Complete B3 asset seed data (from Phase 6)
- [x] Language switcher in Settings page
- [x] Updated sidebar navigation with translations
- [x] All main pages using `getTranslations()` for server-side rendering

### Files Created/Modified

```
src/
├── i18n/
│   ├── config.ts              # Locale constants and settings
│   ├── routing.ts             # Navigation helpers (Link, useRouter, etc.)
│   ├── request.ts             # Server-side message loading
│   └── index.ts               # Barrel exports
├── middleware.ts              # next-intl middleware
├── lib/
│   └── formatting.ts          # Locale-aware formatting utilities
├── hooks/
│   ├── use-formatting.ts      # Client formatting hook
│   └── index.ts               # Barrel exports
├── components/
│   ├── layout/
│   │   └── sidebar.tsx        # Updated with translations
│   └── settings/
│       ├── language-switcher.tsx  # Language toggle component
│       └── general-settings.tsx   # Updated with language switcher
├── app/
│   ├── layout.tsx             # Minimal root layout
│   └── [locale]/
│       ├── layout.tsx         # Locale-aware layout
│       ├── not-found.tsx      # 404 page
│       ├── page.tsx           # Dashboard with translations
│       ├── journal/page.tsx   # Journal with translations
│       ├── analytics/page.tsx # Analytics with translations
│       ├── playbook/page.tsx  # Playbook with translations
│       ├── reports/page.tsx   # Reports with translations
│       └── settings/page.tsx  # Settings with translations
├── messages/
│   ├── pt-BR.json             # Portuguese translations
│   └── en.json                # English translations
└── next.config.ts             # Updated with i18n plugin
```

---

## File Structure Summary

```
src/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── layout.tsx                  # Root layout with MainLayout
│   ├── globals.css                 # Design tokens + trading colors
│   ├── error.tsx                   # Error boundary
│   ├── loading.tsx                 # Loading skeleton
│   ├── journal/
│   │   ├── page.tsx               # Trade list
│   │   ├── new/page.tsx           # New trade form
│   │   └── [id]/page.tsx          # Trade detail
│   ├── analytics/page.tsx
│   ├── playbook/page.tsx
│   ├── reports/page.tsx
│   ├── settings/page.tsx
│   └── actions/
│       ├── trades.ts
│       ├── strategies.ts
│       ├── tags.ts
│       ├── analytics.ts
│       ├── reports.ts             # Phase 6
│       └── import.ts              # Phase 6
├── components/
│   ├── ui/                        # Base shadcn components
│   ├── layout/                    # ✅ Sidebar, MainLayout, PageHeader
│   ├── dashboard/                 # Phase 3
│   ├── journal/                   # Phase 2
│   ├── analytics/                 # Phase 4
│   ├── playbook/                  # Phase 5
│   ├── reports/                   # Phase 6
│   └── settings/                  # Phase 6
├── db/
│   ├── drizzle.ts                 # Database client
│   ├── schema.ts                  # ✅ Full schema
│   └── migrations/                # ✅ Generated
├── lib/
│   ├── utils.ts                   # cn() utility
│   ├── dates.ts                   # ✅ Date utilities
│   ├── calculations.ts            # ✅ Trading calculations
│   └── validations/               # Phase 2
│       ├── trade.ts
│       └── strategy.ts
└── types/
    └── index.ts                   # ✅ TypeScript types
```

---

## Phase 8: Monthly Results & Prop Trading 🔲 PLANNED

**Goal:** Create a comprehensive monthly results page with prop trading profit calculations, tax deductions, and month-over-month comparison.

---

### 8.1 Problem Statement

Traders using prop trading accounts (Mesa Proprietária) need to track:

1. **Profit Share** - Prop firms typically give traders 50-90% of profits
2. **Tax Obligations** - Day trading in Brazil has 20% tax on profits
3. **Monthly Performance** - Compare month-to-month results
4. **Projections** - Understand potential earnings based on current performance

Currently, the dashboard shows overall and weekly performance but lacks:
- Monthly breakdown with navigation
- Prop trading profit share calculations
- Tax estimates
- Month comparison features

---

### 8.2 Database Schema Changes

#### New Table: `user_settings`

Stores user-specific trading settings including prop trading configuration.

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- For future multi-user support

  -- Prop Trading Settings
  profit_share_percentage DECIMAL(5, 2) DEFAULT 100.00, -- % of profit user keeps (100 = no prop)
  is_prop_account BOOLEAN DEFAULT FALSE,
  prop_firm_name VARCHAR(100), -- e.g., "Atom", "Raise", "SoloTrader"

  -- Tax Settings
  day_trade_tax_rate DECIMAL(5, 2) DEFAULT 20.00, -- Brazil: 20%
  swing_trade_tax_rate DECIMAL(5, 2) DEFAULT 15.00, -- Brazil: 15%
  tax_exempt_threshold INTEGER DEFAULT 0, -- Monthly exempt amount in cents (stocks: R$20,000)

  -- Display Preferences
  default_currency VARCHAR(3) DEFAULT 'BRL',
  show_tax_estimates BOOLEAN DEFAULT TRUE,
  show_prop_calculations BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);
```

#### Note on Current Implementation

For now, since we have a single-user app, we'll use a single row with `user_id = 'default'`. Future multi-user support can expand on this.

---

### 8.3 Calculation Logic

#### Prop Trading Profit Calculation

```typescript
interface MonthlyPropCalculation {
  grossProfit: number          // Total P&L for the month
  propFirmShare: number        // Amount kept by prop firm
  traderShare: number          // Amount the trader receives
  estimatedTax: number         // Tax on trader's share
  netProfit: number            // Final amount after tax
}

const calculatePropProfit = (
  grossProfit: number,
  profitSharePercentage: number,  // e.g., 80 for 80%
  taxRate: number                 // e.g., 20 for 20%
): MonthlyPropCalculation => {
  // Only calculate shares if profitable
  if (grossProfit <= 0) {
    return {
      grossProfit,
      propFirmShare: 0,
      traderShare: grossProfit, // Trader absorbs the loss (no profit share on losses)
      estimatedTax: 0,          // No tax on losses
      netProfit: grossProfit
    }
  }

  const traderShare = grossProfit * (profitSharePercentage / 100)
  const propFirmShare = grossProfit - traderShare
  const estimatedTax = traderShare * (taxRate / 100)
  const netProfit = traderShare - estimatedTax

  return {
    grossProfit,
    propFirmShare,
    traderShare,
    estimatedTax,
    netProfit
  }
}
```

#### Monthly Projection Calculation

```typescript
interface MonthlyProjection {
  daysTraded: number
  totalTradingDays: number      // ~22 business days
  currentProfit: number
  projectedMonthlyProfit: number
  projectedNetProfit: number     // After prop share and tax
  dailyAverage: number
}

const calculateMonthlyProjection = (
  currentProfit: number,
  daysTraded: number,
  tradingDaysInMonth: number = 22,
  profitSharePercentage: number,
  taxRate: number
): MonthlyProjection => {
  const remainingDays = tradingDaysInMonth - daysTraded
  const dailyAverage = daysTraded > 0 ? currentProfit / daysTraded : 0
  const projectedMonthlyProfit = currentProfit + (dailyAverage * remainingDays)

  const propCalc = calculatePropProfit(projectedMonthlyProfit, profitSharePercentage, taxRate)

  return {
    daysTraded,
    totalTradingDays: tradingDaysInMonth,
    currentProfit,
    projectedMonthlyProfit,
    projectedNetProfit: propCalc.netProfit,
    dailyAverage
  }
}
```

#### Month Comparison

```typescript
interface MonthComparison {
  currentMonth: MonthlyReport
  previousMonth: MonthlyReport | null
  changes: {
    profitChange: number           // Absolute change
    profitChangePercent: number    // Percentage change
    winRateChange: number
    avgRChange: number
    tradeCountChange: number
  }
}
```

---

### 8.4 Backend Tasks

#### Settings Actions (`src/app/actions/settings.ts`)

- [ ] `getUserSettings()` - Get user trading settings
- [ ] `updateUserSettings()` - Update profit share %, tax rates, etc.
- [ ] `getDefaultSettings()` - Return default values for new users

#### Enhanced Reports (`src/app/actions/reports.ts`)

- [ ] `getMonthlyResultsWithProp()` - Monthly P&L with prop calculations
- [ ] `getMonthlyProjection()` - Current month projection
- [ ] `getMonthComparison()` - Compare two months
- [ ] `getYearlyOverview()` - 12-month summary for navigation

---

### 8.5 Frontend Components

#### Monthly Results Page (`src/app/[locale]/monthly/page.tsx`)

New page dedicated to monthly results with navigation.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Resultados Mensais                                                       │
│                                                                          │
│  ◀ Dezembro 2024        Janeiro 2025         Fevereiro 2025 ▶           │
│                         ═══════════                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  Lucro Bruto    │  │  Sua Parte      │  │  Líquido        │         │
│  │  R$ 5.400,00    │  │  R$ 4.320,00    │  │  R$ 3.456,00    │         │
│  │                 │  │  (80%)          │  │  (após IR 20%)  │         │
│  │  +12% vs dez    │  │                 │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  Projeção do Mês                                           │         │
│  │  ─────────────────────────────────────────────────────────│         │
│  │  15 de 22 dias operados                                    │         │
│  │  ████████████████████░░░░░░░░  68%                        │         │
│  │                                                            │         │
│  │  Média diária: R$ 360,00                                   │         │
│  │  Projeção mensal: R$ 7.920,00                             │         │
│  │  Projeção líquida: R$ 5.068,80                            │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  Comparação com Dezembro                                   │         │
│  │  ─────────────────────────────────────────────────────────│         │
│  │  Lucro:     R$ 4.820,00 → R$ 5.400,00   ▲ +12%           │         │
│  │  Win Rate:  62% → 68%                    ▲ +6pp           │         │
│  │  Avg R:     1.2R → 1.5R                  ▲ +0.3R          │         │
│  │  Trades:    45 → 52                      ▲ +7             │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  Breakdown por Semana                                      │         │
│  │  ─────────────────────────────────────────────────────────│         │
│  │  Sem 1 (01-05): R$ 1.200,00  ████████░░░░░  22%           │         │
│  │  Sem 2 (08-12): R$ 2.100,00  █████████████░  39%          │         │
│  │  Sem 3 (15-19): R$ 1.400,00  ████████████░░  26%          │         │
│  │  Sem 4 (22-26): R$   700,00  █████░░░░░░░░░  13%          │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### New Components (`src/components/monthly/`)

**MonthNavigator** - Month selection with arrows and year dropdown
```typescript
interface MonthNavigatorProps {
  currentMonth: Date
  onMonthChange: (month: Date) => void
  availableRange: { start: Date; end: Date }
}
```

**PropProfitSummary** - Shows gross → trader share → net breakdown
```typescript
interface PropProfitSummaryProps {
  grossProfit: number
  profitSharePercentage: number
  taxRate: number
  showBreakdown?: boolean
}
```

**MonthlyProjection** - Progress bar with projection
```typescript
interface MonthlyProjectionProps {
  daysTraded: number
  totalDays: number
  currentProfit: number
  projectedProfit: number
  projectedNetProfit: number
}
```

**MonthComparison** - Side-by-side comparison
```typescript
interface MonthComparisonProps {
  current: MonthlyReport
  previous: MonthlyReport | null
  metrics: Array<'profit' | 'winRate' | 'avgR' | 'trades' | 'profitFactor'>
}
```

**WeeklyBreakdown** - Weekly bars within the month
```typescript
interface WeeklyBreakdownProps {
  weeks: Array<{
    weekNumber: number
    dateRange: string
    profit: number
    trades: number
  }>
}
```

---

### 8.6 Settings UI Updates

Add new section to Settings page for Prop Trading configuration.

```
┌────────────────────────────────────────────────────────────────┐
│ Configurações de Conta                                          │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tipo de Conta:                                                  │
│  ○ Conta Própria (100% do lucro)                                │
│  ◉ Mesa Proprietária (Prop Trading)                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Configurações Mesa Proprietária                      │       │
│  │  ─────────────────────────────────────────────────── │       │
│  │                                                       │       │
│  │  Nome da Mesa: [Atom                    ▼]           │       │
│  │                                                       │       │
│  │  Porcentagem do Lucro: [80         ] %               │       │
│  │  (Parte que você recebe)                              │       │
│  │                                                       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  Configurações de Impostos:                                      │
│  ─────────────────────────────────────────────────────────      │
│                                                                  │
│  IR Day Trade:    [20] %                                        │
│  IR Swing Trade:  [15] %                                        │
│                                                                  │
│  ☑ Mostrar estimativas de impostos                              │
│  ☑ Mostrar cálculos de mesa proprietária                        │
│                                                                  │
│                              [Salvar Configurações]              │
└────────────────────────────────────────────────────────────────┘
```

---

### 8.7 Navigation Integration

Add "Mensal" to sidebar navigation between "Relatórios" and "Configurações".

```typescript
// Sidebar navigation items
{
  icon: Calendar,
  label: t('nav.monthly'),
  href: '/monthly'
}
```

---

### 8.8 Implementation Order

1. **Settings Schema & Actions** (Day 1)
   - [ ] Create `user_settings` table
   - [ ] Generate migration
   - [ ] Implement settings CRUD actions
   - [ ] Add validation schema

2. **Settings UI** (Day 2)
   - [ ] Add "Trading Account" section to Settings page
   - [ ] Prop trading toggle and configuration form
   - [ ] Tax rate inputs
   - [ ] Translations for new settings

3. **Backend Report Functions** (Day 3)
   - [ ] `getMonthlyResultsWithProp()` with calculations
   - [ ] `getMonthlyProjection()`
   - [ ] `getMonthComparison()`
   - [ ] `getYearlyOverview()` for navigation

4. **Monthly Page - Core** (Day 4)
   - [ ] Create `/monthly/page.tsx`
   - [ ] `MonthNavigator` component
   - [ ] `PropProfitSummary` component
   - [ ] Basic layout and data fetching

5. **Monthly Page - Enhanced** (Day 5)
   - [ ] `MonthlyProjection` component
   - [ ] `MonthComparison` component
   - [ ] `WeeklyBreakdown` component
   - [ ] Responsive design

6. **Polish & Translations** (Day 6)
   - [ ] Full i18n support (pt-BR and en)
   - [ ] Empty states
   - [ ] Loading skeletons
   - [ ] Navigation integration

---

### 8.9 Files to Create/Modify

```
src/
├── db/
│   ├── schema.ts                      # Add user_settings table
│   └── migrations/
│       └── 0003_xxx.sql               # Phase 8 migration
├── app/
│   ├── [locale]/
│   │   └── monthly/
│   │       └── page.tsx               # NEW: Monthly results page
│   └── actions/
│       ├── settings.ts                # UPDATE: Add user settings CRUD
│       └── reports.ts                 # UPDATE: Add prop calculations
├── components/
│   ├── monthly/
│   │   ├── index.ts                   # NEW: Barrel exports
│   │   ├── month-navigator.tsx        # NEW: Month navigation
│   │   ├── prop-profit-summary.tsx    # NEW: Profit breakdown
│   │   ├── monthly-projection.tsx     # NEW: Projection display
│   │   ├── month-comparison.tsx       # NEW: Compare months
│   │   ├── weekly-breakdown.tsx       # NEW: Week-by-week
│   │   └── monthly-content.tsx        # NEW: Client wrapper
│   ├── settings/
│   │   ├── trading-account-settings.tsx  # NEW: Prop trading config
│   │   └── general-settings.tsx          # UPDATE: Include new section
│   └── layout/
│       └── sidebar.tsx                # UPDATE: Add monthly nav item
├── lib/
│   ├── calculations.ts                # UPDATE: Add prop profit calculations
│   └── validations/
│       └── settings.ts                # NEW: Settings validation
├── types/
│   └── index.ts                       # UPDATE: Add settings types
└── messages/
    ├── en.json                        # UPDATE: Add monthly translations
    └── pt-BR.json                     # UPDATE: Add monthly translations
```

---

### 8.10 Translation Keys to Add

```json
{
  "nav": {
    "monthly": "Monthly"
  },
  "monthly": {
    "title": "Monthly Results",
    "grossProfit": "Gross Profit",
    "traderShare": "Your Share",
    "propShare": "Prop Firm Share",
    "netProfit": "Net Profit",
    "afterTax": "after {taxRate}% tax",
    "projection": {
      "title": "Month Projection",
      "daysTraded": "{current} of {total} days traded",
      "dailyAverage": "Daily Average",
      "projectedMonthly": "Projected Monthly",
      "projectedNet": "Projected Net"
    },
    "comparison": {
      "title": "Comparison with {month}",
      "profit": "Profit",
      "winRate": "Win Rate",
      "avgR": "Avg R",
      "trades": "Trades",
      "change": "Change"
    },
    "weeklyBreakdown": {
      "title": "Weekly Breakdown",
      "week": "Week {number}"
    },
    "noData": "No trades recorded for this month"
  },
  "settings": {
    "tradingAccount": {
      "title": "Trading Account",
      "accountType": "Account Type",
      "personal": "Personal Account (100% profit)",
      "prop": "Prop Trading Firm",
      "propSettings": "Prop Trading Settings",
      "firmName": "Firm Name",
      "profitShare": "Profit Share",
      "profitShareHelp": "Percentage you receive",
      "taxSettings": "Tax Settings",
      "dayTradeTax": "Day Trade Tax",
      "swingTradeTax": "Swing Trade Tax",
      "showTaxEstimates": "Show tax estimates",
      "showPropCalculations": "Show prop calculations"
    }
  }
}
```

---

### Deliverables

- [ ] `user_settings` table for trading account configuration
- [ ] Settings UI for prop trading and tax configuration
- [ ] Monthly results page with navigation between months
- [ ] Prop profit calculation (gross → trader share → net)
- [ ] Monthly projection based on days traded
- [ ] Month-over-month comparison
- [ ] Weekly breakdown within month
- [ ] Navigation sidebar integration
- [ ] Full i18n support for new features
- [ ] Responsive design for all new components

---

## Phase 9: Position Scaling & Execution Management 🔲 PLANNED

**Goal:** Support multiple entries and exits within a single trade position, including scale-in, scale-out, and partial position management.

---

### 9.1 Problem Statement

Currently, each trade is a single record with one entry price and one exit price. Real trading often involves:

1. **Scaling In** - Adding to a winning or averaging down on a losing position
   - Example: Buy 2 contracts at 128000, add 2 more at 128100, add 1 more at 128200

2. **Scaling Out** - Taking partial profits or reducing risk
   - Example: Close 3 contracts at 128500, close remaining 2 at 128300

3. **Mixed Scaling** - Multiple entries AND multiple exits
   - Example: Build position over 3 entries, exit over 2 partial closes

4. **Averaging** - Calculating weighted average entry/exit prices for proper P&L tracking

---

### 9.2 Database Schema Changes

#### New Table: `trade_executions`

Stores individual buy/sell executions that make up a trade position.

```sql
CREATE TABLE trade_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,

  -- Execution details
  execution_type VARCHAR(10) NOT NULL, -- 'entry' | 'exit'
  execution_date TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL, -- contracts/shares for this execution

  -- Optional metadata
  order_type VARCHAR(20), -- 'market' | 'limit' | 'stop' | 'stop_limit'
  notes TEXT,

  -- Costs for this specific execution
  commission INTEGER DEFAULT 0, -- in cents
  fees INTEGER DEFAULT 0, -- in cents
  slippage INTEGER DEFAULT 0, -- in cents (difference from intended price)

  -- Calculated fields (stored for performance)
  execution_value INTEGER NOT NULL, -- quantity * price in cents

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trade_executions_trade_id ON trade_executions(trade_id);
CREATE INDEX idx_trade_executions_type ON trade_executions(execution_type);
```

#### Modified Table: `trades`

Add fields to track aggregated execution data:

```sql
ALTER TABLE trades ADD COLUMN execution_mode VARCHAR(20) DEFAULT 'simple';
-- 'simple' = single entry/exit (legacy behavior)
-- 'scaled' = multiple entries/exits via trade_executions

ALTER TABLE trades ADD COLUMN total_entry_quantity DECIMAL(20, 8);
ALTER TABLE trades ADD COLUMN total_exit_quantity DECIMAL(20, 8);
ALTER TABLE trades ADD COLUMN avg_entry_price DECIMAL(20, 8);
ALTER TABLE trades ADD COLUMN avg_exit_price DECIMAL(20, 8);
ALTER TABLE trades ADD COLUMN remaining_quantity DECIMAL(20, 8) DEFAULT 0;
-- For tracking open positions with partial exits
```

---

### 9.3 Calculation Logic

#### Weighted Average Price Calculation

```typescript
// Calculate weighted average entry price
const calculateAvgEntryPrice = (executions: Execution[]): number => {
  const entries = executions.filter(e => e.executionType === 'entry')
  const totalValue = entries.reduce((sum, e) => sum + (e.price * e.quantity), 0)
  const totalQuantity = entries.reduce((sum, e) => sum + e.quantity, 0)
  return totalQuantity > 0 ? totalValue / totalQuantity : 0
}

// Calculate weighted average exit price
const calculateAvgExitPrice = (executions: Execution[]): number => {
  const exits = executions.filter(e => e.executionType === 'exit')
  const totalValue = exits.reduce((sum, e) => sum + (e.price * e.quantity), 0)
  const totalQuantity = exits.reduce((sum, e) => sum + e.quantity, 0)
  return totalQuantity > 0 ? totalValue / totalQuantity : 0
}
```

#### P&L Calculation for Scaled Positions

```typescript
// FIFO-based P&L calculation (First In, First Out)
const calculateScaledPnL = (
  executions: Execution[],
  direction: 'long' | 'short',
  asset: Asset
): { realizedPnl: number; unrealizedPnl: number } => {
  // Sort entries by date (FIFO)
  const entries = [...executions]
    .filter(e => e.executionType === 'entry')
    .sort((a, b) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime())

  const exits = [...executions]
    .filter(e => e.executionType === 'exit')
    .sort((a, b) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime())

  let realizedPnl = 0
  let entryIndex = 0
  let remainingEntryQty = entries[0]?.quantity || 0

  for (const exit of exits) {
    let exitQtyRemaining = exit.quantity

    while (exitQtyRemaining > 0 && entryIndex < entries.length) {
      const matchQty = Math.min(exitQtyRemaining, remainingEntryQty)
      const entryPrice = entries[entryIndex].price
      const exitPrice = exit.price

      // Calculate P&L for this matched quantity
      const priceDiff = direction === 'long'
        ? exitPrice - entryPrice
        : entryPrice - exitPrice

      const tickPnl = (priceDiff / asset.tickSize) * asset.tickValue * matchQty
      realizedPnl += tickPnl

      exitQtyRemaining -= matchQty
      remainingEntryQty -= matchQty

      if (remainingEntryQty <= 0) {
        entryIndex++
        remainingEntryQty = entries[entryIndex]?.quantity || 0
      }
    }
  }

  return { realizedPnl, unrealizedPnl: 0 } // unrealizedPnl requires current market price
}
```

#### Position Status Tracking

```typescript
type PositionStatus =
  | 'open'      // Has entries but no exits yet
  | 'partial'   // Some exits but position still open
  | 'closed'    // All entries matched with exits
  | 'over_exit' // More exits than entries (error state)

const getPositionStatus = (executions: Execution[]): PositionStatus => {
  const totalEntries = executions
    .filter(e => e.executionType === 'entry')
    .reduce((sum, e) => sum + e.quantity, 0)

  const totalExits = executions
    .filter(e => e.executionType === 'exit')
    .reduce((sum, e) => sum + e.quantity, 0)

  if (totalExits === 0) return 'open'
  if (totalExits < totalEntries) return 'partial'
  if (totalExits === totalEntries) return 'closed'
  return 'over_exit'
}
```

---

### 9.4 Backend Tasks (`src/app/actions/executions.ts`)

- [ ] `addExecution()` - Add entry or exit to a trade
- [ ] `updateExecution()` - Modify execution details
- [ ] `deleteExecution()` - Remove execution (with position recalculation)
- [ ] `getExecutions()` - List executions for a trade
- [ ] `recalculateTradeFromExecutions()` - Update trade aggregates from executions

#### Modified Actions (`src/app/actions/trades.ts`)

- [ ] `createTrade()` - Support `executionMode: 'scaled'` with initial executions
- [ ] `updateTrade()` - Handle execution updates properly
- [ ] `getTrade()` - Include executions in response
- [ ] `convertToScaled()` - Convert simple trade to scaled mode

---

### 9.5 Frontend Components

#### New Components (`src/components/journal/`)

**ExecutionList** - Display all executions for a trade
```
┌─────────────────────────────────────────────────────────────┐
│ Executions                                          + Add   │
├─────────────────────────────────────────────────────────────┤
│ ▲ ENTRY   Jan 15, 10:30   2 contracts @ 128,000    R$ -     │
│ ▲ ENTRY   Jan 15, 11:15   2 contracts @ 128,100    R$ -     │
│ ▲ ENTRY   Jan 15, 14:00   1 contract  @ 128,200    R$ -     │
├─────────────────────────────────────────────────────────────┤
│ ▼ EXIT    Jan 15, 15:30   3 contracts @ 128,500    +R$ 180  │
│ ▼ EXIT    Jan 15, 16:00   2 contracts @ 128,300    +R$ 60   │
├─────────────────────────────────────────────────────────────┤
│ Summary: 5 in → 5 out | Avg Entry: 128,080 | Avg Exit: 128,420│
│ Total P&L: +R$ 240.00 | Position: CLOSED                     │
└─────────────────────────────────────────────────────────────┘
```

**ExecutionForm** - Modal to add/edit execution
```
┌────────────────────────────────────────┐
│ Add Execution                      [x] │
├────────────────────────────────────────┤
│ Type:    ◉ Entry  ○ Exit               │
│                                        │
│ Date:    [Jan 15, 2025    ] [10:30  ]  │
│                                        │
│ Price:   [128,000                   ]  │
│                                        │
│ Quantity: [2                        ]  │
│                                        │
│ Order Type: [Market          ▼]        │
│                                        │
│ Commission: [R$ 0.40            ]      │
│                                        │
│ Notes:   [                         ]   │
│          [                         ]   │
│                                        │
│         [Cancel]          [Add Entry]  │
└────────────────────────────────────────┘
```

**PositionSummary** - Visual summary of position
```
┌─────────────────────────────────────────────────────────────┐
│ Position Summary                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Entry Avg: 128,080          Exit Avg: 128,420               │
│       ──────────────────────────────────────►                │
│            +340 pts (+R$ 68.00 per contract)                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░│    │
│  │        60% closed                   40% open       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  5 contracts entered → 3 closed, 2 remaining                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**ScaledTradeForm** - Enhanced trade form for scaled positions
- Toggle between "Simple" and "Scaled" mode
- In scaled mode, show execution list with add button
- Real-time P&L calculation as executions are added

---

### 9.6 Trade Form UX Flow

#### Option A: Start Simple, Convert to Scaled

1. User creates simple trade (current behavior)
2. If user needs to add execution, click "Convert to Scaled Position"
3. Original entry/exit become first executions
4. Can now add more entries/exits

#### Option B: Choose Mode at Creation

1. User selects "Simple Trade" or "Scaled Position" at start
2. Simple: Current form (one entry, one exit)
3. Scaled: Execution-based form from the start

**Recommended: Option A** - Less friction for simple trades, easy upgrade path

---

### 9.7 Migration Strategy

#### Backwards Compatibility

1. **Existing trades** remain in `execution_mode: 'simple'`
2. Simple trades use current `entryPrice`, `exitPrice`, `positionSize` fields
3. Scaled trades use `trade_executions` table
4. All reports/analytics work with both modes transparently

#### Data Access Layer

```typescript
// Unified interface for getting trade data
interface TradeWithCalculations {
  // ... existing trade fields ...

  // These are calculated differently based on execution_mode
  effectiveEntryPrice: number  // single price or weighted avg
  effectiveExitPrice: number   // single price or weighted avg
  effectiveSize: number        // single size or total quantity

  // New fields for scaled trades
  executions?: TradeExecution[]
  remainingQuantity?: number
  positionStatus: 'open' | 'partial' | 'closed'
}

const getTradeWithCalculations = async (tradeId: string): Promise<TradeWithCalculations> => {
  const trade = await getTrade(tradeId)

  if (trade.executionMode === 'simple') {
    return {
      ...trade,
      effectiveEntryPrice: trade.entryPrice,
      effectiveExitPrice: trade.exitPrice,
      effectiveSize: trade.positionSize,
      positionStatus: trade.exitPrice ? 'closed' : 'open'
    }
  }

  // Scaled mode: calculate from executions
  const executions = await getExecutions(tradeId)
  return {
    ...trade,
    executions,
    effectiveEntryPrice: calculateAvgEntryPrice(executions),
    effectiveExitPrice: calculateAvgExitPrice(executions),
    effectiveSize: calculateTotalEntryQuantity(executions),
    remainingQuantity: calculateRemainingQuantity(executions),
    positionStatus: getPositionStatus(executions)
  }
}
```

---

### 9.8 Analytics Integration

#### Updated Calculations

All analytics functions need to work with effective prices:

- [ ] `getOverallStats()` - Use effective prices for P&L
- [ ] `getDailyPnL()` - Aggregate by execution date or trade date
- [ ] `getEquityCurve()` - Account for partial closes on different dates
- [ ] `getRDistribution()` - Calculate R from effective entry to effective exit
- [ ] `getPerformanceByVariable()` - Group by trade, not execution

#### New Analytics Possibilities

- [ ] **Scaling Efficiency**: Compare scaled vs simple trade performance
- [ ] **Add-on Analysis**: Performance of trades where positions were added
- [ ] **Partial Exit Analysis**: Effectiveness of taking partial profits
- [ ] **Average Down Analysis**: Performance of averaging down vs cutting losses

---

### 9.9 Implementation Order

1. **Schema & Migration** (Day 1)
   - [ ] Create `trade_executions` table
   - [ ] Add new fields to `trades` table
   - [ ] Generate and run migration

2. **Backend Actions** (Day 2-3)
   - [ ] `addExecution()`, `updateExecution()`, `deleteExecution()`
   - [ ] `recalculateTradeFromExecutions()`
   - [ ] Update `getTrade()` to include executions
   - [ ] Update `createTrade()` for scaled mode

3. **UI Components** (Day 4-5)
   - [ ] `ExecutionList` component
   - [ ] `ExecutionForm` modal
   - [ ] `PositionSummary` component
   - [ ] Update `TradeForm` with execution mode toggle

4. **Trade Detail Page** (Day 6)
   - [ ] Display execution list
   - [ ] Show position summary visualization
   - [ ] Add execution directly from detail page

5. **Analytics Updates** (Day 7)
   - [ ] Update calculation functions for effective prices
   - [ ] Add scaling-specific analytics (optional)

6. **Testing & Polish** (Day 8)
   - [ ] Test FIFO P&L calculation
   - [ ] Test partial position scenarios
   - [ ] Update translations

---

### 9.10 Files to Create/Modify

```
src/
├── db/
│   ├── schema.ts                      # Add trade_executions table
│   └── migrations/
│       └── 0004_xxx.sql               # Phase 9 migration
├── app/
│   └── actions/
│       ├── executions.ts              # NEW: Execution CRUD
│       ├── trades.ts                  # Update for scaled mode
│       └── analytics.ts               # Update calculations
├── components/
│   └── journal/
│       ├── execution-list.tsx         # NEW: Execution table
│       ├── execution-form.tsx         # NEW: Add/edit execution
│       ├── position-summary.tsx       # NEW: Visual summary
│       └── trade-form.tsx             # Update for scaled mode
├── lib/
│   ├── calculations.ts                # Add FIFO P&L calculation
│   └── validations/
│       └── execution.ts               # NEW: Execution validation
├── types/
│   └── index.ts                       # Add Execution types
└── messages/
    ├── en.json                        # Add execution translations
    └── pt-BR.json                     # Add execution translations
```

---

### 9.11 Translation Keys to Add

```json
{
  "execution": {
    "title": "Executions",
    "add": "Add Execution",
    "edit": "Edit Execution",
    "entry": "Entry",
    "exit": "Exit",
    "date": "Date",
    "price": "Price",
    "quantity": "Quantity",
    "orderType": "Order Type",
    "market": "Market",
    "limit": "Limit",
    "stop": "Stop",
    "stopLimit": "Stop Limit",
    "commission": "Commission",
    "fees": "Fees",
    "slippage": "Slippage",
    "notes": "Notes",
    "avgEntry": "Avg Entry",
    "avgExit": "Avg Exit",
    "totalIn": "Total In",
    "totalOut": "Total Out",
    "remaining": "Remaining",
    "positionStatus": {
      "open": "Open",
      "partial": "Partial",
      "closed": "Closed"
    },
    "convertToScaled": "Convert to Scaled Position",
    "scaledMode": "Scaled Position",
    "simpleMode": "Simple Trade"
  }
}
```

---

### Deliverables

- [ ] `trade_executions` table with proper indexes
- [ ] Execution CRUD operations
- [ ] Weighted average price calculations
- [ ] FIFO P&L calculation for scaled positions
- [ ] Position status tracking (open/partial/closed)
- [ ] `ExecutionList` component with add/edit/delete
- [ ] `ExecutionForm` modal for entry/exit
- [ ] `PositionSummary` visualization
- [ ] Updated trade form with scaling support
- [ ] Updated trade detail page
- [ ] Backwards compatible with simple trades
- [ ] Updated analytics for effective prices
- [ ] Full i18n support for new features

---

## Success Criteria

After 30 days of use, the platform should enable the user to say:

> "I make 80% of my money on Tuesday mornings trading 15-minute breakouts, and I lose it all back on Friday afternoons trading 1-minute reversals."

This means:
- Complete trade logging with all relevant data
- Accurate performance calculations
- Effective filtering and grouping
- Clear visualization of patterns
- Actionable mistake identification
