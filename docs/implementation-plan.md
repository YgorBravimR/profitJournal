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
| 8 | Monthly Results & Prop Trading | ✅ Complete | Jan 2025 |
| 9 | Position Scaling & Execution Management | ✅ Complete | Jan 2025 |

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

## Phase 8: Monthly Results & Prop Trading ✅ COMPLETE

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

## Phase 9: Position Scaling & Execution Management ✅ COMPLETE

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

1. **Schema & Migration** ✅
   - [x] Create `trade_executions` table
   - [x] Add new fields to `trades` table
   - [x] Generate and run migration

2. **Backend Actions** ✅
   - [x] `createExecution()`, `updateExecution()`, `deleteExecution()`
   - [x] `recalculateTradeFromExecutions()`
   - [x] Update `getTrade()` to include executions
   - [x] `convertToScaledMode()` action

3. **UI Components** ✅
   - [x] `ExecutionList` component
   - [x] `ExecutionForm` modal
   - [x] `PositionSummary` component
   - [x] `TradeExecutionsSection` wrapper component

4. **Trade Detail Page** ✅
   - [x] Display execution list
   - [x] Show position summary visualization
   - [x] Add execution directly from detail page
   - [x] Convert to scaled mode option

5. **Calculations** ✅
   - [x] FIFO P&L calculation
   - [x] Weighted average price calculation

6. **Translations** ✅
   - [x] English translations
   - [x] Portuguese translations

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

- [x] `trade_executions` table with proper indexes
- [x] Execution CRUD operations
- [x] Weighted average price calculations
- [x] FIFO P&L calculation for scaled positions
- [x] Position status tracking (open/partial/closed)
- [x] `ExecutionList` component with add/edit/delete
- [x] `ExecutionForm` modal for entry/exit
- [x] `PositionSummary` visualization
- [x] Convert to scaled mode from trade detail page
- [x] Updated trade detail page with executions section
- [x] Backwards compatible with simple trades
- [x] Full i18n support for new features (en + pt-BR)

---

## Improvements & Fixes (Jan 2025)

### Fee Calculation Enhancement

Updated the fee calculation to properly account for contract executions:

1. **Fee Formula Change**: Fees are now calculated as `(commission + fees) × contractsExecuted`
   - Previously: `(commission + fees) × positionSize` (only counted position size once)
   - Now: Default is `positionSize × 2` (entry + exit) unless overridden

2. **New Field: `contractsExecuted`**
   - Added to `trades` table to track total contract executions
   - Defaults to `positionSize × 2` (1 entry + 1 exit per contract)
   - Can be increased for trades with scaling (add/reduce during trade)
   - Preliminary work for Phase 9's full execution tracking

3. **Dashboard Updates**
   - Added **Gross P&L** card (P&L before fees)
   - Added **Net P&L** card (P&L after fees, shows fee amount)
   - Dashboard now shows 6 KPI cards instead of 5

4. **Trade Form Updates**
   - Added "Contracts Executed" field in Risk tab
   - Shows default calculation hint
   - Tooltip explains usage for scaling scenarios

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

---

## Phase 10: User Authentication & Multi-Account System ✅ COMPLETE

**Goal:** Implement secure user authentication with registration and login, supporting multiple trading accounts per user with account-specific settings.

---

### 10.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER                                         │
│  - Full name, email, password                                            │
│  - General settings (language, theme, date format)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │   Account 1     │  │   Account 2     │  │   Account 3     │          │
│  │  "Personal"     │  │  "Atom Prop"    │  │  "Raise Prop"   │          │
│  │                 │  │                 │  │                 │          │
│  │ - Risk settings │  │ - Risk settings │  │ - Risk settings │          │
│  │ - Prop config   │  │ - Prop config   │  │ - Prop config   │          │
│  │ - Enabled assets│  │ - Enabled assets│  │ - Enabled assets│          │
│  │ - Custom fees   │  │ - Custom fees   │  │ - Custom fees   │          │
│  │ - Trades        │  │ - Trades        │  │ - Trades        │          │
│  │ - Strategies    │  │ - Strategies    │  │ - Strategies    │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         GLOBAL (Admin-managed)                           │
│                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐       │
│  │         Assets              │  │       Timeframes            │       │
│  │  WINFUT, WDOFUT, ES, NQ...  │  │  1M, 5M, 15M, Renko 10...   │       │
│  │  (tick size, tick value,    │  │  (Created by admins)        │       │
│  │   currency, multiplier)     │  │                             │       │
│  │  NO commission/fees here    │  │                             │       │
│  └─────────────────────────────┘  └─────────────────────────────┘       │
│                                                                          │
│  Note: Commission/fees are USER-managed per account, not admin-managed.  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 10.2 Technology Choice: Auth.js (NextAuth.js v5)

**Library:** `next-auth` v5 (Auth.js) - The most modern and performant authentication solution for Next.js

**Why Auth.js v5:**
- Native App Router support (React Server Components)
- Edge runtime compatible
- Built-in TypeScript support
- Secure session handling with JWT or database sessions
- Middleware-based route protection
- Credentials provider for email/password auth
- Easy database integration with Drizzle adapter

---

### 10.3 Database Schema Changes

#### New Table: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified TIMESTAMP WITH TIME ZONE,
  password_hash VARCHAR(255) NOT NULL,
  image VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,

  -- General user settings (not account-specific)
  preferred_locale VARCHAR(10) DEFAULT 'pt-BR',
  theme VARCHAR(20) DEFAULT 'dark',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### New Table: `trading_accounts`

Each user can have multiple trading accounts (personal, prop firms, etc.)

```sql
CREATE TABLE trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Account identification
  name VARCHAR(100) NOT NULL,          -- "Personal", "Atom Prop", etc.
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,    -- Default account for this user
  is_active BOOLEAN DEFAULT TRUE,

  -- Trading account type
  account_type VARCHAR(20) DEFAULT 'personal', -- 'personal' | 'prop'
  prop_firm_name VARCHAR(100),         -- e.g., "Atom", "Raise", "SoloTrader"
  profit_share_percentage DECIMAL(5, 2) DEFAULT 100.00, -- % trader keeps

  -- Tax settings (per account as different accounts may have different tax treatments)
  day_trade_tax_rate DECIMAL(5, 2) DEFAULT 20.00,
  swing_trade_tax_rate DECIMAL(5, 2) DEFAULT 15.00,

  -- Risk settings (per account)
  default_risk_per_trade DECIMAL(5, 2), -- % of account
  max_daily_loss DECIMAL(12, 2),        -- in account currency
  max_daily_trades INTEGER,
  default_currency VARCHAR(3) DEFAULT 'BRL',

  -- Global default fees for this account (user-managed, not admin)
  -- These are the default fees applied to all assets unless overridden per-asset
  default_commission INTEGER DEFAULT 0, -- cents per contract
  default_fees INTEGER DEFAULT 0,       -- cents per contract

  -- Display preferences
  show_tax_estimates BOOLEAN DEFAULT TRUE,
  show_prop_calculations BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, name)
);

CREATE INDEX idx_trading_accounts_user_id ON trading_accounts(user_id);
```

#### New Table: `account_assets`

Per-account asset configuration (which assets are enabled, per-asset fee overrides)

```sql
CREATE TABLE account_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,

  is_enabled BOOLEAN DEFAULT TRUE,

  -- Per-asset fee overrides (NULL = use account's global default)
  commission_override INTEGER,         -- in cents, NULL = use account default
  fees_override INTEGER,               -- in cents, NULL = use account default

  -- Notes specific to this asset/account combo
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, asset_id)
);

CREATE INDEX idx_account_assets_account_id ON account_assets(account_id);
```

#### New Table: `account_timeframes`

Per-account timeframe configuration (which timeframes are enabled)

```sql
CREATE TABLE account_timeframes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
  timeframe_id UUID NOT NULL REFERENCES timeframes(id) ON DELETE CASCADE,

  is_enabled BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, timeframe_id)
);

CREATE INDEX idx_account_timeframes_account_id ON account_timeframes(account_id);
```

#### New Table: `sessions` (for database sessions)

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_account_id UUID REFERENCES trading_accounts(id), -- Currently selected account
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

#### Modify Existing Tables

**Remove commission/fees from assets table:**

```sql
-- Commission/fees move to account level (user-managed, not admin)
ALTER TABLE assets DROP COLUMN commission;
ALTER TABLE assets DROP COLUMN fees;
```

**Update tables to reference trading accounts:**

```sql
-- trades table: belongs to an account
ALTER TABLE trades ADD COLUMN account_id UUID REFERENCES trading_accounts(id);
CREATE INDEX idx_trades_account_id ON trades(account_id);

-- strategies table: belongs to an account (strategies can differ per account)
ALTER TABLE strategies ADD COLUMN account_id UUID REFERENCES trading_accounts(id);
CREATE INDEX idx_strategies_account_id ON strategies(account_id);

-- tags table: belongs to an account
ALTER TABLE tags ADD COLUMN account_id UUID REFERENCES trading_accounts(id);
CREATE INDEX idx_tags_account_id ON tags(account_id);
```

---

### 10.4 Commission & Fees Calculation

#### Fee Priority (at trade creation time)

When creating a trade, commission/fees are calculated with this priority:

```
1. Check account_assets for per-asset override → if exists, use it
2. Else, use account's global default (trading_accounts.default_commission/fees)
```

#### Fee Snapshot on Trade

**Important:** Commission and fees are captured at trade creation time and saved on the trade record.

```typescript
// When creating a trade:
const getTradeCommissionFees = async (accountId: string, assetId: string) => {
  // Check for per-asset override
  const assetOverride = await db.query.accountAssets.findFirst({
    where: and(
      eq(accountAssets.accountId, accountId),
      eq(accountAssets.assetId, assetId)
    )
  })

  if (assetOverride?.commissionOverride !== null) {
    return {
      commission: assetOverride.commissionOverride,
      fees: assetOverride.feesOverride ?? account.defaultFees
    }
  }

  // Fall back to account defaults
  const account = await getAccount(accountId)
  return {
    commission: account.defaultCommission,
    fees: account.defaultFees
  }
}

// These values are saved on the trade record
// Future fee changes do NOT affect historical trades
```

#### Why Snapshot?

- User pays commission at trade time
- Broker may change fees in the future
- Historical P&L calculations must reflect actual costs paid
- Changing fees later should not retroactively alter past trades

---

### 10.5 Authentication & Account Selection Flow

#### Registration Flow

```
User enters name, email, password
        ↓
Validate input (Zod schema)
        ↓
Check if email already exists
        ↓
Hash password with bcrypt (cost factor 12)
        ↓
Create user record
        ↓
Create default "Personal" trading account
        ↓
Redirect to login page with success message
```

#### Login Flow

```
User enters email and password
        ↓
Validate credentials
        ↓
Find user by email
        ↓
Verify password hash
        ↓
Fetch user's trading accounts
        ↓
If single account → Auto-select and go to dashboard
        ↓
If multiple accounts → Show account picker
        ↓
Create session with selected account
        ↓
Redirect to dashboard
```

#### Account Switching (In-App)

```
User clicks account switcher in header
        ↓
Show dropdown/modal with all accounts
        ↓
User selects different account
        ↓
Update session with new current_account_id
        ↓
Reload dashboard data for new account
```

---

### 10.5 Backend Implementation

#### Auth Configuration (`src/auth.ts`)

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db/drizzle"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        accountId: { label: "Account ID", type: "text" }  // Optional on first login
      },
      async authorize(credentials) {
        const user = await getUserByEmail(credentials.email)
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          accountId: credentials.accountId || null
        }
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user, trigger, session }) => {
      if (user) {
        token.userId = user.id
        token.accountId = user.accountId
      }
      // Handle account switching
      if (trigger === "update" && session?.accountId) {
        token.accountId = session.accountId
      }
      return token
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.userId,
        accountId: token.accountId
      }
    })
  }
})
```

#### User Actions (`src/app/actions/auth.ts`)

- [ ] `registerUser()` - Create user + default trading account
- [ ] `loginUser()` - Authenticate and create session
- [ ] `logoutUser()` - Destroy session
- [ ] `getCurrentUser()` - Get authenticated user from session
- [ ] `getCurrentAccount()` - Get currently selected trading account
- [ ] `getUserAccounts()` - List all accounts for current user
- [ ] `switchAccount()` - Change current account in session

#### Account Actions (`src/app/actions/accounts.ts`)

- [ ] `createAccount()` - Create new trading account
- [ ] `updateAccount()` - Update account settings
- [ ] `deleteAccount()` - Delete account (with confirmation for trades)
- [ ] `getAccountAssets()` - Get enabled assets with fee overrides
- [ ] `updateAccountAsset()` - Enable/disable asset, set fee overrides
- [ ] `getAccountTimeframes()` - Get enabled timeframes
- [ ] `updateAccountTimeframe()` - Enable/disable timeframe

---

### 10.6 Frontend Implementation

#### Auth Pages

**Login Page** (`src/app/[locale]/(auth)/login/page.tsx`)

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                    ┌─────────────────────────┐                     │
│                    │      Profit Journal      │                     │
│                    │                          │                     │
│                    │  Email                   │                     │
│                    │  [____________________]  │                     │
│                    │                          │                     │
│                    │  Password                │                     │
│                    │  [____________________]  │                     │
│                    │                          │                     │
│                    │  [ ] Remember me         │                     │
│                    │                          │                     │
│                    │  [      Sign In      ]   │                     │
│                    │                          │                     │
│                    │  Don't have an account?  │                     │
│                    │  Register                │                     │
│                    └─────────────────────────┘                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Account Picker** (shown after login if multiple accounts)

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                    ┌─────────────────────────┐                     │
│                    │    Select Account        │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ ◉ Personal Account │  │                     │
│                    │  │   100% profit      │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ ○ Atom Prop        │  │                     │
│                    │  │   80% profit share │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ ○ Raise Prop       │  │                     │
│                    │  │   75% profit share │  │                     │
│                    │  └────────────────────┘  │                     │
│                    │                          │                     │
│                    │  [     Continue      ]   │                     │
│                    └─────────────────────────┘                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Account Switcher** (in header, always visible)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Profit Journal                          [Personal ▼]  [User Menu ▼]  │
├──────────────────────────────────────────────────────────────────────┤
│                                         ┌─────────────────────────┐  │
│                                         │ ✓ Personal Account      │  │
│                                         │   Atom Prop             │  │
│                                         │   Raise Prop            │  │
│                                         ├─────────────────────────┤  │
│                                         │ + New Account           │  │
│                                         │ ⚙ Manage Accounts       │  │
│                                         └─────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

#### Settings Reorganization

**User Settings** (applies to user, not account)
- Language preference
- Theme (dark/light)
- Date format
- Time format

**Account Settings** (per trading account)
- Account name and description
- Account type (Personal / Prop)
- Prop firm configuration
- Tax settings
- Risk parameters
- Enabled assets with fee overrides
- Enabled timeframes

---

### 10.7 Settings Page Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Settings                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [General] [Account] [Assets] [Timeframes] [Data]                   │
│  ═══════                                                            │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ User Preferences                                               │  │
│  │                                                                │  │
│  │ Language:     [Portuguese (Brazil) ▼]                          │  │
│  │ Theme:        [Dark ▼]                                         │  │
│  │ Date Format:  [DD/MM/YYYY ▼]                                   │  │
│  │                                                                │  │
│  │                            [Save Preferences]                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Settings                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [General] [Account] [Assets] [Timeframes] [Data]                   │
│           ═══════                                                   │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Trading Account: Personal Account                              │  │
│  │                                                                │  │
│  │ Account Name:    [Personal Account     ]                       │  │
│  │ Description:     [My main trading account]                     │  │
│  │                                                                │  │
│  │ ───────────────────────────────────────────────────────────── │  │
│  │                                                                │  │
│  │ Account Type:                                                  │  │
│  │ ◉ Personal (100% profit)                                       │  │
│  │ ○ Prop Trading Firm                                            │  │
│  │                                                                │  │
│  │ ───────────────────────────────────────────────────────────── │  │
│  │                                                                │  │
│  │ Tax Settings                                                   │  │
│  │ Day Trade Tax:    [20] %                                       │  │
│  │ Swing Trade Tax:  [15] %                                       │  │
│  │ ☑ Show tax estimates                                           │  │
│  │                                                                │  │
│  │ ───────────────────────────────────────────────────────────── │  │
│  │                                                                │  │
│  │ Risk Settings                                                  │  │
│  │ Default Risk/Trade: [1.0] %                                    │  │
│  │ Max Daily Loss:     [R$ 500.00]                                │  │
│  │ Max Daily Trades:   [10]                                       │  │
│  │                                                                │  │
│  │                            [Save Account Settings]             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Settings                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [General] [Account] [Assets] [Timeframes] [Data]                   │
│                      ══════                                         │
│                                                                      │
│  Assets for: Personal Account                                       │
│                                                                      │
│  Account Default Fees:                                              │
│  Commission: [R$ 0.30    ]    Fees: [R$ 0.05    ]                   │
│                                                                      │
│  ───────────────────────────────────────────────────────────────    │
│                                                                      │
│  Per-Asset Overrides (leave blank to use account default):          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Symbol  │ Name           │ Enabled │ Commission │ Fees     │    │
│  ├─────────┼────────────────┼─────────┼────────────┼──────────┤    │
│  │ WINFUT  │ Mini Índice    │   ☑     │ [       ]  │ [      ] │    │
│  │ WDOFUT  │ Mini Dólar     │   ☑     │ [R$ 0.50]  │ [R$0.10] │    │
│  │ PETR4   │ Petrobras PN   │   ☐     │ -          │ -        │    │
│  │ VALE3   │ Vale ON        │   ☐     │ -          │ -        │    │
│  │ ES      │ E-mini S&P 500 │   ☐     │ -          │ -        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Note: Asset definitions (tick size, tick value) are managed by     │
│  admins. You control which assets are enabled and their fees.       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 10.8 Middleware & Route Protection

**Middleware** (`src/middleware.ts`)

```typescript
import { auth } from "@/auth"
import createIntlMiddleware from "next-intl/middleware"

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "pt-BR"],
  defaultLocale: "pt-BR"
})

const publicPaths = ["/login", "/register"]

export default auth((req) => {
  const { pathname } = req.nextUrl

  const isPublicPath = publicPaths.some(path => pathname.includes(path))

  // Not authenticated and not on public path
  if (!req.auth && !isPublicPath) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return Response.redirect(loginUrl)
  }

  // Authenticated but no account selected (except on account-picker page)
  if (req.auth && !req.auth.user.accountId && !pathname.includes("/select-account")) {
    return Response.redirect(new URL("/select-account", req.url))
  }

  // Authenticated and on auth page
  if (req.auth && isPublicPath) {
    return Response.redirect(new URL("/", req.url))
  }

  return intlMiddleware(req)
})
```

---

### 10.9 Data Isolation

All server actions must filter by `account_id`:

```typescript
export const getTrades = async (filters: TradeFilters) => {
  const session = await auth()
  if (!session?.user?.accountId) {
    return { status: "error", error: "No account selected" }
  }

  const trades = await db.query.trades.findMany({
    where: and(
      eq(trades.accountId, session.user.accountId),
      // ... other filters
    )
  })

  return { status: "success", data: trades }
}
```

---

### 10.10 Implementation Order

1. **Schema & Migration** (Day 1-2)
   - [ ] Create `users`, `sessions`, `trading_accounts` tables
   - [ ] Create `account_assets`, `account_timeframes` tables
   - [ ] Add `account_id` to existing tables
   - [ ] Generate and run migration

2. **Auth Configuration** (Day 3)
   - [ ] Install dependencies
   - [ ] Configure Auth.js with Credentials provider
   - [ ] Set up JWT with account ID support
   - [ ] Session callbacks for account management

3. **User & Account Actions** (Day 4)
   - [ ] `registerUser()` with default account creation
   - [ ] `loginUser()` with session
   - [ ] `getUserAccounts()`, `switchAccount()`
   - [ ] Account CRUD operations

4. **Auth Pages** (Day 5)
   - [ ] Login page
   - [ ] Register page
   - [ ] Account picker page
   - [ ] Auth layout

5. **Account Switcher & Header** (Day 6)
   - [ ] Account switcher dropdown
   - [ ] User menu
   - [ ] Header updates

6. **Settings Restructure** (Day 7)
   - [ ] Separate user settings from account settings
   - [ ] Asset management per account
   - [ ] Timeframe management per account

7. **Data Isolation & Testing** (Day 8)
   - [ ] Update all server actions
   - [ ] Ownership validation
   - [ ] Cross-account protection testing

---

### 10.11 Files to Create/Modify

```
src/
├── auth.ts                           # NEW: Auth.js configuration
├── middleware.ts                     # UPDATE: Add auth + account middleware
├── db/
│   ├── schema.ts                     # UPDATE: Add auth + account tables
│   └── migrations/
│       └── 0005_xxx.sql              # NEW: Phase 10 migration
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts                  # NEW: Auth API route
│   └── [locale]/
│       ├── (auth)/
│       │   ├── layout.tsx            # NEW: Auth layout
│       │   ├── login/page.tsx        # NEW: Login page
│       │   ├── register/page.tsx     # NEW: Register page
│       │   └── select-account/page.tsx # NEW: Account picker
│       └── (protected)/
│           └── layout.tsx            # UPDATE: Protected layout
│       └── actions/
│           ├── auth.ts               # NEW: Auth actions
│           └── accounts.ts           # NEW: Account management
├── components/
│   ├── auth/
│   │   ├── index.ts                  # NEW: Barrel exports
│   │   ├── login-form.tsx            # NEW
│   │   ├── register-form.tsx         # NEW
│   │   └── account-picker.tsx        # NEW
│   └── layout/
│       ├── account-switcher.tsx      # NEW
│       └── user-menu.tsx             # NEW
├── lib/
│   └── validations/
│       └── auth.ts                   # NEW: Auth validation
└── messages/
    ├── en.json                       # UPDATE
    └── pt-BR.json                    # UPDATE
```

---

### 10.12 Translation Keys to Add

```json
{
  "auth": {
    "login": {
      "title": "Sign In",
      "subtitle": "Welcome back",
      "email": "Email",
      "password": "Password",
      "rememberMe": "Remember me",
      "submit": "Sign In",
      "noAccount": "Don't have an account?",
      "register": "Create account"
    },
    "register": {
      "title": "Create Account",
      "subtitle": "Start tracking your trading performance",
      "name": "Full Name",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "submit": "Create Account",
      "hasAccount": "Already have an account?",
      "login": "Sign in"
    },
    "selectAccount": {
      "title": "Select Account",
      "subtitle": "Choose which account to work with",
      "continue": "Continue",
      "profitShare": "{percentage}% profit share"
    },
    "accountSwitcher": {
      "currentAccount": "Current Account",
      "switchAccount": "Switch Account",
      "newAccount": "New Account",
      "manageAccounts": "Manage Accounts"
    }
  },
  "settings": {
    "user": {
      "title": "User Preferences",
      "language": "Language",
      "theme": "Theme",
      "dateFormat": "Date Format"
    },
    "account": {
      "title": "Trading Account",
      "name": "Account Name",
      "description": "Description",
      "type": "Account Type",
      "personal": "Personal (100% profit)",
      "prop": "Prop Trading Firm",
      "propFirmName": "Firm Name",
      "profitShare": "Profit Share Percentage"
    },
    "accountAssets": {
      "title": "Account Assets",
      "description": "Enable or disable assets and customize fees for this account",
      "defaultFees": "Account Default Fees",
      "perAssetOverrides": "Per-Asset Overrides",
      "leaveBlank": "Leave blank to use account default",
      "enabled": "Enabled",
      "commission": "Commission",
      "fees": "Fees",
      "useDefault": "Use default"
    }
  }
}
```

---

### 10.13 Dependencies

```bash
pnpm add next-auth@beta bcryptjs @auth/drizzle-adapter
pnpm add -D @types/bcryptjs
```

---

### Deliverables

- [ ] `users` table with general settings
- [ ] `trading_accounts` table with risk, prop settings, and default commission/fees
- [ ] `account_assets` table with per-asset fee overrides
- [ ] `account_timeframes` table for enabling/disabling timeframes
- [ ] Remove commission/fees from global `assets` table (admin only manages tick size, tick value, etc.)
- [ ] Auth.js configuration with account support
- [ ] User registration with default account
- [ ] Login with account selection
- [ ] Account switcher in header
- [ ] Settings reorganization (user vs account)
- [ ] Commission/fees calculated at trade creation (snapshot values)
- [ ] Fee priority: per-asset override → account default
- [ ] Per-account timeframe configuration
- [ ] Data isolation by account_id
- [ ] Full i18n support (pt-BR, en)

---

## Phase 10.5: Scaled Position UX Improvements ✅ COMPLETE

**Goal:** Enable scaled positions (multiple entries/exits) from trade creation instead of requiring conversion, and add CSV import support for scaled trades.

---

### 10.5.1 Problem Statement

Current Phase 9 implementation requires:
1. Create a simple trade first
2. Convert to scaled mode from trade detail page
3. Then add additional executions

This is friction for traders who know upfront they have a scaled position. They should be able to:
1. Create a scaled trade directly with multiple entries/exits from the start
2. Import scaled trades from CSV with multiple executions per trade

---

### 10.5.2 Updated Trade Form UX

#### Trade Mode Selection at Creation

Instead of defaulting to simple mode, allow users to choose upfront:

```
┌─────────────────────────────────────────────────────────────────────┐
│ New Trade                                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Trade Mode:                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────────┐           │
│  │ ◉ Simple Trade          │  │ ○ Scaled Position       │           │
│  │   Single entry & exit   │  │   Multiple entries/exits │           │
│  └─────────────────────────┘  └─────────────────────────┘           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Simple Mode (Current Behavior)

Standard form with single entry price, exit price, and position size.

#### Scaled Mode Form

When scaled mode is selected, show execution-based form:

```
┌─────────────────────────────────────────────────────────────────────┐
│ New Trade - Scaled Position                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Basic Info                                                          │
│  ─────────────────────────────────────────────────────────────────  │
│  Asset:     [WINFUT ▼]          Direction:  ◉ Long  ○ Short         │
│  Strategy:  [Select strategy ▼]  Timeframe:  [15 min ▼]             │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Entries                                                    [+ Add]  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ #  │ Date/Time          │ Price    │ Quantity │ Commission │ × │  │
│  ├────┼────────────────────┼──────────┼──────────┼────────────┼───┤  │
│  │ 1  │ Jan 15, 10:30      │ 128,000  │ 2        │ R$ 0.40    │ × │  │
│  │ 2  │ Jan 15, 11:15      │ 128,100  │ 2        │ R$ 0.40    │ × │  │
│  │ 3  │ Jan 15, 14:00      │ 128,200  │ 1        │ R$ 0.20    │ × │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  Total: 5 contracts @ Avg 128,080                                    │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Exits                                                      [+ Add]  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ #  │ Date/Time          │ Price    │ Quantity │ Commission │ × │  │
│  ├────┼────────────────────┼──────────┼──────────┼────────────┼───┤  │
│  │ 1  │ Jan 15, 15:30      │ 128,500  │ 3        │ R$ 0.60    │ × │  │
│  │ 2  │ Jan 15, 16:00      │ 128,300  │ 2        │ R$ 0.40    │ × │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  Total: 5 contracts @ Avg 128,420                                    │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Position Summary                                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Status: CLOSED    │  Entries: 5  │  Exits: 5                  │  │
│  │  Avg Entry: 128,080  →  Avg Exit: 128,420  =  +340 pts         │  │
│  │  Gross P&L: +R$ 340.00  │  Fees: R$ 2.00  │  Net P&L: +R$ 338  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Risk Management                                                     │
│  Stop Loss: [128,000]    Take Profit: [128,500]                     │
│  Risk Amount: [R$ 200.00]                                           │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Notes                                                               │
│  [Pre-trade thoughts...                                         ]   │
│                                                                      │
│                                        [Cancel]  [Create Trade]      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Inline Execution Editor

Instead of a modal for each execution, use inline editing for faster entry:

```
┌───────────────────────────────────────────────────────────────┐
│ Entries                                                [+ Add] │
├───────────────────────────────────────────────────────────────┤
│ │ Date/Time          │ Price    │ Qty │ Comm.   │            │
│ │ [Jan 15, 10:30 ▼]  │ [128000] │ [2] │ [0.40]  │  [×]       │
│ │ [Jan 15, 11:15 ▼]  │ [128100] │ [2] │ [0.40]  │  [×]       │
│ │ [             ▼]   │ [      ] │ [ ] │ [    ]  │  [×]  ← new│
└───────────────────────────────────────────────────────────────┘
```

---

### 10.5.3 CSV Import for Scaled Positions

#### New CSV Format: Grouped Executions

Support importing trades where multiple rows represent the same position:

```csv
# Option 1: Trade ID column to group executions
trade_group,execution_type,asset,direction,date,time,price,quantity,commission
T001,entry,WINFUT,long,2025-01-15,10:30,128000,2,0.40
T001,entry,WINFUT,long,2025-01-15,11:15,128100,2,0.40
T001,entry,WINFUT,long,2025-01-15,14:00,128200,1,0.20
T001,exit,WINFUT,long,2025-01-15,15:30,128500,3,0.60
T001,exit,WINFUT,long,2025-01-15,16:00,128300,2,0.40
T002,entry,WDOFUT,short,2025-01-16,09:00,5045,1,0.50
T002,exit,WDOFUT,short,2025-01-16,11:00,5020,1,0.50
```

#### Alternative: Pipe-Separated Multiple Values

For simpler CSV structure, allow multiple values in single cells:

```csv
# Option 2: Multiple values in single row
asset,direction,entry_dates,entry_prices,entry_quantities,exit_dates,exit_prices,exit_quantities
WINFUT,long,"10:30|11:15|14:00","128000|128100|128200","2|2|1","15:30|16:00","128500|128300","3|2"
WDOFUT,short,"09:00","5045","1","11:00","5020","1"
```

#### CSV Import UI Enhancement

```
┌─────────────────────────────────────────────────────────────────────┐
│ Import Trades                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Import Format:                                                      │
│  ○ Simple (one row per trade)                                       │
│  ◉ Scaled (multiple rows per trade, grouped by trade_group column)  │
│  ○ Broker Export (auto-detect format)                               │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Grouping Column: [trade_group ▼]                                   │
│  (Used to identify which rows belong to the same trade)             │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Preview:                                                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Trade T001: WINFUT LONG                                       │  │
│  │   3 entries (5 contracts) → 2 exits (5 contracts)             │  │
│  │   Avg Entry: 128,080 → Avg Exit: 128,420                      │  │
│  │   P&L: +R$ 340.00                                             │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │ Trade T002: WDOFUT SHORT                                      │  │
│  │   1 entry (1 contract) → 1 exit (1 contract)                  │  │
│  │   Entry: 5,045 → Exit: 5,020                                  │  │
│  │   P&L: +R$ 250.00                                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Found: 2 trades (7 executions total)                               │
│                                                                      │
│                                    [Cancel]  [Import 2 Trades]       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 10.5.4 Broker Integration Patterns

#### Common Broker Export Formats

Support auto-detection for common formats:

**TradeZella Format:**
```csv
Symbol,Side,Entry Date,Entry Time,Entry Price,Exit Date,Exit Time,Exit Price,Quantity,P&L
US30,Short,2025-02-03,21:48:55,43905.35,2025-02-04,03:19:27,44049.35,0.02,-288.14
```

**TradingView Format:**
```csv
Trade #,Symbol,Type,Entry Date,Entry Price,Exit Date,Exit Price,Quantity,Profit
1,BTCUSD,Long,2025-01-15 10:30,42000,2025-01-15 14:30,42500,0.1,50
```

**NinjaTrader Format:**
```csv
Instrument,Market pos.,Qty,Entry price,Exit price,Entry time,Exit time,Profit
ES 03-25,Long,1,5100.00,5125.00,1/15/2025 9:30:00 AM,1/15/2025 10:45:00 AM,625.00
```

#### Auto-Detection Logic

```typescript
interface BrokerFormat {
  name: string
  detectPattern: (headers: string[]) => boolean
  parseRow: (row: Record<string, string>) => ParsedExecution[]
  supportsScaling: boolean
}

const BROKER_FORMATS: BrokerFormat[] = [
  {
    name: 'TradeZella',
    detectPattern: (h) => h.includes('Symbol') && h.includes('Side') && h.includes('P&L'),
    parseRow: (row) => [/* ... */],
    supportsScaling: false  // Single row per trade
  },
  {
    name: 'Generic Scaled',
    detectPattern: (h) => h.includes('trade_group') && h.includes('execution_type'),
    parseRow: (row) => [/* ... */],
    supportsScaling: true  // Multiple rows per trade
  },
  // ... more formats
]
```

---

### 10.5.5 Backend Updates

#### Updated `createTrade()` Action

```typescript
interface CreateTradeInput {
  // ... existing fields ...

  // New: Optional executions array for scaled trades
  executions?: Array<{
    executionType: 'entry' | 'exit'
    executionDate: Date
    price: number
    quantity: number
    commission?: number
    fees?: number
    notes?: string
  }>
}

export const createTrade = async (input: CreateTradeInput) => {
  // If executions provided, create as scaled trade
  if (input.executions && input.executions.length > 0) {
    return createScaledTrade(input)
  }

  // Otherwise, create simple trade (current behavior)
  return createSimpleTrade(input)
}

const createScaledTrade = async (input: CreateTradeInput) => {
  // 1. Create trade record with execution_mode = 'scaled'
  // 2. Create all execution records
  // 3. Calculate and store aggregates (avg entry, avg exit, P&L)
  // 4. Return trade with executions
}
```

#### New `importScaledTrades()` Action

```typescript
interface ScaledTradeImport {
  groupId: string           // Identifier to group rows
  executions: Array<{
    type: 'entry' | 'exit'
    date: Date
    price: number
    quantity: number
    commission?: number
  }>
  asset: string
  direction: 'long' | 'short'
  // Optional metadata
  strategyId?: string
  notes?: string
}

export const importScaledTrades = async (
  trades: ScaledTradeImport[]
): Promise<ImportResult> => {
  const results: ImportResult = {
    success: 0,
    failed: 0,
    errors: []
  }

  for (const trade of trades) {
    try {
      await createTrade({
        asset: trade.asset,
        direction: trade.direction,
        executions: trade.executions.map(e => ({
          executionType: e.type,
          executionDate: e.date,
          price: e.price,
          quantity: e.quantity,
          commission: e.commission
        })),
        strategyId: trade.strategyId,
        preTradeThoughts: trade.notes
      })
      results.success++
    } catch (error) {
      results.failed++
      results.errors.push({
        groupId: trade.groupId,
        error: error.message
      })
    }
  }

  return results
}
```

---

### 10.5.6 Frontend Components

#### New/Updated Components

- [ ] `trade-mode-selector.tsx` - Toggle between Simple and Scaled mode
- [ ] `scaled-trade-form.tsx` - Full form for scaled position creation
- [ ] `inline-execution-editor.tsx` - Inline row editor for executions
- [ ] `csv-import-scaled.tsx` - Enhanced CSV import with scaling support
- [ ] `csv-format-selector.tsx` - Format selection and preview
- [ ] `import-preview-card.tsx` - Preview grouped trades before import

#### Updated Trade Form Flow

```typescript
// trade-form.tsx
const TradeForm = () => {
  const [tradeMode, setTradeMode] = useState<'simple' | 'scaled'>('simple')

  return (
    <div>
      <TradeModeSelector
        value={tradeMode}
        onChange={setTradeMode}
      />

      {tradeMode === 'simple' ? (
        <SimpleTradeForm />
      ) : (
        <ScaledTradeForm />
      )}
    </div>
  )
}
```

---

### 10.5.7 Implementation Order

1. **Backend: Create with Executions** (Day 1)
   - [ ] Update `createTrade()` to accept executions array
   - [ ] Implement `createScaledTrade()` helper
   - [ ] Update validation schemas

2. **Scaled Trade Form** (Day 2-3)
   - [ ] `TradeModeSelector` component
   - [ ] `ScaledTradeForm` with inline execution editors
   - [ ] Real-time P&L calculation as executions are added
   - [ ] Position summary component

3. **CSV Import Enhancement** (Day 4-5)
   - [ ] Add `trade_group` column support
   - [ ] Implement row grouping logic
   - [ ] Preview component for grouped trades
   - [ ] `importScaledTrades()` action

4. **Broker Format Detection** (Day 6)
   - [ ] Auto-detect common broker formats
   - [ ] Format-specific parsers
   - [ ] Format selection UI

5. **Testing & Polish** (Day 7)
   - [ ] Test various CSV formats
   - [ ] Edge cases (partial positions, mismatched quantities)
   - [ ] Error handling and validation messages
   - [ ] Translations (pt-BR, en)

---

### 10.5.8 Files to Create/Modify

```
src/
├── app/
│   └── actions/
│       ├── trades.ts                    # UPDATE: Accept executions in createTrade
│       └── import.ts                    # UPDATE: Add importScaledTrades
├── components/
│   └── journal/
│       ├── trade-form.tsx               # UPDATE: Add mode selector
│       ├── trade-mode-selector.tsx      # NEW: Simple/Scaled toggle
│       ├── scaled-trade-form.tsx        # NEW: Full scaled form
│       ├── inline-execution-editor.tsx  # NEW: Inline row editor
│       └── execution-list-editable.tsx  # NEW: Editable execution list
├── components/
│   └── settings/
│       ├── csv-import-dialog.tsx        # UPDATE: Add scaled import
│       ├── csv-format-selector.tsx      # NEW: Format selection
│       └── import-preview-scaled.tsx    # NEW: Grouped trade preview
├── lib/
│   ├── csv-parsers/
│   │   ├── index.ts                     # NEW: Parser exports
│   │   ├── generic-scaled.ts            # NEW: Generic scaled format
│   │   ├── tradezella.ts                # NEW: TradeZella format
│   │   └── auto-detect.ts               # NEW: Format detection
│   └── validations/
│       └── trade.ts                     # UPDATE: Add executions validation
└── messages/
    ├── en.json                          # UPDATE: Add new translations
    └── pt-BR.json                       # UPDATE: Add new translations
```

---

### 10.5.9 Translation Keys to Add

```json
{
  "trade": {
    "mode": {
      "label": "Trade Mode",
      "simple": "Simple Trade",
      "simpleDescription": "Single entry & exit",
      "scaled": "Scaled Position",
      "scaledDescription": "Multiple entries/exits"
    },
    "scaledForm": {
      "entries": "Entries",
      "exits": "Exits",
      "addEntry": "Add Entry",
      "addExit": "Add Exit",
      "totalContracts": "Total: {count} contracts",
      "avgPrice": "Avg: {price}",
      "positionSummary": "Position Summary",
      "status": "Status",
      "entriesCount": "Entries",
      "exitsCount": "Exits",
      "grossPnl": "Gross P&L",
      "netPnl": "Net P&L"
    }
  },
  "import": {
    "format": {
      "label": "Import Format",
      "simple": "Simple (one row per trade)",
      "scaled": "Scaled (multiple rows per trade)",
      "broker": "Broker Export (auto-detect)"
    },
    "grouping": {
      "label": "Grouping Column",
      "description": "Column used to identify which rows belong to the same trade"
    },
    "preview": {
      "title": "Preview",
      "trade": "Trade {id}",
      "entries": "{count} entries ({contracts} contracts)",
      "exits": "{count} exits ({contracts} contracts)",
      "pnl": "P&L",
      "found": "Found: {trades} trades ({executions} executions total)"
    },
    "scaledImport": "Import {count} Trades"
  }
}
```

---

### Deliverables

- [ ] Trade mode selector (Simple/Scaled) at creation
- [ ] Scaled trade form with inline execution editors
- [ ] Real-time P&L calculation during scaled trade creation
- [ ] Position summary in scaled form (status, totals, P&L)
- [ ] CSV import with `trade_group` column support
- [ ] Row grouping logic for scaled imports
- [ ] Import preview showing grouped trades
- [ ] Auto-detection for common broker formats
- [ ] `createTrade()` accepting executions array
- [ ] `importScaledTrades()` action
- [ ] Full i18n support (pt-BR, en)
- [ ] Documentation for CSV formats

---

## Phase 11: Advanced Reports & Dashboard Visualizations ✅ COMPLETE

**Goal:** Enhance reports with time-based performance analysis (hour of day, day of week) and add new interactive dashboard visualizations with drill-down capabilities.

---

### 11.1 Problem Statement

Traders need deeper insights into their performance patterns:

1. **Time-Based Analysis** - Understanding which times of day and days of the week are most/least profitable
   - "Am I better in the morning session or afternoon?"
   - "Do I consistently lose money on Fridays?"

2. **Enhanced Dashboard Visualizations** - More comprehensive visual overview
   - Current dashboard shows calendar and equity curve
   - Missing: multi-metric radar chart, daily P&L bars, cumulative equity line

3. **Day Drill-Down** - Clicking on a day in the calendar should reveal detailed information
   - Day summary (P&L, win rate, trade count)
   - Mini equity curve for that day
   - List of individual trades with navigation

---

### 11.2 Time-Based Performance Analysis

#### Hour of Day Analysis

Track performance across trading hours to identify optimal trading windows.

```typescript
interface HourlyPerformance {
  hour: number                    // 0-23 (UTC or local)
  totalTrades: number
  wins: number
  losses: number
  breakevens: number
  winRate: number                 // percentage
  totalPnl: number                // in cents
  avgPnl: number                  // average P&L per trade
  avgR: number                    // average R-multiple
  profitFactor: number
}

// Example output:
// Hour 10: 45 trades, 62% win rate, +R$2,340, avg 1.2R
// Hour 14: 23 trades, 43% win rate, -R$890, avg -0.4R
```

#### Day of Week Analysis

Track performance by weekday to identify patterns.

```typescript
interface DayOfWeekPerformance {
  dayOfWeek: number               // 0 = Sunday, 6 = Saturday
  dayName: string                 // "Monday", "Tuesday", etc.
  totalTrades: number
  wins: number
  losses: number
  breakevens: number
  winRate: number
  totalPnl: number
  avgPnl: number
  avgR: number
  profitFactor: number
  bestHour?: number               // Best performing hour on this day
  worstHour?: number              // Worst performing hour on this day
}
```

---

### 11.3 Backend Tasks

#### New Analytics Functions (`src/app/actions/analytics.ts`)

- [ ] `getHourlyPerformance()` - Performance breakdown by hour of day
- [ ] `getDayOfWeekPerformance()` - Performance breakdown by day of week
- [ ] `getTimeHeatmap()` - Combined hour × day performance matrix
- [ ] `getDailyEquityCurve()` - Cumulative P&L by day (for line chart)
- [ ] `getDailyPnLBars()` - Individual day P&L (for bar chart)

#### Day Detail Functions (`src/app/actions/reports.ts`)

- [ ] `getDaySummary(date)` - Summary stats for a specific day
- [ ] `getDayEquityCurve(date)` - Intraday equity curve
- [ ] `getDayTrades(date)` - List of trades for the day

---

### 11.4 New Dashboard Visualizations

#### 11.4.1 Performance Radar Chart

Multi-metric radar/spider chart showing normalized performance across key dimensions.

```
                    Win Rate
                       ●
                      /|\
                     / | \
                    /  |  \
     Avg R ●-------●--●--●-------● Profit Factor
                    \  |  /
                     \ | /
                      \|/
                       ●
                   Discipline
```

**Metrics displayed:**
- Win Rate (0-100%)
- Average R-Multiple (normalized)
- Profit Factor (capped at 3.0 for visualization)
- Discipline Score (% following plan)
- Consistency (inverse of P&L standard deviation)

```typescript
interface RadarChartData {
  metric: string
  value: number          // Actual value
  normalized: number     // 0-100 for chart display
  benchmark?: number     // Optional comparison (e.g., last month)
}
```

#### 11.4.2 Net Daily P&L Bar Chart

Daily profit/loss shown as vertical bars with positive (green) and negative (red) values.

```
     +$500 |     ██
     +$400 |     ██         ██
     +$300 | ██  ██         ██
     +$200 | ██  ██     ██  ██
     +$100 | ██  ██     ██  ██      ██
        $0 |─██──██──██─██──██──██──██──
    -$100 |         ██          ██
    -$200 |         ██          ██
           Mon Tue Wed Thu Fri Mon Tue
```

```typescript
interface DailyPnLBar {
  date: string            // ISO date
  pnl: number             // in cents (positive or negative)
  tradeCount: number
  isCurrentDay: boolean
}
```

#### 11.4.3 Cumulative P&L Line Chart

Running total P&L over time showing equity growth trajectory.

```
     ↑
     │                         ●───●
     │                    ●───●
     │               ●───●
     │          ●───●
     │     ●───●
     │●───●
     └─────────────────────────────→
      Jan    Feb    Mar    Apr    May
```

```typescript
interface CumulativePnLPoint {
  date: string
  cumulativePnl: number
  dailyPnl: number
  drawdown?: number       // Current drawdown from peak
}
```

---

### 11.5 Day Click Modal

When user clicks on a day in the calendar or bar chart, show a modal with detailed day information.

```
┌─────────────────────────────────────────────────────────────────────┐
│ January 15, 2025 (Wednesday)                                    [×] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Net P&L    │  │ Gross P&L  │  │ Win Rate   │  │ Trades     │    │
│  │ +R$ 450.00 │  │ +R$ 520.00 │  │ 75%        │  │ 8          │    │
│  │ ▲ +12%     │  │ Fees: R$70 │  │ 6W 2L      │  │ Avg: 1.4R  │    │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Equity Curve (Intraday)                                        │  │
│  │         ●                                                      │  │
│  │    ●───●  ●───●                                               │  │
│  │ ●───●        ●───●───●                                        │  │
│  │ 09:00   10:00   11:00   14:00   15:00   16:00                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Trades                                                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Time   │ Asset  │ Dir │ Entry   │ Exit    │ P&L     │ R      │  │
│  ├────────┼────────┼─────┼─────────┼─────────┼─────────┼────────┤  │
│  │ 09:15  │ WINFUT │ L   │ 128,000 │ 128,150 │ +R$60   │ +1.5R →│  │
│  │ 09:45  │ WINFUT │ S   │ 128,200 │ 128,050 │ +R$60   │ +1.5R →│  │
│  │ 10:30  │ WDOFUT │ L   │ 5,045   │ 5,038   │ -R$70   │ -0.8R →│  │
│  │ 11:00  │ WINFUT │ L   │ 128,100 │ 128,250 │ +R$60   │ +1.5R →│  │
│  │ 14:15  │ WINFUT │ L   │ 128,300 │ 128,500 │ +R$80   │ +2.0R →│  │
│  │ 14:45  │ WINFUT │ S   │ 128,450 │ 128,350 │ +R$40   │ +1.0R →│  │
│  │ 15:30  │ WDOFUT │ L   │ 5,052   │ 5,040   │ -R$120  │ -1.4R →│  │
│  │ 16:00  │ WINFUT │ L   │ 128,200 │ 128,450 │ +R$100  │ +2.5R →│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Click on a trade row to view full trade details                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Day Modal Components

**DaySummaryStats** - Top row of KPIs for the day
```typescript
interface DaySummaryStatsProps {
  date: Date
  netPnl: number
  grossPnl: number
  fees: number
  winRate: number
  wins: number
  losses: number
  totalTrades: number
  avgR: number
  previousDayPnl?: number     // For comparison
}
```

**DayEquityCurve** - Intraday mini equity chart
```typescript
interface DayEquityCurveProps {
  date: Date
  dataPoints: Array<{
    time: string              // HH:mm format
    cumulativePnl: number
    tradeId?: string          // Link to trade that caused this change
  }>
}
```

**DayTradesList** - Compact table of day's trades
```typescript
interface DayTradesListProps {
  trades: Array<{
    id: string
    time: string
    asset: string
    direction: 'long' | 'short'
    entryPrice: number
    exitPrice: number
    pnl: number
    rMultiple: number
  }>
  onTradeClick: (tradeId: string) => void
}
```

---

### 11.6 Frontend Components

#### New Components (`src/components/dashboard/`)

- [ ] `performance-radar-chart.tsx` - Multi-metric radar visualization
- [ ] `daily-pnl-bar-chart.tsx` - Daily P&L bars with click handler
- [ ] `cumulative-pnl-chart.tsx` - Line chart showing equity growth
- [ ] `day-detail-modal.tsx` - Modal wrapper for day drill-down
- [ ] `day-summary-stats.tsx` - KPI cards for selected day
- [ ] `day-equity-curve.tsx` - Intraday equity visualization
- [ ] `day-trades-list.tsx` - Compact trade table with links

#### New Components (`src/components/analytics/`)

- [ ] `hourly-performance-chart.tsx` - Hour of day analysis
- [ ] `day-of-week-chart.tsx` - Day of week analysis
- [ ] `time-heatmap.tsx` - Hour × Day performance heatmap

---

### 11.7 Dashboard Layout Update

Updated dashboard with new chart sections:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Dashboard                                            [Personal ▼] [⚙]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │Net P&L │ │Gross   │ │Win Rate│ │Profit  │ │Avg R   │ │Discipl.│    │
│  │+R$5.4K │ │+R$6.1K │ │  68%   │ │  2.1   │ │ +1.2R  │ │  85%   │    │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
│                                                                          │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐│
│  │ Calendar (click days)           │ │ Quick Stats                     ││
│  │ ┌─┬─┬─┬─┬─┬─┬─┐                │ │ Current Streak: 4W              ││
│  │ │S│M│T│W│T│F│S│                │ │ Best Day: +R$1.2K (Jan 10)      ││
│  │ ├─┼─┼─┼─┼─┼─┼─┤                │ │ Worst Day: -R$450 (Jan 8)       ││
│  │ │ │ │ │●│●│●│ │                │ │ Total Trades: 156               ││
│  │ │●│●│○│●│●│ │ │                │ │ ─────────────────────────       ││
│  │ │ │●│●│●│○│ │ │                │ │ Longest Win: 8                  ││
│  │ └─┴─┴─┴─┴─┴─┴─┘                │ │ Longest Loss: 3                 ││
│  └─────────────────────────────────┘ └─────────────────────────────────┘│
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Daily Net P&L                                                      │  │
│  │      ██                                                            │  │
│  │  ██  ██      ██  ██              ██                                │  │
│  │  ██  ██  ██  ██  ██  ██  ██      ██  ██      ██                    │  │
│  │──██──██──██──██──██──██──██──██──██──██──██──██──                  │  │
│  │          ▓▓          ▓▓  ▓▓      ▓▓      ▓▓                        │  │
│  │  1   5   10  15  20  25  30                                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐│
│  │ Cumulative P&L                  │ │ Performance Radar               ││
│  │                          ●──●   │ │       Win Rate                  ││
│  │                     ●───●       │ │          ●                      ││
│  │                ●───●            │ │    ●────●────●                  ││
│  │           ●───●                 │ │   /          \                  ││
│  │      ●───●                      │ │ ●──────●──────● Profit Factor  ││
│  │ ●───●                           │ │   \          /                  ││
│  │ Jan  Feb  Mar  Apr  May         │ │    ●────●────●                  ││
│  │                                 │ │       Avg R                     ││
│  └─────────────────────────────────┘ └─────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 11.8 Analytics Page Enhancement

Add new time-based analysis section to Analytics page:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Analytics                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Overview] [By Asset] [By Strategy] [By Time] [R-Distribution]         │
│                                     ═══════                              │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Performance by Hour of Day                                         │  │
│  │                                                                    │  │
│  │  +R$500 |          ██                                              │  │
│  │  +R$300 |    ██    ██  ██                                          │  │
│  │  +R$100 |    ██    ██  ██  ██                                      │  │
│  │      $0 |────██────██──██──██──██──██──██──██──                    │  │
│  │  -R$100 |                      ▓▓  ▓▓          ▓▓                  │  │
│  │  -R$300 |                              ▓▓                          │  │
│  │         09  10  11  12  13  14  15  16  17                         │  │
│  │                                                                    │  │
│  │  Best Hour: 10:00 (62% WR, +R$1,230 total, 45 trades)             │  │
│  │  Worst Hour: 14:00 (38% WR, -R$890 total, 23 trades)              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Performance by Day of Week                                         │  │
│  │                                                                    │  │
│  │         Mon     Tue     Wed     Thu     Fri                        │  │
│  │  P&L   +R$1.2K +R$890  +R$450  +R$620  -R$340                     │  │
│  │  WR    68%     72%     58%     65%     42%                        │  │
│  │  Trades 32     28      25      30      22                          │  │
│  │  Avg R  +1.4R  +1.6R   +0.8R   +1.2R   -0.4R                      │  │
│  │                                                                    │  │
│  │  Best Day: Tuesday (72% WR, 1.6R avg)                             │  │
│  │  Worst Day: Friday (42% WR, -0.4R avg)                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Time Heatmap (Hour × Day)                                          │  │
│  │                                                                    │  │
│  │        09   10   11   12   13   14   15   16   17                 │  │
│  │  Mon   ██   ██   ██   --   --   ░░   ░░   ██   ░░                 │  │
│  │  Tue   ██   ██   ██   --   --   ██   ░░   ░░   ░░                 │  │
│  │  Wed   ░░   ██   ░░   --   --   ░░   ░░   ██   ░░                 │  │
│  │  Thu   ██   ██   ██   --   --   ██   ██   ░░   ░░                 │  │
│  │  Fri   ░░   ░░   ░░   --   --   ░░   ░░   ░░   ░░                 │  │
│  │                                                                    │  │
│  │  ██ = Profitable   ░░ = Losing   -- = No trades (lunch)           │  │
│  │                                                                    │  │
│  │  Best Slot: Tuesday 10:00-11:00 (85% WR, +R$680)                  │  │
│  │  Worst Slot: Friday 14:00-15:00 (25% WR, -R$420)                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 11.9 Implementation Order

1. **Backend Time Analysis** (Day 1-2)
   - [ ] `getHourlyPerformance()` - Hour of day analytics
   - [ ] `getDayOfWeekPerformance()` - Day of week analytics
   - [ ] `getTimeHeatmap()` - Combined hour × day matrix
   - [ ] Update schema if needed for time zone handling

2. **Backend Day Detail** (Day 2)
   - [ ] `getDaySummary()` - Day summary stats
   - [ ] `getDayEquityCurve()` - Intraday points
   - [ ] `getDayTrades()` - Trades list for day

3. **Dashboard Charts** (Day 3-4)
   - [ ] `daily-pnl-bar-chart.tsx` with click handlers
   - [ ] `cumulative-pnl-chart.tsx` line chart
   - [ ] `performance-radar-chart.tsx` multi-metric radar
   - [ ] Update dashboard layout

4. **Day Detail Modal** (Day 5)
   - [ ] `day-detail-modal.tsx` container
   - [ ] `day-summary-stats.tsx` KPI cards
   - [ ] `day-equity-curve.tsx` intraday chart
   - [ ] `day-trades-list.tsx` with navigation

5. **Analytics Time Section** (Day 6)
   - [ ] `hourly-performance-chart.tsx`
   - [ ] `day-of-week-chart.tsx`
   - [ ] `time-heatmap.tsx`
   - [ ] Add "By Time" tab to analytics page

6. **Polish & Translations** (Day 7)
   - [ ] Full i18n support (pt-BR and en)
   - [ ] Responsive design for all new components
   - [ ] Loading states and empty states
   - [ ] Tooltips and accessibility

---

### 11.10 Files to Create/Modify

```
src/
├── app/
│   ├── [locale]/
│   │   └── analytics/page.tsx          # UPDATE: Add "By Time" tab
│   └── actions/
│       ├── analytics.ts                # UPDATE: Add time-based functions
│       └── reports.ts                  # UPDATE: Add day detail functions
├── components/
│   ├── dashboard/
│   │   ├── index.ts                    # UPDATE: Export new components
│   │   ├── dashboard-content.tsx       # UPDATE: New layout with charts
│   │   ├── daily-pnl-bar-chart.tsx     # NEW: Daily P&L bars
│   │   ├── cumulative-pnl-chart.tsx    # NEW: Equity line chart
│   │   ├── performance-radar-chart.tsx # NEW: Multi-metric radar
│   │   ├── day-detail-modal.tsx        # NEW: Day drill-down modal
│   │   ├── day-summary-stats.tsx       # NEW: Day KPI cards
│   │   ├── day-equity-curve.tsx        # NEW: Intraday equity
│   │   └── day-trades-list.tsx         # NEW: Day trades table
│   └── analytics/
│       ├── index.ts                    # UPDATE: Export new components
│       ├── hourly-performance-chart.tsx  # NEW
│       ├── day-of-week-chart.tsx         # NEW
│       └── time-heatmap.tsx              # NEW
├── types/
│   └── index.ts                        # UPDATE: Add new types
└── messages/
    ├── en.json                         # UPDATE: Add translations
    └── pt-BR.json                      # UPDATE: Add translations
```

---

### 11.11 Translation Keys to Add

```json
{
  "dashboard": {
    "charts": {
      "dailyPnl": {
        "title": "Daily Net P&L",
        "noData": "No trades in this period"
      },
      "cumulativePnl": {
        "title": "Cumulative P&L",
        "drawdown": "Current Drawdown"
      },
      "performanceRadar": {
        "title": "Performance Overview",
        "winRate": "Win Rate",
        "avgR": "Avg R",
        "profitFactor": "Profit Factor",
        "discipline": "Discipline",
        "consistency": "Consistency"
      }
    },
    "dayModal": {
      "title": "{date}",
      "netPnl": "Net P&L",
      "grossPnl": "Gross P&L",
      "fees": "Fees",
      "winRate": "Win Rate",
      "wins": "Wins",
      "losses": "Losses",
      "trades": "Trades",
      "avgR": "Avg R",
      "intradayEquity": "Intraday Equity",
      "tradesList": "Trades",
      "time": "Time",
      "asset": "Asset",
      "direction": "Dir",
      "entry": "Entry",
      "exit": "Exit",
      "pnl": "P&L",
      "rMultiple": "R",
      "viewTrade": "View trade details",
      "noTrades": "No trades on this day"
    }
  },
  "analytics": {
    "byTime": {
      "title": "Performance by Time",
      "hourOfDay": {
        "title": "Hour of Day",
        "bestHour": "Best Hour",
        "worstHour": "Worst Hour",
        "totalTrades": "{count} trades"
      },
      "dayOfWeek": {
        "title": "Day of Week",
        "bestDay": "Best Day",
        "worstDay": "Worst Day",
        "monday": "Monday",
        "tuesday": "Tuesday",
        "wednesday": "Wednesday",
        "thursday": "Thursday",
        "friday": "Friday",
        "saturday": "Saturday",
        "sunday": "Sunday"
      },
      "heatmap": {
        "title": "Time Heatmap",
        "profitable": "Profitable",
        "losing": "Losing",
        "noTrades": "No trades",
        "bestSlot": "Best Time Slot",
        "worstSlot": "Worst Time Slot"
      }
    }
  }
}
```

---

### 11.12 Enhanced Trade Detail Page

Based on professional trading journal platforms, enhance the trade detail page with comprehensive stats and new features.

#### Enhanced Stats Panel

Display more detailed trade information in a structured layout:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Trade Detail: WINFUT                            Mon, Feb 03, 2025       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Stats] [Playbook] [Executions] [Attachments]                          │
│  ══════                                                                  │
│                                                                          │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐   │
│  │                                 │  │                              │   │
│  │  Net P&L        -R$ 288.14      │  │     [CHART: Price Action]   │   │
│  │                 ─────────       │  │                              │   │
│  │  Side           SHORT           │  │     Entry: ●────────────    │   │
│  │  Contracts      0.02            │  │                    ────●    │   │
│  │  Commissions    R$ 0.14         │  │     Exit: ────────●         │   │
│  │  Total Fees     R$ 0.00         │  │                              │   │
│  │  Net ROI        (0.33%)         │  │                              │   │
│  │  Gross P&L      -R$ 288.00      │  │                              │   │
│  │                                 │  │                              │   │
│  │  ─────────────────────────────  │  └─────────────────────────────┘   │
│  │                                 │                                     │
│  │  MAE / MFE      -R$29.00 / +R$15.24                                  │
│  │                 ░░░░░░░░░░█░░░░░░░░░░                                │
│  │                 ←worst    entry    best→                             │
│  │                                 │                                     │
│  │  ─────────────────────────────  │                                     │
│  │                                 │                                     │
│  │  Trade Rating   ★★★☆☆           │                                     │
│  │                                 │                                     │
│  │  ─────────────────────────────  │                                     │
│  │                                 │                                     │
│  │  Profit Target  R$ 419.00       │                                     │
│  │  Stop Loss      R$ 285.00       │                                     │
│  │  Initial Target +R$ 419.00      │                                     │
│  │  Trade Risk     -R$ 285.34      │                                     │
│  │  Planned R      1.47R           │                                     │
│  │  Realized R     -1.01R          │                                     │
│  │                                 │                                     │
│  │  ─────────────────────────────  │                                     │
│  │                                 │                                     │
│  │  Avg Entry      R$ 43,905.35    │                                     │
│  │  Avg Exit       R$ 44,049.35    │                                     │
│  │  Entry Time     21:48:55        │                                     │
│  │  Exit Time      03:19:27        │                                     │
│  │  Duration       5h 30m 32s      │                                     │
│  │                                 │                                     │
│  └─────────────────────────────────┘                                     │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Setups                                                    [+ Add] │  │
│  │  ┌──────────┐                                                      │  │
│  │  │ bear flag│  ×                                                   │  │
│  │  └──────────┘                                                      │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  Mistakes                                                  [+ Add] │  │
│  │  ┌────────────────┐  ┌──────────────┐                              │  │
│  │  │ early entry    │× │ no stop loss │×                             │  │
│  │  └────────────────┘  └──────────────┘                              │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  Custom Tags                                               [+ Add] │  │
│  │  ┌───────────┐  ┌──────────────┐                                   │  │
│  │  │ 1hr chart │× │ london open  │×                                  │  │
│  │  └───────────┘  └──────────────┘                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Charts & Running P&L                                              │  │
│  │  [Trade note] [Daily Journal]                    [+ Add template]  │  │
│  │  ─────────────────────────────────────────────────────────────────│  │
│  │  ┌───────────────────────────────────────────────────────────────┐│  │
│  │  │ Rich text editor with formatting toolbar                       ││  │
│  │  │                                                                ││  │
│  │  │ Enter your trade notes here...                                 ││  │
│  │  │                                                                ││  │
│  │  └───────────────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### New Fields for Trade Detail

```typescript
interface EnhancedTradeStats {
  // Existing fields
  netPnl: number
  grossPnl: number
  direction: 'long' | 'short'
  positionSize: number
  commission: number
  fees: number

  // New calculated fields
  netRoi: number                    // (pnl / cost) * 100
  totalCost: number                 // positionSize * entryPrice (adjusted)
  tradeDuration: number             // exitTime - entryTime in seconds

  // MAE/MFE visualization
  mae: number                       // Maximum Adverse Excursion
  mfe: number                       // Maximum Favorable Excursion
  maePercent: number                // Normalized for visualization
  mfePercent: number                // Normalized for visualization

  // R-Multiple tracking
  profitTarget: number              // Take profit price
  stopLoss: number                  // Stop loss price
  initialTarget: number             // Calculated target in currency
  tradeRisk: number                 // Calculated risk in currency
  plannedRMultiple: number          // target / risk
  realizedRMultiple: number         // actual pnl / risk

  // New fields
  tradeRating?: number              // 1-5 star rating (optional)
}
```

#### Trade Rating System

Optional 1-5 star rating for subjective trade quality assessment.

```typescript
interface TradeRating {
  value: number                     // 1-5
  criteria?: {
    execution: number               // How well was it executed?
    patience: number                // Did you wait for confirmation?
    riskManagement: number          // Proper position sizing and stops?
    emotionalControl: number        // Traded without emotion?
  }
}
```

**Use cases:**
- Rate trade quality independent of outcome (a losing trade can be well-executed)
- Track improvement in trade quality over time
- Filter analytics by trade rating

---

### 11.13 Mistake Tags System

Dedicated mistake tracking separate from general tags, enabling cost-of-mistakes analysis.

#### Pre-defined Mistake Categories

```typescript
const COMMON_MISTAKES = [
  // Entry Mistakes
  'early_entry',           // Entered before confirmation
  'late_entry',            // Missed optimal entry, chased
  'fomo_entry',            // Fear of missing out
  'revenge_trade',         // Trading to recover losses
  'overtrading',           // Too many trades

  // Exit Mistakes
  'early_exit',            // Took profits too soon
  'late_exit',             // Held too long
  'moved_stop',            // Moved stop loss (usually worse)
  'no_stop_loss',          // Traded without stop loss
  'didnt_take_profit',     // Missed take profit level

  // Risk Mistakes
  'oversized_position',    // Position too large
  'wrong_asset',           // Traded unfamiliar asset
  'against_trend',         // Traded against major trend

  // Psychological
  'emotional_decision',    // Not following the plan
  'distracted',            // Not fully focused
  'tired_trading',         // Trading when fatigued

  // Custom
  // Users can add their own
]
```

#### Mistake Cost Analysis

Track the financial impact of each mistake type:

```typescript
interface MistakeCostAnalysis {
  mistake: string
  occurrences: number
  totalCost: number                 // Sum of P&L for trades with this mistake
  avgCost: number                   // Average loss per occurrence
  winRateWithMistake: number        // Win rate when this mistake is made
  percentOfLosses: number           // What % of total losses come from this mistake
}

// Example output:
// "Moving stop loss" - 12 occurrences, -R$1,840 total, 0% win rate
// This mistake alone costs you R$153/occurrence
```

---

### 11.14 Custom Tags for Timeframe Tracking

Enable tracking trades by the chart timeframe used for analysis/entry.

#### Pre-defined Timeframe Tags

```typescript
const TIMEFRAME_TAGS = [
  '1m_chart',
  '5m_chart',
  '15m_chart',
  '1h_chart',
  '4h_chart',
  'daily_chart',
  'weekly_chart',
  // Renko/Range
  'renko_chart',
  'range_chart',
]
```

#### Timeframe Performance Analysis

```typescript
interface TimeframePerformance {
  timeframe: string
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalPnl: number
  avgPnl: number
  avgR: number
  profitFactor: number
  avgDuration: number               // Avg trade duration for this timeframe
}

// Example insight:
// "You're most profitable on the 1-hour chart (72% WR, 1.8R avg)"
// "5-minute chart trades have the lowest win rate (45%)"
```

---

### 11.15 Trade Notes with Templates

Rich text notes with template system for consistent journaling.

#### Note Templates

```typescript
interface NoteTemplate {
  id: string
  name: string
  content: string                   // HTML or markdown template
  category: 'trade_note' | 'daily_journal' | 'weekly_review'
}

// Example template:
const PRE_TRADE_TEMPLATE = `
## Setup
- Pattern:
- Timeframe:
- Key levels:

## Entry Thesis
Why am I taking this trade?

## Risk Management
- Stop loss reason:
- Target reason:
- Position size:
`

const POST_TRADE_TEMPLATE = `
## What Happened
- Did price reach my target?
- Where did I exit?

## What I Did Well

## What I Could Improve

## Lesson Learned
`
```

---

### 11.16 Key Metrics Balance Insight

The relationship between win rate and average win/loss ratio is crucial for profitability.

#### Profitability Formula Display

Add a visual indicator showing the balance needed for profitability:

```
┌───────────────────────────────────────────────────────────────────────┐
│ Profitability Balance                                                  │
│                                                                        │
│  Your Stats:                                                           │
│  Win Rate: 58%          Avg Win/Loss: 1.4                             │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                                                                │   │
│  │  High Win Rate (>60%)  →  Avg Win/Loss ~1.0 is enough         │   │
│  │  Medium Win Rate (50%) →  Avg Win/Loss >1.0 required          │   │
│  │  Low Win Rate (<40%)   →  Avg Win/Loss >2.0 required          │   │
│  │                                                                │   │
│  │  You: 58% WR + 1.4 Avg W/L = ✓ Profitable combination         │   │
│  │                                                                │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  Breakeven line: At your win rate, you need 0.72 Avg W/L to break even│
│  You're +94% above breakeven threshold                                 │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

#### Calculation

```typescript
// Breakeven Avg Win/Loss for a given win rate
const calculateBreakevenRatio = (winRate: number): number => {
  // At breakeven: (winRate * avgWin) = ((1 - winRate) * avgLoss)
  // avgWin/avgLoss = (1 - winRate) / winRate
  return (1 - winRate) / winRate
}

// Example: 60% win rate → breakeven at 0.67 avg win/loss
// Example: 40% win rate → breakeven at 1.5 avg win/loss

interface ProfitabilityInsight {
  winRate: number
  avgWinLoss: number
  breakevenRatio: number
  marginAboveBreakeven: number      // % above breakeven threshold
  status: 'profitable' | 'breakeven' | 'unprofitable'
  recommendation?: string           // "Increase avg win size" or "Improve win rate"
}
```

---

### 11.17 Updated Implementation Order

1. **Backend Time Analysis** (Day 1-2)
   - [ ] `getHourlyPerformance()` - Hour of day analytics
   - [ ] `getDayOfWeekPerformance()` - Day of week analytics
   - [ ] `getTimeHeatmap()` - Combined hour × day matrix
   - [ ] Update schema if needed for time zone handling

2. **Backend Day Detail** (Day 2)
   - [ ] `getDaySummary()` - Day summary stats
   - [ ] `getDayEquityCurve()` - Intraday points
   - [ ] `getDayTrades()` - Trades list for day

3. **Dashboard Charts** (Day 3-4)
   - [ ] `daily-pnl-bar-chart.tsx` with click handlers
   - [ ] `cumulative-pnl-chart.tsx` line chart
   - [ ] `performance-radar-chart.tsx` multi-metric radar
   - [ ] Update dashboard layout

4. **Day Detail Modal** (Day 5)
   - [ ] `day-detail-modal.tsx` container
   - [ ] `day-summary-stats.tsx` KPI cards
   - [ ] `day-equity-curve.tsx` intraday chart
   - [ ] `day-trades-list.tsx` with navigation

5. **Analytics Time Section** (Day 6)
   - [ ] `hourly-performance-chart.tsx`
   - [ ] `day-of-week-chart.tsx`
   - [ ] `time-heatmap.tsx`
   - [ ] Add "By Time" tab to analytics page

6. **Trade Detail Enhancements** (Day 7-8)
   - [ ] Enhanced stats panel layout
   - [ ] MAE/MFE visualization bar
   - [ ] Trade rating component (1-5 stars)
   - [ ] Trade duration calculation and display
   - [ ] ROI calculation and display

7. **Mistake Tags System** (Day 9)
   - [ ] Create `mistake_tags` table or use existing tags with `category`
   - [ ] Pre-populate common mistakes
   - [ ] Mistake selector component in trade detail
   - [ ] `getMistakeCostAnalysis()` analytics function

8. **Custom Tags & Timeframe** (Day 10)
   - [ ] Timeframe tag category
   - [ ] Custom tag management UI
   - [ ] `getTimeframePerformance()` analytics
   - [ ] Tag-based filtering in reports

9. **Trade Notes Enhancement** (Day 11)
   - [ ] Note templates system
   - [ ] Rich text editor improvements
   - [ ] Template selector component
   - [ ] Pre-defined templates (pre-trade, post-trade)

10. **Profitability Balance** (Day 12)
    - [ ] Calculate breakeven ratio
    - [ ] Profitability insight component
    - [ ] Add to dashboard or analytics overview

11. **Polish & Translations** (Day 13-14)
    - [ ] Full i18n support (pt-BR and en)
    - [ ] Responsive design for all new components
    - [ ] Loading states and empty states
    - [ ] Tooltips and accessibility

---

### 11.18 Updated Files to Create/Modify

```
src/
├── db/
│   └── schema.ts                     # Add trade_rating, update tags schema
├── app/
│   ├── [locale]/
│   │   ├── analytics/page.tsx        # UPDATE: Add "By Time" tab
│   │   └── journal/[id]/page.tsx     # UPDATE: Enhanced trade detail
│   └── actions/
│       ├── analytics.ts              # UPDATE: Add time-based + mistake analysis
│       ├── reports.ts                # UPDATE: Add day detail functions
│       └── tags.ts                   # UPDATE: Mistake tags, timeframe tags
├── components/
│   ├── dashboard/
│   │   ├── index.ts                  # UPDATE: Export new components
│   │   ├── dashboard-content.tsx     # UPDATE: New layout with charts
│   │   ├── daily-pnl-bar-chart.tsx   # NEW: Daily P&L bars
│   │   ├── cumulative-pnl-chart.tsx  # NEW: Equity line chart
│   │   ├── performance-radar-chart.tsx # NEW: Multi-metric radar
│   │   ├── profitability-balance.tsx # NEW: Win rate / Avg W-L balance
│   │   ├── day-detail-modal.tsx      # NEW: Day drill-down modal
│   │   ├── day-summary-stats.tsx     # NEW: Day KPI cards
│   │   ├── day-equity-curve.tsx      # NEW: Intraday equity
│   │   └── day-trades-list.tsx       # NEW: Day trades table
│   ├── analytics/
│   │   ├── index.ts                  # UPDATE: Export new components
│   │   ├── hourly-performance-chart.tsx  # NEW
│   │   ├── day-of-week-chart.tsx         # NEW
│   │   ├── time-heatmap.tsx              # NEW
│   │   ├── timeframe-performance.tsx     # NEW
│   │   └── mistake-cost-analysis.tsx     # NEW
│   └── journal/
│       ├── trade-detail-stats.tsx    # NEW: Enhanced stats panel
│       ├── trade-rating.tsx          # NEW: 1-5 star rating
│       ├── mae-mfe-bar.tsx           # NEW: Visual MAE/MFE bar
│       ├── mistake-tags-selector.tsx # NEW: Mistake tags component
│       ├── timeframe-tag-selector.tsx # NEW: Timeframe selection
│       └── note-template-selector.tsx # NEW: Template picker
├── types/
│   └── index.ts                      # UPDATE: Add new types
└── messages/
    ├── en.json                       # UPDATE: Add translations
    └── pt-BR.json                    # UPDATE: Add translations
```

---

### 11.19 Additional Translation Keys

```json
{
  "tradeDetail": {
    "stats": {
      "netPnl": "Net P&L",
      "grossPnl": "Gross P&L",
      "side": "Side",
      "contracts": "Contracts",
      "commissions": "Commissions",
      "totalFees": "Total Fees",
      "netRoi": "Net ROI",
      "maeMfe": "MAE / MFE",
      "maeMfeTooltip": "Maximum Adverse/Favorable Excursion - How far price moved against/for you",
      "tradeRating": "Trade Rating",
      "rateThisTrade": "Rate this trade",
      "profitTarget": "Profit Target",
      "stopLoss": "Stop Loss",
      "initialTarget": "Initial Target",
      "tradeRisk": "Trade Risk",
      "plannedR": "Planned R",
      "realizedR": "Realized R",
      "avgEntry": "Avg Entry",
      "avgExit": "Avg Exit",
      "entryTime": "Entry Time",
      "exitTime": "Exit Time",
      "duration": "Duration"
    },
    "tags": {
      "setups": "Setups",
      "mistakes": "Mistakes",
      "customTags": "Custom Tags",
      "timeframe": "Timeframe",
      "addSetup": "Add setup",
      "addMistake": "Add mistake",
      "addTag": "Add tag",
      "selectTimeframe": "Select timeframe"
    },
    "notes": {
      "title": "Charts & Running P&L",
      "tradeNote": "Trade note",
      "dailyJournal": "Daily Journal",
      "addTemplate": "Add template",
      "selectTemplate": "Select a template",
      "preTradeAnalysis": "Pre-Trade Analysis",
      "postTradeReview": "Post-Trade Review"
    }
  },
  "mistakes": {
    "categories": {
      "entry": "Entry Mistakes",
      "exit": "Exit Mistakes",
      "risk": "Risk Mistakes",
      "psychological": "Psychological"
    },
    "types": {
      "early_entry": "Early Entry",
      "late_entry": "Late Entry",
      "fomo_entry": "FOMO Entry",
      "revenge_trade": "Revenge Trade",
      "overtrading": "Overtrading",
      "early_exit": "Early Exit",
      "late_exit": "Late Exit",
      "moved_stop": "Moved Stop Loss",
      "no_stop_loss": "No Stop Loss",
      "didnt_take_profit": "Didn't Take Profit",
      "oversized_position": "Oversized Position",
      "wrong_asset": "Wrong Asset",
      "against_trend": "Against Trend",
      "emotional_decision": "Emotional Decision",
      "distracted": "Distracted",
      "tired_trading": "Tired Trading"
    },
    "analysis": {
      "title": "Mistake Cost Analysis",
      "occurrences": "Occurrences",
      "totalCost": "Total Cost",
      "avgCost": "Avg Cost",
      "costPerMistake": "This mistake costs you {amount} per occurrence"
    }
  },
  "timeframes": {
    "1m": "1 Minute",
    "5m": "5 Minutes",
    "15m": "15 Minutes",
    "1h": "1 Hour",
    "4h": "4 Hours",
    "daily": "Daily",
    "weekly": "Weekly",
    "renko": "Renko",
    "range": "Range"
  },
  "profitability": {
    "title": "Profitability Balance",
    "yourStats": "Your Stats",
    "winRate": "Win Rate",
    "avgWinLoss": "Avg Win/Loss",
    "breakevenLine": "At your win rate, you need {ratio} Avg W/L to break even",
    "aboveBreakeven": "You're +{percent}% above breakeven threshold",
    "belowBreakeven": "You're {percent}% below breakeven threshold",
    "profitable": "Profitable combination",
    "breakeven": "At breakeven",
    "unprofitable": "Below breakeven",
    "recommendation": {
      "increaseWinRate": "Focus on improving entry timing to increase win rate",
      "increaseAvgWin": "Let winners run longer to increase average win size",
      "decreaseAvgLoss": "Cut losses faster to decrease average loss size"
    }
  }
}
```

---

### Deliverables

- [ ] Hour of day performance analysis (backend + frontend)
- [ ] Day of week performance analysis (backend + frontend)
- [ ] Time heatmap (hour × day matrix) visualization
- [ ] Daily P&L bar chart with click handler
- [ ] Cumulative P&L line chart
- [ ] Multi-metric performance radar chart
- [ ] Day detail modal with:
  - [ ] Summary stats (P&L, win rate, trades, avg R)
  - [ ] Intraday equity curve
  - [ ] Trades list with navigation to trade detail
- [ ] "By Time" tab in Analytics page
- [ ] Calendar day click triggers modal
- [ ] Bar chart day click triggers modal
- [ ] Enhanced Trade Detail Page:
  - [ ] Comprehensive stats panel (ROI, duration, MAE/MFE)
  - [ ] MAE/MFE visualization bar
  - [ ] Trade rating system (1-5 stars)
  - [ ] Planned vs Realized R-Multiple display
- [ ] Mistake Tags System:
  - [ ] Pre-defined common mistakes
  - [ ] Custom mistake creation
  - [ ] Mistake cost analysis report
- [ ] Custom Tags Enhancements:
  - [ ] Timeframe tags (1m, 5m, 15m, 1h, 4h, daily)
  - [ ] Timeframe performance analysis
- [ ] Trade Notes with Templates:
  - [ ] Pre-trade analysis template
  - [ ] Post-trade review template
  - [ ] Custom template creation
- [ ] Profitability Balance indicator (Win Rate vs Avg W/L)
- [ ] Full i18n support (pt-BR, en)
- [ ] Responsive design for all new components

---

## Phase 12: Daily Trading Command Center ✅ COMPLETE

**Goal:** Create a dedicated daily page that serves as the trader's command center during trading sessions, with pre-market routines, real-time targets/limits tracking, intraday performance metrics, and behavioral insights to help maintain discipline throughout the day.

---

### 12.1 Problem Statement

Traders need a focused daily view that helps them:

1. **Prepare for the Trading Day** - Pre-market checklist ensures proper mental and technical preparation
   - "Did I review yesterday's trades?"
   - "Did I check the economic calendar?"
   - "What's my focus strategy for today?"

2. **Track Progress Against Targets** - Real-time monitoring prevents overtrading
   - "Am I approaching my daily loss limit?"
   - "How many trades have I taken vs my limit?"
   - "What's my projected end-of-day P&L?"

3. **Stay Disciplined** - Visual reminders and circuit breakers
   - "Should I stop trading now?"
   - "Am I following my playbook today?"
   - "What mistakes am I making today?"

4. **End-of-Day Review** - Quick summary for journaling
   - "How did today compare to my targets?"
   - "What patterns emerged today?"
   - "What should I focus on tomorrow?"

---

### 12.2 Data Scope Architecture

The daily command center has a clear separation between **global**, **account-level**, and **asset-specific** data:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ALL ACCOUNTS SUMMARY (Top Banner)                       │
│                                                                                  │
│  Aggregated view across all trading accounts:                                    │
│  - Combined P&L from all accounts                                               │
│  - Total trades across all accounts                                             │
│  - Overall win rate / avg R                                                     │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                          ACCOUNT-LEVEL (Selected Account)                        │
│                                                                                  │
│  Per-account settings and metrics:                                              │
│  - Profit target / Loss limit (circuit breakers)                                │
│  - Max daily trades / Consecutive loss limits                                   │
│  - Stop trading time                                                            │
│  - Pre-market checklist                                                         │
│  - Emotional state tracking                                                     │
│  - Day rating                                                                   │
│  - General daily notes                                                          │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                          ASSET-SPECIFIC (Per Asset within Account)               │
│                                                                                  │
│  Each asset has its own:                                                        │
│  - Focus strategy (different strategy per asset)                                │
│  - Daily bias (bullish/bearish/neutral)                                         │
│  - Key levels (support/resistance)                                              │
│  - Asset-specific notes and analysis                                            │
│  - Trading rules for today                                                      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 12.3 Database Schema Changes

#### New Table: `daily_checklists`

Stores customizable pre-market checklist items (per account).

```sql
CREATE TABLE daily_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE,

  -- Checklist item details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general', -- 'mental', 'technical', 'market', 'general'
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_checklists_account_id ON daily_checklists(account_id);
```

#### New Table: `checklist_completions`

Tracks daily completion of checklist items.

```sql
CREATE TABLE checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES daily_checklists(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,

  -- Completion tracking
  completed_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,

  UNIQUE(checklist_id, account_id, completed_date)
);

CREATE INDEX idx_checklist_completions_date ON checklist_completions(account_id, completed_date);
```

#### New Table: `daily_targets`

Stores daily trading targets and limits per account (account-level circuit breakers).

```sql
CREATE TABLE daily_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,

  -- Profit targets (account-level)
  profit_target INTEGER, -- in cents (e.g., R$500 = 50000)
  profit_target_enabled BOOLEAN DEFAULT FALSE,

  -- Loss limits (circuit breakers)
  max_daily_loss INTEGER, -- in cents
  max_daily_loss_enabled BOOLEAN DEFAULT TRUE,

  -- Trade count limits
  max_daily_trades INTEGER,
  max_daily_trades_enabled BOOLEAN DEFAULT FALSE,

  -- Time-based limits
  stop_trading_time TIME, -- e.g., 15:30:00
  stop_trading_time_enabled BOOLEAN DEFAULT FALSE,

  -- Consecutive loss limit
  max_consecutive_losses INTEGER DEFAULT 3,
  max_consecutive_losses_enabled BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id)
);
```

#### New Table: `daily_account_notes`

Account-level daily notes (general analysis, emotional state, day review).

```sql
CREATE TABLE daily_account_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
  note_date DATE NOT NULL,

  -- General pre-market
  general_market_analysis TEXT, -- Overall market conditions
  focus_notes TEXT,             -- What to focus on today (account-wide)

  -- Post-market review
  post_market_review TEXT,
  lessons_learned TEXT,
  tomorrow_focus TEXT,

  -- Emotional tracking (trader state, not asset-specific)
  emotional_state_start VARCHAR(20), -- 'calm', 'anxious', 'confident', 'fearful', 'neutral'
  emotional_state_end VARCHAR(20),

  -- Overall day rating
  day_rating INTEGER, -- 1-5 stars

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, note_date)
);

CREATE INDEX idx_daily_account_notes_date ON daily_account_notes(account_id, note_date);
```

#### New Table: `daily_asset_settings`

Asset-specific daily settings (focus strategy, bias, key levels).

```sql
CREATE TABLE daily_asset_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  setting_date DATE NOT NULL,

  -- Focus strategy for this asset today
  focus_strategy_id UUID REFERENCES strategies(id),

  -- Daily bias for this asset
  daily_bias VARCHAR(20), -- 'bullish', 'bearish', 'neutral', 'range_bound'

  -- Key levels (stored as JSON for flexibility)
  key_levels JSONB DEFAULT '[]',
  -- Example: [{"type": "support", "price": 128000, "note": "Major support"}, {"type": "resistance", "price": 129500}]

  -- Trading rules for today (asset-specific)
  trading_rules TEXT,
  -- Example: "Only trade breakouts above 128500. Avoid counter-trend trades."

  -- Asset-specific notes
  pre_market_notes TEXT,
  post_market_notes TEXT,

  -- Is this asset being traded today?
  is_trading_today BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(account_id, asset_id, setting_date)
);

CREATE INDEX idx_daily_asset_settings_date ON daily_asset_settings(account_id, setting_date);
CREATE INDEX idx_daily_asset_settings_asset ON daily_asset_settings(asset_id, setting_date);
```

#### Key Levels JSON Structure

```typescript
interface KeyLevel {
  type: 'support' | 'resistance' | 'pivot' | 'vwap' | 'pdc' | 'pdh' | 'pdl' | 'custom'
  price: number
  note?: string
  strength?: 'strong' | 'moderate' | 'weak'
}

// PDC = Previous Day Close
// PDH = Previous Day High
// PDL = Previous Day Low

// Example usage:
const keyLevels: KeyLevel[] = [
  { type: 'resistance', price: 129500, note: 'Major resistance from last week', strength: 'strong' },
  { type: 'support', price: 128000, note: 'Psychological level', strength: 'strong' },
  { type: 'pdh', price: 128800, note: 'Previous day high' },
  { type: 'pdl', price: 127500, note: 'Previous day low' },
  { type: 'vwap', price: 128300, note: 'VWAP from yesterday' },
]
```

---

### 12.3 Daily Targets & Limits Calculation

#### Circuit Breaker Logic

```typescript
interface DailyProgress {
  // P&L tracking
  currentPnl: number           // Today's P&L in cents
  grossPnl: number             // Before fees
  fees: number                 // Total fees today

  // Targets progress
  profitTargetProgress: number // 0-100% or can exceed 100%
  profitTargetReached: boolean

  // Loss limit tracking
  lossLimitProgress: number    // 0-100% (100% = stop trading)
  lossLimitReached: boolean
  lossLimitRemaining: number   // How much more can lose

  // Trade count tracking
  tradesCount: number
  tradesLimit: number
  tradesLimitReached: boolean

  // Consecutive losses
  currentLossStreak: number
  maxAllowedStreak: number
  streakLimitReached: boolean

  // Time-based
  tradingHoursRemaining: string // "2h 30m" until stop time
  shouldStopTrading: boolean    // Any limit reached

  // Recommendations
  status: 'green' | 'yellow' | 'red'
  message: string              // "You're doing well!" or "Consider stopping"
}

const calculateDailyProgress = async (
  accountId: string,
  date: Date,
  targets: DailyTargets
): Promise<DailyProgress> => {
  const todayTrades = await getTradesForDate(accountId, date)

  // Calculate current P&L
  const currentPnl = todayTrades.reduce((sum, t) => sum + t.netPnl, 0)
  const grossPnl = todayTrades.reduce((sum, t) => sum + t.grossPnl, 0)
  const fees = grossPnl - currentPnl

  // Calculate loss limit progress
  const lossLimitProgress = targets.maxDailyLossEnabled
    ? Math.min(100, (Math.abs(Math.min(0, currentPnl)) / targets.maxDailyLoss) * 100)
    : 0

  // Calculate consecutive losses
  let currentLossStreak = 0
  for (let i = todayTrades.length - 1; i >= 0; i--) {
    if (todayTrades[i].outcome === 'loss') {
      currentLossStreak++
    } else {
      break
    }
  }

  // Determine overall status
  const shouldStopTrading =
    (targets.maxDailyLossEnabled && currentPnl <= -targets.maxDailyLoss) ||
    (targets.maxDailyTradesEnabled && todayTrades.length >= targets.maxDailyTrades) ||
    (targets.maxConsecutiveLossesEnabled && currentLossStreak >= targets.maxConsecutiveLosses)

  const status = shouldStopTrading ? 'red'
    : lossLimitProgress > 70 || currentLossStreak >= 2 ? 'yellow'
    : 'green'

  return {
    currentPnl,
    grossPnl,
    fees,
    profitTargetProgress: targets.profitTargetEnabled
      ? (currentPnl / targets.profitTarget) * 100
      : 0,
    profitTargetReached: targets.profitTargetEnabled && currentPnl >= targets.profitTarget,
    lossLimitProgress,
    lossLimitReached: targets.maxDailyLossEnabled && currentPnl <= -targets.maxDailyLoss,
    lossLimitRemaining: targets.maxDailyLoss + currentPnl,
    tradesCount: todayTrades.length,
    tradesLimit: targets.maxDailyTrades || 0,
    tradesLimitReached: targets.maxDailyTradesEnabled && todayTrades.length >= targets.maxDailyTrades,
    currentLossStreak,
    maxAllowedStreak: targets.maxConsecutiveLosses,
    streakLimitReached: targets.maxConsecutiveLossesEnabled && currentLossStreak >= targets.maxConsecutiveLosses,
    tradingHoursRemaining: calculateTradingHoursRemaining(targets.stopTradingTime),
    shouldStopTrading,
    status,
    message: getStatusMessage(status, { currentLossStreak, lossLimitProgress, profitTargetProgress })
  }
}
```

---

### 12.4 Backend Tasks

#### All Accounts Summary Actions (`src/app/actions/daily.ts`)

- [ ] `getAllAccountsSummary()` - Aggregated P&L, trades, win rate across ALL accounts
- [ ] `getAccountQuickStats()` - Quick stats per account for summary row

#### Account-Level Daily Actions (`src/app/actions/daily.ts`)

- [ ] `getDailyOverview()` - Complete daily summary with progress for selected account
- [ ] `getDailyProgress()` - Real-time progress against account targets
- [ ] `getTodayTrades()` - Trades for the current day for selected account
- [ ] `getTodayStats()` - P&L, win rate, avg R for today for selected account
- [ ] `getIntradayEquityCurve()` - Equity curve for today (with optional asset filter)
- [ ] `getComparisonWithAverage()` - Today vs historical averages for selected account

#### Checklist Actions (`src/app/actions/checklists.ts`)

- [ ] `getChecklists()` - Get all checklist items for account
- [ ] `createChecklist()` - Add checklist item
- [ ] `updateChecklist()` - Edit checklist item
- [ ] `deleteChecklist()` - Remove checklist item
- [ ] `reorderChecklists()` - Change sort order
- [ ] `getChecklistCompletions()` - Get completions for date
- [ ] `toggleChecklistItem()` - Mark item complete/incomplete
- [ ] `getChecklistHistory()` - Completion rate over time

#### Targets Actions (`src/app/actions/targets.ts`)

- [ ] `getDailyTargets()` - Get account targets
- [ ] `updateDailyTargets()` - Update targets/limits
- [ ] `checkCircuitBreakers()` - Real-time limit checking
- [ ] `getTargetHistory()` - How often targets were hit/missed

#### Account-Level Notes Actions (`src/app/actions/daily-notes.ts`)

- [ ] `getAccountDailyNotes()` - Get account-level notes for date
- [ ] `saveAccountDailyNotes()` - Create/update account-level daily notes
- [ ] `updateEmotionalState()` - Update emotional state (start/current)
- [ ] `rateDayQuality()` - Save day rating (1-5 stars)

#### Asset-Specific Settings Actions (`src/app/actions/asset-settings.ts`)

- [ ] `getDailyAssetSettings()` - Get settings for an asset on a date
- [ ] `saveDailyAssetSettings()` - Save/update asset-specific settings
- [ ] `getAssetFocusStrategy()` - Get focus strategy for asset today
- [ ] `setAssetFocusStrategy()` - Set focus strategy for asset today
- [ ] `getAssetBias()` - Get daily bias for asset
- [ ] `setAssetBias()` - Set daily bias for asset
- [ ] `getAssetKeyLevels()` - Get key levels for asset today
- [ ] `saveAssetKeyLevels()` - Save key levels for asset
- [ ] `getAssetTradingRules()` - Get trading rules for asset today
- [ ] `saveAssetTradingRules()` - Save trading rules for asset
- [ ] `getAssetNotes()` - Get asset-specific notes
- [ ] `saveAssetNotes()` - Save asset-specific notes
- [ ] `getAssetsBeingTradedToday()` - List assets with settings for today
- [ ] `addAssetToTradingDay()` - Add asset to today's trading list
- [ ] `removeAssetFromTradingDay()` - Remove asset from today's trading list

---

### 12.5 Frontend - Daily Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Daily Trading - January 27, 2025                  ◀ Yesterday  Tomorrow ▶ [📅]  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ╔═══════════════════════════════════════════════════════════════════════════╗  │
│  ║  ALL ACCOUNTS SUMMARY                                                      ║  │
│  ║                                                                            ║  │
│  ║  Combined P&L: +R$890   │  Total Trades: 12   │  Overall Win Rate: 67%    ║  │
│  ║                                                                            ║  │
│  ║  ┌─ Personal ─────┐  ┌─ Atom Prop ────┐  ┌─ Raise Prop ───┐               ║  │
│  ║  │ +R$340 (5 tr.) │  │ +R$350 (4 tr.) │  │ +R$200 (3 tr.) │               ║  │
│  ║  │ 60% WR         │  │ 75% WR         │  │ 67% WR         │               ║  │
│  ║  └────────────────┘  └────────────────┘  └────────────────┘               ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════╝  │
│                                                                                  │
│  ┌─ SELECTED ACCOUNT: [Personal Account ▼] ─────────────────────────────────┐   │
│  │                                                                           │   │
│  │  ┌─ STATUS BANNER ────────────────────────────────────────────────────┐  │   │
│  │  │ 🟢 GOOD TO TRADE | P&L: +R$340 | 5/10 trades | 0 consecutive losses │  │   │
│  │  └────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                           │   │
│  │  ┌─ ACCOUNT METRICS ──────────────────────────────────────────────────┐  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│  │   │
│  │  │  │ Today P&L│  │ Win Rate │  │  Avg R   │  │  Trades  │  │Discipl.││  │   │
│  │  │  │ +R$340   │  │   60%    │  │  +1.2R   │  │   5/10   │  │  80%   ││  │   │
│  │  │  │ ▲ +15%   │  │ 3W 2L    │  │ vs 0.8R  │  │ 5 left   │  │ 4/5 ✓  ││  │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────┘│  │   │
│  │  └────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                           │   │
│  │  ┌─ TARGETS & LIMITS (Account) ────────┐  ┌─ PRE-MARKET CHECKLIST ─────┐ │   │
│  │  │                                      │  │                            │ │   │
│  │  │  Profit Target: R$500                │  │  ☑ Review yesterday trades │ │   │
│  │  │  ██████████████████████████████░░ 68%│  │  ☑ Check economic calendar │ │   │
│  │  │  R$340 / R$500                       │  │  ☑ Mental check - focused  │ │   │
│  │  │                                      │  │  ☐ Set price alerts        │ │   │
│  │  │  ──────────────────────────────────  │  │  ☐ Update journal          │ │   │
│  │  │                                      │  │                            │ │   │
│  │  │  Loss Limit: R$400                   │  │  ─────────────────────     │ │   │
│  │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%  │  │  Completion: 3/5 (60%)     │ │   │
│  │  │  R$0 used / R$400 limit              │  │                            │ │   │
│  │  │                                      │  │  [+ Add item]              │ │   │
│  │  │  ──────────────────────────────────  │  │                            │ │   │
│  │  │                                      │  └────────────────────────────┘ │   │
│  │  │  Consecutive Losses: 0/3             │                                 │   │
│  │  │  ○ ○ ○  Safe                        │  ┌─ EMOTIONAL STATE ──────────┐ │   │
│  │  │                                      │  │                            │ │   │
│  │  │  ──────────────────────────────────  │  │  Start: 😌 Calm            │ │   │
│  │  │                                      │  │  Current: 😊 Confident     │ │   │
│  │  │  Stop Trading Time: 15:30            │  │                            │ │   │
│  │  │  ⏱ 2h 15m remaining                 │  │  [Update]                  │ │   │
│  │  │                                      │  │                            │ │   │
│  │  └──────────────────────────────────────┘  └────────────────────────────┘ │   │
│  │                                                                           │   │
│  └───────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ╔═══════════════════════════════════════════════════════════════════════════╗  │
│  ║  ASSETS BEING TRADED TODAY                                                 ║  │
│  ║                                                                            ║  │
│  ║  [WINFUT]  [WDOFUT]  [+ Add Asset]                                         ║  │
│  ║   ═══════                                                                  ║  │
│  ╠═══════════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                            ║  │
│  ║  Asset: WINFUT (Mini Índice)                        Today: 3 trades +R$200 ║  │
│  ║                                                                            ║  │
│  ║  ┌─ FOCUS STRATEGY ───────┐  ┌─ DAILY BIAS ────────┐  ┌─ KEY LEVELS ────┐ ║  │
│  ║  │                        │  │                      │  │                 │ ║  │
│  ║  │  📌 Breakout - 15min   │  │  🟢 Bullish          │  │  R: 129,500 ●   │ ║  │
│  ║  │                        │  │                      │  │  R: 129,000     │ ║  │
│  ║  │  "Wait for volume      │  │  Strong momentum on  │  │  PDH: 128,800   │ ║  │
│  ║  │   confirmation before  │  │  daily chart. Look   │  │  S: 128,000 ●   │ ║  │
│  ║  │   entering breakouts"  │  │  for long entries.   │  │  PDL: 127,500   │ ║  │
│  ║  │                        │  │                      │  │                 │ ║  │
│  ║  │  [Change Strategy]     │  │  [Change Bias]       │  │  [Edit Levels]  │ ║  │
│  ║  └────────────────────────┘  └──────────────────────┘  └─────────────────┘ ║  │
│  ║                                                                            ║  │
│  ║  ┌─ ASSET TRADING RULES ─────────────────────────────────────────────────┐ ║  │
│  ║  │                                                                        │ ║  │
│  ║  │  • Only trade breakouts above 128,500 with volume confirmation         │ ║  │
│  ║  │  • Avoid counter-trend shorts until price below 128,000                │ ║  │
│  ║  │  • Maximum 2 trades per hour on this asset                             │ ║  │
│  ║  │                                                                        │ ║  │
│  ║  │  [Edit Rules]                                                          │ ║  │
│  ║  └────────────────────────────────────────────────────────────────────────┘ ║  │
│  ║                                                                            ║  │
│  ║  ┌─ ASSET-SPECIFIC NOTES ────────────────────────────────────────────────┐ ║  │
│  ║  │                                                                        │ ║  │
│  ║  │  Pre-market: Gap up from yesterday's close. Watch for pullback to     │ ║  │
│  ║  │  128,300 area for long entry. VWAP should act as support.             │ ║  │
│  ║  │                                                                        │ ║  │
│  ║  │  [Edit Notes]                                                          │ ║  │
│  ║  └────────────────────────────────────────────────────────────────────────┘ ║  │
│  ║                                                                            ║  │
│  ╚═══════════════════════════════════════════════════════════════════════════╝  │
│                                                                                  │
│  ┌─ INTRADAY EQUITY CURVE (Account: Personal) ──────────────────────────────┐   │
│  │                                                                           │   │
│  │  +R$400 │                              ●───●                              │   │
│  │  +R$300 │                         ●───●                                   │   │
│  │  +R$200 │                    ●───●                                        │   │
│  │  +R$100 │          ●───●    ●                                             │   │
│  │      R$0│─●───●───●                                                       │   │
│  │  -R$100 │     ●                                                           │   │
│  │         └─────────────────────────────────────────────────────────────    │   │
│  │          09:00   10:00   11:00   12:00   13:00   14:00   15:00            │   │
│  │                                                                           │   │
│  │  Legend: ── All Assets   ── WINFUT only   ── WDOFUT only                 │   │
│  │                                                                           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─ TODAY'S TRADES (Account: Personal) ─────────────────────────────────────┐   │
│  │                                    Filter: [All Assets ▼]  [+ New Trade] │   │
│  │  Time  │ Asset  │ Dir │ Strategy    │ Entry   │ Exit    │ P&L    │ R     │   │
│  │  09:15 │ WINFUT │ L   │ Breakout    │ 128,000 │ 128,150 │ +R$60  │+1.5R →│   │
│  │  09:45 │ WINFUT │ S   │ Mean Rev.   │ 128,200 │ 128,300 │ -R$40  │-1.0R →│   │
│  │  10:30 │ WINFUT │ L   │ Breakout    │ 128,050 │ 128,250 │ +R$80  │+2.0R →│   │
│  │  11:15 │ WDOFUT │ S   │ Range Break │ 5,045   │ 5,020   │ +R$125 │+1.2R →│   │
│  │  14:00 │ WINFUT │ L   │ Breakout    │ 128,300 │ 128,500 │ +R$115 │+2.3R →│   │
│  │                                                                           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─ GENERAL DAILY NOTES (Account-Level) ────────────────────────────────────┐   │
│  │                                                                           │   │
│  │  [Pre-Market] [Post-Market]                                               │   │
│  │   ═══════════                                                             │   │
│  │                                                                           │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐   │   │
│  │  │ General Market Analysis:                                           │   │   │
│  │  │ Overall market showing strength. Dow futures up, VIX low.          │   │   │
│  │  │ No major economic events today. Good day for trend following.      │   │   │
│  │  │                                                                   │   │   │
│  │  │ Focus for Today (General):                                        │   │   │
│  │  │ - Stay patient for A+ setups only                                 │   │   │
│  │  │ - Maximum 10 trades total across all assets                       │   │   │
│  │  │ - Stop if emotional state changes                                 │   │   │
│  │  └───────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                           │   │
│  │                                                     [Save] [Auto-save ✓]  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─ COMPARISON WITH AVERAGE ────────────────────────────────────────────────┐   │
│  │                                                                           │   │
│  │  Account: Personal                                                        │   │
│  │  Metric          Today      Daily Avg    Weekly Avg   vs Average         │   │
│  │  ─────────────────────────────────────────────────────────────────────   │   │
│  │  P&L             +R$340     +R$180       +R$850       ▲ +89%             │   │
│  │  Win Rate        60%        55%          58%          ▲ +5pp             │   │
│  │  Avg R           +1.2R      +0.8R        +0.9R        ▲ +0.4R            │   │
│  │  Trades          5          7            35           ▼ -2 trades        │   │
│  │  Discipline      80%        72%          75%          ▲ +8pp             │   │
│  │                                                                           │   │
│  │  💡 Insight: You're performing above average with fewer trades.          │   │
│  │              Quality over quantity is working today!                      │   │
│  │                                                                           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 12.6 Circuit Breaker Alerts

Visual alerts when approaching or reaching limits:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ WARNING: You're at 70% of your daily loss limit                              │
│                                                                                  │
│  Current P&L: -R$280   |   Loss Limit: R$400   |   Remaining: R$120             │
│                                                                                  │
│  Consider:                                                                       │
│  • Taking a break for 15-30 minutes                                             │
│  • Reducing position size for remaining trades                                   │
│  • Reviewing recent losses for patterns                                         │
│                                                                                  │
│  [Continue Trading]  [Stop for Today]  [Reduce Size]                            │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🛑 STOP: Daily loss limit reached                                                │
│                                                                                  │
│  You've lost R$400 today, reaching your daily loss limit.                       │
│                                                                                  │
│  Today's Stats:                                                                  │
│  • 8 trades taken                                                               │
│  • 25% win rate (2W / 6L)                                                       │
│  • Average R: -1.2R                                                             │
│                                                                                  │
│  Recommended Actions:                                                           │
│  • Review today's trades in the journal                                         │
│  • Identify what went wrong                                                     │
│  • Rest and prepare for tomorrow                                                │
│                                                                                  │
│  [Review Trades]  [Go to Dashboard]  [Override (not recommended)]               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 12.7 Default Checklist Items

Pre-populated checklist items for new accounts:

```typescript
const defaultChecklistItems: ChecklistItem[] = [
  // Mental Preparation
  { category: 'mental', title: 'Good night sleep (7+ hours)', sortOrder: 1 },
  { category: 'mental', title: 'Feeling mentally sharp and focused', sortOrder: 2 },
  { category: 'mental', title: 'No emotional distractions', sortOrder: 3 },

  // Technical Preparation
  { category: 'technical', title: 'Review yesterday\'s trades', sortOrder: 10 },
  { category: 'technical', title: 'Check pending orders/positions', sortOrder: 11 },
  { category: 'technical', title: 'Verify trading platform is working', sortOrder: 12 },
  { category: 'technical', title: 'Internet connection stable', sortOrder: 13 },

  // Market Analysis
  { category: 'market', title: 'Check economic calendar', sortOrder: 20 },
  { category: 'market', title: 'Identify key support/resistance levels', sortOrder: 21 },
  { category: 'market', title: 'Define daily bias (bullish/bearish/neutral)', sortOrder: 22 },
  { category: 'market', title: 'Note any important news events', sortOrder: 23 },

  // Trading Plan
  { category: 'general', title: 'Set daily profit target', sortOrder: 30 },
  { category: 'general', title: 'Confirm daily loss limit', sortOrder: 31 },
  { category: 'general', title: 'Choose focus strategy for today', sortOrder: 32 },
  { category: 'general', title: 'Set price alerts on key levels', sortOrder: 33 },
]
```

---

### 12.8 Frontend Components

#### All Accounts Components (`src/components/daily/`)

**All Accounts Summary Banner** - Aggregated view across all accounts
```typescript
interface AllAccountsSummaryProps {
  accounts: Array<{
    id: string
    name: string
    pnl: number
    tradesCount: number
    winRate: number
  }>
  combinedPnl: number
  combinedTrades: number
  overallWinRate: number
  onAccountSelect: (accountId: string) => void
}
```

#### Account-Level Components (`src/components/daily/`)

**Account Selector** - Dropdown to switch between accounts
```typescript
interface AccountSelectorProps {
  accounts: TradingAccount[]
  selectedAccountId: string
  onAccountChange: (accountId: string) => void
}
```

**Status Banner** - Trading status for selected account
```typescript
interface StatusBannerProps {
  status: 'green' | 'yellow' | 'red'
  currentPnl: number
  tradesCount: number
  tradesLimit: number
  consecutiveLosses: number
  message: string
}
```

**Account Metrics Row** - Today's KPIs for selected account
```typescript
interface AccountMetricsProps {
  todayPnl: number
  todayWinRate: number
  todayAvgR: number
  tradesCount: number
  tradesLimit: number
  disciplineScore: number
  comparisons: {
    pnlVsAverage: number
    winRateVsAverage: number
    avgRVsAverage: number
  }
}
```

**Targets Progress Card** - Account-level targets/limits
```typescript
interface TargetsProgressProps {
  profitTarget: number
  profitProgress: number
  lossLimit: number
  lossProgress: number
  tradesLimit: number
  tradesCount: number
  consecutiveLosses: number
  maxConsecutiveLosses: number
  stopTime: string
  timeRemaining: string
}
```

**Checklist Card** - Account-level checklist
```typescript
interface ChecklistCardProps {
  items: ChecklistItem[]
  completions: ChecklistCompletion[]
  onToggle: (itemId: string) => void
  onAddItem: () => void
  completionRate: number
}
```

**Emotional State Card** - Account-level emotional tracking
```typescript
interface EmotionalStateCardProps {
  stateStart: EmotionalState | null
  stateCurrent: EmotionalState | null
  onUpdateState: (state: EmotionalState) => void
}

type EmotionalState = 'calm' | 'anxious' | 'confident' | 'fearful' | 'neutral' | 'frustrated'
```

#### Asset-Specific Components (`src/components/daily/`)

**Asset Tabs** - Switch between assets being traded today
```typescript
interface AssetTabsProps {
  assets: Array<{
    id: string
    symbol: string
    name: string
    todayPnl: number
    todayTrades: number
  }>
  selectedAssetId: string
  onAssetSelect: (assetId: string) => void
  onAddAsset: () => void
}
```

**Asset Focus Strategy Card** - Strategy for specific asset
```typescript
interface AssetFocusStrategyProps {
  assetId: string
  strategy: Strategy | null
  onChangeStrategy: () => void
}
```

**Asset Bias Card** - Daily bias for specific asset
```typescript
interface AssetBiasCardProps {
  assetId: string
  bias: 'bullish' | 'bearish' | 'neutral' | 'range_bound' | null
  biasNotes: string
  onChangeBias: (bias: string, notes: string) => void
}
```

**Key Levels Card** - Support/resistance for specific asset
```typescript
interface KeyLevelsCardProps {
  assetId: string
  levels: KeyLevel[]
  onEditLevels: () => void
}

interface KeyLevel {
  type: 'support' | 'resistance' | 'pivot' | 'vwap' | 'pdc' | 'pdh' | 'pdl' | 'custom'
  price: number
  note?: string
  strength?: 'strong' | 'moderate' | 'weak'
}
```

**Asset Trading Rules Card** - Rules for specific asset today
```typescript
interface AssetTradingRulesProps {
  assetId: string
  rules: string
  onEditRules: () => void
}
```

**Asset Notes Card** - Notes specific to asset
```typescript
interface AssetNotesProps {
  assetId: string
  preMarketNotes: string
  postMarketNotes: string
  onSaveNotes: (notes: { preMarket: string; postMarket: string }) => void
}
```

#### Shared Components (`src/components/daily/`)

**Intraday Equity Chart** - Today's equity curve with asset filter
```typescript
interface IntradayEquityChartProps {
  dataPoints: Array<{
    time: string
    pnl: number
    assetId?: string
    tradeId?: string
  }>
  profitTarget?: number
  lossLimit?: number
  assetFilter?: string | null  // null = show all assets
  availableAssets: Array<{ id: string; symbol: string }>
  onAssetFilterChange: (assetId: string | null) => void
}
```

**Today Trades Table** - Compact table with asset filter
```typescript
interface TodayTradesTableProps {
  trades: TodaySummaryTrade[]
  assetFilter?: string | null
  onTradeClick: (tradeId: string) => void
  onAddTrade: () => void
  onAssetFilterChange: (assetId: string | null) => void
}
```

**General Daily Notes Editor** - Account-level notes
```typescript
interface GeneralDailyNotesProps {
  notes: AccountDailyNotes
  onSave: (notes: AccountDailyNotes) => void
  autoSave: boolean
}

interface AccountDailyNotes {
  generalMarketAnalysis: string
  focusNotes: string
  postMarketReview: string
  lessonsLearned: string
  tomorrowFocus: string
  dayRating: number  // 1-5
}
```

**Comparison Table** - Today vs averages comparison
```typescript
interface ComparisonTableProps {
  accountId: string
  today: DayStats
  dailyAverage: DayStats
  weeklyAverage: WeekStats
  insight: string
}
```

**Circuit Breaker Modal** - Warning/stop dialogs
```typescript
interface CircuitBreakerModalProps {
  type: 'warning' | 'stop'
  reason: 'loss_limit' | 'trade_count' | 'consecutive_losses' | 'stop_time'
  stats: DailyProgress
  onContinue: () => void
  onStop: () => void
  onReview: () => void
}
```

---

### 12.9 Navigation Integration

Add "Daily" as the first navigation item (most frequently used):

```typescript
// Sidebar navigation - Daily becomes primary entry point
{
  icon: CalendarClock,  // or Sun icon
  label: t('nav.daily'),
  href: '/daily'
}
```

Navigation order:
1. **Daily** (NEW - today's command center)
2. Dashboard (overall stats)
3. Journal (trade history)
4. Analytics (deep analysis)
5. Playbook (strategies)
6. Monthly (monthly results)
7. Reports (weekly/monthly reports)
8. Settings

---

### 12.10 Implementation Order

1. **Schema & Migration** (Day 1)
   - [ ] Create `daily_checklists` table
   - [ ] Create `checklist_completions` table
   - [ ] Create `daily_targets` table
   - [ ] Create `daily_notes` table
   - [ ] Generate and run migration
   - [ ] Seed default checklist items

2. **Backend - Core Daily** (Day 2)
   - [ ] `getDailyOverview()` - Main daily data
   - [ ] `getDailyProgress()` - Real-time progress
   - [ ] `getTodayTrades()` - Today's trades
   - [ ] `getTodayStats()` - Today's metrics
   - [ ] `getIntradayEquityCurve()` - Intraday equity
   - [ ] `getComparisonWithAverage()` - Averages comparison

3. **Backend - Checklists** (Day 3)
   - [ ] Checklist CRUD operations
   - [ ] Completion tracking
   - [ ] Completion history

4. **Backend - Targets & Notes** (Day 4)
   - [ ] Targets CRUD
   - [ ] Circuit breaker checking
   - [ ] Daily notes CRUD
   - [ ] Target history tracking

5. **Frontend - Page Layout** (Day 5-6)
   - [ ] Daily page structure
   - [ ] Status banner component
   - [ ] Daily metrics row
   - [ ] Targets progress card
   - [ ] Date navigation

6. **Frontend - Checklist & Strategy** (Day 7)
   - [ ] Checklist card with interactions
   - [ ] Focus strategy card
   - [ ] Add/edit checklist modal

7. **Frontend - Charts & Tables** (Day 8)
   - [ ] Intraday equity chart
   - [ ] Today trades table
   - [ ] Quick trade entry

8. **Frontend - Notes & Comparison** (Day 9)
   - [ ] Daily notes editor
   - [ ] Pre/post market tabs
   - [ ] Comparison table
   - [ ] Insight generation

9. **Circuit Breakers & Alerts** (Day 10)
   - [ ] Warning modal
   - [ ] Stop modal
   - [ ] Real-time monitoring
   - [ ] Notification system

10. **Polish & Translations** (Day 11)
    - [ ] Full i18n support (pt-BR, en)
    - [ ] Responsive design
    - [ ] Loading states
    - [ ] Empty states
    - [ ] Settings integration

---

### 12.11 Files to Create/Modify

```
src/
├── db/
│   ├── schema.ts                      # Add 5 new tables (checklists, completions, targets, account_notes, asset_settings)
│   └── migrations/
│       └── 0006_xxx.sql               # Phase 12 migration
├── app/
│   ├── [locale]/
│   │   └── daily/
│   │       └── page.tsx               # NEW: Daily command center page
│   └── actions/
│       ├── daily.ts                   # NEW: Daily overview + all accounts summary
│       ├── checklists.ts              # NEW: Checklist CRUD
│       ├── targets.ts                 # NEW: Targets CRUD (account-level)
│       ├── daily-notes.ts             # NEW: Account-level notes CRUD
│       └── asset-settings.ts          # NEW: Asset-specific settings CRUD
├── components/
│   ├── daily/
│   │   ├── index.ts                   # NEW: Barrel exports
│   │   ├── daily-content.tsx          # NEW: Client wrapper
│   │   │
│   │   │ # All Accounts Components
│   │   ├── all-accounts-summary.tsx   # NEW: Combined stats across accounts
│   │   ├── account-selector.tsx       # NEW: Dropdown to switch accounts
│   │   │
│   │   │ # Account-Level Components
│   │   ├── status-banner.tsx          # NEW: Account trading status
│   │   ├── account-metrics.tsx        # NEW: Account KPI row
│   │   ├── targets-progress.tsx       # NEW: Account progress bars
│   │   ├── checklist-card.tsx         # NEW: Account checklist
│   │   ├── checklist-form.tsx         # NEW: Add/edit checklist item
│   │   ├── emotional-state-card.tsx   # NEW: Account emotional tracking
│   │   │
│   │   │ # Asset-Specific Components
│   │   ├── asset-tabs.tsx             # NEW: Switch between assets
│   │   ├── asset-focus-strategy.tsx   # NEW: Strategy for asset
│   │   ├── asset-bias-card.tsx        # NEW: Bias for asset
│   │   ├── key-levels-card.tsx        # NEW: Support/resistance
│   │   ├── key-levels-form.tsx        # NEW: Edit key levels modal
│   │   ├── asset-trading-rules.tsx    # NEW: Rules for asset today
│   │   ├── asset-notes-card.tsx       # NEW: Asset-specific notes
│   │   │
│   │   │ # Shared Components
│   │   ├── intraday-equity-chart.tsx  # NEW: Today's equity (with asset filter)
│   │   ├── today-trades-table.tsx     # NEW: Today's trades (with asset filter)
│   │   ├── general-daily-notes.tsx    # NEW: Account-level notes editor
│   │   ├── comparison-table.tsx       # NEW: vs averages
│   │   ├── circuit-breaker-modal.tsx  # NEW: Warning/stop modal
│   │   └── date-navigator.tsx         # NEW: Day navigation
│   │
│   ├── layout/
│   │   └── sidebar.tsx                # UPDATE: Add Daily nav item
│   └── settings/
│       └── targets-settings.tsx       # NEW: Configure account daily targets
├── lib/
│   ├── calculations.ts                # UPDATE: Add daily calculations
│   └── validations/
│       ├── checklist.ts               # NEW: Checklist validation
│       ├── targets.ts                 # NEW: Targets validation
│       ├── daily-notes.ts             # NEW: Account notes validation
│       └── asset-settings.ts          # NEW: Asset settings validation
├── types/
│   └── index.ts                       # UPDATE: Add daily + asset settings types
├── scripts/
│   └── seed-checklists.sql            # NEW: Default checklist items
└── messages/
    ├── en.json                        # UPDATE: Add daily translations
    └── pt-BR.json                     # UPDATE: Add daily translations
```

---

### 12.12 Translation Keys to Add

```json
{
  "nav": {
    "daily": "Daily"
  },
  "daily": {
    "title": "Daily Trading",
    "date": "{date}",
    "yesterday": "Yesterday",
    "tomorrow": "Tomorrow",
    "today": "Today",

    "allAccounts": {
      "title": "All Accounts Summary",
      "combinedPnl": "Combined P&L",
      "totalTrades": "Total Trades",
      "overallWinRate": "Overall Win Rate",
      "noAccounts": "No trading accounts configured"
    },

    "account": {
      "selectAccount": "Select Account",
      "selectedAccount": "Selected Account"
    },

    "status": {
      "green": "Good to Trade",
      "yellow": "Caution",
      "red": "Stop Trading",
      "messages": {
        "allGood": "You're doing well! Stay disciplined.",
        "approachingLimit": "Approaching daily loss limit. Consider reducing size.",
        "lossStreak": "{count} consecutive losses. Take a break.",
        "limitReached": "Daily loss limit reached. Stop trading.",
        "targetReached": "Profit target reached! Consider stopping.",
        "timeUp": "Trading hours ended for today."
      }
    },

    "metrics": {
      "todayPnl": "Today P&L",
      "winRate": "Win Rate",
      "avgR": "Avg R",
      "trades": "Trades",
      "discipline": "Discipline",
      "vsAverage": "vs avg"
    },

    "targets": {
      "title": "Targets & Limits",
      "profitTarget": "Profit Target",
      "lossLimit": "Loss Limit",
      "tradesLimit": "Max Trades",
      "consecutiveLosses": "Consecutive Losses",
      "stopTime": "Stop Trading Time",
      "remaining": "remaining",
      "reached": "reached",
      "safe": "Safe"
    },

    "checklist": {
      "title": "Pre-Market Checklist",
      "completion": "Completion",
      "addItem": "Add item",
      "categories": {
        "mental": "Mental",
        "technical": "Technical",
        "market": "Market",
        "general": "General"
      }
    },

    "emotionalState": {
      "title": "Emotional State",
      "start": "Start",
      "current": "Current",
      "update": "Update",
      "states": {
        "calm": "Calm",
        "anxious": "Anxious",
        "confident": "Confident",
        "fearful": "Fearful",
        "neutral": "Neutral",
        "frustrated": "Frustrated"
      }
    },

    "assets": {
      "title": "Assets Being Traded Today",
      "addAsset": "Add Asset",
      "removeAsset": "Remove Asset",
      "noAssets": "No assets selected for today",
      "todayStats": "Today: {trades} trades, {pnl}"
    },

    "assetSettings": {
      "focusStrategy": {
        "title": "Focus Strategy",
        "noStrategy": "No focus strategy selected",
        "change": "Change Strategy",
        "select": "Select strategy for {asset}"
      },
      "bias": {
        "title": "Daily Bias",
        "change": "Change Bias",
        "values": {
          "bullish": "Bullish",
          "bearish": "Bearish",
          "neutral": "Neutral",
          "rangeBound": "Range Bound"
        },
        "notes": "Bias Notes"
      },
      "keyLevels": {
        "title": "Key Levels",
        "edit": "Edit Levels",
        "addLevel": "Add Level",
        "types": {
          "support": "Support",
          "resistance": "Resistance",
          "pivot": "Pivot",
          "vwap": "VWAP",
          "pdc": "PDC",
          "pdh": "PDH",
          "pdl": "PDL",
          "custom": "Custom"
        },
        "strength": {
          "strong": "Strong",
          "moderate": "Moderate",
          "weak": "Weak"
        },
        "price": "Price",
        "note": "Note"
      },
      "tradingRules": {
        "title": "Trading Rules",
        "edit": "Edit Rules",
        "placeholder": "Define your trading rules for this asset today..."
      },
      "notes": {
        "title": "Asset Notes",
        "preMarket": "Pre-Market Notes",
        "postMarket": "Post-Market Notes",
        "edit": "Edit Notes"
      }
    },

    "equity": {
      "title": "Intraday Equity",
      "allAssets": "All Assets",
      "filterByAsset": "Filter by asset"
    },

    "trades": {
      "title": "Today's Trades",
      "addTrade": "New Trade",
      "noTrades": "No trades today yet",
      "time": "Time",
      "asset": "Asset",
      "direction": "Dir",
      "strategy": "Strategy",
      "entry": "Entry",
      "exit": "Exit",
      "pnl": "P&L",
      "rMultiple": "R",
      "filterByAsset": "Filter by asset"
    },

    "generalNotes": {
      "title": "General Daily Notes",
      "preMarket": "Pre-Market",
      "postMarket": "Post-Market",
      "generalAnalysis": "General Market Analysis",
      "focusNotes": "Focus for Today",
      "review": "Post-Market Review",
      "lessons": "Lessons Learned",
      "tomorrowFocus": "Tomorrow's Focus",
      "dayRating": "Day Rating",
      "save": "Save",
      "autoSave": "Auto-save"
    },

    "comparison": {
      "title": "Comparison with Average",
      "metric": "Metric",
      "today": "Today",
      "dailyAvg": "Daily Avg",
      "weeklyAvg": "Weekly Avg",
      "vsAverage": "vs Average"
    },

    "circuitBreaker": {
      "warning": {
        "title": "Warning",
        "lossLimit": "You're at {percent}% of your daily loss limit",
        "consecutiveLosses": "You have {count} consecutive losses",
        "tradesLimit": "You've used {count} of {limit} trades"
      },
      "stop": {
        "title": "Stop Trading",
        "lossLimit": "Daily loss limit reached",
        "consecutiveLosses": "Maximum consecutive losses reached",
        "tradesLimit": "Maximum daily trades reached",
        "timeUp": "Trading hours ended"
      },
      "actions": {
        "continue": "Continue Trading",
        "stop": "Stop for Today",
        "reduceSize": "Reduce Size",
        "reviewTrades": "Review Trades",
        "override": "Override (not recommended)"
      },
      "recommendations": {
        "takeBreak": "Take a 15-30 minute break",
        "reduceSize": "Reduce position size for remaining trades",
        "reviewLosses": "Review recent losses for patterns",
        "stopTrading": "Consider stopping for today",
        "reviewJournal": "Review today's trades in the journal"
      }
    }
  },

  "settings": {
    "dailyTargets": {
      "title": "Daily Targets & Limits",
      "description": "Configure your daily trading limits and circuit breakers",
      "profitTarget": "Daily Profit Target",
      "profitTargetEnabled": "Enable profit target",
      "lossLimit": "Daily Loss Limit",
      "lossLimitEnabled": "Enable loss limit (recommended)",
      "maxTrades": "Maximum Daily Trades",
      "maxTradesEnabled": "Enable trade limit",
      "consecutiveLosses": "Max Consecutive Losses",
      "consecutiveLossesEnabled": "Enable consecutive loss limit",
      "stopTime": "Stop Trading Time",
      "stopTimeEnabled": "Enable stop time"
    }
  }
}
```

---

### Deliverables

#### Database & Schema
- [ ] `daily_checklists` table with default items
- [ ] `checklist_completions` tracking
- [ ] `daily_targets` table with account-level circuit breaker settings
- [ ] `daily_account_notes` table for account-level pre/post market notes
- [ ] `daily_asset_settings` table for asset-specific settings (strategy, bias, levels, rules)

#### All Accounts Features
- [ ] All accounts summary banner with combined P&L across accounts
- [ ] Quick stats per account in summary row
- [ ] Account selector dropdown

#### Account-Level Features
- [ ] Daily page as trading command center for selected account
- [ ] Real-time progress tracking against account targets
- [ ] Interactive pre-market checklist (account-level)
- [ ] Account circuit breaker warnings and stops
- [ ] Emotional state tracking (start/current)
- [ ] Day rating system
- [ ] General daily notes editor (account-level analysis)

#### Asset-Specific Features
- [ ] Asset tabs to switch between assets being traded today
- [ ] Focus strategy per asset
- [ ] Daily bias per asset (bullish/bearish/neutral/range-bound)
- [ ] Key levels management per asset (support/resistance/pivot/VWAP/PDC/PDH/PDL)
- [ ] Trading rules per asset for the day
- [ ] Asset-specific pre/post market notes
- [ ] Add/remove assets from today's trading list

#### Shared Features
- [ ] Intraday equity curve with asset filter option
- [ ] Today's trades table with asset filter option
- [ ] Comparison with historical averages
- [ ] Date navigation (previous/next day)

#### Settings & Configuration
- [ ] Settings page for account-level targets configuration
- [ ] Default checklist items seeding

#### Polish
- [ ] Full i18n support (pt-BR, en)
- [ ] Responsive design for all components
- [ ] Navigation sidebar integration (Daily as primary entry point)

---

## Phase 13: Monte Carlo Strategy Simulator ✅ COMPLETE

**Goal:** Build a comprehensive Monte Carlo simulator that allows traders to stress-test their strategies using either their actual historical trading data (auto-populated from selected strategy) or manual inputs. The simulator runs thousands of randomized trade sequences to understand the range of possible outcomes, calculate risk metrics, and provide actionable position sizing recommendations.

---

### 13.1 Problem Statement

Traders need to understand the statistical robustness of their strategies:

1. **Uncertainty in Future Performance** - Past performance doesn't guarantee future results
   - "What's the range of outcomes I can expect?"
   - "What's the worst-case scenario I should prepare for?"
   - "How likely is my strategy to blow up?"

2. **Risk Management Validation** - Proper position sizing is critical
   - "Am I risking too much per trade?"
   - "What's the optimal Kelly Criterion for my strategy?"
   - "How much drawdown should I expect?"

3. **Strategy Comparison** - Compare different approaches objectively
   - "Is my new strategy better than my old one?"
   - "What if I improved my win rate by 5%?"
   - "How does commission impact my long-term results?"

4. **Psychological Preparation** - Knowing the statistics helps maintain discipline
   - "How many consecutive losses should I expect?"
   - "Is a 10-trade losing streak normal for my strategy?"
   - "When should I be concerned about my strategy failing?"

---

### 13.2 Feature Overview

#### Data Scope

The Monte Carlo simulator respects the global account selection and "show all accounts" flag:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           STRATEGY SELECTION OPTIONS                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  DEFAULT MODE (Single Account Selected):                                         │
│  ───────────────────────────────────────                                        │
│  Uses the currently selected account from the global account selector.           │
│                                                                                  │
│  Strategy Options:                                                               │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ • Individual Strategy  - Test a specific strategy's metrics                 │ │
│  │ • All Strategies       - Combined metrics from ALL strategies in account    │ │
│  │                         "If I keep trading at this overall pace, will I     │ │
│  │                          survive?" - Tests your general trading edge        │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  UNIVERSAL MODE (Show All Accounts Flag = TRUE):                                │
│  ───────────────────────────────────────────────                                │
│  When user has enabled "show reports from all accounts" in settings.            │
│                                                                                  │
│  Additional Strategy Option:                                                     │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ • All Accounts + All Strategies                                             │ │
│  │   Universal simulation combining metrics from EVERY account and strategy.   │ │
│  │   "What if I keep doing exactly what I've been doing across all my          │ │
│  │    accounts? What's my overall trading edge?"                               │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Input Mode Selection

**Mode 1: Auto-Populate from Strategy/Account Data**
- System uses the currently selected account (no account dropdown)
- Select data source:
  - **Individual Strategy** - Specific strategy from current account
  - **All Strategies (Account)** - Combined metrics from all strategies in current account
  - **All Accounts + All Strategies** - Universal metrics (only if "show all accounts" enabled)
- System automatically calculates:
  - Win rate from actual trades
  - Average reward/risk ratio from actual trades
  - Average commission impact
  - Actual number of trades as reference
- User can adjust parameters or use them as-is

**Mode 2: Manual Entry**
- Enter all parameters manually for hypothetical testing
- Useful for testing new strategy ideas before trading them

#### Strategy Comparison Mode (when "Show All Accounts" enabled)

When the user has "show reports from all accounts" enabled, an additional **Compare Strategies** toggle appears. When enabled:

1. **Runs simulation for EACH strategy independently** (not combined)
2. **Shows side-by-side comparison table** with key metrics
3. **Highlights best/worst performers** in each category
4. **Helps identify which strategies are statistically more robust**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ☑ Compare Strategies                                                           │
│                                                                                  │
│  Run Monte Carlo simulation on each strategy individually and compare results.  │
│  This helps identify which strategies have the strongest statistical edge.      │
│                                                                                  │
│  Strategies to compare: 5 strategies (from current account)                     │
│                    or   12 strategies (from all accounts - if universal)        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Comparison Output:**
- Side-by-side table comparing all strategies
- Ranking by key metrics (profitability %, Sharpe, max DD, etc.)
- Visual indicators (🥇🥈🥉) for top performers
- Recommendation on which strategies to focus on

#### Input Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| Initial Balance | Starting account balance | $10,000 |
| Risk Type | Percentage or Fixed amount | Percentage |
| Risk Per Trade | How much to risk per trade | 1% |
| Win Rate | Probability of winning a trade | 55% |
| Reward/Risk Ratio | Average winner / Average loser | 1.5 |
| Number of Trades | Trades to simulate per run | 100 |
| Commission per Trade | Commission as % of risk | 0.1% |
| Monte Carlo Simulations | Number of simulation runs | 1,000 |

#### Output Visualizations

1. **Total Return Progression** - Equity curve showing balance over time
2. **Drawdown Progression** - Underwater chart showing drawdowns
3. **Distribution of Outcomes** - Histogram of final balances across simulations
4. **Trade-by-Trade View** - Sample sequence of simulated trades

#### Output Metrics

1. **Balance Summary**
   - Initial Balance
   - Final Balance (median)
   - Total Return %
   - Trade Profit
   - Total Commission

2. **Risk-Adjusted Metrics**
   - Sharpe Ratio
   - Sortino Ratio
   - Calmar Ratio

3. **Performance Metrics**
   - Profit Factor
   - Best Trade
   - Worst Trade
   - R-Multiple
   - Position Impact

4. **Drawdown Analysis**
   - Max Drawdown
   - Average Drawdown
   - Recovery Time (trades)
   - Underwater Time %
   - Valley-to-Peak (trades)

5. **Streak Statistics**
   - Max Wins in Row
   - Max Losses in Row
   - Average Win Streak
   - Average Loss Streak

6. **Kelly Criterion Calculator**
   - Full Kelly (Aggressive)
   - Half Kelly (Balanced)
   - Quarter Kelly (Conservative)
   - Expected Return Per Trade
   - Recommendation message

7. **Strategy Analysis Summary**
   - Monte Carlo outcome percentages
   - Best/Average/Worst case scenarios
   - Probability of profitability
   - Risk assessment with ratings
   - Psychology insights (handling losing streaks)
   - Position sizing recommendations
   - Strategy improvement suggestions

---

### 13.3 Monte Carlo Simulation Algorithm

```typescript
interface SimulationParams {
  initialBalance: number
  riskType: 'percentage' | 'fixed'
  riskPerTrade: number      // % or $ based on riskType
  winRate: number           // 0-100
  rewardRiskRatio: number   // e.g., 1.5 means winners are 1.5x losers
  numberOfTrades: number
  commissionPerTrade: number // % of risk
  simulationCount: number   // Number of Monte Carlo runs
}

interface SimulatedTrade {
  tradeNumber: number
  isWin: boolean
  pnl: number
  commission: number
  balanceAfter: number
  drawdown: number
  drawdownPercent: number
}

interface SimulationRun {
  runId: number
  trades: SimulatedTrade[]
  finalBalance: number
  totalReturn: number
  totalReturnPercent: number
  maxDrawdown: number
  maxDrawdownPercent: number
  totalCommission: number
  winCount: number
  lossCount: number
  maxWinStreak: number
  maxLossStreak: number
  peakBalance: number
  underwaterTrades: number
}

interface MonteCarloResult {
  params: SimulationParams
  runs: SimulationRun[]
  
  // Aggregated statistics across all runs
  statistics: {
    // Balance outcomes
    medianFinalBalance: number
    meanFinalBalance: number
    bestCaseFinalBalance: number    // 95th percentile
    worstCaseFinalBalance: number   // 5th percentile
    
    // Return outcomes
    medianReturn: number
    meanReturn: number
    bestCaseReturn: number
    worstCaseReturn: number
    
    // Drawdown statistics
    medianMaxDrawdown: number
    meanMaxDrawdown: number
    worstMaxDrawdown: number
    
    // Profitability
    profitablePct: number           // % of simulations that were profitable
    ruinPct: number                 // % that hit ruin (e.g., lost 50%+)
    
    // Risk-adjusted
    sharpeRatio: number
    sortinoRatio: number
    calmarRatio: number
    
    // Performance
    profitFactor: number
    expectedValuePerTrade: number
    
    // Streaks
    expectedMaxWinStreak: number
    expectedMaxLossStreak: number
    avgWinStreak: number
    avgLossStreak: number
    
    // Kelly Criterion
    kellyFull: number
    kellyHalf: number
    kellyQuarter: number
    kellyRecommendation: string
    
    // Recovery
    avgRecoveryTrades: number
    avgUnderwaterPercent: number
  }
  
  // Histogram data for distribution chart
  distributionBuckets: Array<{
    rangeStart: number
    rangeEnd: number
    count: number
    percentage: number
  }>
  
  // Sample run for detailed view (median outcome)
  sampleRun: SimulationRun
}

const runMonteCarloSimulation = (params: SimulationParams): MonteCarloResult => {
  const runs: SimulationRun[] = []
  
  for (let i = 0; i < params.simulationCount; i++) {
    const run = simulateSingleRun(params, i)
    runs.push(run)
  }
  
  return aggregateResults(params, runs)
}

const simulateSingleRun = (params: SimulationParams, runId: number): SimulationRun => {
  let balance = params.initialBalance
  let peakBalance = balance
  const trades: SimulatedTrade[] = []
  let winCount = 0
  let lossCount = 0
  let currentWinStreak = 0
  let currentLossStreak = 0
  let maxWinStreak = 0
  let maxLossStreak = 0
  let underwaterTrades = 0
  let totalCommission = 0
  
  for (let t = 0; t < params.numberOfTrades; t++) {
    // Determine risk amount for this trade
    const riskAmount = params.riskType === 'percentage'
      ? balance * (params.riskPerTrade / 100)
      : Math.min(params.riskPerTrade, balance)
    
    // Calculate commission
    const commission = riskAmount * (params.commissionPerTrade / 100)
    totalCommission += commission
    
    // Determine win or loss (random based on win rate)
    const isWin = Math.random() * 100 < params.winRate
    
    // Calculate P&L
    let pnl: number
    if (isWin) {
      pnl = riskAmount * params.rewardRiskRatio - commission
      winCount++
      currentWinStreak++
      currentLossStreak = 0
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
    } else {
      pnl = -riskAmount - commission
      lossCount++
      currentLossStreak++
      currentWinStreak = 0
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
    }
    
    // Update balance
    balance += pnl
    balance = Math.max(0, balance) // Can't go negative
    
    // Track peak and drawdown
    peakBalance = Math.max(peakBalance, balance)
    const drawdown = peakBalance - balance
    const drawdownPercent = peakBalance > 0 ? (drawdown / peakBalance) * 100 : 0
    
    // Track underwater time
    if (balance < peakBalance) {
      underwaterTrades++
    }
    
    trades.push({
      tradeNumber: t + 1,
      isWin,
      pnl,
      commission,
      balanceAfter: balance,
      drawdown,
      drawdownPercent
    })
    
    // Check for ruin (optional early exit)
    if (balance <= 0) break
  }
  
  const maxDrawdownTrade = trades.reduce((max, t) => 
    t.drawdownPercent > max.drawdownPercent ? t : max
  , trades[0])
  
  return {
    runId,
    trades,
    finalBalance: balance,
    totalReturn: balance - params.initialBalance,
    totalReturnPercent: ((balance - params.initialBalance) / params.initialBalance) * 100,
    maxDrawdown: maxDrawdownTrade?.drawdown || 0,
    maxDrawdownPercent: maxDrawdownTrade?.drawdownPercent || 0,
    totalCommission,
    winCount,
    lossCount,
    maxWinStreak,
    maxLossStreak,
    peakBalance,
    underwaterTrades
  }
}

// Kelly Criterion calculation
const calculateKellyCriterion = (winRate: number, rewardRiskRatio: number): number => {
  // Kelly % = W - (1-W)/R
  // Where W = win probability, R = reward/risk ratio
  const W = winRate / 100
  const R = rewardRiskRatio
  return W - ((1 - W) / R)
}
```

---

### 13.4 Auto-Population from Data Source

```typescript
// Data source types
type DataSource =
  | { type: 'strategy'; strategyId: string }           // Individual strategy
  | { type: 'all_strategies' }                          // All strategies in current account
  | { type: 'universal' }                               // All accounts + all strategies

interface SourceStats {
  sourceType: DataSource['type']
  sourceName: string                                    // "Breakout - 15min" or "All Strategies" or "Universal"

  // Calculated from actual trades
  totalTrades: number
  winRate: number
  avgRewardRiskRatio: number
  avgRiskPerTrade: number      // as % of account
  avgCommissionImpact: number  // as % of risk

  // Additional context
  dateRange: { from: Date; to: Date }
  profitFactor: number
  avgR: number

  // Multi-source context (for all_strategies and universal)
  strategiesCount?: number
  accountsCount?: number       // Only for universal
  strategiesBreakdown?: Array<{
    name: string
    tradesCount: number
    winRate: number
  }>
}

/**
 * Get stats for simulation based on selected data source.
 * Uses the currently selected account (from global context) unless universal mode.
 */
const getSimulationStats = async (
  currentAccountId: string,       // From global account selector
  source: DataSource,
  showAllAccountsEnabled: boolean // User setting
): Promise<SourceStats> => {

  let trades: Trade[] = []
  let sourceName = ''
  let strategiesCount = 0
  let accountsCount = 1

  switch (source.type) {
    case 'strategy':
      // Individual strategy from current account
      trades = await getTradesByStrategy(currentAccountId, source.strategyId)
      const strategy = await getStrategy(source.strategyId)
      sourceName = strategy?.name || 'Unknown Strategy'
      strategiesCount = 1
      break

    case 'all_strategies':
      // All strategies from current account - "If I keep this pace, will I break?"
      trades = await getAllTradesForAccount(currentAccountId)
      sourceName = 'All Strategies'
      const strategies = await getStrategiesForAccount(currentAccountId)
      strategiesCount = strategies.length
      break

    case 'universal':
      // All accounts + all strategies - requires showAllAccountsEnabled
      if (!showAllAccountsEnabled) {
        throw new Error('Universal mode requires "show all accounts" to be enabled')
      }
      trades = await getAllTradesForUser() // All trades across all accounts
      sourceName = 'All Accounts + All Strategies'
      const allAccounts = await getAllAccounts()
      accountsCount = allAccounts.length
      const allStrategies = await getAllStrategies()
      strategiesCount = allStrategies.length
      break
  }

  if (trades.length === 0) {
    throw new Error(`No trades found for ${sourceName}`)
  }

  // Calculate stats (same logic for all sources)
  const wins = trades.filter(t => t.outcome === 'win')
  const winRate = (wins.length / trades.length) * 100

  // Calculate average R (reward/risk ratio)
  const tradesWithR = trades.filter(t => t.rMultiple !== null)
  const avgWinR = tradesWithR
    .filter(t => t.rMultiple > 0)
    .reduce((sum, t) => sum + t.rMultiple, 0) / wins.length || 0
  const avgLossR = Math.abs(tradesWithR
    .filter(t => t.rMultiple < 0)
    .reduce((sum, t) => sum + t.rMultiple, 0) / (trades.length - wins.length)) || 1
  const avgRewardRiskRatio = avgWinR / avgLossR

  // Calculate commission impact
  const totalCommission = trades.reduce((sum, t) => sum + (t.commission || 0), 0)
  const totalRisk = trades.reduce((sum, t) => sum + (t.riskAmount || 0), 0)
  const avgCommissionImpact = totalRisk > 0 ? (totalCommission / totalRisk) * 100 : 0

  // Build strategies breakdown for multi-strategy sources
  const strategiesBreakdown = source.type !== 'strategy'
    ? Object.values(
        trades.reduce((acc, t) => {
          const name = t.strategy?.name || 'No Strategy'
          if (!acc[name]) {
            acc[name] = { name, tradesCount: 0, wins: 0 }
          }
          acc[name].tradesCount++
          if (t.outcome === 'win') acc[name].wins++
          return acc
        }, {} as Record<string, { name: string; tradesCount: number; wins: number }>)
      ).map(s => ({
        name: s.name,
        tradesCount: s.tradesCount,
        winRate: (s.wins / s.tradesCount) * 100
      }))
    : undefined

  return {
    sourceType: source.type,
    sourceName,
    totalTrades: trades.length,
    winRate,
    avgRewardRiskRatio,
    avgRiskPerTrade: 1, // Default, would need account history for accurate %
    avgCommissionImpact,
    dateRange: {
      from: trades[trades.length - 1].entryDate,
      to: trades[0].entryDate
    },
    profitFactor: calculateProfitFactor(trades),
    avgR: tradesWithR.reduce((sum, t) => sum + t.rMultiple, 0) / tradesWithR.length,
    strategiesCount,
    accountsCount: source.type === 'universal' ? accountsCount : undefined,
    strategiesBreakdown
  }
}
```

---

### 13.5 Backend Tasks

#### Simulation Actions (`src/app/actions/monte-carlo.ts`)

- [ ] `getSimulationStats()` - Fetch stats for any data source (strategy, all strategies, universal)
- [ ] `getDataSourceOptions()` - List available data sources for current context
  - Individual strategies from current account
  - "All Strategies" option (always available)
  - "Universal" option (only if showAllAccounts enabled)
- [ ] `runSimulation()` - Execute Monte Carlo simulation (server-side for heavy computation)
- [ ] `runComparisonSimulation()` - Run simulations for ALL strategies and return comparison results
  - Runs simulation for each strategy individually
  - Returns array of results with rankings
  - Generates recommendations and suggested allocations
- [ ] `saveSimulationResult()` - Optionally save simulation for later reference
- [ ] `saveComparisonResult()` - Save comparison results for later reference
- [ ] `getSavedSimulations()` - List saved simulations
- [ ] `deleteSimulation()` - Remove saved simulation

#### Stats Helper Actions (`src/app/actions/strategy-stats.ts`)

- [ ] `getAllTradesForAccount()` - Get all trades for selected account
- [ ] `getAllTradesForUser()` - Get all trades across all accounts (for universal)
- [ ] `getStrategiesBreakdown()` - Win rate breakdown by strategy
- [ ] `getStrategyPerformanceMetrics()` - Detailed strategy metrics
- [ ] `getStrategyTradeDistribution()` - Distribution of R-multiples

---

### 13.6 Frontend - Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Monte Carlo Strategy Simulator                                          [?] Help│
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─ INPUT MODE ────────────────────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  ○ Auto-populate from Strategy    ● Manual Entry                            ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─ DATA SOURCE (if Auto mode) ────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  Current Account: Personal Account                   (change in sidebar)    ││
│  │                                                                              ││
│  │  Data Source: [─────────────────────────────────────────────────────── ▼]   ││
│  │               │ ○ Breakout - 15min (Individual Strategy)               │    ││
│  │               │ ○ Mean Reversion - 5min (Individual Strategy)          │    ││
│  │               │ ○ Scalping - 1min (Individual Strategy)                │    ││
│  │               │ ─────────────────────────────────────────────────────  │    ││
│  │               │ ● All Strategies (Account-wide metrics)                │    ││
│  │               │   "Test your overall trading edge"                     │    ││
│  │               │ ─────────────────────────────────────────────────────  │    ││
│  │               │ ○ All Accounts + All Strategies (Universal)  🌐        │    ││
│  │               │   "Test your complete trading profile"                 │    ││
│  │               │   (only if "show all accounts" enabled)                │    ││
│  │               └────────────────────────────────────────────────────────┘    ││
│  │                                                                              ││
│  │  ┌─ Stats Preview ───────────────────────────────────────────────────────┐  ││
│  │  │ All Strategies - Based on 342 trades (Jan 2024 - Jan 2025)           │  ││
│  │  │ Across 5 strategies                                                   │  ││
│  │  │                                                                        │  ││
│  │  │ Win Rate: 54%  │  Avg R:R: 1.42  │  Profit Factor: 1.67               │  ││
│  │  │                                                                        │  ││
│  │  │ [Use These Stats]  [Customize]                                        │  ││
│  │  └────────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─ SIMULATION PARAMETERS ─────────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                            ││
│  │  │ Initial    │  │ Risk Type  │  │ Risk Per   │                            ││
│  │  │ Balance    │  │            │  │ Trade      │                            ││
│  │  │ $10,000    │  │ Percentage▼│  │ 1%         │                            ││
│  │  └────────────┘  └────────────┘  └────────────┘                            ││
│  │                                                                              ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                            ││
│  │  │ Win Rate   │  │ Reward/    │  │ Number of  │                            ││
│  │  │ (%)        │  │ Risk Ratio │  │ Trades     │                            ││
│  │  │ 58         │  │ 1.35       │  │ 100        │                            ││
│  │  └────────────┘  └────────────┘  └────────────┘                            ││
│  │                                                                              ││
│  │  ┌────────────────────────────┐  ┌─────────────────────────────────────┐   ││
│  │  │ Commission per Trade (%)   │  │ Monte Carlo Simulations             │   ││
│  │  │ 0.1                        │  │ 1000                                │   ││
│  │  └────────────────────────────┘  └─────────────────────────────────────┘   ││
│  │                                                                              ││
│  │                        [ 🎲 CALCULATE RESULTS ]                             ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════
                              RESULTS (After Calculation)
═══════════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│  ┌─ EXPECTED RESULTS ──────────────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  ┌─ Total Return Progression ────────────────────────────────────────────┐  ││
│  │  │        25% │                                          ___----````       │  ││
│  │  │        20% │                               ___----````                  │  ││
│  │  │        15% │                    ___----````                             │  ││
│  │  │        10% │         ___----````                                        │  ││
│  │  │         5% │___----``                                                   │  ││
│  │  │         0% │────────────────────────────────────────────────────────    │  ││
│  │  │        -5% │                                                            │  ││
│  │  │            └────────────────────────────────────────────────────────    │  ││
│  │  │             0    10   20   30   40   50   60   70   80   90  100        │  ││
│  │  │                              Trade Number                               │  ││
│  │  └────────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                              ││
│  │  ┌─ Drawdown Progression ────────────────────────────────────────────────┐  ││
│  │  │         0% │──────────────────────────────────────────────────────────  │  ││
│  │  │         2% │    ````---___                                             │  ││
│  │  │         4% │              ```---___                  ___---```          │  ││
│  │  │         6% │                       ```---___    ___---                  │  ││
│  │  │         8% │                                ```---                      │  ││
│  │  │        10% │                                   ````---___               │  ││
│  │  │            └────────────────────────────────────────────────────────    │  ││
│  │  │             0    10   20   30   40   50   60   70   80   90  100        │  ││
│  │  └────────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                              ││
│  │  ┌─ Distribution of Possible Outcomes ───────────────────────────────────┐  ││
│  │  │                                                                        │  ││
│  │  │   Frequency                                                            │  ││
│  │  │      100 │                    ████                                     │  ││
│  │  │       80 │                 ████████                                    │  ││
│  │  │       60 │              ██████████████                                 │  ││
│  │  │       40 │           ████████████████████                              │  ││
│  │  │       20 │        ████████████████████████████                         │  ││
│  │  │          └────────────────────────────────────────────────────────     │  ││
│  │  │           $8k    $9k    $10k   $11k   $12k   $13k   $14k              │  ││
│  │  │                          Final Balance                                 │  ││
│  │  └────────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─ AVERAGE CASE SCENARIO - Trade Details ─────────────────────────────────────┐│
│  │                                                                              ││
│  │  ┌─ Balance Summary ────┐  ┌─ Risk-Adjusted ────┐  ┌─ Performance ────────┐ ││
│  │  │                      │  │                    │  │                      │ ││
│  │  │ Initial: $10,000     │  │ Sharpe: 2.85       │  │ Profit Factor: 1.87  │ ││
│  │  │ Final: $12,340       │  │ Sortino: 2.91      │  │ Best Trade: $185     │ ││
│  │  │ Return: +23.4%       │  │ Calmar: 6.12       │  │ Worst Trade: -$137   │ ││
│  │  │ Profit: $2,340       │  │                    │  │ R-Multiple: 0.35     │ ││
│  │  │ Commission: $45      │  │                    │  │                      │ ││
│  │  │                      │  │                    │  │                      │ ││
│  │  └──────────────────────┘  └────────────────────┘  └──────────────────────┘ ││
│  │                                                                              ││
│  │  ┌─ Drawdown Analysis ──┐  ┌─ Streak Stats ─────┐  ┌─ Kelly Criterion ────┐ ││
│  │  │                      │  │                    │  │                      │ ││
│  │  │ Max DD: 8.5%         │  │ Max Wins: 7        │  │ Full Kelly: 18.5%    │ ││
│  │  │ Avg DD: 3.2%         │  │ Max Losses: 5      │  │ Half Kelly: 9.25%    │ ││
│  │  │ Recovery: 12 trades  │  │ Avg Win Streak: 2.1│  │ Quarter Kelly: 4.6%  │ ││
│  │  │ Underwater: 45%      │  │ Avg Loss Streak: 1.4│ │                      │ ││
│  │  │ V-to-P: 8 trades     │  │                    │  │ ⚠️ Use Quarter Kelly │ ││
│  │  │                      │  │                    │  │                      │ ││
│  │  └──────────────────────┘  └────────────────────┘  └──────────────────────┘ ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─ SAMPLE TRADE SEQUENCE (Average Case) ──────────────────────────────────────┐│
│  │                                                                              ││
│  │  #1  │ 🟢 Win  │ +$135   │ Commission: $1.35   │ Balance: $10,135          ││
│  │  #2  │ 🔴 Loss │ -$101   │ Commission: $1.01   │ Balance: $10,034          ││
│  │  #3  │ 🟢 Win  │ +$136   │ Commission: $1.36   │ Balance: $10,169          ││
│  │  #4  │ 🟢 Win  │ +$138   │ Commission: $1.38   │ Balance: $10,306          ││
│  │  #5  │ 🔴 Loss │ -$103   │ Commission: $1.03   │ Balance: $10,203          ││
│  │  ... │         │         │                      │                           ││
│  │                                                                              ││
│  │  [Show All Trades]                                                          ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─ TRADING STRATEGY ANALYSIS ─────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  📊 Monte Carlo Simulation Analysis                                         ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │  Based on 1000 simulations of your strategy:                                ││
│  │                                                                              ││
│  │  • Average Return: 23.4% (Max DD: 8.5%) - This is your most likely outcome ││
│  │  • Best Case: 52.3% (Max DD: 4.2%) - Achieved in top 5% of simulations     ││
│  │  • Worst Case: -12.5% (Max DD: 18.2%) - Your maximum downside risk         ││
│  │                                                                              ││
│  │  ✅ 89% of all simulations were profitable, indicating a robust strategy.  ││
│  │                                                                              ││
│  │  💡 Tip: A reliable strategy should be profitable in at least 70% of sims. ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │                                                                              ││
│  │  💰 Balance and Returns Analysis                                            ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │  Starting with $10,000, your strategy shows:                                ││
│  │                                                                              ││
│  │  • Expected Profit: $2,340 (23.4% return)                                   ││
│  │  • Commission Impact: $45 (1.9% of profits)                                 ││
│  │                                                                              ││
│  │  ✅ Commission costs are well-managed relative to profits.                  ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │                                                                              ││
│  │  ⚠️ Risk Analysis                                                           ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │  Your risk metrics indicate:                                                ││
│  │                                                                              ││
│  │  • Maximum Drawdown: 8.5% - ✅ Well-controlled                              ││
│  │  • Sharpe Ratio: 2.85 - ✅ Excellent risk-adjusted returns                  ││
│  │  • Sortino Ratio: 2.91 - ✅ Strong downside risk management                 ││
│  │  • Calmar Ratio: 6.12 - ✅ Exceptional return relative to risk              ││
│  │                                                                              ││
│  │  💡 Your strategy's risk-adjusted performance is excellent.                 ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │                                                                              ││
│  │  🧠 Trading Psychology                                                       ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │  Psychological factors to consider:                                         ││
│  │                                                                              ││
│  │  • Win Rate: 58% - Solid performance                                        ││
│  │  • Longest Win Streak: 7 trades                                             ││
│  │  • Longest Loss Streak: 5 trades                                            ││
│  │                                                                              ││
│  │  💡 Can you maintain discipline during a 5-trade losing streak?             ││
│  │     This is crucial for success.                                            ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │                                                                              ││
│  │  ✏️ Position Sizing Recommendations                                          ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │  Based on the Kelly Criterion:                                              ││
│  │                                                                              ││
│  │  • Full Kelly (Aggressive): 18.5% per trade                                 ││
│  │  • Half Kelly (Balanced): 9.25% per trade                                   ││
│  │  • Quarter Kelly (Conservative): 4.6% per trade                             ││
│  │                                                                              ││
│  │  Recommended Quarter Kelly position sizes:                                   ││
│  │  • $10,000 account: Risk $460 per trade                                     ││
│  │  • $25,000 account: Risk $1,150 per trade                                   ││
│  │  • $50,000 account: Risk $2,300 per trade                                   ││
│  │                                                                              ││
│  │  💡 Risk Management Guidelines:                                              ││
│  │  • New Traders: Start with 1% risk maximum                                  ││
│  │  • Prop Firm Accounts: Keep risk at 0.5% or lower                          ││
│  │  • Experienced Traders: Can gradually increase to 1-2%                      ││
│  │  • Never exceed Quarter Kelly regardless of experience level                ││
│  │                                                                              ││
│  │  ✅ Your current 1% risk is reasonable for capital preservation.            ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │                                                                              ││
│  │  🎯 Strategy Improvements                                                    ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │  Key areas for optimization:                                                ││
│  │                                                                              ││
│  │  • ⏱️ Reduce Underwater Time: Look for better entry/exit criteria          ││
│  │  • 📈 Improve Reward/Risk: Focus on letting winners run longer             ││
│  │                                                                              ││
│  │  💡 Remember: The best strategy is one you can execute consistently         ││
│  │     with confidence.                                                        ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│                    [💾 Save Simulation]  [📤 Export PDF]  [🔄 Run Again]         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Strategy Comparison Results (when Compare Mode enabled)

```
═══════════════════════════════════════════════════════════════════════════════════
                    STRATEGY COMPARISON (When Compare Mode Enabled)
═══════════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────────┐
│ Strategy Comparison Results                           Based on 1000 simulations │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Comparing 5 strategies from Personal Account                                   │
│                                                                                  │
│  ┌─ COMPARISON TABLE ──────────────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  Strategy          Trades  Win%   R:R    Profit%  MaxDD   Sharpe  Rank     ││
│  │  ───────────────────────────────────────────────────────────────────────    ││
│  │  🥇 Breakout 15m    127    58%   1.35   +32.4%   8.5%    2.85    #1       ││
│  │  🥈 Mean Rev. 5m     89    62%   1.12   +24.1%   6.2%    2.41    #2       ││
│  │  🥉 Scalping 1m     234    71%   0.85   +18.7%   4.8%    2.12    #3       ││
│  │     Range Break      45    52%   1.65   +15.2%  12.1%    1.54    #4       ││
│  │     Counter-trend    32    44%   2.10    -8.5%  18.3%    0.42    #5       ││
│  │                                                                              ││
│  │  Legend: 🟢 Best in category  🔴 Worst in category                          ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─ DETAILED METRICS COMPARISON ───────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  ┌─ Profitability (% of simulations profitable) ────────────────────────┐   ││
│  │  │                                                                       │   ││
│  │  │  Breakout 15m    ████████████████████████████████████████████░░░ 89%  │   ││
│  │  │  Mean Rev. 5m    █████████████████████████████████████████░░░░░░ 84%  │   ││
│  │  │  Scalping 1m     ████████████████████████████████████░░░░░░░░░░░ 78%  │   ││
│  │  │  Range Break     █████████████████████████████░░░░░░░░░░░░░░░░░░ 65%  │   ││
│  │  │  Counter-trend   ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 32%  │   ││
│  │  │                                                                       │   ││
│  │  └───────────────────────────────────────────────────────────────────────┘   ││
│  │                                                                              ││
│  │  ┌─ Risk-Adjusted Returns (Sharpe Ratio) ───────────────────────────────┐   ││
│  │  │                                                                       │   ││
│  │  │  Breakout 15m    ████████████████████████████████████████████ 2.85   │   ││
│  │  │  Mean Rev. 5m    ████████████████████████████████████░░░░░░░░ 2.41   │   ││
│  │  │  Scalping 1m     █████████████████████████████████░░░░░░░░░░░ 2.12   │   ││
│  │  │  Range Break     ██████████████████████████░░░░░░░░░░░░░░░░░░ 1.54   │   ││
│  │  │  Counter-trend   ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0.42   │   ││
│  │  │                                                                       │   ││
│  │  └───────────────────────────────────────────────────────────────────────┘   ││
│  │                                                                              ││
│  │  ┌─ Maximum Drawdown (lower is better) ─────────────────────────────────┐   ││
│  │  │                                                                       │   ││
│  │  │  Scalping 1m     ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 4.8% 🟢│   ││
│  │  │  Mean Rev. 5m    ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 6.2%   │   ││
│  │  │  Breakout 15m    ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 8.5%   │   ││
│  │  │  Range Break     ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 12.1%  │   ││
│  │  │  Counter-trend   ██████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░ 18.3% 🔴│   ││
│  │  │                                                                       │   ││
│  │  └───────────────────────────────────────────────────────────────────────┘   ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─ RECOMMENDATIONS ───────────────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  📊 Analysis Summary                                                         ││
│  │  ───────────────────────────────────────────────────────                    ││
│  │                                                                              ││
│  │  🏆 Top Performers:                                                          ││
│  │  • Breakout 15m - Best overall returns with acceptable drawdown             ││
│  │  • Mean Reversion 5m - Excellent balance of returns and low drawdown        ││
│  │                                                                              ││
│  │  ⚠️ Needs Improvement:                                                       ││
│  │  • Counter-trend - Only 32% profitable simulations, consider pausing        ││
│  │    this strategy until parameters are refined                               ││
│  │                                                                              ││
│  │  💡 Suggested Focus:                                                         ││
│  │  Based on Monte Carlo analysis, consider allocating more capital to         ││
│  │  "Breakout 15m" and "Mean Reversion 5m" strategies, while reducing          ││
│  │  exposure to "Counter-trend" until its edge improves.                       ││
│  │                                                                              ││
│  │  📈 Portfolio Suggestion (by statistical robustness):                        ││
│  │  • Breakout 15m: 35% allocation                                             ││
│  │  • Mean Reversion 5m: 30% allocation                                        ││
│  │  • Scalping 1m: 25% allocation                                              ││
│  │  • Range Break: 10% allocation                                              ││
│  │  • Counter-trend: 0% (pause until improved)                                 ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─ INDIVIDUAL STRATEGY DETAILS ───────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  [Breakout 15m ▼]  [Mean Rev. 5m]  [Scalping 1m]  [Range Break]  [Counter]  ││
│  │   ═══════════════                                                            ││
│  │                                                                              ││
│  │  (Shows full simulation results for selected strategy - same as single      ││
│  │   strategy view with all charts, metrics, and analysis)                     ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│          [📤 Export Comparison PDF]  [📊 Export to CSV]  [🔄 Run Again]          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 13.7 Frontend Components

#### Input Components (`src/components/monte-carlo/`)

**Input Mode Selector**
```typescript
interface InputModeSelectorProps {
  mode: 'auto' | 'manual'
  onModeChange: (mode: 'auto' | 'manual') => void
}
```

**Data Source Selector**
```typescript
type DataSource =
  | { type: 'strategy'; strategyId: string }           // Individual strategy
  | { type: 'all_strategies' }                          // All strategies in current account
  | { type: 'universal' }                               // All accounts + all strategies

interface DataSourceSelectorProps {
  strategies: Strategy[]                                // Strategies from current account
  selectedSource: DataSource
  onSourceChange: (source: DataSource) => void
  showUniversalOption: boolean                          // Based on "show all accounts" flag
  sourceStats: SourceStats | null                       // Stats for selected source
  isLoading: boolean
}

interface SourceStats {
  sourceType: DataSource['type']
  sourceName: string                                    // "Breakout - 15min" or "All Strategies" or "Universal"
  totalTrades: number
  winRate: number
  avgRewardRiskRatio: number
  avgCommissionImpact: number
  dateRange: { from: Date; to: Date }
  profitFactor: number
  avgR: number
  // For "all_strategies" and "universal", also include:
  strategiesCount?: number
  accountsCount?: number                                // Only for universal
}
```

**Strategy Stats Preview**
```typescript
interface StrategyStatsPreviewProps {
  stats: StrategyStats
  onUseStats: () => void
  onCustomize: () => void
}
```

**Simulation Parameters Form**
```typescript
interface SimulationParamsFormProps {
  params: SimulationParams
  onChange: (params: SimulationParams) => void
  isAutoPopulated: boolean
  onReset: () => void
}
```

#### Result Components (`src/components/monte-carlo/`)

**Equity Curve Chart**
```typescript
interface EquityCurveChartProps {
  trades: SimulatedTrade[]
  showPercentage: boolean
}
```

**Drawdown Chart**
```typescript
interface DrawdownChartProps {
  trades: SimulatedTrade[]
}
```

**Distribution Histogram**
```typescript
interface DistributionHistogramProps {
  buckets: DistributionBucket[]
  medianBalance: number
  initialBalance: number
}
```

**Balance Summary Card**
```typescript
interface BalanceSummaryCardProps {
  initial: number
  final: number
  returnPercent: number
  profit: number
  commission: number
  currency: string
}
```

**Risk Adjusted Metrics Card**
```typescript
interface RiskAdjustedMetricsCardProps {
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
}
```

**Performance Metrics Card**
```typescript
interface PerformanceMetricsCardProps {
  profitFactor: number
  bestTrade: number
  worstTrade: number
  rMultiple: number
  positionImpact: number
  currency: string
}
```

**Drawdown Analysis Card**
```typescript
interface DrawdownAnalysisCardProps {
  maxDrawdown: number
  avgDrawdown: number
  recoveryTrades: number
  underwaterPercent: number
  valleyToPeak: number
}
```

**Streak Statistics Card**
```typescript
interface StreakStatisticsCardProps {
  maxWinStreak: number
  maxLossStreak: number
  avgWinStreak: number
  avgLossStreak: number
}
```

**Kelly Criterion Card**
```typescript
interface KellyCriterionCardProps {
  fullKelly: number
  halfKelly: number
  quarterKelly: number
  expectedReturnPerTrade: number
  recommendation: string
  recommendationLevel: 'aggressive' | 'balanced' | 'conservative'
}
```

**Trade Sequence List**
```typescript
interface TradeSequenceListProps {
  trades: SimulatedTrade[]
  currency: string
  initiallyCollapsed: boolean
  maxVisible: number
}
```

**Strategy Analysis Section**
```typescript
interface StrategyAnalysisProps {
  result: MonteCarloResult
  currency: string
}
```

#### Comparison Components (`src/components/monte-carlo/`)

**Compare Mode Toggle**
```typescript
interface CompareModeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  strategiesCount: number
  accountsCount?: number  // Only for universal mode
  isUniversalMode: boolean
}
```

**Strategy Comparison Table**
```typescript
interface StrategyComparisonTableProps {
  results: StrategyComparisonResult[]
  sortBy: ComparisonSortField
  onSortChange: (field: ComparisonSortField) => void
  onStrategySelect: (strategyId: string) => void
  currency: string
}

interface StrategyComparisonResult {
  strategyId: string
  strategyName: string
  accountName?: string  // For universal mode
  tradesCount: number
  winRate: number
  rewardRiskRatio: number
  medianReturn: number
  profitablePct: number  // % of simulations profitable
  maxDrawdown: number
  sharpeRatio: number
  rank: number
}

type ComparisonSortField =
  | 'rank'
  | 'profitablePct'
  | 'medianReturn'
  | 'maxDrawdown'
  | 'sharpeRatio'
  | 'winRate'
```

**Comparison Bar Charts**
```typescript
interface ComparisonBarChartProps {
  data: Array<{
    strategyName: string
    value: number
    isHighlighted: boolean  // Best or worst in category
  }>
  title: string
  metric: 'profitability' | 'sharpe' | 'drawdown' | 'return'
  lowerIsBetter?: boolean  // For drawdown
}
```

**Comparison Recommendations**
```typescript
interface ComparisonRecommendationsProps {
  results: StrategyComparisonResult[]
  topPerformers: string[]      // Strategy names
  needsImprovement: string[]   // Strategy names
  suggestedAllocations: Array<{
    strategyName: string
    allocationPct: number
    reason: string
  }>
}
```

**Strategy Detail Tabs** (for viewing individual results in comparison mode)
```typescript
interface StrategyDetailTabsProps {
  strategies: Array<{
    id: string
    name: string
    result: MonteCarloResult
  }>
  selectedStrategyId: string
  onStrategySelect: (id: string) => void
}
```

---

### 13.8 Database Schema (Optional - for saving simulations)

```sql
CREATE TABLE monte_carlo_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES trading_accounts(id) ON DELETE SET NULL,
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  
  -- Input parameters
  name VARCHAR(255), -- User-given name for the simulation
  initial_balance INTEGER NOT NULL, -- in cents
  risk_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
  risk_per_trade DECIMAL(10,4) NOT NULL,
  win_rate DECIMAL(5,2) NOT NULL,
  reward_risk_ratio DECIMAL(10,4) NOT NULL,
  number_of_trades INTEGER NOT NULL,
  commission_per_trade DECIMAL(10,4) NOT NULL,
  simulation_count INTEGER NOT NULL,
  
  -- Key results (stored for quick reference)
  median_return DECIMAL(10,4),
  best_case_return DECIMAL(10,4),
  worst_case_return DECIMAL(10,4),
  profitability_percent DECIMAL(5,2),
  median_max_drawdown DECIMAL(10,4),
  sharpe_ratio DECIMAL(10,4),
  kelly_quarter DECIMAL(10,4),
  
  -- Full results stored as JSON (for detailed view)
  full_results JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_risk_type CHECK (risk_type IN ('percentage', 'fixed'))
);

CREATE INDEX idx_monte_carlo_user ON monte_carlo_simulations(user_id);
CREATE INDEX idx_monte_carlo_strategy ON monte_carlo_simulations(strategy_id);
```

---

### 13.9 Implementation Order

1. **Core Simulation Engine** (Day 1-2)
   - [ ] Create `lib/monte-carlo.ts` with simulation algorithm
   - [ ] Implement Kelly Criterion calculation
   - [ ] Implement statistics aggregation
   - [ ] Add risk metric calculations (Sharpe, Sortino, Calmar)
   - [ ] Write unit tests for simulation accuracy

2. **Backend Actions** (Day 3)
   - [ ] `getSimulationStats()` - Auto-populate from data source (strategy/all/universal)
   - [ ] `getDataSourceOptions()` - List available data sources for current context
   - [ ] `runSimulation()` - Server action for heavy computation
   - [ ] Create validation schemas

3. **Frontend - Input Section** (Day 4-5)
   - [ ] Monte Carlo page layout
   - [ ] Input mode selector (auto/manual)
   - [ ] Data source selector (strategy dropdown + "All Strategies" + "Universal" options)
   - [ ] Stats preview card with strategies breakdown
   - [ ] Simulation parameters form
   - [ ] Form validation

4. **Frontend - Charts** (Day 6-7)
   - [ ] Equity curve chart (Recharts)
   - [ ] Drawdown progression chart
   - [ ] Distribution histogram
   - [ ] Chart interactions and tooltips

5. **Frontend - Metrics Cards** (Day 8-9)
   - [ ] Balance summary card
   - [ ] Risk-adjusted metrics card
   - [ ] Performance metrics card
   - [ ] Drawdown analysis card
   - [ ] Streak statistics card
   - [ ] Kelly Criterion card

6. **Frontend - Analysis Section** (Day 10)
   - [ ] Strategy analysis component with insights
   - [ ] Trade sequence list
   - [ ] Conditional insights based on metrics

7. **Frontend - Strategy Comparison** (Day 11-12)
   - [ ] Compare mode toggle
   - [ ] `runComparisonSimulation()` backend action
   - [ ] Strategy comparison table with sorting
   - [ ] Comparison bar charts (profitability, Sharpe, drawdown)
   - [ ] Comparison recommendations generator
   - [ ] Strategy detail tabs for viewing individual results
   - [ ] Portfolio allocation suggestions

8. **Optional: Save Simulations** (Day 13)
   - [ ] Database migration
   - [ ] Save/load simulation actions
   - [ ] Save comparison results
   - [ ] Saved simulations list
   - [ ] Delete simulation

9. **Polish & Translations** (Day 14)
   - [ ] Full i18n support (pt-BR, en)
   - [ ] Loading states
   - [ ] Error handling
   - [ ] Responsive design
   - [ ] Help tooltips

---

### 13.10 Files to Create/Modify

```
src/
├── app/
│   ├── [locale]/(app)/
│   │   └── monte-carlo/
│   │       └── page.tsx               # NEW: Monte Carlo simulator page
│   └── actions/
│       └── monte-carlo.ts             # NEW: Simulation actions
├── components/
│   ├── monte-carlo/
│   │   ├── index.ts                   # NEW: Barrel exports
│   │   ├── monte-carlo-content.tsx    # NEW: Client wrapper
│   │   │
│   │   │ # Input Components
│   │   ├── input-mode-selector.tsx    # NEW: Auto/Manual toggle
│   │   ├── strategy-selector.tsx      # NEW: Account + Strategy dropdowns
│   │   ├── strategy-stats-preview.tsx # NEW: Stats preview card
│   │   ├── simulation-params-form.tsx # NEW: Parameter inputs
│   │   │
│   │   │ # Chart Components
│   │   ├── equity-curve-chart.tsx     # NEW: Return progression
│   │   ├── drawdown-chart.tsx         # NEW: Drawdown progression
│   │   ├── distribution-histogram.tsx # NEW: Outcomes distribution
│   │   │
│   │   │ # Metrics Cards
│   │   ├── balance-summary-card.tsx   # NEW: Balance summary
│   │   ├── risk-adjusted-card.tsx     # NEW: Sharpe/Sortino/Calmar
│   │   ├── performance-card.tsx       # NEW: Profit factor, trades
│   │   ├── drawdown-card.tsx          # NEW: Drawdown analysis
│   │   ├── streak-stats-card.tsx      # NEW: Win/loss streaks
│   │   ├── kelly-criterion-card.tsx   # NEW: Position sizing
│   │   │
│   │   │ # Analysis Components
│   │   ├── strategy-analysis.tsx      # NEW: AI-like insights
│   │   ├── trade-sequence-list.tsx    # NEW: Sample trades
│   │   │
│   │   │ # Optional
│   │   ├── saved-simulations-list.tsx # NEW: List saved sims
│   │   └── simulation-actions.tsx     # NEW: Save/Export buttons
│   │
│   └── layout/
│       └── sidebar.tsx                # UPDATE: Add Monte Carlo nav
├── lib/
│   ├── monte-carlo.ts                 # NEW: Core simulation engine
│   └── validations/
│       └── monte-carlo.ts             # NEW: Param validation
├── types/
│   └── monte-carlo.ts                 # NEW: Simulation types
├── db/
│   ├── schema.ts                      # UPDATE: Add simulations table (optional)
│   └── migrations/
│       └── 0007_xxx.sql               # Phase 13 migration (optional)
└── messages/
    ├── en.json                        # UPDATE: Add monte-carlo translations
    └── pt-BR.json                     # UPDATE: Add monte-carlo translations
```

---

### 13.11 Navigation Integration

Add "Monte Carlo" under Analytics or as standalone:

```typescript
// Sidebar navigation
{
  icon: Dices,  // or BarChart3
  label: t('nav.monteCarlo'),
  href: '/monte-carlo'
}
```

Navigation order suggestion:
1. Daily
2. Dashboard
3. Journal
4. Analytics
5. **Monte Carlo** (NEW)
6. Playbook
7. Monthly
8. Reports
9. Settings

---

### 13.12 Translation Keys to Add

```json
{
  "nav": {
    "monteCarlo": "Monte Carlo"
  },
  "monteCarlo": {
    "title": "Monte Carlo Strategy Simulator",
    "subtitle": "Stress-test your trading strategy with statistical simulations",
    
    "inputMode": {
      "title": "Input Mode",
      "auto": "Auto-populate from Data",
      "manual": "Manual Entry"
    },

    "dataSource": {
      "title": "Data Source",
      "currentAccount": "Current Account",
      "changeInSidebar": "(change in sidebar)",
      "selectSource": "Select data source",
      "noTrades": "No trades found",
      "basedOnTrades": "Based on {count} trades ({from} - {to})",
      "acrossStrategies": "Across {count} strategies",
      "acrossAccounts": "Across {count} accounts",

      "individual": "Individual Strategy",
      "allStrategies": "All Strategies (Account-wide metrics)",
      "allStrategiesDesc": "Test your overall trading edge",
      "universal": "All Accounts + All Strategies (Universal)",
      "universalDesc": "Test your complete trading profile",
      "universalDisabled": "(enable 'show all accounts' in settings)"
    },

    "statsPreview": {
      "winRate": "Win Rate",
      "avgRR": "Avg R:R",
      "profitFactor": "Profit Factor",
      "useStats": "Use These Stats",
      "customize": "Customize",
      "strategiesBreakdown": "Strategies Breakdown"
    },

    "comparison": {
      "title": "Compare Strategies",
      "description": "Run Monte Carlo simulation on each strategy individually and compare results",
      "subtitle": "This helps identify which strategies have the strongest statistical edge",
      "strategiesToCompare": "Strategies to compare",
      "fromCurrentAccount": "from current account",
      "fromAllAccounts": "from all accounts",
      "enable": "Enable comparison mode",

      "resultsTitle": "Strategy Comparison Results",
      "basedOnSimulations": "Based on {count} simulations",
      "comparingStrategies": "Comparing {count} strategies from {account}",

      "table": {
        "strategy": "Strategy",
        "trades": "Trades",
        "winRate": "Win%",
        "rr": "R:R",
        "profit": "Profit%",
        "maxDD": "MaxDD",
        "sharpe": "Sharpe",
        "rank": "Rank"
      },

      "charts": {
        "profitability": "Profitability (% of simulations profitable)",
        "riskAdjusted": "Risk-Adjusted Returns (Sharpe Ratio)",
        "maxDrawdown": "Maximum Drawdown (lower is better)"
      },

      "recommendations": {
        "title": "Recommendations",
        "analysisSummary": "Analysis Summary",
        "topPerformers": "Top Performers",
        "needsImprovement": "Needs Improvement",
        "suggestedFocus": "Suggested Focus",
        "portfolioSuggestion": "Portfolio Suggestion (by statistical robustness)",
        "allocation": "{percent}% allocation",
        "pauseStrategy": "pause until improved",
        "considerPausing": "Only {pct}% profitable simulations, consider pausing this strategy until parameters are refined"
      },

      "detailTabs": {
        "title": "Individual Strategy Details",
        "selectStrategy": "Select a strategy to view full simulation results"
      },

      "export": {
        "comparisonPdf": "Export Comparison PDF",
        "csv": "Export to CSV"
      }
    },

    "params": {
      "title": "Simulation Parameters",
      "initialBalance": "Initial Balance",
      "riskType": "Risk Type",
      "riskTypePercentage": "Percentage",
      "riskTypeFixed": "Fixed Amount",
      "riskPerTrade": "Risk Per Trade",
      "winRate": "Win Rate (%)",
      "rewardRiskRatio": "Reward/Risk Ratio",
      "numberOfTrades": "Number of Trades",
      "commissionPerTrade": "Commission per Trade (%)",
      "simulationCount": "Monte Carlo Simulations",
      "calculate": "Calculate Results"
    },
    
    "results": {
      "title": "Expected Results",
      "equityCurve": "Total Return Progression",
      "drawdownCurve": "Drawdown Progression",
      "distribution": "Distribution of Possible Outcomes",
      "tradeNumber": "Trade Number",
      "returnPercent": "Return %",
      "drawdownPercent": "Drawdown %",
      "finalBalance": "Final Balance",
      "frequency": "Frequency"
    },
    
    "metrics": {
      "averageCase": "Average Case Scenario - Trade Details",
      "balanceSummary": "Balance Summary",
      "initial": "Initial Balance",
      "final": "Final Balance",
      "totalReturn": "Total Return",
      "tradeProfit": "Trade Profit",
      "totalCommission": "Total Commission",
      
      "riskAdjusted": "Risk-Adjusted Metrics",
      "sharpeRatio": "Sharpe Ratio",
      "sortinoRatio": "Sortino Ratio",
      "calmarRatio": "Calmar Ratio",
      
      "performance": "Performance Metrics",
      "profitFactor": "Profit Factor",
      "bestTrade": "Best Trade",
      "worstTrade": "Worst Trade",
      "rMultiple": "R-Multiple",
      "positionImpact": "Position Impact",
      
      "drawdown": "Drawdown Analysis",
      "maxDrawdown": "Max Drawdown",
      "avgDrawdown": "Average Drawdown",
      "recoveryTime": "Recovery Time",
      "underwaterTime": "Underwater Time",
      "valleyToPeak": "Valley-to-Peak",
      "trades": "trades",
      
      "streaks": "Streak Statistics",
      "maxWinsInRow": "Max Wins in Row",
      "maxLossesInRow": "Max Losses in Row",
      "avgWinStreak": "Average Win Streak",
      "avgLossStreak": "Average Loss Streak",
      
      "kelly": "Position Size Calculator (Kelly Criterion)",
      "kellyDescription": "Helps you decide how much to risk per trade based on your win rate and reward/risk ratio.",
      "fullKelly": "Aggressive (Full Kelly)",
      "halfKelly": "Balanced (Half Kelly)",
      "quarterKelly": "Conservative (Quarter Kelly)",
      "expectedReturn": "Expected Return Per Trade",
      "kellyWarning": "High potential but risky - Use Conservative (Quarter Kelly)",
      "kellyModerate": "Reasonable Kelly - Consider Half Kelly for growth",
      "kellySafe": "Conservative Kelly - Quarter Kelly recommended for stability"
    },
    
    "trades": {
      "title": "Sample Trade Sequence (Average Case)",
      "win": "Win",
      "loss": "Loss",
      "commission": "Commission",
      "balance": "Balance",
      "showAll": "Show All Trades",
      "hideAll": "Hide Trades"
    },
    
    "analysis": {
      "title": "Trading Strategy Analysis",
      
      "monteCarlo": "Monte Carlo Simulation Analysis",
      "basedOn": "Based on {count} simulations of your strategy:",
      "averageReturn": "Average Return: {return}% (Max DD: {dd}%) - This is your most likely outcome over time",
      "bestCase": "Best Case: {return}% (Max DD: {dd}%) - Achieved in {pct}% of simulations",
      "worstCase": "Worst Case: {return}% (Max DD: {dd}%) - Your maximum downside risk",
      "profitableSimulations": "{pct}% of all simulations were profitable, which indicates {quality}.",
      "robustStrategy": "a robust strategy",
      "moderateStrategy": "a moderately reliable strategy",
      "riskyStrategy": "a risky strategy that needs improvement",
      "profitabilityTip": "Tip: A reliable strategy should be profitable in at least 70% of simulations.",
      
      "balanceReturns": "Balance and Returns Analysis",
      "startingWith": "Starting with {amount}, your strategy shows:",
      "expectedProfit": "Expected Profit: {amount} ({pct}% return)",
      "commissionImpact": "Commission Impact: {amount} ({pct}% of profits)",
      "commissionGood": "Commission costs are well-managed relative to profits.",
      "commissionWarning": "Consider negotiating lower commissions or reducing trade frequency.",
      
      "riskAnalysis": "Risk Analysis",
      "riskMetrics": "Your risk metrics indicate:",
      "wellControlled": "Well-controlled",
      "acceptable": "Acceptable",
      "needsAttention": "Needs attention",
      "excellent": "Excellent risk-adjusted returns",
      "good": "Good risk-adjusted returns",
      "belowAverage": "Below average",
      "riskExcellent": "Your strategy's risk-adjusted performance is excellent.",
      "riskGood": "Your strategy's risk-adjusted performance is good.",
      "riskImprove": "Consider reducing risk or improving win rate.",
      
      "psychology": "Trading Psychology",
      "psychFactors": "Psychological factors to consider:",
      "winRateSolid": "Solid performance",
      "winRateGood": "Good win rate",
      "winRateChallenging": "Challenging - requires strong discipline",
      "longestWinStreak": "Longest Win Streak: {count} trades",
      "longestLossStreak": "Longest Loss Streak: {count} trades",
      "avgWinStreak": "Average Win Streak: {count} trades",
      "avgLossStreak": "Average Loss Streak: {count} trades",
      "disciplineQuestion": "Can you maintain discipline during a {count}-trade losing streak? This is crucial for success.",
      
      "positionSizing": "Position Sizing Recommendations",
      "kellyBased": "Based on the Kelly Criterion:",
      "perTrade": "per trade",
      "recommendedPositions": "Recommended {kelly} position sizes:",
      "accountSize": "{amount} account: Risk {risk} per trade",
      "riskGuidelines": "Risk Management Guidelines:",
      "newTraders": "New Traders: Start with 1% risk maximum while learning",
      "propFirm": "Prop Firm Accounts: Keep risk at 0.5% or lower to maintain account safety",
      "experienced": "Experienced Traders: Can gradually increase to 1-2% after proving consistent profitability",
      "neverExceed": "Never exceed Quarter Kelly size regardless of experience level",
      "currentRiskGood": "Your current {pct}% risk is reasonable - maintain disciplined position sizing for consistent growth",
      "currentRiskHigh": "Consider reducing your risk to {pct}% or lower",
      
      "improvements": "Strategy Improvements",
      "keyAreas": "Key areas for strategy optimization:",
      "reduceUnderwater": "Reduce Underwater Time: Look for better entry/exit criteria",
      "improveProfitFactor": "Improve Profit Factor: Focus on better reward:risk ratios",
      "improveWinRate": "Improve Win Rate: Refine entry criteria for higher probability setups",
      "reduceDrawdown": "Reduce Maximum Drawdown: Consider smaller position sizes or tighter stops",
      "bestStrategyReminder": "Remember: The best strategy is one you can execute consistently with confidence."
    },
    
    "actions": {
      "save": "Save Simulation",
      "export": "Export PDF",
      "runAgain": "Run Again",
      "reset": "Reset Parameters"
    },
    
    "tooltips": {
      "riskType": "Percentage: Risk a % of current balance. Fixed: Risk a set $ amount regardless of balance.",
      "rewardRiskRatio": "Average winner size divided by average loser size. E.g., 1.5 means winners are 1.5x larger than losers.",
      "commissionPerTrade": "Commission expressed as a percentage of your risk amount per trade.",
      "simulationCount": "More simulations provide more accurate probability distributions. 1000 is recommended.",
      "sharpeRatio": "Measures risk-adjusted return. Above 1 is good, above 2 is excellent.",
      "sortinoRatio": "Like Sharpe but only penalizes downside volatility. Higher is better.",
      "calmarRatio": "Annual return divided by max drawdown. Higher means better return per unit of risk.",
      "profitFactor": "Gross profits divided by gross losses. Above 1.5 is good, above 2 is excellent.",
      "kelly": "Mathematical formula for optimal bet sizing. Quarter Kelly is recommended for safety."
    }
  }
}
```

---

### Deliverables

#### Core Features
- [ ] Monte Carlo simulation engine with accurate statistical calculations
- [ ] Auto-populate parameters from three data sources:
  - Individual strategy from current account
  - All strategies combined (account-wide "will I survive?" test)
  - Universal mode: all accounts + all strategies (if "show all accounts" enabled)
- [ ] Manual entry mode for hypothetical testing
- [ ] Run configurable number of simulations (100-10,000)

#### Visualization
- [ ] Equity curve chart showing return progression
- [ ] Drawdown progression chart
- [ ] Distribution histogram of final balances
- [ ] Sample trade sequence display

#### Metrics & Analysis
- [ ] Balance summary (initial, final, return, profit, commission)
- [ ] Risk-adjusted metrics (Sharpe, Sortino, Calmar ratios)
- [ ] Performance metrics (profit factor, best/worst trade, R-multiple)
- [ ] Drawdown analysis (max DD, avg DD, recovery time, underwater %)
- [ ] Streak statistics (max/avg win and loss streaks)
- [ ] Kelly Criterion calculator with position sizing recommendations

#### Insights & Recommendations
- [ ] Monte Carlo outcome analysis (best/avg/worst case)
- [ ] Profitability probability assessment
- [ ] Risk level assessment with ratings
- [ ] Psychology preparation (handling losing streaks)
- [ ] Position sizing recommendations by account size
- [ ] Strategy improvement suggestions

#### Strategy Comparison (when "Show All Accounts" enabled)
- [ ] Compare mode toggle
- [ ] Run simulation for each strategy independently
- [ ] Side-by-side comparison table with key metrics
- [ ] Ranking by profitability %, Sharpe ratio, max drawdown
- [ ] Visual bar charts comparing strategies
- [ ] Top performers and needs-improvement identification
- [ ] Portfolio allocation suggestions based on statistical robustness
- [ ] Individual strategy detail tabs within comparison view

#### Optional
- [ ] Save simulations for later reference
- [ ] Save comparison results for later reference
- [ ] Export simulation results as PDF
- [ ] Export comparison results as PDF/CSV

#### Polish
- [ ] Full i18n support (pt-BR, en)
- [ ] Help tooltips for all parameters
- [ ] Loading states during simulation
- [ ] Responsive design for all components
- [ ] Navigation sidebar integration
