# Phase 2: Detailed CSV Import Implementation
## Enhanced Trade Import with Automatic Grouping

**Target:** Clear, XP, Genial brokers | **MVP Timeline:** 2-3 weeks | **Sync:** Daily batch + manual with 30-min cooldown

---

## What Users Will Do

1. **Export from Broker:**
   ```
   Clear: Home Broker → Extratos → Operações → CSV
   XP: Área do Cliente → Extrato de Operações → CSV
   Genial: Operações → Histórico → Exportar → CSV
   ```

2. **Upload to ProfitJournal:**
   - Settings → Import Detailed Trades
   - Upload CSV file
   - See preview of detected executions
   - Confirm auto-grouped trades
   - Import

3. **Result:**
   - All entries & exits with exact prices & quantities
   - Automatic partial fill grouping
   - Weighted average calculations
   - Exact R-multiple per trade

---

## CSV Format Expected

### Clear Statement Format
```csv
Data,Hora,Tipo,Ativo,Quantidade,Preço,Juros,Corretagem,Liquidação,Observações
25/02/2026,09:15:30,COMPRA,WIN,2,5200.00,0.00,15.00,25/02/2026,
25/02/2026,09:20:15,COMPRA,WIN,3,5205.00,0.00,22.50,25/02/2026,
25/02/2026,14:30:15,VENDA,WIN,5,5250.00,0.00,37.50,25/02/2026,
25/02/2026,10:00:00,COMPRA,WDO,100,30.50,0.00,25.00,25/02/2026,
25/02/2026,11:15:00,VENDA,WDO,50,29.80,0.00,12.50,25/02/2026,
25/02/2026,11:20:00,VENDA,WDO,50,29.75,0.00,12.50,25/02/2026,
```

### XP Statement Format
```csv
Data,Hora,Ativo,Operação,Quantidade,Preço,Corretagem
25/02/2026,09:15:30,WIN,Compra,2,5200.00,15.00
25/02/2026,09:20:15,WIN,Compra,3,5205.00,22.50
25/02/2026,14:30:15,WIN,Venda,5,5250.00,37.50
```

### Genial Statement Format
```csv
Data,Horário,Ativo,Tipo de Operação,Qtde,Preço Unit.,Corretagem
25/02/2026,09:15:30,WIN,C,2,5200.00,15.00
25/02/2026,09:20:15,WIN,C,3,5205.00,22.50
25/02/2026,14:30:15,WIN,V,5,5250.00,37.50
```

**Key:** Each row = one execution (preserves partial fills)

---

## Implementation Plan (3 Phases)

### Phase 2A: CSV Parser (Week 1)

Create broker-specific CSV parsers:

```typescript
// src/lib/csv-parsers/clear-parser.ts
export const parseClearCSV = (csvContent: string): RawExecution[] => {
  const lines = csvContent.split('\n').slice(1) // skip header

  return lines
    .filter(line => line.trim())
    .map(line => {
      const [data, hora, tipo, ativo, qtd, preco, juros, corr, liq, obs] =
        line.split(',').map(s => s.trim())

      return {
        date: parseDate(data),
        time: parseTime(hora),
        asset: ativo.trim(),
        side: tipo.toLowerCase().includes('compra') ? 'BUY' : 'SELL',
        quantity: parseFloat(qtd),
        price: parseFloat(preco),
        commission: parseFloat(corr),
        broker: 'CLEAR'
      }
    })
}

// src/lib/csv-parsers/xp-parser.ts
export const parseXPCSV = (csvContent: string): RawExecution[] => {
  // Similar pattern
}

// src/lib/csv-parsers/genial-parser.ts
export const parseGenialCSV = (csvContent: string): RawExecution[] => {
  // Similar pattern
}

// src/lib/csv-parsers/index.ts
export const parseStatementCSV = (
  csvContent: string,
  brokerName: 'CLEAR' | 'XP' | 'GENIAL'
): RawExecution[] => {
  switch (brokerName) {
    case 'CLEAR':
      return parseClearCSV(csvContent)
    case 'XP':
      return parseXPCSV(csvContent)
    case 'GENIAL':
      return parseGenialCSV(csvContent)
  }
}
```

**Type Definition:**
```typescript
interface RawExecution {
  date: Date
  time: string
  asset: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  commission: number
  broker: 'CLEAR' | 'XP' | 'GENIAL'
}
```

---

### Phase 2B: Trade Grouping Engine (Week 1)

Auto-group executions into complete trades:

```typescript
// src/lib/trade-grouping.ts

interface GroupedTrade {
  asset: string
  date: string // YYYY-MM-DD
  entryExecutions: RawExecution[]
  exitExecutions: RawExecution[]
}

export const groupExecutionsIntoTrades = (
  executions: RawExecution[]
): GroupedTrade[] => {
  // Group by asset + date
  const byAssetDate = new Map<string, RawExecution[]>()

  for (const exec of executions) {
    const key = `${exec.asset}_${exec.date.toISOString().split('T')[0]}`
    if (!byAssetDate.has(key)) {
      byAssetDate.set(key, [])
    }
    byAssetDate.get(key)!.push(exec)
  }

  // For each asset+date, split entry/exit
  const trades: GroupedTrade[] = []

  for (const [key, execs] of byAssetDate.entries()) {
    // Sort by time
    execs.sort((a, b) => a.time.localeCompare(b.time))

    // Find entry sequence (all same side at start)
    let entryCount = 0
    const firstSide = execs[0].side

    for (let i = 0; i < execs.length; i++) {
      if (execs[i].side === firstSide) {
        entryCount++
      } else {
        break // Side changed, entries are done
      }
    }

    const [asset, date] = key.split('_')
    const entryExecutions = execs.slice(0, entryCount)
    const exitExecutions = execs.slice(entryCount)

    trades.push({
      asset,
      date,
      entryExecutions,
      exitExecutions
    })
  }

  return trades
}

interface ProcessedTrade {
  asset: string
  direction: 'long' | 'short'
  entryTime: Date
  exitTime: Date | null
  entryPrice: number // weighted average
  exitPrice: number | null // weighted average
  positionSize: number // total quantity
  commission: number // total of all commissions
  status: 'open' | 'closed'
  grossPnl: number // raw P&L before commission
  netPnl: number // P&L after commission
}

export const calculateTradeMetrics = (
  grouped: GroupedTrade
): ProcessedTrade => {
  const entryQty = grouped.entryExecutions.reduce((sum, e) => sum + e.quantity, 0)
  const entryValue = grouped.entryExecutions.reduce((sum, e) => sum + (e.quantity * e.price), 0)
  const entryPrice = entryValue / entryQty

  const entryTime = new Date(`${grouped.date}T${grouped.entryExecutions[0].time}`)

  let exitPrice: number | null = null
  let exitTime: Date | null = null
  let exitQty = 0
  let grossPnl = 0
  let totalCommission = 0

  // Calculate totals
  for (const exec of grouped.entryExecutions) {
    totalCommission += exec.commission
  }

  if (grouped.exitExecutions.length > 0) {
    const exitValue = grouped.exitExecutions.reduce((sum, e) => sum + (e.quantity * e.price), 0)
    exitQty = grouped.exitExecutions.reduce((sum, e) => sum + e.quantity, 0)
    exitPrice = exitValue / exitQty
    exitTime = new Date(`${grouped.date}T${grouped.exitExecutions[grouped.exitExecutions.length - 1].time}`)

    for (const exec of grouped.exitExecutions) {
      totalCommission += exec.commission
    }

    // Calculate P&L
    const isLong = grouped.entryExecutions[0].side === 'BUY'
    if (isLong) {
      grossPnl = (exitPrice - entryPrice) * Math.min(entryQty, exitQty)
    } else {
      grossPnl = (entryPrice - exitPrice) * Math.min(entryQty, exitQty)
    }
  }

  return {
    asset: grouped.asset,
    direction: grouped.entryExecutions[0].side === 'BUY' ? 'long' : 'short',
    entryTime,
    exitTime,
    entryPrice,
    exitPrice,
    positionSize: entryQty,
    commission: totalCommission,
    status: exitExecutions.length > 0 ? 'closed' : 'open',
    grossPnl,
    netPnl: grossPnl - totalCommission
  }
}
```

---

### Phase 2C: Import API + UI (Week 2)

#### API Endpoint

```typescript
// src/app/api/imports/detailed-trades/route.ts
import { NextRequest, NextResponse } from "next/server"
import { parseStatementCSV } from "@/lib/csv-parsers"
import { groupExecutionsIntoTrades, calculateTradeMetrics } from "@/lib/trade-grouping"
import { eq } from "drizzle-orm"
import * as schema from "@/db/schema"
import { db } from "@/db"

interface ImportRequest {
  accountId: string
  brokerName: 'CLEAR' | 'XP' | 'GENIAL'
  csvContent: string
}

interface ImportPreviewResponse {
  importId: string
  detectedExecutions: number
  detectedTrades: number
  trades: Array<{
    id: string
    asset: string
    direction: 'long' | 'short'
    entryPrice: number
    exitPrice: number | null
    quantity: number
    entryTime: string
    exitTime: string | null
    netPnl: number
    entryExecutions: Array<{ qty: number; price: number; time: string }>
    exitExecutions: Array<{ qty: number; price: number; time: string }>
  }>
  warnings: string[]
}

// POST - Upload CSV and get preview
export const POST = async (req: NextRequest) => {
  try {
    const { accountId, brokerName, csvContent } = (await req.json()) as ImportRequest

    // Validate account ownership
    const account = await db.query.tradingAccounts.findFirst({
      where: eq(schema.tradingAccounts.id, accountId)
    })

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    // Check rate limit (30-min cooldown between imports)
    const lastImport = await db.query.importLogs.findFirst({
      where: eq(schema.importLogs.accountId, accountId),
      orderBy: schema.importLogs.createdAt
    })

    if (lastImport) {
      const timeSinceLastImport = Date.now() - lastImport.createdAt.getTime()
      if (timeSinceLastImport < 30 * 60 * 1000) { // 30 minutes
        const minutesUntilAvailable = Math.ceil((30 * 60 * 1000 - timeSinceLastImport) / 60000)
        return NextResponse.json(
          { error: `Please wait ${minutesUntilAvailable} minutes before next import` },
          { status: 429 }
        )
      }
    }

    // Parse CSV
    const rawExecutions = parseStatementCSV(csvContent, brokerName)

    if (rawExecutions.length === 0) {
      return NextResponse.json(
        { error: "No executions found in CSV" },
        { status: 400 }
      )
    }

    // Group into trades
    const grouped = groupExecutionsIntoTrades(rawExecutions)
    const trades = grouped.map(calculateTradeMetrics)

    // Generate preview
    const importId = `import_${Date.now()}`

    const preview: ImportPreviewResponse = {
      importId,
      detectedExecutions: rawExecutions.length,
      detectedTrades: trades.length,
      trades: trades.map(t => ({
        id: generateId(),
        asset: t.asset,
        direction: t.direction,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        quantity: t.positionSize,
        entryTime: t.entryTime.toISOString(),
        exitTime: t.exitTime?.toISOString() || null,
        netPnl: t.netPnl,
        entryExecutions: grouped
          .find(g => g.asset === t.asset)
          ?.entryExecutions.map(e => ({
            qty: e.quantity,
            price: e.price,
            time: e.time
          })) || [],
        exitExecutions: grouped
          .find(g => g.asset === t.asset)
          ?.exitExecutions.map(e => ({
            qty: e.quantity,
            price: e.price,
            time: e.time
          })) || []
      })),
      warnings: detectWarnings(trades)
    }

    // Store preview in temporary cache (1 hour)
    await storeImportPreview(importId, {
      accountId,
      brokerName,
      trades,
      rawExecutions,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    })

    return NextResponse.json(preview)
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "Failed to process CSV" },
      { status: 500 }
    )
  }
}

const detectWarnings = (trades: ProcessedTrade[]): string[] => {
  const warnings: string[] = []

  // Check for unclosed positions
  const openTrades = trades.filter(t => t.status === 'open')
  if (openTrades.length > 0) {
    warnings.push(`${openTrades.length} trades are still open (not closed)`)
  }

  // Check for partial exits
  for (const trade of trades) {
    if (trade.positionSize > 0) {
      warnings.push(`Trade ${trade.asset} may have partial exit`)
    }
  }

  return warnings
}
```

#### Confirm & Commit Endpoint

```typescript
// src/app/api/imports/detailed-trades/confirm/route.ts

interface ConfirmRequest {
  importId: string
  accountId: string
}

export const POST = async (req: NextRequest) => {
  try {
    const { importId, accountId } = (await req.json()) as ConfirmRequest

    // Retrieve cached preview
    const cached = await getImportPreview(importId)

    if (!cached) {
      return NextResponse.json(
        { error: "Preview expired or not found" },
        { status: 404 }
      )
    }

    // Get user for encryption
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, "current-user-id"),
      columns: { encryptedDek: true }
    })

    const dek = decryptDek(user!.encryptedDek)

    // Process each trade
    const createdTrades = []
    for (const trade of cached.trades) {
      // Calculate risk metrics
      const plannedRiskAmount =
        Math.abs(trade.entryPrice - (trade.exitPrice || trade.entryPrice)) *
        trade.positionSize

      const plannedRMultiple = trade.exitPrice && trade.exitPrice !== trade.entryPrice
        ? Math.abs(trade.exitPrice - trade.entryPrice) /
          Math.abs(trade.entryPrice - trade.entryPrice)
        : null

      const createdTrade = await db.insert(schema.trades).values({
        accountId,
        asset: trade.asset,
        direction: trade.direction,
        entryPrice: encryptField(trade.entryPrice.toString(), dek),
        exitPrice: encryptField(trade.exitPrice?.toString(), dek),
        positionSize: encryptField(trade.positionSize.toString(), dek),
        stopLoss: encryptField("0", dek), // Not provided in CSV
        takeProfit: encryptField("0", dek), // Not provided in CSV
        entryTime: trade.entryTime,
        exitTime: trade.exitTime,
        commission: encryptField(trade.commission.toString(), dek),
        pnl: encryptField(trade.netPnl.toString(), dek),
        plannedRiskAmount: encryptField(plannedRiskAmount.toString(), dek),
        plannedRMultiple: encryptField(plannedRMultiple?.toString(), dek),
        status: trade.status,
        importedAt: new Date(),
        importSource: 'DETAILED_CSV',
        isArchived: false
      }).returning()

      createdTrades.push(createdTrade)
    }

    // Log import
    await db.insert(schema.importLogs).values({
      accountId,
      source: `${cached.brokerName}_DETAILED_CSV`,
      importedCount: createdTrades.length,
      failedCount: 0,
      status: 'success',
      details: {
        rawExecutions: cached.rawExecutions.length,
        brokerName: cached.brokerName
      }
    })

    // Clean up cache
    await deleteImportPreview(importId)

    return NextResponse.json({
      success: true,
      importedTrades: createdTrades.length,
      timestamp: new Date()
    })
  } catch (error) {
    console.error("Confirm import error:", error)
    return NextResponse.json(
      { error: "Failed to complete import" },
      { status: 500 }
    )
  }
}
```

#### React Component

```typescript
// src/components/imports/detailed-trade-importer.tsx
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

type BrokerName = 'CLEAR' | 'XP' | 'GENIAL'

interface ImportPreview {
  importId: string
  detectedExecutions: number
  detectedTrades: number
  trades: Array<{
    id: string
    asset: string
    direction: 'long' | 'short'
    entryPrice: number
    exitPrice: number | null
    quantity: number
    entryTime: string
    exitTime: string | null
    netPnl: number
    entryExecutions: Array<{ qty: number; price: number; time: string }>
    exitExecutions: Array<{ qty: number; price: number; time: string }>
  }>
  warnings: string[]
}

export const DetailedTradeImporter = ({ accountId }: { accountId: string }) => {
  const t = useTranslations("imports")
  const [step, setStep] = useState<'select' | 'preview' | 'importing'>('select')
  const [broker, setBroker] = useState<BrokerName | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file || !broker) {
      setError("Select broker and CSV file")
      return
    }

    setLoading(true)
    try {
      const csvContent = await file.text()

      const response = await fetch("/api/imports/detailed-trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          brokerName: broker,
          csvContent
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data: ImportPreview = await response.json()
      setPreview(data)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!preview) return

    setLoading(true)
    setStep('importing')

    try {
      const response = await fetch("/api/imports/detailed-trades/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          importId: preview.importId,
          accountId
        })
      })

      if (!response.ok) {
        throw new Error("Import failed")
      }

      const data = await response.json()
      // Show success toast
      setStep('select')
      setFile(null)
      setPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed")
      setStep('preview')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Select & Upload
  if (step === 'select') {
    return (
      <Card className="p-m-600 space-y-m-400">
        <h3 className="text-h4">{t("detailedImport.title")}</h3>

        <div className="space-y-s-300">
          <label>{t("detailedImport.selectBroker")}</label>
          <Select
            value={broker}
            onValueChange={(value) => setBroker(value as BrokerName)}
          >
            <option value="">-- Choose Broker --</option>
            <option value="CLEAR">Clear</option>
            <option value="XP">XP</option>
            <option value="GENIAL">Genial</option>
          </Select>
        </div>

        <div className="space-y-s-300">
          <label>{t("detailedImport.uploadCSV")}</label>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
          <p className="text-tiny text-txt-300">
            {t("detailedImport.csvFormat")}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-s-300 rounded">
            {error}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!broker || !file || loading}
        >
          {loading ? t("common.loading") : t("detailedImport.preview")}
        </Button>
      </Card>
    )
  }

  // Step 2: Preview & Confirm
  if (step === 'preview' && preview) {
    return (
      <Card className="p-m-600 space-y-m-400">
        <h3 className="text-h4">{t("detailedImport.preview")}</h3>

        <div className="grid grid-cols-3 gap-m-300">
          <div className="bg-bg-200 p-m-300 rounded">
            <p className="text-tiny text-txt-300">Executions</p>
            <p className="text-h3">{preview.detectedExecutions}</p>
          </div>
          <div className="bg-bg-200 p-m-300 rounded">
            <p className="text-tiny text-txt-300">Trades</p>
            <p className="text-h3">{preview.detectedTrades}</p>
          </div>
          <div className="bg-bg-200 p-m-300 rounded">
            <p className="text-tiny text-txt-300">Net P&L</p>
            <p className="text-h3 text-trade-buy">
              R$ {preview.trades.reduce((sum, t) => sum + t.netPnl, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {preview.warnings.length > 0 && (
          <div className="bg-yellow-100 border border-yellow-400 p-s-300 rounded">
            <p className="font-semibold mb-s-200">Warnings:</p>
            <ul className="list-disc ml-m-300">
              {preview.warnings.map((w, i) => (
                <li key={i} className="text-small">{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Trade Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b">
                <th className="text-left p-s-200">Asset</th>
                <th className="text-left p-s-200">Direction</th>
                <th className="text-right p-s-200">Entry</th>
                <th className="text-right p-s-200">Exit</th>
                <th className="text-right p-s-200">Qty</th>
                <th className="text-right p-s-200">P&L</th>
              </tr>
            </thead>
            <tbody>
              {preview.trades.map((trade) => (
                <tr key={trade.id} className="border-b hover:bg-bg-200">
                  <td className="p-s-200 font-semibold">{trade.asset}</td>
                  <td className="p-s-200">{trade.direction}</td>
                  <td className="p-s-200 text-right">
                    {trade.entryPrice.toFixed(2)}
                    <br />
                    <span className="text-tiny text-txt-300">
                      {trade.entryExecutions.length} fills
                    </span>
                  </td>
                  <td className="p-s-200 text-right">
                    {trade.exitPrice ? trade.exitPrice.toFixed(2) : '-'}
                    {trade.exitExecutions.length > 0 && (
                      <br />
                    )}
                    {trade.exitExecutions.length > 0 && (
                      <span className="text-tiny text-txt-300">
                        {trade.exitExecutions.length} fills
                      </span>
                    )}
                  </td>
                  <td className="p-s-200 text-right">{trade.quantity}</td>
                  <td className={`p-s-200 text-right ${trade.netPnl >= 0 ? 'text-trade-buy' : 'text-trade-sell'}`}>
                    R$ {trade.netPnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-m-300">
          <Button
            variant="outline"
            onClick={() => {
              setStep('select')
              setPreview(null)
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? t("common.importing") : t("detailedImport.import")}
          </Button>
        </div>
      </Card>
    )
  }

  // Step 3: Importing
  if (step === 'importing') {
    return (
      <Card className="p-m-600 text-center space-y-m-300">
        <div className="animate-spin">⏳</div>
        <p>{t("detailedImport.importing")}</p>
      </Card>
    )
  }

  return null
}
```

---

## Database Schema Updates

```typescript
// src/db/schema.ts

export const importLogs = pgTable("import_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").references(() => tradingAccounts.id).notNull(),
  source: varchar("source").notNull(), // "CLEAR_DETAILED_CSV", "XP_DETAILED_CSV", etc.
  importedCount: integer("imported_count"),
  failedCount: integer("failed_count"),
  status: varchar("status").notNull(), // "success", "failed", "partial"
  details: json("details"), // Raw execution counts, broker name, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})

// Trades table already exists, just ensure these fields:
// - importedAt: timestamp (when trade was imported)
// - importSource: varchar (e.g., "DETAILED_CSV")
// - isArchived: boolean (for soft deletes)
```

---

## Features

✅ **Automatic Trade Grouping**
- Groups multiple BUY orders into entry side
- Groups multiple SELL orders into exit side
- Calculates weighted average price
- Preserves execution timeline

✅ **Partial Fill Support**
- Each execution captured separately
- Combined into single trade entry/exit
- Weighted average calculations
- Exact quantity tracking

✅ **Rate Limiting**
- 30-minute cooldown between manual imports
- Prevents accidental duplicate imports
- User sees countdown timer

✅ **Preview Before Import**
- Shows detected executions and trades
- Displays warnings (unclosed positions, etc.)
- User confirms before committing
- Can cancel and re-upload

✅ **Broker Support**
- Clear CSV format
- XP CSV format
- Genial CSV format
- Easy to add more brokers

---

## User Flow

```
1. Settings → Import Detailed Trades
   ↓
2. Select broker (Clear/XP/Genial)
   ↓
3. Upload CSV (from broker statement, not ProfitChart)
   ↓
4. Preview shows:
   - 142 total executions detected
   - 47 trades grouped
   - Warnings: "3 trades are still open"
   ↓
5. Review trade table (entry price, exit price, qty, P&L)
   ↓
6. Click "Import" → trades saved with exact calculations
   ↓
7. View in Journal with all entries/exits visible
```

---

## Success Metrics

- ✅ All executions captured (including partial fills)
- ✅ Exact entry/exit prices (weighted averages)
- ✅ Exact quantities per trade
- ✅ Zero data loss from broker statement
- ✅ User can preview before committing
- ✅ 30-min cooldown prevents accidental duplicates

---

## Week-by-Week Timeline

**Week 1:**
- [ ] Build CSV parsers (Clear, XP, Genial)
- [ ] Build trade grouping engine
- [ ] Build metrics calculation
- [ ] Unit tests for all functions

**Week 2:**
- [ ] Build import API endpoints
- [ ] Build React component UI
- [ ] Add rate limiting
- [ ] Integration testing with real CSVs

**Week 3 (Optional):**
- [ ] User documentation
- [ ] Beta testing
- [ ] Polish error messages
- [ ] Launch

---

## Next: Phase 1 Planning

Once Phase 2 is shipped and validated with users, we can plan Phase 1 (Broker API integration) which will automate the daily CSV export completely.

