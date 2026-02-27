# ProfitJournal - Direct Broker Integration Strategy

## Executive Summary

This document outlines technical approaches to integrate ProfitJournal with B3 (Brazilian Stock Exchange), ProfitChart, and MetaTrader 5 to automatically import trades without manual CSV intervention. Three integration tiers are proposed:

- **Tier 1 (Quick Win)**: Automated CSV export from ProfitChart → ProfitJournal webhook
- **Tier 2 (Production)**: MetaTrader 5 webhook + B3 market data feed for real-time sync
- **Tier 3 (Enterprise)**: Full broker adapter pattern with direct B3 API integration

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Trading Platforms                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ProfitChart  │  │ MetaTrader 5  │  │   B3 API     │      │
│  │  (RTD/CSV)   │  │  (Webhook)    │  │   (Rest)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│          ProfitJournal Backend (Next.js API Routes)         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Webhook Receivers & Data Normalization Layer      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐    │   │
│  │  │ /api/trades │ │/api/market- │ │ /api/account │    │   │
│  │  │  /import    │ │  data       │ │ /sync        │    │   │
│  │  └────┬────────┘ └────┬────────┘ └──────┬───────┘    │   │
│  └───────┼────────────────┼────────────────┼────────────┘   │
│          │                │                │                │
│  ┌───────▼────────────────▼────────────────▼────────────┐   │
│  │  Trade Normalization & Validation Service           │   │
│  │  - Map broker fields to ProfitJournal schema        │   │
│  │  - Calculate R-multiple, plannedRiskAmount          │   │
│  │  - Encrypt sensitive fields (SL, TP, prices)        │   │
│  │  - Validate trade integrity                         │   │
│  └───────┬───────────────────────────────────────────┬──┘   │
│          │                                           │       │
│  ┌───────▼────────────────────────────────────────────▼─┐   │
│  │  Database (Drizzle ORM + PostgreSQL)                │   │
│  │  ├── trades (with encryped fields)                  │   │
│  │  ├── accounts (encrypted DEK)                       │   │
│  │  ├── market_quotes (real-time sync)                 │   │
│  │  └── import_logs (audit trail)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│          Frontend (React) - Real-time Updates               │
│          via WebSocket or Server-Sent Events                │
└─────────────────────────────────────────────────────────────┘
```

---

## Tier 1: ProfitChart Integration (RTD/CSV Automation)

### Current State
- Users manually export CSV from ProfitChart
- Upload to ProfitJournal
- Manual SL/TP generation with component

### Proposed Approach: Automated CSV Export via Scheduled Task

**Technology:**
- ProfitChart RTD (Real Time Data) feed → Excel/CSV automation
- Node.js script scheduled via Cron or GitHub Actions
- SFTP or cloud storage (Google Drive/OneDrive) intermediate

**Implementation Steps:**

1. **ProfitChart RTD Export Automation**
   ```typescript
   // User sets up automated export in ProfitChart:
   // - Enable RTD in Nelogica settings
   // - Configure Excel macro to export daily to shared folder
   // - Folder path: ~/profitchart-exports/trades_{date}.csv
   ```

2. **Backend Webhook Listener**
   ```typescript
   // src/app/api/integrations/profitchart/import/route.ts
   import { NextRequest, NextResponse } from "next/server"
   import { processTradeImport } from "@/app/actions/trade-import"

   export const POST = async (req: NextRequest) => {
     const { csvData, accountId, brokerName } = await req.json()

     // Normalize ProfitChart fields to schema
     const normalized = normalizeTradeData(csvData, "PROFITCHART")

     // Import with SL/TP auto-generation
     const result = await processTradeImport(
       accountId,
       normalized,
       { autoGenerateSLTP: true }
     )

     return NextResponse.json(result)
   }
   ```

3. **Scheduled CSV Fetch & Process**
   ```typescript
   // scripts/sync-profitchart-trades.ts
   import fs from "fs"
   import path from "path"
   import { execSync } from "child_process"

   const PROFITCHART_EXPORT_DIR = process.env.PROFITCHART_EXPORT_DIR

   const syncProfitChartTrades = async () => {
     // 1. Check for new CSV files
     const files = fs.readdirSync(PROFITCHART_EXPORT_DIR)
       .filter(f => f.startsWith("trades_"))

     for (const file of files) {
       const csv = fs.readFileSync(path.join(PROFITCHART_EXPORT_DIR, file), "utf-8")

       // 2. Send to webhook
       const response = await fetch(`${process.env.API_URL}/api/integrations/profitchart/import`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           csvData: csv,
           accountId: process.env.DEFAULT_ACCOUNT_ID,
           brokerName: "PROFITCHART"
         })
       })

       // 3. Mark as processed
       if (response.ok) {
         fs.renameSync(
           path.join(PROFITCHART_EXPORT_DIR, file),
           path.join(PROFITCHART_EXPORT_DIR, "processed", file)
         )
       }
     }
   }

   // Run daily at 19:00 (after market close)
   // pnpm tsx scripts/sync-profitchart-trades.ts
   ```

**Pros:**
- ✅ Works with existing ProfitChart setup
- ✅ No API key or authentication needed
- ✅ Low implementation complexity
- ✅ Can be fully automated

**Cons:**
- ❌ Not true real-time (daily/hourly sync at best)
- ❌ Requires local file system or cloud storage setup
- ❌ Market data not included (need separate B3 feed)

---

## Tier 2: MetaTrader 5 + B3 Real-Time Integration

### MetaTrader 5 Webhook Trade Capture

**Technology:**
- MT5 Manager API / WebSocket connection
- Webhook receivers in Next.js API routes
- Real-time trade notification system

**Implementation:**

1. **Trade Webhook Receiver**
   ```typescript
   // src/app/api/integrations/metatrader5/webhooks/route.ts
   import { NextRequest, NextResponse } from "next/server"
   import { verifyMT5Webhook } from "@/lib/mt5-webhook-verifier"
   import { processTrade } from "@/app/actions/trades"
   import { eq } from "drizzle-orm"
   import { db } from "@/db"
   import * as schema from "@/db/schema"

   interface MT5TradeEvent {
     event: "trade.open" | "trade.close" | "trade.modify"
     ticket: number
     symbol: string
     type: "buy" | "sell"
     volume: number
     entryPrice: number
     exitPrice?: number
     sl: number
     tp: number
     openTime: string
     closeTime?: string
     commission: number
     swap: number
     profit: number
     accountId?: string
     signature: string
     timestamp: number
   }

   export const POST = async (req: NextRequest) => {
     try {
       const payload: MT5TradeEvent = await req.json()

       // Verify webhook signature
       if (!verifyMT5Webhook(payload)) {
         return NextResponse.json(
           { error: "Invalid webhook signature" },
           { status: 401 }
         )
       }

       // Find account mapping (MT5 account ID → ProfitJournal account ID)
       const accountMapping = await db.query.brokerAccounts.findFirst({
         where: (t, { eq, and }) => and(
           eq(t.brokerName, "METATRADER5"),
           eq(t.brokerAccountId, payload.accountId || "MT5_DEFAULT")
         ),
         columns: { accountId: true }
       })

       if (!accountMapping) {
         return NextResponse.json(
           { error: "Account not mapped" },
           { status: 404 }
         )
       }

       // Normalize MT5 trade to schema
       const trade = normalizeMT5Trade(payload)

       // Handle trade event
       if (payload.event === "trade.open") {
         await processTrade("CREATE", {
           ...trade,
           accountId: accountMapping.accountId,
           externalId: `MT5_${payload.ticket}`
         })
       } else if (payload.event === "trade.close") {
         // Update existing trade with exit info
         await processTrade("UPDATE", {
           ...trade,
           accountId: accountMapping.accountId,
           externalId: `MT5_${payload.ticket}`
         })
       }

       return NextResponse.json({ success: true })
     } catch (error) {
       console.error("MT5 webhook error:", error)
       return NextResponse.json(
         { error: "Processing failed" },
         { status: 500 }
       )
     }
   }

   const normalizeMT5Trade = (mt5: MT5TradeEvent) => ({
     asset: mt5.symbol,
     direction: mt5.type === "buy" ? "long" : "short",
     entryPrice: mt5.entryPrice,
     exitPrice: mt5.exitPrice ?? null,
     positionSize: mt5.volume,
     stopLoss: mt5.sl,
     takeProfit: mt5.tp,
     entryTime: new Date(mt5.openTime),
     exitTime: mt5.closeTime ? new Date(mt5.closeTime) : null,
     commission: mt5.commission,
     swap: mt5.swap,
     pnl: mt5.profit,
     status: mt5.event === "trade.close" ? "closed" : "open"
   })
   ```

2. **MT5 Account Configuration (User Setup)**
   ```
   In MetaTrader 5 Terminal Settings:
   1. Tools > Options > Advisors > Allow WebSocket connections
   2. Create EA (Expert Advisor) that fires webhook on trade events:

   // MT5 Script Example (MQL5)
   void OnTrade() {
     CTrade trade;
     trade.Ticket(); // Get trade ID

     // POST webhook to: https://yourapp.com/api/integrations/metatrader5/webhooks
     WebRequest("POST",
       "https://yourapp.com/api/integrations/metatrader5/webhooks",
       NULL,
       {"Content-Type: application/json"},
       JsonEncode({
         "event": "trade.close",
         "ticket": trade.Ticket(),
         "profit": trade.Commission() + trade.Swap() + trade.Profit()
       }),
       responseHeaders,
       response
     );
   }
   ```

**Pros:**
- ✅ Real-time trade capture (milliseconds)
- ✅ Works with any MT5 broker (not just B3)
- ✅ Automatic SL/TP tracking
- ✅ Commission/swap tracking built-in

**Cons:**
- ❌ Requires user to set up EA in MT5
- ❌ No market depth data from webhook
- ❌ Trade history sync needed for backtesting account setup

---

### B3 Real-Time Market Data Feed

**Technology:**
- BrAPI (free, open REST API)
- B3 UMDF Binary Feed (enterprise, real-time)
- WebSocket for quote updates

**Implementation (BrAPI - Free Tier):**

```typescript
// src/lib/b3-market-data.ts
import axios from "axios"

interface B3Quote {
  symbol: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  regularMarketVolume: number
  regularMarketTime: string
}

export const B3MarketDataService = {
  async getQuote(symbols: string[]): Promise<B3Quote[]> {
    const response = await axios.get("https://brapi.dev/api/quote", {
      params: {
        symbols: symbols.join(","),
        token: process.env.BRAPI_TOKEN // Free tier: no token needed
      }
    })

    return response.data.results.map((q: any) => ({
      symbol: q.symbol,
      regularMarketPrice: q.regularMarketPrice,
      regularMarketChange: q.regularMarketChange,
      regularMarketChangePercent: q.regularMarketChangePercent,
      regularMarketVolume: q.regularMarketVolume,
      regularMarketTime: new Date(q.regularMarketTime * 1000)
    }))
  },

  async syncMarketData(accountId: string) {
    // Fetch all trades' assets for account
    const account = await db.query.tradingAccounts.findFirst({
      where: eq(schema.tradingAccounts.id, accountId),
      with: { trades: { columns: { asset: true } } }
    })

    if (!account) return

    const uniqueAssets = [...new Set(account.trades.map(t => t.asset))]
    const quotes = await this.getQuote(uniqueAssets)

    // Store in database for analytics
    await db.insert(schema.marketQuotes).values(
      quotes.map(q => ({
        accountId,
        symbol: q.symbol,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        volume: q.regularMarketVolume,
        timestamp: q.regularMarketTime
      }))
    )
  }
}

// src/app/api/integrations/b3/market-data/sync/route.ts
import { B3MarketDataService } from "@/lib/b3-market-data"

export const POST = async (req: NextRequest) => {
  const { accountId } = await req.json()

  try {
    await B3MarketDataService.syncMarketData(accountId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// Run every 5 minutes for active accounts
// via Vercel Cron or external scheduler
```

**Pros:**
- ✅ Free B3 API (no authentication needed initially)
- ✅ Real-time quote updates
- ✅ Integrated with ProfitJournal schema
- ✅ Useful for trade analytics (entry/exit prices validation)

**Cons:**
- ❌ BrAPI free tier has rate limits (~30 requests/minute)
- ❌ Enterprise UMDF feed requires B3 subscription
- ❌ No order book depth in free tier

---

## Tier 3: Broker Adapter Pattern (Enterprise)

### Unified Broker Integration Layer

```typescript
// src/lib/integrations/broker-adapter.ts

export interface BrokerAdapter {
  name: string
  authenticate(credentials: any): Promise<void>
  getTradeHistory(params: {
    accountId: string
    from: Date
    to: Date
  }): Promise<NormalizedTrade[]>
  subscribeToTrades(callback: (trade: NormalizedTrade) => void): void
  getMarketData(symbols: string[]): Promise<Quote[]>
  getAccountBalance(): Promise<number>
}

interface NormalizedTrade {
  externalId: string
  asset: string
  direction: "long" | "short"
  entryPrice: number
  exitPrice: number | null
  positionSize: number
  stopLoss: number
  takeProfit: number
  entryTime: Date
  exitTime: Date | null
  commission: number
  pnl: number
  status: "open" | "closed"
}

// src/lib/integrations/adapters/b3.adapter.ts
import { BrokerAdapter, NormalizedTrade } from "../broker-adapter"

export class B3Adapter implements BrokerAdapter {
  name = "B3"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async authenticate(credentials: any) {
    // B3 requires OAuth2 or API key
    this.apiKey = credentials.apiKey
  }

  async getTradeHistory(params: {
    accountId: string
    from: Date
    to: Date
  }): Promise<NormalizedTrade[]> {
    // Call B3 Data API
    // https://developer.b3.com.br/
    // Endpoint: /traders/{accountId}/trades

    const response = await fetch(
      `https://api.b3.com.br/traders/${params.accountId}/trades`,
      {
        headers: { "Authorization": `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          from: params.from.toISOString(),
          to: params.to.toISOString()
        })
      }
    )

    return response.json().then(data =>
      data.trades.map(this.normalizeB3Trade)
    )
  }

  async subscribeToTrades(callback: (trade: NormalizedTrade) => void) {
    // B3 WebSocket subscription for real-time trades
    // Requires enterprise subscription
    const ws = new WebSocket("wss://ws.b3.com.br/trades")

    ws.onmessage = (event) => {
      const trade = JSON.parse(event.data)
      callback(this.normalizeB3Trade(trade))
    }
  }

  private normalizeB3Trade(b3Trade: any): NormalizedTrade {
    return {
      externalId: `B3_${b3Trade.id}`,
      asset: b3Trade.symbol,
      direction: b3Trade.side === "BUY" ? "long" : "short",
      entryPrice: b3Trade.entryPrice,
      exitPrice: b3Trade.exitPrice ?? null,
      positionSize: b3Trade.quantity,
      stopLoss: b3Trade.stopLoss,
      takeProfit: b3Trade.takeProfit,
      entryTime: new Date(b3Trade.openedAt),
      exitTime: b3Trade.closedAt ? new Date(b3Trade.closedAt) : null,
      commission: b3Trade.fees,
      pnl: b3Trade.profit,
      status: b3Trade.closedAt ? "closed" : "open"
    }
  }
}

// src/lib/integrations/adapters/metatrader5.adapter.ts
export class MetaTrader5Adapter implements BrokerAdapter {
  // Similar implementation for MT5...
}

// src/app/api/integrations/unified/sync/route.ts
import { B3Adapter } from "@/lib/integrations/adapters/b3.adapter"

export const POST = async (req: NextRequest) => {
  const { accountId, brokerName, from, to } = await req.json()

  // Factory pattern to select adapter
  let adapter: BrokerAdapter

  if (brokerName === "B3") {
    adapter = new B3Adapter(process.env.B3_API_KEY!)
  } else if (brokerName === "METATRADER5") {
    adapter = new MetaTrader5Adapter(process.env.MT5_API_KEY!)
  }

  // Get trades from broker
  const trades = await adapter.getTradeHistory({
    accountId,
    from: new Date(from),
    to: new Date(to)
  })

  // Process trades (normalize, validate, encrypt, store)
  const result = await processBatchTrades(accountId, trades)

  return NextResponse.json(result)
}
```

---

## Data Normalization & Encryption

All broker-imported trades must be normalized and encrypted before storage:

```typescript
// src/app/actions/trade-import.ts

export const processBatchTrades = async (
  accountId: string,
  trades: NormalizedTrade[]
) => {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, "current-user-id"),
    columns: { encryptedDek: true }
  })

  const dek = decryptDek(user!.encryptedDek)

  const procesedTrades = trades.map(trade => {
    // Calculate risk metrics
    const plannedRiskAmount =
      Math.abs(trade.entryPrice - trade.stopLoss) * trade.positionSize
    const plannedRMultiple = trade.stopLoss > 0
      ? Math.abs(trade.takeProfit - trade.entryPrice) /
        Math.abs(trade.entryPrice - trade.stopLoss)
      : null

    // Encrypt sensitive fields
    return {
      accountId,
      externalId: trade.externalId,
      asset: trade.asset,
      direction: trade.direction,
      entryPrice: encryptField(trade.entryPrice.toString(), dek),
      exitPrice: encryptField(trade.exitPrice?.toString(), dek),
      positionSize: encryptField(trade.positionSize.toString(), dek),
      stopLoss: encryptField(trade.stopLoss.toString(), dek),
      takeProfit: encryptField(trade.takeProfit.toString(), dek),
      entryTime: trade.entryTime,
      exitTime: trade.exitTime,
      commission: encryptField(trade.commission.toString(), dek),
      pnl: encryptField(trade.pnl.toString(), dek),
      plannedRiskAmount: encryptField(plannedRiskAmount.toString(), dek),
      plannedRMultiple: encryptField(plannedRMultiple?.toString(), dek),
      status: trade.status,
      importedAt: new Date(),
      importSource: "BROKER_API"
    }
  })

  // Batch insert with conflict resolution (don't duplicate externalId)
  await db.insert(schema.trades)
    .values(procesedTrades)
    .onConflictDoNothing()

  return {
    imported: procesedTrades.length,
    duplicates: trades.length - procesedTrades.length,
    timestamp: new Date()
  }
}
```

---

## Implementation Roadmap

### Phase 1 (Week 1-2): ProfitChart Automation
- [ ] Create `/api/integrations/profitchart/import` webhook
- [ ] Build CSV normalization logic
- [ ] Add PROFITCHART to broker adapter pattern
- [ ] User documentation for ProfitChart RTD export setup

### Phase 2 (Week 3-4): MetaTrader 5 Real-Time
- [ ] Implement `/api/integrations/metatrader5/webhooks` receiver
- [ ] Add MT5 webhook signature verification
- [ ] Create MT5 → ProfitJournal field mapping
- [ ] Build MT5 account linking UI

### Phase 3 (Week 5-6): B3 Market Data
- [ ] Integrate BrAPI client library
- [ ] Create `/api/integrations/b3/market-data/sync` endpoint
- [ ] Add market quote storage to schema
- [ ] Build analytics dashboard using real-time quotes

### Phase 4 (Optional): Enterprise B3 API
- [ ] Document B3 UMDF enterprise integration
- [ ] Build adapter for B3 Binary Protocol
- [ ] WebSocket trade subscription setup
- [ ] Support for order book integration

---

## Security Considerations

1. **Webhook Signature Verification**
   ```typescript
   const verifyMT5Webhook = (payload: any, signature: string): boolean => {
     const hash = crypto
       .createHmac("sha256", process.env.MT5_WEBHOOK_SECRET!)
       .update(JSON.stringify(payload))
       .digest("hex")
     return hash === signature
   }
   ```

2. **Rate Limiting & DDoS Protection**
   - All webhook endpoints rate-limited to 100 req/minute
   - Verify webhook origin via IP whitelist

3. **Encrypted Field Storage**
   - All prices, SL, TP encrypted with per-user DEK
   - Commission and P&L encrypted
   - Decryption only on demand for display

4. **API Key Management**
   - Store B3/MT5 API keys in encrypted environment variables
   - Use rotating tokens where possible
   - Implement key rotation policies

---

## Database Schema Updates

```typescript
// New tables needed

export const brokerAccounts = pgTable("broker_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  accountId: uuid("account_id").references(() => tradingAccounts.id).notNull(),
  brokerName: varchar("broker_name").notNull(), // "METATRADER5", "B3", "PROFITCHART"
  brokerAccountId: varchar("broker_account_id").notNull(), // External account ID
  brokerApiKey: varchar("broker_api_key").notNull(), // Encrypted
  webhookUrl: varchar("webhook_url"), // For incoming webhooks
  syncEnabled: boolean("sync_enabled").default(false),
  lastSyncTime: timestamp("last_sync_time"),
  createdAt: timestamp("created_at").defaultNow()
})

export const marketQuotes = pgTable("market_quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").references(() => tradingAccounts.id).notNull(),
  symbol: varchar("symbol").notNull(),
  price: numeric("price"),
  change: numeric("change"),
  changePercent: numeric("change_percent"),
  volume: bigint("volume"),
  timestamp: timestamp("timestamp").defaultNow()
})

export const importLogs = pgTable("import_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").references(() => tradingAccounts.id).notNull(),
  source: varchar("source").notNull(), // "PROFITCHART", "METATRADER5", "B3"
  importedCount: integer("imported_count"),
  failedCount: integer("failed_count"),
  status: varchar("status"), // "success", "failed", "partial"
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow()
})
```

---

## Testing Strategy

1. **Unit Tests**: Trade normalization logic with mock broker responses
2. **Integration Tests**: End-to-end webhook → database → UI flow
3. **Security Tests**: Webhook signature verification, API key encryption
4. **Load Tests**: Simulate high-volume trade imports (100+ trades/minute)
5. **Data Validation**: Encrypted field integrity, R-multiple calculations

---

## Sources

- [BrAPI - Free B3 API](https://brapi.dev/)
- [B3 Market Data Platform](https://www.b3.com.br/en_us/market-data-and-indices/data-services/market-data/market-data-platform/)
- [MetaTrader 5 API Documentation](https://www.mtsocketapi.com/)
- [B3 Developer Portal](https://developer.ice.com/fixed-income-data-services/catalog/b3-formerly-brazilian-mercantile-and-futures-exchange-bmf)
- [ProfitChart Integration Guide](https://cmcapital.com.br/blog/guia-profitchart/)

