# Profit Journal - Implementation Plan

## Project Overview

A personal trading performance analysis platform with deep journaling, analytics, and behavioral correction features. The platform focuses on **Deep Insight and Behavioral Correction** - it doesn't just record what happened, but tells you **why** it happened and **how** to improve.

---

## Current State Assessment

### Already Implemented
- Next.js 16 + React 19 foundation with App Router
- TailwindCSS 4 with custom design tokens (globals.css)
- Drizzle ORM configured for PostgreSQL/Neon
- Base UI components: Button, Card, Toast, ThemeToggle
- Theme system with dark/light mode support
- Error boundary and loading states
- ESLint + Prettier configuration

### Needs Replacement
- Current `page.tsx` references a study tracker - needs complete rewrite for trading journal

### To Be Built
- Database schema for trades, strategies, tags, reports
- All server actions for CRUD operations
- Dashboard components (KPIs, Calendar, Equity Curve)
- Journal entry system
- Analytics engine
- Strategy playbook
- Performance reports

---

## Implementation Phases

The plan is divided into **6 phases**, each delivering frontend and backend work together to create functional increments.

| Phase | Name | Focus | Estimated Scope |
|-------|------|-------|-----------------|
| 1 | Foundation | Database schema + Core layout | Schema, Navigation, Theming updates |
| 2 | Trade Management | Trade CRUD + Journal basics | Trade entry, listing, detail view |
| 3 | Command Center | Main dashboard | KPIs, Calendar, Basic stats |
| 4 | Deep Analytics | Filtering + Analysis | Tag system, Filters, Variable comparison |
| 5 | Strategy Playbook | Rules + Compliance | Setup definitions, Tracking |
| 6 | Reports & Polish | Automation + UX | Weekly/Monthly reports, CSV import |

---

## Phase 1: Foundation

**Goal:** Establish database structure, update theming for trading context, create app shell with navigation.

### Backend Tasks

1. **Database Schema Design** (`src/db/schema.ts`)
   - `trades` table - core trade records
   - `strategies` table - playbook entries
   - `tags` table - setup/mistake tags
   - `trade_tags` table - many-to-many relation
   - `daily_journals` table - narrative entries
   - `settings` table - user preferences

2. **Run Initial Migration**
   ```bash
   pnpm db:generate && pnpm db:push
   ```

3. **Create Base Server Actions** (`src/app/actions/`)
   - `trades.ts` - placeholder structure
   - `strategies.ts` - placeholder structure
   - `analytics.ts` - placeholder structure

### Frontend Tasks

1. **Update Theme Colors** (`src/app/globals.css`)
   - Add trading-specific colors:
     - `--color-trade-buy: rgb(0, 255, 150)` (Mint)
     - `--color-trade-sell: rgb(128, 128, 255)` (Periwinkle)
     - `--color-warning: rgb(252, 213, 53)` (Yellow alerts)
   - Add zebra stripe colors for tables

2. **Create App Shell**
   - Sidebar navigation component (`src/components/layout/sidebar.tsx`)
   - Main layout wrapper (`src/components/layout/main-layout.tsx`)
   - Page header component (`src/components/layout/page-header.tsx`)

3. **Navigation Structure**
   - Dashboard (Command Center)
   - Journal (Trade List + Entry)
   - Analytics
   - Playbook
   - Reports
   - Settings

4. **Create Route Structure**
   ```
   src/app/
   ├── (dashboard)/
   │   └── page.tsx           # Command Center
   ├── journal/
   │   ├── page.tsx           # Trade list
   │   └── [id]/page.tsx      # Trade detail
   ├── analytics/
   │   └── page.tsx
   ├── playbook/
   │   └── page.tsx
   ├── reports/
   │   └── page.tsx
   └── settings/
       └── page.tsx
   ```

### Deliverables
- Working database with all tables
- App shell with navigation
- All routes created (with placeholder content)

---

## Phase 2: Trade Management

**Goal:** Build complete trade entry and journal system.

### Backend Tasks

1. **Trade Server Actions** (`src/app/actions/trades.ts`)
   - `createTrade()` - add new trade
   - `updateTrade()` - edit existing trade
   - `deleteTrade()` - remove trade
   - `getTrade()` - single trade fetch
   - `getTrades()` - paginated list with filters
   - `getTradesForDate()` - calendar view
   - `getTradesForDateRange()` - reports

2. **Validation Schemas** (`src/lib/validations/trade.ts`)
   - Trade input schema with Zod
   - Filter parameters schema

3. **Date Utilities** (`src/lib/dates.ts`)
   - `getWeekBoundaries()`
   - `getMonthBoundaries()`
   - `formatCurrency()`
   - `formatDate()`

### Frontend Tasks

1. **Trade List Page** (`src/app/journal/page.tsx`)
   - Server component with trade fetching
   - Filter controls (date range, asset, outcome)
   - Trade card list with key metrics
   - Pagination

2. **Trade Entry Form** (`src/components/journal/trade-form.tsx`)
   - Multi-step or tabbed form:
     - Basic info (asset, direction, date/time)
     - Execution (entry price, exit price, size)
     - Risk management (stop loss, take profit, planned R)
     - Notes (pre-trade thoughts, post-trade reflection)
     - Tags (setup type, mistakes)
   - Form validation with Zod + React Hook Form

3. **Trade Detail Page** (`src/app/journal/[id]/page.tsx`)
   - Full trade breakdown
   - Planned vs Realized R visualization
   - MFE/MAE display (manual input for now)
   - Narrative sections
   - Edit/Delete actions

4. **UI Components**
   - `TradeCard` - summary card for list view
   - `TradeMetric` - reusable metric display
   - `PnLDisplay` - colored profit/loss with monospace font
   - `RMultipleBar` - visual R comparison

### Deliverables
- Full trade CRUD functionality
- Trade list with filtering
- Trade detail view with all metrics
- Working trade entry form

---

## Phase 3: Command Center

**Goal:** Build the main dashboard with KPIs and calendar.

### Backend Tasks

1. **Analytics Server Actions** (`src/app/actions/analytics.ts`)
   - `getOverallStats()` - Net P&L, Win Rate, Profit Factor, Avg R
   - `getStreakData()` - winning/losing streaks
   - `getDailyPnL()` - for calendar coloring
   - `getEquityCurve()` - cumulative P&L over time
   - `getDrawdownData()` - peak-to-trough calculations
   - `getDisciplineScore()` - playbook compliance %

2. **KPI Calculations** (`src/lib/calculations.ts`)
   - Win rate calculation
   - Profit factor calculation
   - Average R-Multiple
   - Drawdown percentage
   - Expected value

### Frontend Tasks

1. **Dashboard Page** (`src/app/(dashboard)/page.tsx`)
   - Server component orchestrating all data
   - Grid layout with KPI cards, calendar, chart

2. **KPI Cards** (`src/components/dashboard/kpi-cards.tsx`)
   - Net P&L (large, prominent)
   - Win Rate
   - Profit Factor
   - Average R
   - Discipline Score

3. **Trading Calendar** (`src/components/dashboard/trading-calendar.tsx`)
   - Monthly grid view
   - Color-coded days (green/red intensity by P&L)
   - Click to navigate to day's trades
   - Month navigation

4. **Equity Curve Chart** (`src/components/dashboard/equity-curve.tsx`)
   - Line chart with Recharts
   - Gradient fill (green above, periwinkle below)
   - Drawdown overlay
   - Hover tooltips with date/value

5. **Quick Stats Panel** (`src/components/dashboard/quick-stats.tsx`)
   - Current streak
   - Best day
   - Worst day
   - Total trades this period

### Deliverables
- Fully functional dashboard
- Real-time KPI calculations
- Interactive trading calendar
- Equity curve visualization

---

## Phase 4: Deep Analytics

**Goal:** Build filtering system and analytical tools.

### Backend Tasks

1. **Tag Server Actions** (`src/app/actions/tags.ts`)
   - `createTag()` - add new tag
   - `getTags()` - list all tags
   - `getTagStats()` - performance per tag
   - `assignTagToTrade()` - link tag to trade

2. **Advanced Analytics** (`src/app/actions/analytics.ts` - extend)
   - `getPerformanceByVariable()` - group by timeframe/asset/time
   - `getTagCloudData()` - tag frequency + performance
   - `getExpectedValue()` - EV calculation
   - `getTradeDistribution()` - R-distribution histogram

### Frontend Tasks

1. **Analytics Page** (`src/app/analytics/page.tsx`)
   - Filter panel
   - Multiple chart views
   - Tag analysis section

2. **Filter Panel** (`src/components/analytics/filter-panel.tsx`)
   - Date range picker
   - Asset selector (multi-select)
   - Strategy selector
   - Tag selector (setup/mistake)
   - Time of day filter

3. **Variable Comparison** (`src/components/analytics/variable-comparison.tsx`)
   - Dropdown to select grouping variable
   - Bar chart comparing performance
   - Table with detailed breakdown

4. **Tag Cloud** (`src/components/analytics/tag-cloud.tsx`)
   - Visual tag display with size = frequency
   - Color = profitable/unprofitable
   - Click to filter trades by tag

5. **Expected Value Calculator** (`src/components/analytics/expected-value.tsx`)
   - Display current EV
   - Projection over N trades
   - Interactive adjustments

6. **R-Distribution Histogram** (`src/components/analytics/r-distribution.tsx`)
   - Bar chart of R outcomes
   - Highlight "fat tail" winners
   - Highlight cut losers

### Deliverables
- Full filtering system
- Variable comparison tool
- Tag analysis with cloud visualization
- EV calculator
- R-distribution chart

---

## Phase 5: Strategy Playbook

**Goal:** Build strategy library and compliance tracking.

### Backend Tasks

1. **Strategy Server Actions** (`src/app/actions/strategies.ts`)
   - `createStrategy()` - add playbook entry
   - `updateStrategy()` - edit strategy
   - `deleteStrategy()` - remove strategy
   - `getStrategies()` - list all
   - `getStrategyCompliance()` - % of trades following rules

2. **Compliance Calculation**
   - Link trades to strategies
   - Track rule adherence per trade
   - Calculate compliance percentage

### Frontend Tasks

1. **Playbook Page** (`src/app/playbook/page.tsx`)
   - Strategy list with compliance stats
   - Add new strategy button

2. **Strategy Card** (`src/components/playbook/strategy-card.tsx`)
   - Strategy name + description
   - Entry/Exit criteria
   - Compliance percentage badge
   - Trade count using this strategy

3. **Strategy Form** (`src/components/playbook/strategy-form.tsx`)
   - Name and description
   - Entry criteria (rich text or structured)
   - Exit criteria
   - Risk rules (max R, stop placement)
   - Screenshot upload (future: image storage)

4. **Strategy Detail Modal** (`src/components/playbook/strategy-detail.tsx`)
   - Full strategy view
   - "Gold standard" reference area
   - Linked trades list
   - Edit/Delete actions

5. **Compliance Dashboard** (`src/components/playbook/compliance-dashboard.tsx`)
   - Overall compliance score
   - Per-strategy breakdown
   - Trend over time

### Deliverables
- Strategy CRUD functionality
- Compliance tracking per strategy
- Playbook overview page

---

## Phase 6: Reports & Polish

**Goal:** Automated reports, CSV import, UX improvements.

### Backend Tasks

1. **Report Server Actions** (`src/app/actions/reports.ts`)
   - `getWeeklyReport()` - week summary data
   - `getMonthlyReport()` - month summary data
   - `getMistakeCostAnalysis()` - sum losses by mistake tag

2. **CSV Import** (`src/app/actions/import.ts`)
   - `parseCSV()` - validate and parse CSV
   - `importTrades()` - bulk insert trades
   - Template download endpoint

### Frontend Tasks

1. **Reports Page** (`src/app/reports/page.tsx`)
   - Report type selector (weekly/monthly)
   - Date range picker
   - Generated report display

2. **Weekly Report** (`src/components/reports/weekly-report.tsx`)
   - Summary statistics
   - Day-by-day breakdown
   - Top wins/losses
   - Mistake cost section

3. **Monthly Report** (`src/components/reports/monthly-report.tsx`)
   - Month overview
   - Week-by-week comparison
   - Strategy performance
   - Mistake analysis with cost

4. **Mistake Cost Analysis** (`src/components/reports/mistake-cost.tsx`)
   - Table of mistake tags
   - Total cost per mistake
   - Psychological impact messaging

5. **CSV Import** (`src/components/settings/csv-import.tsx`)
   - File upload dropzone
   - Column mapping interface
   - Preview before import
   - Import progress + results

6. **Settings Page** (`src/app/settings/page.tsx`)
   - Account preferences
   - Default risk settings
   - CSV import section
   - Data export

7. **UX Polish**
   - Loading states refinement
   - Error handling improvements
   - Toast notifications for actions
   - Keyboard shortcuts
   - Mobile responsiveness

### Deliverables
- Weekly and monthly automated reports
- Mistake cost analysis
- CSV import functionality
- Complete settings page
- Polished user experience

---

## File Structure Summary

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── page.tsx
│   ├── journal/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── analytics/
│   │   └── page.tsx
│   ├── playbook/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── actions/
│   │   ├── trades.ts
│   │   ├── strategies.ts
│   │   ├── tags.ts
│   │   ├── analytics.ts
│   │   ├── reports.ts
│   │   └── import.ts
│   ├── layout.tsx
│   ├── globals.css
│   ├── error.tsx
│   └── loading.tsx
├── components/
│   ├── ui/                    # Base shadcn components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── main-layout.tsx
│   │   └── page-header.tsx
│   ├── dashboard/
│   │   ├── kpi-cards.tsx
│   │   ├── trading-calendar.tsx
│   │   ├── equity-curve.tsx
│   │   └── quick-stats.tsx
│   ├── journal/
│   │   ├── trade-form.tsx
│   │   ├── trade-card.tsx
│   │   ├── trade-detail.tsx
│   │   └── trade-metric.tsx
│   ├── analytics/
│   │   ├── filter-panel.tsx
│   │   ├── variable-comparison.tsx
│   │   ├── tag-cloud.tsx
│   │   ├── expected-value.tsx
│   │   └── r-distribution.tsx
│   ├── playbook/
│   │   ├── strategy-card.tsx
│   │   ├── strategy-form.tsx
│   │   ├── strategy-detail.tsx
│   │   └── compliance-dashboard.tsx
│   ├── reports/
│   │   ├── weekly-report.tsx
│   │   ├── monthly-report.tsx
│   │   └── mistake-cost.tsx
│   └── settings/
│       └── csv-import.tsx
├── db/
│   ├── drizzle.ts
│   ├── schema.ts
│   └── migrations/
├── lib/
│   ├── utils.ts
│   ├── dates.ts
│   ├── calculations.ts
│   └── validations/
│       ├── trade.ts
│       └── strategy.ts
└── types/
    └── index.ts
```

---

## Development Guidelines

### Code Quality
- Follow TypeScript strict mode
- Use Zod for all form validations
- Use server actions for all data mutations
- Keep client components minimal
- Document complex calculations

### Testing Strategy
- Manual testing during development
- Focus on data integrity for trades
- Validate calculations match expected formulas

### Performance Considerations
- Use React Server Components where possible
- Implement pagination for trade lists
- Optimize chart data fetching
- Consider caching for analytics

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
