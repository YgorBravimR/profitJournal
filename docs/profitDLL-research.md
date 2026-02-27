# ProfitDLL Research

Research document summarizing findings on Nelogica's DLL Real Time product, its capabilities, limitations, and potential integration strategy for ProfitJournal.

**Last updated:** 2026-02-26
**Status:** Parked for later implementation

---

## Table of Contents

- [Overview](#overview)
- [Data Available](#data-available)
- [Key Functions](#key-functions)
- [Callbacks](#callbacks)
- [Critical Limitations](#critical-limitations)
- [Architecture for Future Integration](#architecture-for-future-integration)
- [Data Quality Comparison](#data-quality-comparison)
- [Near-Term Alternative](#near-term-alternative)
- [References](#references)

---

## Overview

**Official name:** DLL Real Time
**Developer:** Nelogica (the company behind ProfitChart and ProfitPro)
**Type:** Native Windows DLL (PE32 binary) that connects to Nelogica's Market Data servers

ProfitDLL operates in two modes:

1. **Market Data only** -- read-only access to real-time quotes, order book, time and trades, and historical tick data.
2. **Routing + Market Data** -- full market data plus order routing capabilities (send, cancel, modify orders).

### Open Source Resources

- GitHub examples: [marcusgarim/profit-DLL](https://github.com/marcusgarim/profit-DLL) (MIT license)
- Language support: Python, C#, C++, Delphi

---

## Data Available

### Real-Time Market Data

- **Quotes:** Price, volume, OHLCV (Open, High, Low, Close, Volume)
- **Order Book:** Level 1 and Level 2 depth, bid/ask prices and quantities
- **Time and Trades:** Every execution with hour, minute, second, millisecond, price, volume, lot size, buy/sell agents

### Order and Position Data

- **Order history:** `GetOrders()` retrieves orders by date range
- **Single order lookup:** `GetOrder()` by clOrdID, `GetOrderProfitID()` by internal Profit ID
- **Position:** `GetPosition()` returns intraday quantities, average prices, and custody information

### Historical Data

- **Tick-by-tick history:** `GetHistoryTrades()` provides tick-level data up to 90 days back

### Order Routing

- `SendBuyOrder()`, `SendSellOrder()` for limit orders
- `SendStopBuyOrder()`, `SendStopSellOrder()` for stop orders
- `SendCancelOrder()`, `SendChangeOrder()` for order management

---

## Key Functions

| Function | Description |
|----------|-------------|
| `DLLInitializeLogin` | Initialize with Routing + Market Data mode |
| `DLLInitializeMarketLogin` | Initialize with Market Data only mode |
| `GetOrders()` | Retrieve order list by date range (results via `THistoryCallback`) |
| `GetOrder()` | Retrieve single order by clOrdID |
| `GetOrderProfitID()` | Retrieve single order by internal Profit ID |
| `GetPosition()` | Get intraday position with quantities, prices, and averages |
| `GetHistoryTrades()` | Get tick-by-tick historical data (up to 90 days) |
| `SendBuyOrder()` | Send a limit buy order |
| `SendSellOrder()` | Send a limit sell order |
| `SendStopBuyOrder()` | Send a stop buy order |
| `SendStopSellOrder()` | Send a stop sell order |
| `SendCancelOrder()` | Cancel an existing order |
| `SendChangeOrder()` | Modify an existing order |

---

## Callbacks

| Callback | Purpose |
|----------|---------|
| `stateCallback()` | Login and connection state changes |
| `orderChangeCallbackV2()` | Real-time order status updates |
| `historyCallbackV2()` | Historical order retrieval results |
| `newTradeCallback()` | Executed trade notifications (`TNewTradeCallback` structure) |
| `offerBookCallback()` | Order book changes |
| `THistoryTradeCallback` | Historical tick data (same structure as `TNewTradeCallback`, used for history) |
| `TProgressCallback` | Progress indicator for history data requests |

---

## Critical Limitations

1. **Windows-only** -- ProfitDLL is a native PE32 binary. It cannot run on Linux servers, macOS, or in browsers. There is no cross-platform version.

2. **Paid product** -- Pricing is not publicly available. Requires contacting `corporativo@nelogica.com.br` for licensing. Reportedly expensive.

3. **Requires Nelogica license** -- An activation code, username, and password from Nelogica are required to authenticate and use the DLL.

4. **Desktop only** -- The DLL must run on a Windows machine with a desktop environment. It cannot be deployed server-side for a web application.

5. **Cost prohibitive for near-term** -- Given the licensing cost and Windows-only constraint, ProfitDLL is not viable for a web SaaS product in the near term.

---

## Architecture for Future Integration

A bridge pattern is needed to connect the Windows-only DLL to ProfitJournal's web infrastructure.

```
[User's Windows PC]                         [ProfitJournal Server]
ProfitDLL Agent (Python)  ---HTTPS POST--->  /api/integrations/profitdll/webhook
  - GetOrders()                                - Validate payload
  - GetPosition()                              - Encrypt fields (AES-256-GCM)
  - newTradeCallback events                    - Insert to DB
```

### How It Would Work

The user would install a lightweight Python agent on their Windows machine that:

1. Connects to ProfitDLL using their Nelogica credentials (activation code + username + password).
2. Listens for `newTradeCallback` events to capture real-time trade executions.
3. Periodically calls `GetOrders()` to sync order history.
4. Calls `GetPosition()` to track intraday positions.
5. POSTs normalized trade data to ProfitJournal's API endpoint over HTTPS.

### Security Considerations

- HMAC-SHA256 signature verification on all incoming webhooks.
- AES-256-GCM encryption for sensitive price fields (entry, exit, SL, TP).
- Rate limiting (429 response for more than 100 requests per minute).
- Audit logging for all imports.
- Per-user DEK (Data Encryption Key) system, consistent with ProfitJournal's existing encryption architecture.

---

## Data Quality Comparison

| Approach | Data Quality | Timestamps | Platform Requirement |
|----------|-------------|------------|----------------------|
| ProfitDLL bridge | Excellent (tick-level granularity) | Millisecond precision | Windows only |
| Nota de Corretagem PDF | Good (no execution order within session) | Session date only | Any |
| leitordenotas.com.br to CSV | Good (same as PDF source) | Session date only | Any |

---

## Near-Term Alternative

For immediate implementation, focus on **Nota de Corretagem PDF parsing** using the SINACOR standard. This approach:

- Works for all B3 brokers (Clear, XP, Genial, and others).
- Does not require paid licenses or Windows machines.
- Covers the majority of Brazilian traders who receive brokerage notes.

### Relevant Tools

- **correpy** ([GitHub](https://github.com/thiagosalvatore/correpy)) -- Python library for parsing SINACOR-format brokerage notes (PDFs).
- **nota-de-corretagem-to-csv** ([GitHub](https://github.com/nota-de-corretagem-to-csv/nota-de-corretagem-to-csv-node)) -- Node.js tool for converting brokerage note PDFs to CSV.
- **leitordenotas.com.br** ([Website](https://leitordenotas.com.br/)) -- Online service for reading and converting brokerage notes.

---

## Status and Recommendation

**Current status:** Parked for later.

ProfitDLL is an expensive, paid solution with a Windows-only limitation that makes it impractical for a web SaaS product in the near term. The licensing cost and the requirement for users to run a desktop agent create significant friction.

**Revisit when:**

- The user base grows to a size where premium integrations are justified.
- There is demonstrated demand from ProfitChart users for real-time, execution-level data.
- Nelogica potentially offers more accessible pricing or a server-compatible API.

**For now:** Prioritize Nota de Corretagem PDF parsing as the primary data import path for Brazilian traders. It is universally accessible, free, and covers the core use case without platform restrictions.

---

## References

### Nelogica Official Documentation

- [Ecosystem overview and first steps](https://ajuda.nelogica.com.br/hc/pt-br/articles/22396517026203-Ecossistema-ProfitDLL-e-primeiros-passos)
- [DLL Real Time introduction](https://ajuda.nelogica.com.br/hc/pt-br/articles/11166353435035-Introdução-ao-Produto-DLL-Real-Time)
- [Order routing via DLL Real Time](https://ajuda.nelogica.com.br/hc/pt-br/articles/13312468554651-Algotrading-Saiba-tudo-sobre-o-roteamento-de-ordens-via-DLL-Real-Time)
- [Historical data requests](https://ajuda.nelogica.com.br/hc/pt-br/articles/11973319153563-Como-requisitar-dados-históricos-com-a-DLL-Real-Time)
- [Historical CSV export availability](https://ajuda.nelogica.com.br/hc/pt-br/articles/11169188636443-Disponibilidade-de-Dados-Históricos-para-exportação-em-CSV)
- [NeloStore Data Solutions](https://store.nelogica.com.br/data-solution)

### Open Source Projects

- [marcusgarim/profit-DLL](https://github.com/marcusgarim/profit-DLL) -- ProfitDLL examples in Python, C#, C++, Delphi (MIT license)
- [correpy](https://github.com/thiagosalvatore/correpy) -- Python SINACOR PDF parser for brokerage notes
- [nota-de-corretagem-to-csv](https://github.com/nota-de-corretagem-to-csv/nota-de-corretagem-to-csv-node) -- Node.js brokerage note to CSV converter

### External Services

- [leitordenotas.com.br](https://leitordenotas.com.br/) -- Online brokerage note reader and converter
