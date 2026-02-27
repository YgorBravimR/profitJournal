# Integration API Reference

## ProfitChart Webhook Endpoint

### POST `/api/integrations/profitchart/import`

**Purpose:** Accept CSV trade data from ProfitChart and import into ProfitJournal

**Request Body:**
```json
{
  "csvData": "Asset,Type,EntryPrice,ExitPrice,Quantity,EntryDate,ExitDate,...",
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "brokerName": "PROFITCHART",
  "generateSLTP": true,
  "slTpConfig": {
    "WIN": { "slTicks": 37, "slVariance": 5, "tpTicks": 140, "tpVariance": 5 },
    "WDO": { "slTicks": 50, "slVariance": 10, "tpTicks": 100, "tpVariance": 20 }
  }
}
```

**Response Success (200):**
```json
{
  "success": true,
  "imported": 142,
  "duplicates": 3,
  "failed": 0,
  "errors": [],
  "timestamp": "2026-02-25T14:30:00.000Z",
  "importId": "import_550e8400e29b41d4"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Invalid CSV format",
  "details": {
    "invalidRows": [5, 12],
    "missingColumns": ["EntryPrice", "Quantity"]
  }
}
```

**CSV Format Expected:**
```
Asset,Type,EntryPrice,ExitPrice,Quantity,EntryDate,EntryTime,ExitDate,ExitTime,Commission
WIN,COMPRA,5200.00,5250.00,2,2026-02-25,09:15:00,2026-02-25,14:30:00,15.00
WDO,VENDA,30.50,29.80,100,2026-02-25,10:00:00,2026-02-25,11:45:00,25.00
```

---

## MetaTrader 5 Webhook Endpoint

### POST `/api/integrations/metatrader5/webhooks`

**Purpose:** Receive real-time trade notifications from MT5 Expert Advisor

**Request Body:**
```json
{
  "event": "trade.open",
  "ticket": 123456789,
  "accountId": "MT5_12345",
  "symbol": "PETR4",
  "type": "buy",
  "volume": 100,
  "entryPrice": 28.45,
  "sl": 27.95,
  "tp": 29.50,
  "openTime": "2026-02-25T09:30:15.000Z",
  "commission": 12.50,
  "signature": "sha256_hex_hash_of_payload"
}
```

**Possible Events:**
- `trade.open` - New trade opened
- `trade.close` - Trade closed
- `trade.modify` - SL/TP modified

**Request Body (trade.close):**
```json
{
  "event": "trade.close",
  "ticket": 123456789,
  "accountId": "MT5_12345",
  "symbol": "PETR4",
  "type": "buy",
  "volume": 100,
  "entryPrice": 28.45,
  "exitPrice": 29.35,
  "sl": 27.95,
  "tp": 29.50,
  "openTime": "2026-02-25T09:30:15.000Z",
  "closeTime": "2026-02-25T14:15:30.000Z",
  "commission": 12.50,
  "swap": -5.50,
  "profit": 78.50,
  "signature": "sha256_hex_hash_of_payload"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "tradeId": "trade_550e8400e29b41d4",
  "message": "Trade imported successfully"
}
```

**Response Error (401 - Invalid Signature):**
```json
{
  "success": false,
  "error": "Invalid webhook signature",
  "message": "Signature verification failed"
}
```

**Response Error (404 - Account Not Mapped):**
```json
{
  "success": false,
  "error": "Account not found",
  "message": "MT5 account MT5_12345 is not linked to any ProfitJournal account"
}
```

---

## B3 Market Data Sync Endpoint

### POST `/api/integrations/b3/market-data/sync`

**Purpose:** Fetch and store real-time B3 stock quotes for account

**Request Body:**
```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "symbols": ["PETR4", "VALE3", "ITUB4"]
}
```

**Response Success (200):**
```json
{
  "success": true,
  "quotes": [
    {
      "symbol": "PETR4",
      "price": 28.45,
      "change": 0.15,
      "changePercent": 0.53,
      "volume": 12345000,
      "timestamp": "2026-02-25T14:30:00.000Z"
    },
    {
      "symbol": "VALE3",
      "price": 67.89,
      "change": -0.45,
      "changePercent": -0.66,
      "volume": 8765000,
      "timestamp": "2026-02-25T14:30:00.000Z"
    }
  ],
  "synced": 2,
  "failed": 0
}
```

**Response Error (429 - Rate Limited):**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Broker Account Linking

### POST `/api/integrations/account/link`

**Purpose:** Link external broker account to ProfitJournal account

**Request Body:**
```json
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "brokerName": "METATRADER5",
  "brokerAccountId": "MT5_12345",
  "brokerApiKey": "encrypted_api_key_here",
  "webhookSecret": "webhook_secret_for_signature_verification"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "linkedAccountId": "ba_550e8400e29b41d4",
  "webhookUrl": "https://app.profitjournal.com/api/integrations/metatrader5/webhooks",
  "status": "connected"
}
```

---

## Import Status Polling

### GET `/api/integrations/status/:importId`

**Purpose:** Check status of ongoing import job

**Response:**
```json
{
  "importId": "import_550e8400e29b41d4",
  "status": "processing",
  "progress": {
    "processed": 45,
    "total": 142,
    "percentComplete": 31.7
  },
  "startedAt": "2026-02-25T14:20:00.000Z",
  "estimatedCompletionTime": "2026-02-25T14:35:00.000Z",
  "errors": []
}
```

**Final Status (completed):**
```json
{
  "importId": "import_550e8400e29b41d4",
  "status": "completed",
  "summary": {
    "imported": 142,
    "duplicates": 3,
    "failed": 0
  },
  "completedAt": "2026-02-25T14:30:00.000Z"
}
```

---

## WebSocket Real-Time Updates

### WS `wss://app.profitjournal.com/ws/trades`

**Subscribe to trade updates:**
```json
{
  "action": "subscribe",
  "accountId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Incoming Trade Event:**
```json
{
  "type": "trade.created",
  "data": {
    "id": "trade_550e8400e29b41d4",
    "asset": "PETR4",
    "direction": "long",
    "entryPrice": 28.45,
    "exitPrice": null,
    "positionSize": 100,
    "status": "open",
    "source": "METATRADER5"
  },
  "timestamp": "2026-02-25T09:30:15.000Z"
}
```

**Trade Updated Event:**
```json
{
  "type": "trade.closed",
  "data": {
    "id": "trade_550e8400e29b41d4",
    "exitPrice": 29.35,
    "pnl": 78.50,
    "status": "closed"
  },
  "timestamp": "2026-02-25T14:15:30.000Z"
}
```

---

## Data Normalization Schemas

### Input: ProfitChart Trade Row
```typescript
interface ProfitChartRow {
  "Ativo": string           // e.g., "WIN" or "PETR4"
  "Tipo": string            // "COMPRA" | "VENDA"
  "Preço Entrada": string   // e.g., "5200.00"
  "Preço Saída": string     // e.g., "5250.00"
  "Quantidade": string      // e.g., "2"
  "Data Entrada": string    // "25/02/2026" or "2026-02-25"
  "Hora Entrada": string    // "09:15:00"
  "Data Saída": string      // "25/02/2026"
  "Hora Saída": string      // "14:30:00"
  "Comissão": string        // "15.00"
}
```

### Input: MetaTrader 5 Trade
```typescript
interface MT5Trade {
  ticket: number
  symbol: string
  type: "buy" | "sell"
  volume: number
  entryPrice: number
  exitPrice: number | null
  sl: number
  tp: number
  openTime: string
  closeTime: string | null
  commission: number
  swap: number
  profit: number
}
```

### Output: Normalized Trade (Internal)
```typescript
interface NormalizedTrade {
  accountId: string
  externalId: string        // "MT5_123456" or "PROFITCHART_ABC"
  asset: string
  direction: "long" | "short"
  entryPrice: number        // encrypted in DB
  exitPrice: number | null  // encrypted in DB
  positionSize: number      // encrypted in DB
  stopLoss: number          // encrypted in DB
  takeProfit: number        // encrypted in DB
  entryTime: Date
  exitTime: Date | null
  commission: number        // encrypted in DB
  pnl: number | null        // encrypted in DB
  plannedRiskAmount: number // calculated & encrypted
  plannedRMultiple: number | null // calculated & encrypted
  status: "open" | "closed"
  importSource: "PROFITCHART" | "METATRADER5" | "B3"
  importedAt: Date
}
```

---

## Error Handling

### Common Error Responses

**Invalid Request (400):**
```json
{
  "error": "INVALID_REQUEST",
  "message": "Missing required field: accountId",
  "details": { "field": "accountId" }
}
```

**Unauthorized (401):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Webhook signature verification failed"
}
```

**Not Found (404):**
```json
{
  "error": "NOT_FOUND",
  "message": "Account not found",
  "accountId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Rate Limited (429):**
```json
{
  "error": "RATE_LIMITED",
  "message": "Too many requests",
  "retryAfter": 60
}
```

**Server Error (500):**
```json
{
  "error": "INTERNAL_ERROR",
  "message": "Failed to process trade import",
  "requestId": "req_550e8400e29b41d4"
}
```

---

## Authentication

### Webhook Signature Verification

All webhooks include a `signature` field that must be verified:

```typescript
import crypto from "crypto"

const verifySignature = (payload: any, signature: string, secret: string): boolean => {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex")

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signature)
  )
}

// Usage in webhook handler
if (!verifySignature(payload, payload.signature, process.env.METATRADER5_WEBHOOK_SECRET!)) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
}
```

### API Key Authentication

For synchronous API calls (B3 market data):

```typescript
// Header-based authentication
fetch("/api/integrations/b3/market-data/sync", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ accountId, symbols })
})
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/integrations/profitchart/import` | 10 requests | Per hour |
| `/api/integrations/metatrader5/webhooks` | 1000 requests | Per minute |
| `/api/integrations/b3/market-data/sync` | 100 requests | Per minute |
| `/api/integrations/account/link` | 5 requests | Per hour |

---

## Webhook Security Best Practices

1. **Always verify signatures** before processing
2. **Use HTTPS only** for all endpoints
3. **Implement idempotency** using `externalId` to prevent duplicates
4. **Log all webhook activity** for audit trails
5. **Implement retry logic** with exponential backoff (3-5 retries)
6. **Set timeouts** (30 seconds max for sync endpoints)

---

## Testing Webhook Locally

```bash
# Using curl
curl -X POST http://localhost:3000/api/integrations/metatrader5/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "trade.close",
    "ticket": 123456,
    "accountId": "MT5_12345",
    "symbol": "PETR4",
    "type": "buy",
    "volume": 100,
    "entryPrice": 28.45,
    "exitPrice": 29.35,
    "sl": 27.95,
    "tp": 29.50,
    "openTime": "2026-02-25T09:30:15Z",
    "closeTime": "2026-02-25T14:15:30Z",
    "commission": 12.50,
    "swap": -5.50,
    "profit": 78.50,
    "signature": "test_signature"
  }'
```

