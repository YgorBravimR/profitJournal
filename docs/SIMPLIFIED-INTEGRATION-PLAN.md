# ProfitJournal - Simplified Integration Plan
## Focus: Exact Trade Data (All Entries, All Exits, Exact Prices & Quantities)

---

## The Problem

**Current State:**
- ProfitChart's "Performance Export" gives **average entry/exit prices** (not individual fills)
- Users lose granular trade-by-trade data (entry#1, entry#2, exit#1, exit#2, etc.)
- Missing exact quantities for each execution
- No way to analyze individual trade psychology

**Goal:**
- Capture **EVERY entry and EVERY exit** with exact prices and quantities
- Automation first (direct connection to account)
- CSV fallback (most detailed export possible)
- Direct data flow: Broker → ProfitJournal (no manual CSV uploads)

---

## Understanding the Data Sources

### Option A: Direct Broker Account Connection ⭐ (PREFERRED)

**How it works:**
```
User's Trading Account (Clear/XP/Rico)
        ↓
Broker API → Order Executions
        ↓
Each execution = {
  orderId
  asset
  side (BUY/SELL)
  quantity
  price
  timestamp
  commission
  ...
}
        ↓
Multiple executions in same trade = partial fills
        ↓
ProfitJournal (group by trade logic)
```

**Key Insight:** Brokers track EVERY execution separately (partial fills included). If you buy 100 shares and it fills as 30 + 70, the broker API returns both fills with separate timestamps and prices.

**Supported Brokers in Brazil:**
| Broker | Has API | Trade History API | Webhook Support |
|--------|---------|------------------|-----------------|
| **Clear** | ✅ Yes | Partial | Manual export |
| **XP** | ✅ Yes | Partial | Manual export |
| **Rico** | ✅ Possible | Limited | Unknown |
| **Interactive Brokers** | ✅ Yes (global) | ✅ Full | ✅ Yes |
| **B3 Direct** | ⚠️ Enterprise | ✅ Full | ⚠️ Enterprise fee |

### Option B: CSV Export (Fallback)

**What ProfitChart offers:**
- Performance Report: Average entry/exit (❌ Not detailed enough)
- Order History: Can show individual orders placed
- Trade Statement from broker: Shows all fills

**Best approach:**
1. Export from broker's back-office (not ProfitChart)
   - Clear: Home Broker → Histórico de Operações
   - XP: Área do Cliente → Extrato de Operações
   - B3: Official trade statements
2. This has EXACT execution data with each fill

**Format needed for CSV import:**
```
OrderID, Asset, Side, Quantity, Price, Timestamp, Commission, TradeID
ORD001, WIN, BUY, 2, 5200.00, 2026-02-25 09:15:30, 15.00, TRADE001
ORD002, WIN, SELL, 2, 5250.00, 2026-02-25 14:30:15, 15.00, TRADE001
ORD003, WDO, BUY, 100, 30.50, 2026-02-25 10:00:00, 25.00, TRADE002
ORD004, WDO, SELL, 50, 29.80, 2026-02-25 11:15:00, 12.50, TRADE002
ORD005, WDO, SELL, 50, 29.75, 2026-02-25 11:20:00, 12.50, TRADE002
```

Key: TradeID groups all orders belonging to same trade (accounting for partial exits)

---

## Proposed Implementation Path

### Phase 1: Broker API Direct Connection (6-8 weeks)

**Priority: Clear + XP** (covers ~70% of Brazilian day traders)

#### Step 1: API Credentialing
```
User Action:
1. Goes to Settings → Connect Broker Account
2. Selects "Clear" or "XP"
3. Generates API key from broker portal
4. Pastes into ProfitJournal
5. ProfitJournal tests connection
```

#### Step 2: Create Broker Adapters

**Clear Adapter:**
```typescript
// src/lib/integrations/clear-adapter.ts

class ClearAdapter {
  async authenticate(apiKey: string) {
    // Test connection to Clear API
  }

  async getTradeHistory(params: {
    accountId: string
    from: Date
    to: Date
  }) {
    // Call Clear API endpoint: /operacoes/historico
    // Returns: [{ orderId, asset, side, qty, price, timestamp, commission }]
    // Note: Each partial fill is separate row
    const fills = await this.api.get('/operacoes/historico', params)
    return this.normalizeExecutions(fills)
  }

  private normalizeExecutions(fills: any[]) {
    // Group fills by day/asset/time to reconstruct trades
    // 1. BUY 100 @ 5200 + BUY 50 @ 5205 = Entry 150 @ avg 5201.67
    // 2. SELL 100 @ 5250 + SELL 50 @ 5248 = Exit 150 @ avg 5249.33

    const trades = new Map()
    for (const fill of fills) {
      const tradeKey = `${fill.asset}_${fill.dayId}`
      // Group by asset + day to find matching entries/exits
    }
    return Array.from(trades.values())
  }
}
```

**XP Adapter:**
```typescript
// src/lib/integrations/xp-adapter.ts
class XPAdapter {
  // Similar structure to Clear
  // XP API endpoint: /trading/executions
}
```

#### Step 3: Webhook Receiver for Real-Time Sync

```typescript
// src/app/api/integrations/broker/webhook/route.ts

export const POST = async (req: NextRequest) => {
  const { event, data, signature } = await req.json()

  // Verify signature (broker-specific)
  if (!verifyBrokerSignature(data, signature)) {
    return NextResponse.json({ error: "Invalid" }, { status: 401 })
  }

  // Events:
  // - "order.filled" → New execution
  // - "order.partially_filled" → Partial execution
  // - "order.cancelled" → Cancel event

  const execution = normalizeBrokerExecution(data)

  // Store in database
  await storeExecution(execution)

  // Broadcast via WebSocket for real-time UI update
  broadcastToUser(execution)

  return NextResponse.json({ success: true })
}
```

#### Step 4: Database Schema

```typescript
// src/db/schema.ts

export const executions = pgTable("executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").references(() => tradingAccounts.id).notNull(),

  // Raw execution data
  externalOrderId: varchar("external_order_id").notNull(), // Clear_ORD001
  asset: varchar("asset").notNull(),
  side: varchar("side").notNull(), // BUY, SELL
  quantity: decimal("quantity").notNull(),
  price: decimal("price").notNull(),
  executedAt: timestamp("executed_at").notNull(),
  commission: decimal("commission"),

  // Trade grouping (user links orders to trades)
  tradeId: uuid("trade_id").references(() => trades.id), // User specifies
  executionSequence: integer("execution_sequence"), // 1st entry, 2nd exit, etc.

  // Metadata
  source: varchar("source").notNull(), // CLEAR, XP, CSV_IMPORT
  importedAt: timestamp("imported_at").defaultNow(),
  isEncrypted: boolean("is_encrypted").default(true),
})

export const trades = pgTable("trades", {
  // ... existing fields ...

  // Entry side (can have multiple executions)
  entryExecutions: uuid("entry_executions").array(), // refs to executions table
  // Exit side (can have multiple executions)
  exitExecutions: uuid("exit_executions").array(),

  // Calculated from executions
  entryQuantityTotal: decimal("entry_quantity_total"), // Sum of all entry qty
  entryPriceAverage: decimal("entry_price_average"), // Weighted avg of all entries
  exitQuantityTotal: decimal("exit_quantity_total"),
  exitPriceAverage: decimal("exit_price_average"),
})
```

#### Step 5: Trade Reconstruction Logic

```typescript
// src/lib/trade-reconstruction.ts

export const reconstructTradesFromExecutions = (executions: Execution[]) => {
  const trades: Trade[] = []

  // Group by asset + day + same direction
  const groupedByEntry = groupByAssetAndDay(executions)

  for (const entryGroup of groupedByEntry) {
    // All BUY orders for WIN on Feb 25 = one entry
    const entry = {
      quantity: sum(entryGroup.map(e => e.quantity)),
      priceAverage: weightedAverage(entryGroup), // (qty1*price1 + qty2*price2) / total_qty
      executions: entryGroup
    }

    // Find matching exit group (opposite side, same asset, later time)
    const exitGroup = findMatchingExits(entryGroup, executions)

    // Create trade with both sides
    trades.push({
      asset: entryGroup[0].asset,
      direction: entryGroup[0].side === "BUY" ? "long" : "short",
      entryPrice: entry.priceAverage,
      positionSize: entry.quantity,
      entryTime: entryGroup[0].executedAt,
      exitPrice: exitGroup ? weightedAverage(exitGroup) : null,
      exitTime: exitGroup ? exitGroup[0].executedAt : null,
      ...calculateRMetrics(entry, exitGroup)
    })
  }

  return trades
}

const weightedAverage = (executions: Execution[]) => {
  const totalQty = executions.reduce((sum, e) => sum + e.quantity, 0)
  const totalValue = executions.reduce((sum, e) => sum + (e.quantity * e.price), 0)
  return totalValue / totalQty
}
```

#### Step 6: Settings UI

```typescript
// src/components/settings/broker-connection.tsx
// New page showing:
// 1. "Connect Clear Account" button
// 2. "Connect XP Account" button
// 3. List of connected accounts with:
//    - Last sync time
//    - # trades imported
//    - Connection status
// 4. Manual sync button
```

---

### Phase 2: Enhanced CSV Import (2-3 weeks)

**For users without API connection or as backup:**

#### What to ask users to export:

**From Clear:**
Settings → Extratos → Operações → Date range → Download CSV

**Expected CSV format:**
```
Data,Hora,Tipo,Ativo,Quantidade,Preço,Juros,Corretagem,Liquidação,Observações
25/02/2026,09:15:30,COMPRA,WIN,2,5200.00,0,15.00,25/02/2026,
25/02/2026,14:30:15,VENDA,WIN,2,5250.00,0,15.00,25/02/2026,
25/02/2026,10:00:00,COMPRA,WDO,100,30.50,0,25.00,25/02/2026,
25/02/2026,11:15:00,VENDA,WDO,50,29.80,0,12.50,25/02/2026,
25/02/2026,11:20:00,VENDA,WDO,50,29.75,0,12.50,25/02/2026,
```

#### Create "Detailed Trade Import" UI:

```typescript
// src/components/settings/detailed-trade-import.tsx

// Step 1: Upload CSV (broker statement, not ProfitChart performance)
// Step 2: Show preview of executions detected
// Step 3: Automatic trade grouping:
//    - "Found 2 BUY orders for WIN on Feb 25: 2+2 = 4 contracts @ avg 5200"
//    - "Found 2 SELL orders for WIN on Feb 25: 2+2 = 4 contracts @ avg 5250"
//    - "Grouped into 1 TRADE"
// Step 4: User confirmation
// Step 5: Import
```

---

## Implementation Checklist

### Phase 1: Direct Broker Connection (Weeks 1-8)

- [ ] Research Clear API documentation & authentication
- [ ] Create `ClearAdapter` class with full execution history
- [ ] Research XP API documentation & authentication
- [ ] Create `XPAdapter` class
- [ ] Build broker account linking UI
- [ ] Create `executions` table in database
- [ ] Build trade reconstruction algorithm
- [ ] Create webhook receiver for real-time sync (if broker supports)
- [ ] Build Settings page for account management
- [ ] Test with 5 beta users (Clear + XP accounts)
- [ ] Document setup process for users
- [ ] Launch MVP

### Phase 2: Enhanced CSV Import (Weeks 9-11)

- [ ] Build detailed CSV importer (not averages)
- [ ] Create automatic trade grouping UI
- [ ] Test with various broker statement formats
- [ ] User documentation
- [ ] Launch as fallback option

---

## Why This Approach

| Aspect | API Connection | CSV Fallback |
|--------|---|---|
| **Data Granularity** | ✅ Every execution | ✅ Every execution |
| **Automation** | ✅ Real-time sync | ❌ Manual upload |
| **Partial Fill Support** | ✅ Native | ✅ Supported |
| **Effort to Use** | ✅ One-time setup | ❌ Per-day export |
| **Data Accuracy** | ✅ High (live) | ✅ High (official) |
| **Implementation Time** | 6-8 weeks | 2-3 weeks |

---

## Architecture Diagram

```
User's Trading Account
├── Clear API
│   └─ GET /operacoes/historico
│      └─ [{orderId, asset, qty, price, timestamp}, ...]
├── XP API
│   └─ GET /trading/executions
│      └─ [{orderId, asset, qty, price, timestamp}, ...]
└── Broker Statement CSV (fallback)
   └─ Each row = one execution

        ↓↓↓ All paths converge ↓↓↓

Normalization Service
├── Group executions by asset + day
├── Match entries to exits
├── Calculate weighted averages
└─ Create Trade records

        ↓

Database (Encrypted)
├── executions table (granular fills)
└── trades table (grouped trades with entry/exit)

        ↓

Frontend
├── Show individual executions in trade detail
├── Display weighted avg entry/exit price
└── Calculate exact R-multiple per execution
```

---

## Key Differences vs. Original Plan

| Original | Simplified |
|----------|-----------|
| Tier 1: ProfitChart CSV | Phase 1: Broker API (Clear/XP) |
| Tier 2: MetaTrader 5 | ❌ Removed (not requested) |
| Tier 2b: B3 Quotes | ❌ Removed (not requested) |
| Tier 3: Enterprise | Phase 2: Detailed CSV fallback |

**Focus:** Exact execution data (all fills) via direct account connection

---

## Questions for You

Before starting implementation:

1. **Which brokers** do your target users use?
   - [ ] Clear (primary)
   - [ ] XP (primary)
   - [ ] Rico
   - [ ] Interactive Brokers
   - [ ] Others?

2. **Phase 1 priority:**
   - Start with Clear API + XP API
   - Or CSV fallback first (faster to market)?

3. **Real-time sync needed?**
   - ✅ Yes (webhooks, live updates)
   - ❌ No (daily batch import is fine)

4. **Partial fill handling:**
   - Show individual fills in UI?
   - Or group into single weighted trade?

5. **Timeline:**
   - MVP in 4-6 weeks (CSV + simple API)?
   - Full implementation 8-10 weeks (all brokers)?

---

## Sources & References

- [Clear API Documentation](https://atendimento.clear.com.br/artigo/4577-historico-de-ordens)
- [XP Developer Portal](https://developer.xpinc.com/)
- [ProfitChart Manual](https://cdn.clear.com.br/Platforms/908/manual.pdf)
- [Interactive Brokers TWS API](https://interactivebrokers.github.io/tws-api/executions_commissions.html)
- [Broker API Best Practices](https://blog.traderspost.io/article/broker-api-trading-guide)

