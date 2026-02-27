# ProfitJournal Integration - Quick Start Guide

## Three Integration Tiers Explained

| **Tier** | **Effort** | **Real-time** | **Best For** | **Timeline** |
|----------|-----------|---------------|-------------|--------------|
| **Tier 1: ProfitChart Automation** | Low | No (hourly/daily) | Existing ProfitChart users | 1-2 weeks |
| **Tier 2: MT5 + B3 Real-time** | Medium | Yes (live) | MetaTrader 5 + B3 traders | 3-4 weeks |
| **Tier 3: Enterprise Broker Adapter** | High | Yes | All brokers uniformly | 6+ weeks |

---

## Tier 1: ProfitChart Automation ✨ (Quick Win)

### What It Does
- Automatically exports trades from ProfitChart daily
- Sends CSV to ProfitJournal webhook
- Applies SL/TP auto-generation
- No manual intervention needed

### How to Build (2 weeks)

**Step 1: Create Webhook Endpoint** (30 min)
```typescript
// src/app/api/integrations/profitchart/import/route.ts
import { processTradeImport } from "@/app/actions/trade-import"

export const POST = async (req: NextRequest) => {
  const { csvData, accountId } = await req.json()

  // Normalize and import
  const result = await processTradeImport(accountId, csvData)
  return NextResponse.json(result)
}
```

**Step 2: Add ProfitChart Field Mapper** (45 min)
```typescript
// src/lib/brokers/profitchart-mapper.ts
export const mapProfitChartTrade = (row: any) => ({
  asset: row["Ativo"],
  direction: row["Tipo"] === "COMPRA" ? "long" : "short",
  entryPrice: parseFloat(row["Preço Entrada"]),
  exitPrice: parseFloat(row["Preço Saída"]),
  positionSize: parseFloat(row["Quantidade"]),
  entryTime: new Date(row["Data Entrada"]),
  exitTime: new Date(row["Data Saída"]),
  // ... other fields
})
```

**Step 3: Set Up Export Automation** (45 min)
- User enables RTD (Real Time Data) in ProfitChart
- Create daily Excel macro that exports to folder
- Scheduler script (node/cron) picks up files and POSTs to webhook

**Step 4: Add UI Import Button** (30 min)
- "Import from ProfitChart" button in settings
- Shows import status, conflict resolution
- Preview before commit

### Benefits
- ✅ Works today (no B3/MT5 API setup needed)
- ✅ Zero user friction (automatic after setup)
- ✅ Can reuse existing CSV import logic
- ✅ Customers immediately see value

### Limitations
- ❌ Not true real-time (max hourly)
- ❌ No live market data integration
- ❌ ProfitChart-only (not for MT5 traders)

**Status:** Can implement immediately using existing CSV infrastructure

---

## Tier 2: MetaTrader 5 Real-Time Webhooks ⚡

### What It Does
- MetaTrader 5 automatically sends trade notifications to ProfitJournal
- Trades imported within seconds of execution
- Works with any MT5 broker
- Real-time SL/TP and P&L tracking

### How to Build (3-4 weeks)

**Architecture:**
```
MT5 Terminal (Expert Advisor)
        ↓
   [OnTrade() Event]
        ↓
 POST /api/integrations/metatrader5/webhooks
        ↓
ProfitJournal Backend
        ↓
  Normalize & Encrypt
        ↓
   PostgreSQL (Trades table)
        ↓
  Frontend Updates via WebSocket
```

**Step 1: Create Webhook Receiver** (2 hours)
```typescript
// src/app/api/integrations/metatrader5/webhooks/route.ts
export const POST = async (req: NextRequest) => {
  const payload = await req.json()

  // 1. Verify signature
  if (!verifyMT5Webhook(payload)) {
    return NextResponse.json({ error: "Invalid" }, { status: 401 })
  }

  // 2. Map MT5 fields to schema
  const trade = normalizeMT5Trade(payload)

  // 3. Store in database
  await processTrade("CREATE", trade)

  return NextResponse.json({ success: true })
}
```

**Step 2: Build MT5 Expert Advisor** (4 hours)
```mql5
// In MetaTrader 5, create Expert Advisor that posts on every trade event
void OnTrade() {
  HistoryDealSelect(HistoryDealGetTicket(HistoryDealsTotal() - 1));

  string payload = StringFormat(
    "{\"event\":\"trade.close\",\"ticket\":%lld,\"profit\":%f}",
    HistoryDealGetTicket(...),
    HistoryDealGetDouble(DEAL_PROFIT)
  );

  WebRequest("POST", "https://yourapp.com/api/metatrader5/webhooks",
    NULL, NULL, payload, response);
}
```

**Step 3: Account Mapping UI** (2 hours)
- Settings page to link MT5 account ID → ProfitJournal account
- Webhook URL generation
- Connection test button

**Step 4: Real-time Frontend Updates** (3 hours)
- WebSocket listener for trade updates
- Toast notification when trade imported
- Real-time position tracking

### Benefits
- ✅ True real-time (milliseconds)
- ✅ Works with ANY MT5 broker globally
- ✅ Automatic trade capture (no export needed)
- ✅ Built-in SL/TP/Commission tracking
- ✅ Perfect for active traders

### Limitations
- ❌ Requires EA setup in MT5 (user-facing complexity)
- ❌ Only captures MT5 trades (not ProfitChart-only users)
- ❌ No market depth data in webhook

**Status:** Requires MT5 API access. Feasible but more complex than Tier 1.

---

## Tier 2b: B3 Market Data Real-Time 📊

### What It Does
- Fetches real-time B3 stock quotes
- Calculates live entry/exit prices for validation
- Enables real-time analytics dashboard
- Powers trade performance tracking

### How to Build (1-2 weeks)

**Quick Integration with BrAPI (Free):**

```typescript
// src/lib/b3-market-data.ts
import axios from "axios"

export const B3MarketData = {
  async getQuote(symbols: string[]) {
    const res = await axios.get("https://brapi.dev/api/quote", {
      params: { symbols: symbols.join(",") }
    })
    return res.data.results // Live prices
  },

  async sync(accountId: string) {
    const trades = await getTrades(accountId)
    const symbols = [...new Set(trades.map(t => t.asset))]
    const quotes = await this.getQuote(symbols)

    // Store in database for analytics
    await db.insert(schema.marketQuotes).values(
      quotes.map(q => ({ accountId, ...q, timestamp: new Date() }))
    )
  }
}

// Cron job every 5 minutes during market hours
```

**Sync Endpoint:**
```typescript
// src/app/api/integrations/b3/market-data/sync/route.ts
export const POST = async (req: NextRequest) => {
  const { accountId } = await req.json()
  await B3MarketData.sync(accountId)
  return NextResponse.json({ success: true })
}
```

### Benefits
- ✅ Free (BrAPI has no cost)
- ✅ Real-time B3 stock quotes
- ✅ Useful for MFE/MAE calculations
- ✅ Powers analytics dashboard

### Limitations
- ❌ BrAPI free tier has rate limits
- ❌ No order book depth
- ❌ Enterprise UMDF feed expensive

**Status:** Can implement immediately with BrAPI. Enterprise B3 API requires subscription.

---

## Tier 3: Enterprise Broker Adapter (Future)

### What It Does
- Unified interface for ALL brokers
- Direct B3 API integration (enterprise)
- Custom order book data
- Full trade history sync

### Architecture Pattern
```typescript
interface BrokerAdapter {
  getTradeHistory(): Promise<Trade[]>
  subscribeToTrades(callback): void
  getMarketData(symbols): Promise<Quote[]>
}

// Concrete implementations
class B3Adapter implements BrokerAdapter { }
class MT5Adapter implements BrokerAdapter { }
class ProfitChartAdapter implements BrokerAdapter { }
```

---

## Quick Recommendations

### For MVP (Next 2 weeks)
1. **Start with Tier 1** (ProfitChart automation)
   - Low effort, immediate value
   - Use existing CSV infrastructure
   - Supports existing user base

2. **Add Tier 2b** (B3 market data)
   - Free BrAPI integration
   - Enables real-time analytics
   - Minimal backend work

### For Next Release (2-4 weeks after)
3. **Implement Tier 2** (MT5 webhooks)
   - Real-time trade capture
   - Supports active traders
   - Can charge for premium feature

### For Future (Roadmap)
4. **Enterprise Tier 3** (Full broker adapter)
   - Unified API pattern
   - Support 10+ brokers
   - B3 enterprise partnership

---

## Implementation Order

```
Week 1-2:  ✅ Tier 1 (ProfitChart Automation)
  └─ Webhook receiver
  └─ CSV normalization
  └─ User documentation

Week 3:    ✅ Tier 2b (B3 Market Data)
  └─ BrAPI integration
  └─ Quote syncing
  └─ Analytics dashboard

Week 4-5:  ⏳ Tier 2 (MT5 Webhooks)
  └─ Webhook receiver
  └─ EA setup guide
  └─ Account mapping UI

Week 6+:   🚀 Tier 3 (Enterprise)
  └─ Broker adapter pattern
  └─ B3 enterprise API
  └─ Support 10+ brokers
```

---

## Key Files to Create/Modify

### New Files
```
src/
├── app/
│   └── api/integrations/
│       ├── profitchart/import/route.ts
│       ├── metatrader5/webhooks/route.ts
│       └── b3/market-data/sync/route.ts
├── lib/
│   ├── brokers/
│   │   ├── profitchart-mapper.ts
│   │   ├── metatrader5-mapper.ts
│   │   └── broker-adapter.ts
│   └── b3-market-data.ts
└── components/
    └── integrations/
        ├── broker-connect.tsx
        ├── import-status.tsx
        └── market-data-status.tsx

scripts/
├── sync-profitchart-trades.ts
└── sync-b3-market-data.ts

docs/
├── integration-strategy.md (📄 created)
└── integration-quick-start.md (📄 you are here)
```

### Modified Files
```
src/db/schema.ts              (add broker_accounts, market_quotes tables)
src/app/actions/trades.ts     (add processBatchTrades function)
src/app/actions/trade-import.ts (enhance for webhooks)
src/components/settings/... (add integration UI)
```

---

## Next Steps

1. **Choose starting tier** based on user demand
2. **Assign 1-2 developers** for implementation
3. **Set up testing environment** with sample data
4. **Create user documentation** for setup/troubleshooting
5. **Build admin dashboard** for monitoring imports
6. **Launch beta** with 5-10 power users
7. **Iterate** based on feedback

---

## Success Metrics

- **Tier 1 Success:** 80% of CSV imports automated (zero manual uploads)
- **Tier 2 Success:** <500ms trade capture latency
- **B3 Data:** 95%+ uptime, quote accuracy vs. live B3
- **User Satisfaction:** NPS > 8 for "ease of trade import"

