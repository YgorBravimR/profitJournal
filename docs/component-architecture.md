# Profit Journal - Component Architecture

## Overview

This document defines the frontend component structure, including naming conventions, component responsibilities, and the relationship between server and client components.

---

## Component Philosophy

### Server vs Client Components

| Type | Use For | Characteristics |
|------|---------|-----------------|
| **Server Components** | Data fetching, initial rendering | Default, no "use client", access to server actions |
| **Client Components** | Interactivity, state, effects | "use client" directive, hooks allowed |

**Rule:** Start with Server Components. Only add "use client" when you need:
- Event handlers (onClick, onChange)
- useState, useEffect, useReducer
- Browser-only APIs
- Third-party client libraries

### Component Naming

- **PascalCase** for component files and exports
- **kebab-case** for file names
- Descriptive, domain-specific names
- Prefix with domain context when needed

```
// Good
trading-calendar.tsx    → TradingCalendar
trade-form.tsx          → TradeForm
kpi-cards.tsx           → KPICards

// Avoid
calendar.tsx            → Calendar (too generic)
form.tsx                → Form (too generic)
```

---

## Component Directory Structure

```
src/components/
├── ui/                     # Base shadcn/design system components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── tabs.tsx
│   ├── tooltip.tsx
│   ├── badge.tsx
│   ├── progress.tsx
│   ├── skeleton.tsx
│   ├── toast.tsx
│   └── theme-toggle.tsx
│
├── layout/                 # App shell and navigation
│   ├── sidebar.tsx
│   ├── main-layout.tsx
│   ├── page-header.tsx
│   └── nav-item.tsx
│
├── dashboard/              # Command Center components
│   ├── kpi-cards.tsx
│   ├── trading-calendar.tsx
│   ├── equity-curve.tsx
│   ├── quick-stats.tsx
│   └── discipline-score.tsx
│
├── journal/                # Trade journaling components
│   ├── trade-form.tsx
│   ├── trade-card.tsx
│   ├── trade-detail.tsx
│   ├── trade-list.tsx
│   ├── trade-metric.tsx
│   ├── pnl-display.tsx
│   ├── r-multiple-bar.tsx
│   └── mfe-mae-chart.tsx
│
├── analytics/              # Analysis and filtering
│   ├── filter-panel.tsx
│   ├── variable-comparison.tsx
│   ├── tag-cloud.tsx
│   ├── expected-value.tsx
│   ├── r-distribution.tsx
│   └── date-range-picker.tsx
│
├── playbook/               # Strategy management
│   ├── strategy-card.tsx
│   ├── strategy-form.tsx
│   ├── strategy-detail.tsx
│   └── compliance-dashboard.tsx
│
├── reports/                # Automated reports
│   ├── weekly-report.tsx
│   ├── monthly-report.tsx
│   ├── mistake-cost.tsx
│   └── trade-distribution.tsx
│
├── settings/               # Configuration
│   ├── csv-import.tsx
│   ├── account-settings.tsx
│   └── risk-settings.tsx
│
└── shared/                 # Cross-domain reusables
    ├── empty-state.tsx
    ├── loading-spinner.tsx
    ├── error-boundary.tsx
    ├── confirm-dialog.tsx
    └── data-table.tsx
```

---

## Core UI Components (Shadcn)

### Already Implemented
- `Button` - Primary action component
- `Card` - Container with header/content/footer
- `Toast` - Notification system
- `ThemeToggle` - Dark/light mode switch

### To Be Added
```bash
# Add remaining shadcn components as needed
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add tooltip
npx shadcn@latest add badge
npx shadcn@latest add progress
npx shadcn@latest add skeleton
npx shadcn@latest add calendar
npx shadcn@latest add popover
```

---

## Layout Components

### MainLayout

The app shell wrapping all pages.

```typescript
// src/components/layout/main-layout.tsx
"use client"

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-bg-100 p-m-600">
        {children}
      </main>
    </div>
  )
}
```

### Sidebar

Navigation sidebar with collapsible state.

```typescript
// src/components/layout/sidebar.tsx
"use client"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Journal", href: "/journal", icon: BookOpen },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Playbook", href: "/playbook", icon: FileText },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/settings", icon: Settings },
]
```

### PageHeader

Consistent header for all pages.

```typescript
// src/components/layout/page-header.tsx

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  // Title, optional description, optional action button
}
```

---

## Dashboard Components

### KPICards

Grid of key performance indicators.

```typescript
// src/components/dashboard/kpi-cards.tsx

interface KPICardsProps {
  stats: {
    netPnl: number
    winRate: number
    profitFactor: number
    averageR: number
    disciplineScore: number
  }
}

// Server Component - receives calculated data
export const KPICards = ({ stats }: KPICardsProps) => {
  // 5 cards in responsive grid
  // Large P&L display, smaller metrics
  // Color coding: green for positive, periwinkle for negative
}
```

### TradingCalendar

Monthly calendar with P&L coloring.

```typescript
// src/components/dashboard/trading-calendar.tsx
"use client"

interface CalendarDay {
  date: Date
  pnl: number
  tradeCount: number
}

interface TradingCalendarProps {
  days: CalendarDay[]
  onDayClick: (date: Date) => void
}

// Client Component - needs click handlers, state for month navigation
export const TradingCalendar = ({ days, onDayClick }: TradingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Monthly grid
  // Color intensity based on P&L magnitude
  // Navigation arrows for month switching
  // Click to view day's trades
}
```

### EquityCurve

Line chart showing cumulative P&L.

```typescript
// src/components/dashboard/equity-curve.tsx
"use client"

interface EquityPoint {
  date: string
  equity: number
  drawdown: number
}

interface EquityCurveProps {
  data: EquityPoint[]
}

// Client Component - Recharts requires client
export const EquityCurve = ({ data }: EquityCurveProps) => {
  // Recharts ResponsiveContainer
  // AreaChart with gradient fill
  // Drawdown overlay (secondary area or line)
  // Tooltip with date, equity, drawdown %
}
```

### DisciplineScore

Visual representation of rule compliance.

```typescript
// src/components/dashboard/discipline-score.tsx

interface DisciplineScoreProps {
  score: number          // 0-100
  trend: "up" | "down" | "stable"
  recentCompliance: number  // last 10 trades
}

export const DisciplineScore = ({ score, trend, recentCompliance }: DisciplineScoreProps) => {
  // Circular progress or gauge
  // Large percentage number
  // Trend indicator
  // Recent compliance mini-chart
}
```

---

## Journal Components

### TradeForm

Multi-section form for trade entry.

```typescript
// src/components/journal/trade-form.tsx
"use client"

interface TradeFormProps {
  trade?: Trade          // undefined for new, Trade for edit
  strategies: Strategy[]
  tags: Tag[]
  onSuccess: () => void
}

// Client Component - form state, validation, submission
export const TradeForm = ({ trade, strategies, tags, onSuccess }: TradeFormProps) => {
  // Tabs or accordion sections:
  // 1. Basic Info: asset, direction, timeframe, dates
  // 2. Execution: entry/exit prices, size
  // 3. Risk Management: stop, target, planned R
  // 4. Results: P&L, actual R, MFE/MAE
  // 5. Journal: pre/post thoughts, lessons
  // 6. Classification: strategy, tags

  // Form validation with Zod + react-hook-form
  // Server action submission
}
```

### TradeCard

Summary card for trade list.

```typescript
// src/components/journal/trade-card.tsx

interface TradeCardProps {
  trade: Trade & {
    strategy?: Strategy
    tags: Tag[]
  }
}

// Server Component - no interactivity
export const TradeCard = ({ trade }: TradeCardProps) => {
  // Compact card showing:
  // - Asset + Direction badge
  // - Entry/Exit dates
  // - P&L (colored)
  // - R-Multiple
  // - Tags (small badges)
  // - Click navigates to detail
}
```

### TradeDetail

Full trade breakdown view.

```typescript
// src/components/journal/trade-detail.tsx

interface TradeDetailProps {
  trade: Trade & {
    strategy?: Strategy
    tags: Tag[]
  }
}

// Server Component - data display
export const TradeDetail = ({ trade }: TradeDetailProps) => {
  // Sections:
  // - Header: Asset, direction, dates
  // - Key Metrics: P&L, R, Win/Loss badge
  // - Planned vs Realized comparison
  // - MFE/MAE visualization
  // - Journal entries (pre/post thoughts)
  // - Tags and Strategy
  // - Actions: Edit, Delete
}
```

### PnLDisplay

Consistent P&L formatting.

```typescript
// src/components/journal/pnl-display.tsx

interface PnLDisplayProps {
  value: number
  showSign?: boolean
  size?: "sm" | "md" | "lg"
  showPercent?: boolean
  percentValue?: number
}

// Server Component - pure formatting
export const PnLDisplay = ({ value, showSign = true, size = "md" }: PnLDisplayProps) => {
  // Monospace font
  // Green for positive, periwinkle for negative
  // Optional +/- sign
  // Optional percentage in parentheses
}
```

### RMultipleBar

Visual comparison of planned vs actual R.

```typescript
// src/components/journal/r-multiple-bar.tsx

interface RMultipleBarProps {
  planned: number
  actual: number
}

// Server Component - pure visualization
export const RMultipleBar = ({ planned, actual }: RMultipleBarProps) => {
  // Horizontal bar chart
  // Planned R as target line/marker
  // Actual R as filled bar
  // Color based on hit target or not
}
```

---

## Analytics Components

### FilterPanel

Universal filtering controls.

```typescript
// src/components/analytics/filter-panel.tsx
"use client"

interface FilterState {
  dateRange: { start: Date; end: Date }
  assets: string[]
  directions: ("long" | "short")[]
  outcomes: ("win" | "loss" | "breakeven")[]
  strategies: string[]
  tags: string[]
  timeframes: string[]
}

interface FilterPanelProps {
  initialFilters: FilterState
  onFilterChange: (filters: FilterState) => void
  availableAssets: string[]
  availableStrategies: Strategy[]
  availableTags: Tag[]
}

// Client Component - interactive filters
export const FilterPanel = (props: FilterPanelProps) => {
  // Collapsible panel
  // Date range picker
  // Multi-select dropdowns for each filter
  // Apply/Clear buttons
  // Active filter badges
}
```

### VariableComparison

Grouped performance analysis.

```typescript
// src/components/analytics/variable-comparison.tsx
"use client"

type GroupBy = "asset" | "timeframe" | "hour" | "dayOfWeek" | "strategy"

interface ComparisonData {
  group: string
  trades: number
  pnl: number
  winRate: number
  avgR: number
}

interface VariableComparisonProps {
  data: ComparisonData[]
  groupBy: GroupBy
  onGroupByChange: (groupBy: GroupBy) => void
}

// Client Component - chart interaction
export const VariableComparison = (props: VariableComparisonProps) => {
  // Dropdown to select grouping
  // Bar chart comparing metrics
  // Sortable data table below
}
```

### TagCloud

Visual tag performance display.

```typescript
// src/components/analytics/tag-cloud.tsx
"use client"

interface TagStat {
  tag: Tag
  count: number
  totalPnl: number
  winRate: number
}

interface TagCloudProps {
  setupTags: TagStat[]
  mistakeTags: TagStat[]
  onTagClick: (tagId: string) => void
}

// Client Component - click interaction
export const TagCloud = (props: TagCloudProps) => {
  // Two sections: Setup Tags, Mistake Tags
  // Size = frequency
  // Color = profitable (green) vs unprofitable (periwinkle/yellow)
  // Click filters trades by tag
}
```

### ExpectedValue

EV calculator and projection.

```typescript
// src/components/analytics/expected-value.tsx

interface EVData {
  winRate: number
  avgWin: number
  avgLoss: number
  expectedValue: number
}

interface ExpectedValueProps {
  data: EVData
  projectionTrades?: number
}

// Server Component - calculated display
export const ExpectedValue = ({ data, projectionTrades = 100 }: ExpectedValueProps) => {
  // EV formula display
  // Current EV value (prominent)
  // Projection: "In 100 trades, expect: $X"
  // Breakdown of win/loss averages
}
```

### RDistribution

Histogram of R-multiples.

```typescript
// src/components/analytics/r-distribution.tsx
"use client"

interface RBucket {
  range: string      // e.g., "-2R to -1R"
  count: number
}

interface RDistributionProps {
  data: RBucket[]
}

// Client Component - Recharts
export const RDistribution = ({ data }: RDistributionProps) => {
  // Recharts BarChart
  // X-axis: R ranges
  // Y-axis: Trade count
  // Highlight fat tail winners (green)
  // Highlight cut losers (periwinkle)
  // Goal: small losers, big winners
}
```

---

## Playbook Components

### StrategyCard

Summary card for strategy list.

```typescript
// src/components/playbook/strategy-card.tsx

interface StrategyCardProps {
  strategy: Strategy & {
    tradeCount: number
    compliance: number
    totalPnl: number
  }
}

// Server Component
export const StrategyCard = ({ strategy }: StrategyCardProps) => {
  // Strategy name + description
  // Compliance badge (color-coded)
  // Trade count
  // Total P&L
  // Click opens detail
}
```

### StrategyForm

Form for creating/editing strategies.

```typescript
// src/components/playbook/strategy-form.tsx
"use client"

interface StrategyFormProps {
  strategy?: Strategy
  onSuccess: () => void
  onCancel: () => void
}

// Client Component - form handling
export const StrategyForm = (props: StrategyFormProps) => {
  // Fields:
  // - Name
  // - Description
  // - Entry Criteria (textarea)
  // - Exit Criteria (textarea)
  // - Risk Rules (textarea)
  // - Target R
  // - Max Risk %
  // - Screenshot upload (future)
  // - Notes
}
```

### ComplianceDashboard

Overview of playbook adherence.

```typescript
// src/components/playbook/compliance-dashboard.tsx

interface ComplianceData {
  overall: number
  byStrategy: Array<{
    strategy: Strategy
    compliance: number
    tradeCount: number
  }>
  trend: Array<{
    date: string
    compliance: number
  }>
}

interface ComplianceDashboardProps {
  data: ComplianceData
}

// Server Component
export const ComplianceDashboard = ({ data }: ComplianceDashboardProps) => {
  // Overall score (large, circular)
  // Per-strategy breakdown
  // Trend line chart
}
```

---

## Report Components

### WeeklyReport

Generated weekly summary.

```typescript
// src/components/reports/weekly-report.tsx

interface WeeklyReportData {
  dateRange: { start: Date; end: Date }
  totalPnl: number
  tradeCount: number
  winRate: number
  bestDay: { date: Date; pnl: number }
  worstDay: { date: Date; pnl: number }
  topWins: Trade[]
  topLosses: Trade[]
  mistakeCosts: Array<{ tag: string; cost: number }>
}

interface WeeklyReportProps {
  data: WeeklyReportData
}

// Server Component - printable/exportable
export const WeeklyReport = ({ data }: WeeklyReportProps) => {
  // Header with date range
  // Summary KPIs
  // Day-by-day mini-calendar
  // Top 3 wins/losses
  // Mistake cost breakdown
}
```

### MistakeCost

Psychological impact display for mistakes.

```typescript
// src/components/reports/mistake-cost.tsx

interface MistakeCostData {
  tag: string
  occurrences: number
  totalCost: number
}

interface MistakeCostProps {
  mistakes: MistakeCostData[]
  period: string
}

// Server Component
export const MistakeCost = ({ mistakes, period }: MistakeCostProps) => {
  // Table of mistakes
  // Sorted by cost (highest first)
  // Bold messaging: "FOMO cost you $1,200 this month"
  // Psychological framing to prevent future errors
}
```

---

## Shared Components

### EmptyState

Consistent empty state display.

```typescript
// src/components/shared/empty-state.tsx

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState = (props: EmptyStateProps) => {
  // Centered content
  // Icon (optional, muted)
  // Title
  // Description
  // CTA button (optional)
}
```

### ConfirmDialog

Reusable confirmation modal.

```typescript
// src/components/shared/confirm-dialog.tsx
"use client"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
}

// Client Component - dialog state
export const ConfirmDialog = (props: ConfirmDialogProps) => {
  // Shadcn Dialog
  // Title + description
  // Cancel and Confirm buttons
  // Destructive variant for delete actions
}
```

### DataTable

Generic sortable/filterable table.

```typescript
// src/components/shared/data-table.tsx
"use client"

interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
}

// Client Component - sorting, pagination
export const DataTable = <T,>(props: DataTableProps<T>) => {
  // Zebra-striped rows
  // Sortable column headers
  // Click handler for rows
  // Pagination controls
}
```

---

## Props Pattern

### Consistent Props Structure

```typescript
// Always type props explicitly
interface ComponentProps {
  // Required props first
  data: DataType

  // Optional props with defaults
  variant?: "default" | "compact"
  className?: string

  // Event handlers prefixed with "on"
  onClick?: () => void
  onSuccess?: () => void

  // Children when needed
  children?: React.ReactNode
}
```

### Passing Data from Server to Client

```typescript
// Page (Server Component)
const Page = async () => {
  const data = await fetchData()

  return (
    <ClientComponent initialData={data} />
  )
}

// Client Component
"use client"

const ClientComponent = ({ initialData }: { initialData: Data }) => {
  const [data, setData] = useState(initialData)
  // Now has reactive state
}
```

---

## Styling Guidelines

### Tailwind Classes

```typescript
// Use design tokens from globals.css
<div className="bg-bg-100 text-txt-100 p-m-600">

// Responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// State variants
<button className="hover:bg-bg-300 focus:ring-acc-100">
```

### Trading Colors

```typescript
// Positive/Buy - Mint
className="text-trade-buy"  // rgb(0, 255, 150)

// Negative/Sell - Periwinkle
className="text-trade-sell" // rgb(128, 128, 255)

// Warning - Yellow
className="text-warning"    // rgb(252, 213, 53)
```

### Component Variants with CVA

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const metricVariants = cva(
  "font-mono tabular-nums",
  {
    variants: {
      type: {
        positive: "text-trade-buy",
        negative: "text-trade-sell",
        neutral: "text-txt-100",
      },
      size: {
        sm: "text-small",
        md: "text-body",
        lg: "text-h3",
      },
    },
    defaultVariants: {
      type: "neutral",
      size: "md",
    },
  }
)
```

---

## Accessibility

### Required Attributes

```typescript
// Interactive elements
<button
  type="button"
  aria-label="Close dialog"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>

// Form inputs
<input
  id="asset"
  aria-describedby="asset-error"
  aria-invalid={hasError}
/>
<span id="asset-error" role="alert">
  {errorMessage}
</span>

// Status indicators
<span role="status" aria-live="polite">
  {loadingMessage}
</span>
```

### Color Contrast

- All text meets WCAG AA standards
- Don't rely solely on color for meaning (add icons/text)
- Focus states visible on all interactive elements
