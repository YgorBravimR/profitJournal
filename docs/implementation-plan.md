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
| 5 | Strategy Playbook | 🔲 Pending | - |
| 6 | Reports & Polish | 🔲 Pending | - |

---

## Current State Assessment

### Implemented (Phase 1 Complete)

**Infrastructure:**
- Next.js 16 + React 19 foundation with App Router
- TailwindCSS 4 with custom design tokens
- Drizzle ORM configured for PostgreSQL/Neon
- ESLint 9 flat config + Prettier

**Database Schema (`src/db/schema.ts`):**
- `trades` - 32 columns (P&L, R-multiples, MFE/MAE, narrative)
- `strategies` - playbook entries with criteria
- `tags` - setup/mistake tags with colors
- `trade_tags` - many-to-many relationship
- `daily_journals` - session reflections
- `settings` - user preferences
- Migration generated: `src/db/migrations/0000_fat_justin_hammer.sql`

**Theme System (`src/app/globals.css`):**
- Trading colors: `--color-trade-buy` (Mint), `--color-trade-sell` (Periwinkle)
- Warning color, muted variants, zebra stripes
- Dark and light theme support

**Layout Components (`src/components/layout/`):**
- `Sidebar` - collapsible navigation
- `MainLayout` - app shell wrapper
- `PageHeader` - consistent headers

**Routes (all with placeholder content):**
- `/` - Dashboard (Command Center)
- `/journal` - Trade list
- `/journal/new` - New trade form
- `/journal/[id]` - Trade detail
- `/analytics` - Analytics page
- `/playbook` - Strategy playbook
- `/reports` - Performance reports
- `/settings` - User preferences

**Server Actions (`src/app/actions/`):**
- `trades.ts` - placeholder CRUD
- `strategies.ts` - placeholder CRUD
- `tags.ts` - placeholder CRUD
- `analytics.ts` - placeholder stats

**Utilities:**
- `src/lib/dates.ts` - date helpers
- `src/lib/calculations.ts` - trading calculations
- `src/types/index.ts` - TypeScript types

**UI Components:**
- Button, Card, Toast, ThemeToggle (shadcn)

### To Be Built (Phases 2-6)
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
- [x] `getTagStats()` - performance per tag (P&L, win rate, avg R, trade count)
- [x] `getPerformanceByVariable()` - group by asset/timeframe/hour/dayOfWeek/strategy
- [x] `getExpectedValue()` - EV calculation with win rate, avg win/loss, 100-trade projection
- [x] `getRDistribution()` - R-multiple histogram buckets from <-2R to >3R

#### Frontend
- [x] Analytics page with server-side data fetching (`src/app/analytics/page.tsx`)
- [x] Filter Panel - date presets, custom date range, asset/direction/outcome/timeframe filters
- [x] Variable Comparison - bar chart with metric selector (P&L, win rate, avg R, trade count, profit factor)
- [x] Tag Cloud - visual tag display by type with size/color coding and detailed stats table
- [x] Expected Value - EV display with formula breakdown and interpretation
- [x] R-Distribution Histogram - bar chart with Recharts, color-coded positive/negative R

### Files Created/Modified
```
src/
├── app/
│   ├── analytics/page.tsx              # Full implementation with data
│   └── actions/
│       ├── tags.ts                     # Full CRUD + stats
│       └── analytics.ts                # Extended with new functions
├── components/
│   └── analytics/
│       ├── index.ts                    # Barrel exports
│       ├── filter-panel.tsx            # Date/filter controls
│       ├── variable-comparison.tsx     # Performance chart
│       ├── tag-cloud.tsx               # Tag visualization
│       ├── expected-value.tsx          # EV calculator
│       ├── r-distribution.tsx          # R histogram
│       └── analytics-content.tsx       # Client wrapper
└── types/
    └── index.ts                        # Added PerformanceByGroup, ExpectedValueData, RDistributionBucket
```

### Deliverables
- ✅ Full filtering system with date presets and multi-select filters
- ✅ Variable comparison tool with 5 grouping options and 5 metrics
- ✅ Tag analysis with cloud visualization and detailed statistics table
- ✅ EV calculator with formula explanation and 100-trade projection
- ✅ R-distribution histogram with positive/negative color coding

---

## Phase 5: Strategy Playbook 🔲 NEXT

**Goal:** Build strategy library and compliance tracking.

### Backend Tasks

1. **Implement Strategy Server Actions** (`src/app/actions/strategies.ts`)
   - [ ] `createStrategy()` - add playbook entry
   - [ ] `updateStrategy()` - edit strategy
   - [ ] `deleteStrategy()` - remove strategy
   - [ ] `getStrategies()` - list all with stats
   - [ ] `getStrategyCompliance()` - % of trades following rules

### Frontend Tasks

1. **Playbook Page** (`src/app/playbook/page.tsx`)
   - [ ] Replace placeholder with real components

2. **Strategy Card** (`src/components/playbook/strategy-card.tsx`)
   - [ ] Name, description, compliance badge

3. **Strategy Form** (`src/components/playbook/strategy-form.tsx`)
   - [ ] Entry/exit criteria, risk rules

4. **Compliance Dashboard** (`src/components/playbook/compliance-dashboard.tsx`)
   - [ ] Overall score, per-strategy breakdown

### Deliverables
- Strategy CRUD functionality
- Compliance tracking per strategy
- Playbook overview page

---

## Phase 6: Reports & Polish

**Goal:** Automated reports, settings, UX improvements.

### Backend Tasks

1. **Report Server Actions** (`src/app/actions/reports.ts`)
   - [ ] `getWeeklyReport()` - week summary
   - [ ] `getMonthlyReport()` - month summary
   - [ ] `getMistakeCostAnalysis()` - sum losses by mistake tag

2. **Per-Asset Fees Backend** (`src/app/actions/settings.ts`)
   - [ ] `getAssetFees()` - get fees for an asset
   - [ ] `setAssetFees()` - configure commission/fees per asset
   - [ ] Auto-apply fees in P&L calculations based on trade asset

### Frontend Tasks

1. **Reports Page** (`src/app/reports/page.tsx`)
   - [ ] Replace placeholder with real components

2. **Weekly/Monthly Reports** (`src/components/reports/`)
   - [ ] Summary statistics, day-by-day breakdown
   - [ ] Top wins/losses, mistake cost section

3. **Settings Page** (`src/app/settings/page.tsx`)
   - [ ] Make settings editable
   - [ ] Per-asset fee configuration (commission and fees applied automatically to P&L calculations)
   - [ ] Asset fee management UI (add/edit/delete fee presets per asset)

4. **UX Polish**
   - [ ] Loading states refinement
   - [ ] Error handling improvements
   - [ ] Toast notifications for actions
   - [ ] Mobile responsiveness

### Deliverables
- Weekly and monthly automated reports
- Mistake cost analysis
- Complete settings page with per-asset fee configuration
- Automatic fee application in P&L calculations
- Polished user experience

### Note
CSV Import was completed in Phase 3.

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
