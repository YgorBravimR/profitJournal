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

## Success Criteria

After 30 days of use, the platform should enable the user to say:

> "I make 80% of my money on Tuesday mornings trading 15-minute breakouts, and I lose it all back on Friday afternoons trading 1-minute reversals."

This means:
- Complete trade logging with all relevant data
- Accurate performance calculations
- Effective filtering and grouping
- Clear visualization of patterns
- Actionable mistake identification
