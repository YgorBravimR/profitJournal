# Profit Journal - Server Actions & API Design

## Overview

This document defines all server actions for the Profit Journal platform. Server actions use Next.js 15's built-in server action pattern with "use server" directive.

---

## Response Format

All server actions follow a consistent response structure:

```typescript
// src/types/index.ts

interface ActionResponse<T> {
  status: "success" | "error"
  message: string
  data?: T
  errors?: ActionError[]
}

interface ActionError {
  code: string
  detail: string
  field?: string  // for form validation errors
}

// Pagination wrapper
interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
```

---

## Trade Actions

Location: `src/app/actions/trades.ts`

### createTrade

Creates a new trade record.

```typescript
"use server"

import { z } from "zod"
import { db } from "@/db/drizzle"
import { trades, tradeTags } from "@/db/schema"

const createTradeSchema = z.object({
  asset: z.string().min(1).max(20),
  direction: z.enum(["long", "short"]),
  timeframe: z.enum(["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"]).optional(),
  entryDate: z.coerce.date(),
  exitDate: z.coerce.date().optional(),
  entryPrice: z.coerce.number().positive(),
  exitPrice: z.coerce.number().positive().optional(),
  positionSize: z.coerce.number().positive(),
  stopLoss: z.coerce.number().positive().optional(),
  takeProfit: z.coerce.number().positive().optional(),
  plannedRiskAmount: z.coerce.number().optional(),
  plannedRMultiple: z.coerce.number().optional(),
  pnl: z.coerce.number().optional(),
  realizedRMultiple: z.coerce.number().optional(),
  mfe: z.coerce.number().optional(),
  mae: z.coerce.number().optional(),
  commission: z.coerce.number().default(0),
  fees: z.coerce.number().default(0),
  preTradeThoughts: z.string().optional(),
  postTradeReflection: z.string().optional(),
  lessonLearned: z.string().optional(),
  strategyId: z.string().uuid().optional(),
  followedPlan: z.boolean().optional(),
  disciplineNotes: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
})

type CreateTradeInput = z.infer<typeof createTradeSchema>

export const createTrade = async (
  input: CreateTradeInput
): Promise<ActionResponse<Trade>> => {
  try {
    const validated = createTradeSchema.parse(input)
    const { tagIds, ...tradeData } = validated

    // Calculate outcome if exitPrice exists
    let outcome: "win" | "loss" | "breakeven" | undefined
    if (tradeData.pnl !== undefined) {
      outcome = tradeData.pnl > 0 ? "win" : tradeData.pnl < 0 ? "loss" : "breakeven"
    }

    // Calculate realized R if we have pnl and plannedRiskAmount
    let realizedR: number | undefined
    if (tradeData.pnl && tradeData.plannedRiskAmount) {
      realizedR = tradeData.pnl / tradeData.plannedRiskAmount
    }

    // Insert trade
    const [trade] = await db
      .insert(trades)
      .values({
        ...tradeData,
        outcome,
        realizedRMultiple: realizedR?.toString(),
      })
      .returning()

    // Insert tag associations
    if (tagIds?.length) {
      await db.insert(tradeTags).values(
        tagIds.map((tagId) => ({
          tradeId: trade.id,
          tagId,
        }))
      )
    }

    return {
      status: "success",
      message: "Trade created successfully",
      data: trade,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: "error",
        message: "Validation failed",
        errors: error.errors.map((e) => ({
          code: "VALIDATION_ERROR",
          detail: e.message,
          field: e.path.join("."),
        })),
      }
    }

    return {
      status: "error",
      message: "Failed to create trade",
      errors: [{ code: "CREATE_FAILED", detail: String(error) }],
    }
  }
}
```

### updateTrade

Updates an existing trade.

```typescript
export const updateTrade = async (
  id: string,
  input: Partial<CreateTradeInput>
): Promise<ActionResponse<Trade>> => {
  // Validate id is UUID
  // Validate partial input
  // Update trade
  // Update tag associations (delete existing, insert new)
  // Return updated trade
}
```

### deleteTrade

Soft deletes a trade (sets isArchived = true).

```typescript
export const deleteTrade = async (
  id: string
): Promise<ActionResponse<void>> => {
  try {
    await db
      .update(trades)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(trades.id, id))

    return {
      status: "success",
      message: "Trade archived successfully",
    }
  } catch (error) {
    return {
      status: "error",
      message: "Failed to archive trade",
      errors: [{ code: "DELETE_FAILED", detail: String(error) }],
    }
  }
}
```

### getTrade

Fetches a single trade with relations.

```typescript
export const getTrade = async (
  id: string
): Promise<ActionResponse<TradeWithRelations>> => {
  try {
    const trade = await db.query.trades.findFirst({
      where: and(eq(trades.id, id), eq(trades.isArchived, false)),
      with: {
        strategy: true,
        tags: {
          with: {
            tag: true,
          },
        },
      },
    })

    if (!trade) {
      return {
        status: "error",
        message: "Trade not found",
        errors: [{ code: "NOT_FOUND", detail: "Trade does not exist" }],
      }
    }

    return {
      status: "success",
      message: "Trade retrieved successfully",
      data: trade,
    }
  } catch (error) {
    return {
      status: "error",
      message: "Failed to retrieve trade",
      errors: [{ code: "FETCH_FAILED", detail: String(error) }],
    }
  }
}
```

### getTrades

Paginated list with filters.

```typescript
interface GetTradesParams {
  limit?: number
  offset?: number
  dateFrom?: Date
  dateTo?: Date
  assets?: string[]
  directions?: ("long" | "short")[]
  outcomes?: ("win" | "loss" | "breakeven")[]
  strategyIds?: string[]
  tagIds?: string[]
  timeframes?: string[]
  sortBy?: "entryDate" | "pnl" | "realizedRMultiple"
  sortOrder?: "asc" | "desc"
}

export const getTrades = async (
  params: GetTradesParams
): Promise<ActionResponse<PaginatedResponse<TradeWithRelations>>> => {
  const {
    limit = 20,
    offset = 0,
    dateFrom,
    dateTo,
    assets,
    directions,
    outcomes,
    strategyIds,
    tagIds,
    timeframes,
    sortBy = "entryDate",
    sortOrder = "desc",
  } = params

  // Build where conditions dynamically
  const conditions = [eq(trades.isArchived, false)]

  if (dateFrom) conditions.push(gte(trades.entryDate, dateFrom))
  if (dateTo) conditions.push(lte(trades.entryDate, dateTo))
  if (assets?.length) conditions.push(inArray(trades.asset, assets))
  if (directions?.length) conditions.push(inArray(trades.direction, directions))
  if (outcomes?.length) conditions.push(inArray(trades.outcome, outcomes))
  if (strategyIds?.length) conditions.push(inArray(trades.strategyId, strategyIds))
  if (timeframes?.length) conditions.push(inArray(trades.timeframe, timeframes))

  // Handle tag filtering (requires join)
  // ...

  // Execute query with count
  const [result, countResult] = await Promise.all([
    db.query.trades.findMany({
      where: and(...conditions),
      with: {
        strategy: true,
        tags: { with: { tag: true } },
      },
      orderBy: sortOrder === "desc" ? desc(trades[sortBy]) : asc(trades[sortBy]),
      limit,
      offset,
    }),
    db.select({ count: count() }).from(trades).where(and(...conditions)),
  ])

  return {
    status: "success",
    message: "Trades retrieved successfully",
    data: {
      items: result,
      pagination: {
        total: countResult[0].count,
        limit,
        offset,
        hasMore: offset + result.length < countResult[0].count,
      },
    },
  }
}
```

### getTradesForDate

Get all trades for a specific date (for calendar).

```typescript
export const getTradesForDate = async (
  date: Date
): Promise<ActionResponse<Trade[]>> => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const result = await db.query.trades.findMany({
    where: and(
      eq(trades.isArchived, false),
      gte(trades.entryDate, startOfDay),
      lte(trades.entryDate, endOfDay)
    ),
    orderBy: asc(trades.entryDate),
  })

  return {
    status: "success",
    message: "Trades retrieved successfully",
    data: result,
  }
}
```

---

## Strategy Actions

Location: `src/app/actions/strategies.ts`

### createStrategy

```typescript
"use server"

const createStrategySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  entryCriteria: z.string().optional(),
  exitCriteria: z.string().optional(),
  riskRules: z.string().optional(),
  targetRMultiple: z.coerce.number().optional(),
  maxRiskPercent: z.coerce.number().min(0).max(100).optional(),
  screenshotUrl: z.string().url().optional(),
  notes: z.string().optional(),
})

export const createStrategy = async (
  input: z.infer<typeof createStrategySchema>
): Promise<ActionResponse<Strategy>> => {
  // Validate and insert
}
```

### getStrategies

```typescript
export const getStrategies = async (): Promise<ActionResponse<StrategyWithStats[]>> => {
  // Fetch all active strategies
  // Include trade count and compliance stats
  const result = await db
    .select({
      strategy: strategies,
      tradeCount: count(trades.id),
      followedCount: sql<number>`count(*) filter (where ${trades.followedPlan} = true)`,
      totalPnl: sum(trades.pnl),
    })
    .from(strategies)
    .leftJoin(trades, eq(trades.strategyId, strategies.id))
    .where(eq(strategies.isActive, true))
    .groupBy(strategies.id)

  // Calculate compliance percentage
  const withCompliance = result.map((r) => ({
    ...r.strategy,
    tradeCount: r.tradeCount,
    compliance: r.tradeCount > 0 ? (r.followedCount / r.tradeCount) * 100 : 0,
    totalPnl: r.totalPnl || 0,
  }))

  return {
    status: "success",
    message: "Strategies retrieved successfully",
    data: withCompliance,
  }
}
```

### getStrategyCompliance

```typescript
export const getStrategyCompliance = async (
  strategyId: string
): Promise<ActionResponse<ComplianceData>> => {
  // Get compliance stats for a specific strategy
  // Include trend over time
}
```

---

## Tag Actions

Location: `src/app/actions/tags.ts`

### createTag

```typescript
"use server"

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(["setup", "mistake", "general"]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().optional(),
})

export const createTag = async (
  input: z.infer<typeof createTagSchema>
): Promise<ActionResponse<Tag>> => {
  // Check for duplicate name
  // Insert and return
}
```

### getTags

```typescript
export const getTags = async (
  type?: "setup" | "mistake" | "general"
): Promise<ActionResponse<Tag[]>> => {
  const conditions = type ? [eq(tags.type, type)] : []

  const result = await db.query.tags.findMany({
    where: and(...conditions),
    orderBy: asc(tags.name),
  })

  return {
    status: "success",
    message: "Tags retrieved successfully",
    data: result,
  }
}
```

### getTagStats

Performance statistics per tag.

```typescript
interface TagStats {
  tag: Tag
  tradeCount: number
  totalPnl: number
  winRate: number
  avgR: number
}

export const getTagStats = async (): Promise<ActionResponse<TagStats[]>> => {
  const result = await db
    .select({
      tag: tags,
      tradeCount: count(tradeTags.tradeId),
      totalPnl: sum(trades.pnl),
      winCount: sql<number>`count(*) filter (where ${trades.outcome} = 'win')`,
      avgR: avg(trades.realizedRMultiple),
    })
    .from(tags)
    .leftJoin(tradeTags, eq(tradeTags.tagId, tags.id))
    .leftJoin(trades, eq(trades.id, tradeTags.tradeId))
    .groupBy(tags.id)

  const withWinRate = result.map((r) => ({
    tag: r.tag,
    tradeCount: r.tradeCount,
    totalPnl: Number(r.totalPnl) || 0,
    winRate: r.tradeCount > 0 ? (r.winCount / r.tradeCount) * 100 : 0,
    avgR: Number(r.avgR) || 0,
  }))

  return {
    status: "success",
    message: "Tag stats retrieved successfully",
    data: withWinRate,
  }
}
```

---

## Analytics Actions

Location: `src/app/actions/analytics.ts`

### getOverallStats

Dashboard KPIs.

```typescript
"use server"

interface OverallStats {
  netPnl: number
  winRate: number
  profitFactor: number
  averageR: number
  totalTrades: number
  winCount: number
  lossCount: number
  avgWin: number
  avgLoss: number
}

export const getOverallStats = async (
  dateFrom?: Date,
  dateTo?: Date
): Promise<ActionResponse<OverallStats>> => {
  const conditions = [eq(trades.isArchived, false)]
  if (dateFrom) conditions.push(gte(trades.entryDate, dateFrom))
  if (dateTo) conditions.push(lte(trades.entryDate, dateTo))

  const result = await db
    .select({
      netPnl: sum(trades.pnl),
      totalTrades: count(),
      winCount: sql<number>`count(*) filter (where ${trades.outcome} = 'win')`,
      lossCount: sql<number>`count(*) filter (where ${trades.outcome} = 'loss')`,
      totalWins: sql<number>`sum(${trades.pnl}) filter (where ${trades.outcome} = 'win')`,
      totalLosses: sql<number>`abs(sum(${trades.pnl}) filter (where ${trades.outcome} = 'loss'))`,
      avgR: avg(trades.realizedRMultiple),
    })
    .from(trades)
    .where(and(...conditions))

  const stats = result[0]

  const winRate = stats.totalTrades > 0 ? (stats.winCount / stats.totalTrades) * 100 : 0
  const profitFactor = stats.totalLosses > 0 ? stats.totalWins / stats.totalLosses : stats.totalWins
  const avgWin = stats.winCount > 0 ? stats.totalWins / stats.winCount : 0
  const avgLoss = stats.lossCount > 0 ? stats.totalLosses / stats.lossCount : 0

  return {
    status: "success",
    message: "Stats retrieved successfully",
    data: {
      netPnl: Number(stats.netPnl) || 0,
      winRate,
      profitFactor,
      averageR: Number(stats.avgR) || 0,
      totalTrades: stats.totalTrades,
      winCount: stats.winCount,
      lossCount: stats.lossCount,
      avgWin,
      avgLoss,
    },
  }
}
```

### getDailyPnL

For calendar coloring.

```typescript
interface DailyPnL {
  date: string
  pnl: number
  tradeCount: number
}

export const getDailyPnL = async (
  month: Date
): Promise<ActionResponse<DailyPnL[]>> => {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59)

  const result = await db
    .select({
      date: sql<string>`date_trunc('day', ${trades.entryDate})::date`,
      pnl: sum(trades.pnl),
      tradeCount: count(),
    })
    .from(trades)
    .where(
      and(
        eq(trades.isArchived, false),
        gte(trades.entryDate, startOfMonth),
        lte(trades.entryDate, endOfMonth)
      )
    )
    .groupBy(sql`date_trunc('day', ${trades.entryDate})`)

  return {
    status: "success",
    message: "Daily P&L retrieved successfully",
    data: result.map((r) => ({
      date: r.date,
      pnl: Number(r.pnl) || 0,
      tradeCount: r.tradeCount,
    })),
  }
}
```

### getEquityCurve

Cumulative P&L over time.

```typescript
interface EquityPoint {
  date: string
  equity: number
  drawdown: number
}

export const getEquityCurve = async (
  dateFrom?: Date,
  dateTo?: Date
): Promise<ActionResponse<EquityPoint[]>> => {
  // Fetch all trades in date range, ordered by date
  // Calculate cumulative equity
  // Calculate drawdown from peak

  const tradesInRange = await db.query.trades.findMany({
    where: and(
      eq(trades.isArchived, false),
      dateFrom ? gte(trades.entryDate, dateFrom) : undefined,
      dateTo ? lte(trades.entryDate, dateTo) : undefined
    ),
    orderBy: asc(trades.entryDate),
    columns: {
      entryDate: true,
      pnl: true,
    },
  })

  let cumulative = 0
  let peak = 0
  const equityPoints: EquityPoint[] = []

  for (const trade of tradesInRange) {
    cumulative += Number(trade.pnl) || 0
    peak = Math.max(peak, cumulative)
    const drawdown = peak > 0 ? ((peak - cumulative) / peak) * 100 : 0

    equityPoints.push({
      date: trade.entryDate.toISOString().split("T")[0],
      equity: cumulative,
      drawdown,
    })
  }

  return {
    status: "success",
    message: "Equity curve retrieved successfully",
    data: equityPoints,
  }
}
```

### getDisciplineScore

Playbook compliance percentage.

```typescript
interface DisciplineData {
  score: number
  totalTrades: number
  followedCount: number
  trend: "up" | "down" | "stable"
  recentCompliance: number // last 10 trades
}

export const getDisciplineScore = async (): Promise<ActionResponse<DisciplineData>> => {
  // Get all trades with followedPlan set
  const result = await db
    .select({
      total: count(),
      followed: sql<number>`count(*) filter (where ${trades.followedPlan} = true)`,
    })
    .from(trades)
    .where(and(
      eq(trades.isArchived, false),
      isNotNull(trades.followedPlan)
    ))

  // Get last 10 trades for recent compliance
  const recentTrades = await db.query.trades.findMany({
    where: and(
      eq(trades.isArchived, false),
      isNotNull(trades.followedPlan)
    ),
    orderBy: desc(trades.entryDate),
    limit: 10,
    columns: { followedPlan: true },
  })

  const recentFollowed = recentTrades.filter((t) => t.followedPlan).length
  const recentCompliance = recentTrades.length > 0
    ? (recentFollowed / recentTrades.length) * 100
    : 0

  const stats = result[0]
  const score = stats.total > 0 ? (stats.followed / stats.total) * 100 : 0

  // Determine trend (compare recent to overall)
  let trend: "up" | "down" | "stable" = "stable"
  if (recentCompliance > score + 5) trend = "up"
  else if (recentCompliance < score - 5) trend = "down"

  return {
    status: "success",
    message: "Discipline score retrieved successfully",
    data: {
      score,
      totalTrades: stats.total,
      followedCount: stats.followed,
      trend,
      recentCompliance,
    },
  }
}
```

### getPerformanceByVariable

Group trades by a variable for comparison.

```typescript
type GroupByVariable = "asset" | "timeframe" | "hour" | "dayOfWeek" | "strategy"

interface VariablePerformance {
  group: string
  tradeCount: number
  pnl: number
  winRate: number
  avgR: number
}

export const getPerformanceByVariable = async (
  groupBy: GroupByVariable,
  dateFrom?: Date,
  dateTo?: Date
): Promise<ActionResponse<VariablePerformance[]>> => {
  // Dynamic grouping based on variable
  // Build appropriate SQL for each case
  // Return aggregated stats per group
}
```

### getExpectedValue

Calculate expected value per trade.

```typescript
interface ExpectedValueData {
  winRate: number
  avgWin: number
  avgLoss: number
  expectedValue: number
  projectedPnl100: number // expected P&L over 100 trades
}

export const getExpectedValue = async (
  filters?: GetTradesParams
): Promise<ActionResponse<ExpectedValueData>> => {
  // EV = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)

  const stats = await getOverallStats(filters?.dateFrom, filters?.dateTo)
  if (stats.status === "error") return stats as ActionResponse<ExpectedValueData>

  const { winRate, avgWin, avgLoss } = stats.data!
  const lossRate = 100 - winRate

  const expectedValue = (winRate / 100 * avgWin) - (lossRate / 100 * avgLoss)
  const projectedPnl100 = expectedValue * 100

  return {
    status: "success",
    message: "Expected value calculated successfully",
    data: {
      winRate,
      avgWin,
      avgLoss,
      expectedValue,
      projectedPnl100,
    },
  }
}
```

### getRDistribution

R-multiple distribution for histogram.

```typescript
interface RBucket {
  range: string
  minR: number
  maxR: number
  count: number
}

export const getRDistribution = async (
  bucketSize: number = 0.5,
  dateFrom?: Date,
  dateTo?: Date
): Promise<ActionResponse<RBucket[]>> => {
  // Fetch all R values
  // Bucket into ranges
  // Return counts per bucket
}
```

---

## Report Actions

Location: `src/app/actions/reports.ts`

### getWeeklyReport

```typescript
"use server"

interface WeeklyReportData {
  dateRange: { start: Date; end: Date }
  totalPnl: number
  tradeCount: number
  winRate: number
  profitFactor: number
  bestDay: { date: Date; pnl: number } | null
  worstDay: { date: Date; pnl: number } | null
  topWins: Trade[]
  topLosses: Trade[]
  mistakeCosts: Array<{ tag: string; cost: number }>
  dailyBreakdown: Array<{ date: Date; pnl: number; tradeCount: number }>
}

export const getWeeklyReport = async (
  weekStart: Date
): Promise<ActionResponse<WeeklyReportData>> => {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  // Parallel fetch all required data
  const [stats, dailyPnl, topWins, topLosses, mistakes] = await Promise.all([
    getOverallStats(weekStart, weekEnd),
    getDailyPnL(weekStart),
    getTopTrades(weekStart, weekEnd, "win", 3),
    getTopTrades(weekStart, weekEnd, "loss", 3),
    getMistakeCosts(weekStart, weekEnd),
  ])

  // Process and return report data
}
```

### getMonthlyReport

```typescript
interface MonthlyReportData {
  month: Date
  totalPnl: number
  tradeCount: number
  winRate: number
  profitFactor: number
  weeklyBreakdown: Array<{
    weekStart: Date
    pnl: number
    tradeCount: number
  }>
  strategyPerformance: Array<{
    strategy: Strategy
    pnl: number
    compliance: number
  }>
  mistakeCosts: Array<{ tag: string; cost: number }>
}

export const getMonthlyReport = async (
  month: Date
): Promise<ActionResponse<MonthlyReportData>> => {
  // Similar to weekly but for full month
}
```

### getMistakeCosts

```typescript
interface MistakeCost {
  tag: Tag
  occurrences: number
  totalCost: number
}

export const getMistakeCosts = async (
  dateFrom: Date,
  dateTo: Date
): Promise<ActionResponse<MistakeCost[]>> => {
  const result = await db
    .select({
      tag: tags,
      occurrences: count(tradeTags.id),
      totalCost: sql<number>`abs(sum(${trades.pnl}) filter (where ${trades.pnl} < 0))`,
    })
    .from(tags)
    .innerJoin(tradeTags, eq(tradeTags.tagId, tags.id))
    .innerJoin(trades, eq(trades.id, tradeTags.tradeId))
    .where(
      and(
        eq(tags.type, "mistake"),
        eq(trades.isArchived, false),
        gte(trades.entryDate, dateFrom),
        lte(trades.entryDate, dateTo)
      )
    )
    .groupBy(tags.id)
    .orderBy(desc(sql`abs(sum(${trades.pnl}) filter (where ${trades.pnl} < 0))`))

  return {
    status: "success",
    message: "Mistake costs retrieved successfully",
    data: result.map((r) => ({
      tag: r.tag,
      occurrences: r.occurrences,
      totalCost: Number(r.totalCost) || 0,
    })),
  }
}
```

---

## Import Actions

Location: `src/app/actions/import.ts`

### parseCSV

```typescript
"use server"

interface CSVParseResult {
  headers: string[]
  rows: string[][]
  rowCount: number
  preview: string[][]  // first 5 rows
}

export const parseCSV = async (
  fileContent: string
): Promise<ActionResponse<CSVParseResult>> => {
  // Parse CSV content
  // Validate structure
  // Return headers and preview
}
```

### importTrades

```typescript
interface ColumnMapping {
  asset: string
  direction: string
  entryDate: string
  exitDate: string
  entryPrice: string
  exitPrice: string
  positionSize: string
  pnl: string
  // ... other optional mappings
}

interface ImportResult {
  totalRows: number
  successCount: number
  errorCount: number
  errors: Array<{ row: number; message: string }>
}

export const importTrades = async (
  fileContent: string,
  columnMapping: ColumnMapping
): Promise<ActionResponse<ImportResult>> => {
  // Parse CSV
  // Map columns to trade fields
  // Validate each row
  // Batch insert valid trades
  // Return success/error counts
}
```

---

## Daily Journal Actions

Location: `src/app/actions/journals.ts`

### upsertDailyJournal

Create or update daily journal entry.

```typescript
"use server"

const journalSchema = z.object({
  date: z.coerce.date(),
  marketOutlook: z.string().optional(),
  focusGoals: z.string().optional(),
  mentalState: z.number().min(1).max(10).optional(),
  sessionReview: z.string().optional(),
  emotionalState: z.number().min(1).max(10).optional(),
  keyTakeaways: z.string().optional(),
})

export const upsertDailyJournal = async (
  input: z.infer<typeof journalSchema>
): Promise<ActionResponse<DailyJournal>> => {
  // Check if entry exists for date
  // If exists, update
  // If not, insert
  // Auto-calculate metrics from trades for that day
}
```

### getDailyJournal

```typescript
export const getDailyJournal = async (
  date: Date
): Promise<ActionResponse<DailyJournal | null>> => {
  // Fetch journal entry for specific date
  // Include calculated metrics
}
```

---

## Settings Actions

Location: `src/app/actions/settings.ts`

### getSetting

```typescript
export const getSetting = async (
  key: string
): Promise<ActionResponse<string | null>> => {
  const setting = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  })

  return {
    status: "success",
    message: "Setting retrieved",
    data: setting?.value ?? null,
  }
}
```

### updateSetting

```typescript
export const updateSetting = async (
  key: string,
  value: string
): Promise<ActionResponse<Setting>> => {
  const [setting] = await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    })
    .returning()

  return {
    status: "success",
    message: "Setting updated",
    data: setting,
  }
}
```

### getSettings

```typescript
export const getSettings = async (): Promise<ActionResponse<Record<string, string>>> => {
  const allSettings = await db.query.settings.findMany()

  const settingsMap = Object.fromEntries(
    allSettings.map((s) => [s.key, s.value])
  )

  return {
    status: "success",
    message: "Settings retrieved",
    data: settingsMap,
  }
}
```

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input failed schema validation |
| `NOT_FOUND` | Requested resource doesn't exist |
| `CREATE_FAILED` | Failed to create resource |
| `UPDATE_FAILED` | Failed to update resource |
| `DELETE_FAILED` | Failed to delete resource |
| `FETCH_FAILED` | Failed to fetch resource |
| `DUPLICATE_ERROR` | Resource already exists |
| `PARSE_ERROR` | Failed to parse input (CSV, JSON) |
| `IMPORT_ERROR` | Bulk import encountered errors |

---

## Utility Functions

Location: `src/lib/dates.ts`

```typescript
export const getWeekBoundaries = (date: Date) => {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay()) // Sunday
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6) // Saturday
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export const getMonthBoundaries = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

  return { start, end }
}

export const formatCurrency = (value: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export const formatPercent = (value: number, decimals = 1) => {
  return `${value.toFixed(decimals)}%`
}
```

Location: `src/lib/calculations.ts`

```typescript
export const calculateWinRate = (wins: number, total: number) => {
  return total > 0 ? (wins / total) * 100 : 0
}

export const calculateProfitFactor = (grossProfit: number, grossLoss: number) => {
  return grossLoss > 0 ? grossProfit / grossLoss : grossProfit
}

export const calculateExpectedValue = (winRate: number, avgWin: number, avgLoss: number) => {
  const lossRate = 100 - winRate
  return (winRate / 100 * avgWin) - (lossRate / 100 * avgLoss)
}

export const calculateDrawdown = (equity: number, peak: number) => {
  return peak > 0 ? ((peak - equity) / peak) * 100 : 0
}

export const calculateRMultiple = (pnl: number, riskAmount: number) => {
  return riskAmount > 0 ? pnl / riskAmount : 0
}
```
