# Profit Journal - Implementation Plan

## Project Overview

A personal trading performance analysis platform with deep journaling, analytics, and behavioral correction features. The platform focuses on **Deep Insight and Behavioral Correction** - it doesn't just record what happened, but tells you **why** it happened and **how** to improve.

---

## Progress Tracker

| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Foundation | ✅ Complete | Jan 2025 |
| 2 | Trade Management | ✅ Complete | Jan 2025 |
| 3 | Command Center | 🔲 Pending | - |
| 4 | Deep Analytics | 🔲 Pending | - |
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

## Phase 3: Command Center 🔲 NEXT

**Goal:** Build the main dashboard with KPIs and calendar.

### Backend Tasks

1. **Implement Analytics Server Actions** (`src/app/actions/analytics.ts`)
   - [ ] `getOverallStats()` - Net P&L, Win Rate, Profit Factor, Avg R
   - [ ] `getStreakData()` - winning/losing streaks
   - [ ] `getDailyPnL()` - for calendar coloring
   - [ ] `getEquityCurve()` - cumulative P&L over time
   - [ ] `getDrawdownData()` - peak-to-trough calculations
   - [ ] `getDisciplineScore()` - playbook compliance %

### Frontend Tasks

1. **Dashboard Page** (`src/app/page.tsx`)
   - [ ] Replace placeholder with real data fetching
   - [ ] Grid layout with KPI cards, calendar, chart

2. **KPI Cards** (`src/components/dashboard/kpi-cards.tsx`)
   - [ ] Net P&L (large, prominent)
   - [ ] Win Rate, Profit Factor, Average R
   - [ ] Discipline Score

3. **Trading Calendar** (`src/components/dashboard/trading-calendar.tsx`)
   - [ ] Monthly grid view
   - [ ] Color-coded days by P&L
   - [ ] Click to navigate to day's trades
   - [ ] Month navigation

4. **Equity Curve Chart** (`src/components/dashboard/equity-curve.tsx`)
   - [ ] Line chart with Recharts
   - [ ] Gradient fill (green/periwinkle)
   - [ ] Drawdown overlay

5. **Quick Stats Panel** (`src/components/dashboard/quick-stats.tsx`)
   - [ ] Current streak, Best/Worst day, Total trades

### Deliverables
- Fully functional dashboard
- Real-time KPI calculations
- Interactive trading calendar
- Equity curve visualization

---

## Phase 4: Deep Analytics

**Goal:** Build filtering system and analytical tools.

### Backend Tasks

1. **Implement Tag Server Actions** (`src/app/actions/tags.ts`)
   - [ ] `createTag()` - add new tag
   - [ ] `getTags()` - list all tags
   - [ ] `getTagStats()` - performance per tag

2. **Extend Analytics** (`src/app/actions/analytics.ts`)
   - [ ] `getPerformanceByVariable()` - group by timeframe/asset/time
   - [ ] `getTagCloudData()` - tag frequency + performance
   - [ ] `getExpectedValue()` - EV calculation
   - [ ] `getTradeDistribution()` - R-distribution histogram

### Frontend Tasks

1. **Analytics Page** (`src/app/analytics/page.tsx`)
   - [ ] Replace placeholder with real components

2. **Filter Panel** (`src/components/analytics/filter-panel.tsx`)
   - [ ] Date range picker, multi-selects for filters

3. **Variable Comparison** (`src/components/analytics/variable-comparison.tsx`)
   - [ ] Dropdown to select grouping, bar chart

4. **Tag Cloud** (`src/components/analytics/tag-cloud.tsx`)
   - [ ] Visual tag display with size/color coding

5. **Expected Value Calculator** (`src/components/analytics/expected-value.tsx`)
   - [ ] Current EV, projection over N trades

6. **R-Distribution Histogram** (`src/components/analytics/r-distribution.tsx`)
   - [ ] Bar chart of R outcomes

### Deliverables
- Full filtering system
- Variable comparison tool
- Tag analysis with cloud visualization
- EV calculator, R-distribution chart

---

## Phase 5: Strategy Playbook

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

**Goal:** Automated reports, CSV import, UX improvements.

### Backend Tasks

1. **Report Server Actions** (`src/app/actions/reports.ts`)
   - [ ] `getWeeklyReport()` - week summary
   - [ ] `getMonthlyReport()` - month summary
   - [ ] `getMistakeCostAnalysis()` - sum losses by mistake tag

2. **CSV Import** (`src/app/actions/import.ts`)
   - [ ] `parseCSV()` - validate and parse
   - [ ] `importTrades()` - bulk insert

### Frontend Tasks

1. **Reports Page** (`src/app/reports/page.tsx`)
   - [ ] Replace placeholder with real components

2. **Weekly/Monthly Reports** (`src/components/reports/`)
   - [ ] Summary statistics, day-by-day breakdown
   - [ ] Top wins/losses, mistake cost section

3. **CSV Import** (`src/components/settings/csv-import.tsx`)
   - [ ] File upload, column mapping, preview

4. **Settings Page** (`src/app/settings/page.tsx`)
   - [ ] Make settings editable
   - [ ] Per-asset fee configuration (commission and fees applied automatically to P&L calculations)
   - [ ] Asset fee management UI (add/edit/delete fee presets per asset)

5. **Per-Asset Fees Backend** (`src/app/actions/settings.ts`)
   - [ ] `getAssetFees()` - get fees for an asset
   - [ ] `setAssetFees()` - configure commission/fees per asset
   - [ ] Auto-apply fees in P&L calculations based on trade asset

6. **UX Polish**
   - [ ] Loading states refinement
   - [ ] Error handling improvements
   - [ ] Toast notifications for actions
   - [ ] Mobile responsiveness

### Deliverables
- Weekly and monthly automated reports
- Mistake cost analysis
- CSV import functionality
- Complete settings page with per-asset fee configuration
- Automatic fee application in P&L calculations
- Polished user experience

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
