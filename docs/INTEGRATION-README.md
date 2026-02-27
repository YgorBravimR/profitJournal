# ProfitJournal - Broker Integration Documentation

Complete technical guide for integrating ProfitJournal with B3, ProfitChart, and MetaTrader 5 to automatically import trades without manual intervention.

## 📚 Documentation Structure

This integration guide is organized into 4 files:

1. **INTEGRATION-README.md** (you are here)
   - Overview and quick navigation
   - High-level summary of all approaches

2. **integration-quick-start.md** ⭐ (START HERE)
   - Executive summary of 3 integration tiers
   - Effort/impact comparison
   - Recommended implementation order
   - ~15 min read

3. **integration-strategy.md**
   - Detailed technical architecture
   - Complete implementation code examples
   - Security considerations
   - Database schema design
   - Testing strategy
   - ~45 min read

4. **integration-api-reference.md**
   - Webhook endpoint specifications
   - Request/response formats
   - Data normalization schemas
   - Authentication & error handling
   - ~20 min read

---

## 🎯 The Challenge

Currently, ProfitJournal requires users to:
1. Export trades manually from ProfitChart/MetaTrader
2. Upload CSV file
3. Manually generate SL/TP values in UI

**Goal:** Automate this entirely so trades flow directly from broker to ProfitJournal in real-time.

---

## ⚡ Quick Summary: 3 Integration Tiers

### Tier 1: ProfitChart Automation (Quick Win)
- **What:** Daily automated CSV export from ProfitChart
- **Effort:** 1-2 weeks
- **Timeline:** Can start immediately
- **Real-time:** No (daily sync)
- **Users:** ProfitChart day traders
- **ROI:** High (zero manual work)

→ **Best for MVP** - Use existing CSV infrastructure

### Tier 2: MetaTrader 5 Real-Time Webhooks
- **What:** MT5 sends trade notifications automatically
- **Effort:** 3-4 weeks
- **Real-time:** Yes (milliseconds)
- **Users:** MT5 traders globally
- **ROI:** High (live trade tracking)

→ **Best for active traders** - Premium feature

### Tier 2b: B3 Market Data Real-Time
- **What:** Live stock quotes from B3 exchange
- **Effort:** 1-2 weeks
- **Real-time:** Yes (live quotes)
- **Users:** B3 stock traders
- **ROI:** Medium (enables analytics)

→ **Add to Tier 2** - Complements MT5 integration

### Tier 3: Enterprise Broker Adapter
- **What:** Unified pattern supporting 10+ brokers
- **Effort:** 6+ weeks
- **Real-time:** Yes
- **Users:** All trader types
- **ROI:** Maximum (long-term scalability)

→ **Future roadmap** - Build after Tier 2

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────┐
│  Broker Platforms                       │
│  (ProfitChart, MT5, B3)                 │
└──────┬──────────────────────────────────┘
       │ Webhook/CSV/API
       ▼
┌─────────────────────────────────────────┐
│  ProfitJournal Backend                  │
│  ├─ Trade Webhook Receivers             │
│  ├─ Data Normalization                  │
│  ├─ Encryption (AES-256-GCM)            │
│  └─ Database Storage                    │
└──────┬──────────────────────────────────┘
       │ WebSocket/REST
       ▼
┌─────────────────────────────────────────┐
│  ProfitJournal Frontend                 │
│  (Real-time trade display)              │
└─────────────────────────────────────────┘
```

---

## 🚀 Recommended Implementation Path

### Week 1-2: Tier 1 (ProfitChart Automation)
- Create webhook endpoint `/api/integrations/profitchart/import`
- Build CSV field mapper
- Set up automated export from ProfitChart
- User documentation

**Result:** Zero manual CSV uploads. Users set up once, trades sync daily.

### Week 3: Tier 2b (B3 Market Data)
- Integrate BrAPI (free B3 API)
- Create `/api/integrations/b3/market-data/sync` endpoint
- Store real-time quotes for analytics
- Enable MFE/MAE calculations

**Result:** Live B3 stock prices in the platform.

### Week 4-5: Tier 2 (MT5 Webhooks)
- Build webhook receiver `/api/integrations/metatrader5/webhooks`
- Create MT5 Expert Advisor template
- Add account linking UI
- WebSocket real-time updates

**Result:** Live trade capture from MT5, milliseconds after execution.

### Future: Tier 3 (Enterprise)
- Unified BrokerAdapter pattern
- Enterprise B3 API integration
- Support 10+ brokers

---

## 🔑 Key Decisions to Make

### 1. Which Broker to Support First?
- **ProfitChart:** ~60% of Brazilian day traders use this
- **MetaTrader 5:** Global platform, ~40% of traders
- **B3:** Direct exchange integration (enterprise path)

**Recommendation:** Start with **ProfitChart + MT5** (covers 80% of users)

### 2. Real-Time vs Daily Sync?
- **Tier 1 (Daily):** Low effort, good for backtesting traders
- **Tier 2 (Real-time):** High value for active traders, more complexity

**Recommendation:** Start with Tier 1, add Tier 2 in next release

### 3. Free vs Enterprise APIs?
- **BrAPI (Free):** Good for MVP, rate limits
- **B3 UMDF (Enterprise):** Full market data, expensive

**Recommendation:** Use **BrAPI for MVP**, upgrade to UMDF later if needed

---

## 💰 Feature Pricing Ideas

### Free Tier (Current)
- CSV import (existing)
- Journal entry manual
- Basic analytics

### Premium Tier (New)
- **Automated imports** (Tier 1 + 2b): $9.99/month
- Real-time trade capture from MT5: +$4.99/month
- Live market data & advanced analytics: Included

### Enterprise Tier (Future)
- Direct B3 API integration: Custom pricing
- Support for 10+ broker platforms
- Dedicated webhook infrastructure

---

## 🔐 Security Architecture

All integrations follow encryption-first design:

1. **Webhook Signature Verification:** HMAC-SHA256 for all incoming webhooks
2. **Field Encryption:** Prices (entry/exit/SL/TP) encrypted with per-user DEK
3. **API Key Protection:** Keys stored encrypted in environment variables
4. **Rate Limiting:** 429 for >100 req/min per endpoint
5. **Audit Trail:** All imports logged with status (success/failure/duplicate)

See `integration-strategy.md` for detailed security section.

---

## 📊 Success Metrics

### Tier 1 Adoption
- 70%+ of users enable ProfitChart auto-sync
- 95%+ of imports process successfully
- <1 sec average webhook latency

### Tier 2 Adoption
- 40%+ of MT5 users link their accounts
- <500ms trade capture latency
- 99.9% webhook delivery success

### Data Quality
- <1% duplicate trade detection rate
- 100% SL/TP accuracy validation
- R-multiple calculations within 0.01% of manual

---

## 🛠️ Development Checklist

### Tier 1: ProfitChart
- [ ] Create webhook receiver
- [ ] Build CSV field mapper
- [ ] Implement deduplication logic
- [ ] Add SL/TP auto-generation
- [ ] Create import status UI
- [ ] User documentation
- [ ] User testing (5-10 beta users)

### Tier 2b: B3 Market Data
- [ ] Integrate BrAPI client
- [ ] Create sync endpoint
- [ ] Add market_quotes table to schema
- [ ] Scheduler for periodic sync (every 5 min)
- [ ] Display in frontend

### Tier 2: MT5 Webhooks
- [ ] Webhook receiver with signature verification
- [ ] Account mapping UI
- [ ] MT5 Expert Advisor template
- [ ] WebSocket integration for real-time UI
- [ ] Webhook status monitoring dashboard
- [ ] Documentation for EA setup

---

## 📖 How to Read This Guide

### For Product Managers
1. Read this file (2 min)
2. Read `integration-quick-start.md` (15 min)
3. Decide: Which tier first? (5 min)

### For Developers
1. Read `integration-quick-start.md` (15 min)
2. Deep dive: `integration-strategy.md` (45 min)
3. Reference: `integration-api-reference.md` (20 min as-needed)
4. Start with Tier 1 code (simplest first)

### For Technical Leads
1. Read all 3 technical docs (90 min)
2. Review database schema changes
3. Plan deployment & monitoring
4. Security audit checklist

---

## 🔗 Related Documentation

- **Current Architecture:** `/docs/component-architecture.md`
- **Database Schema:** `src/db/schema.ts`
- **Existing CSV Import:** `src/app/actions/csv-import.ts`
- **Trade Calculations:** `src/lib/calculations.ts`
- **Encryption:** `src/lib/crypto.ts`

---

## ❓ FAQ

**Q: Can we start with B3 instead of ProfitChart?**
A: Not recommended. ProfitChart has simpler integration (CSV automation), B3 requires enterprise API subscription. Start with ProfitChart for quick win.

**Q: Do we need to support all 3 brokers simultaneously?**
A: No. Implement one tier at a time. Start with Tier 1, add Tier 2 after validating with users.

**Q: What about other brokers (XP, B3, etc)?**
A: Tier 3 enables a pattern to support any broker. But start with ProfitChart + MT5 (covers 80% demand).

**Q: How much will this increase backend load?**
A: Minimal. Webhooks are event-driven (only when trades occur). B3 sync runs every 5 min (throttled). CSV import is user-triggered.

**Q: Can users migrate existing trades from MT5?**
A: Yes. MT5 Manager API can fetch historical trades via `history_deals_get()`. Implement in Phase 2 if needed.

**Q: Will this work for options/futures traders?**
A: Yes. All tiers support options and futures (MT5 handles multi-asset, B3 includes derivatives).

---

## 📞 Next Steps

1. **Review:** Share `integration-quick-start.md` with stakeholders
2. **Decide:** Choose starting tier (recommend: Tier 1)
3. **Plan:** Assign developer(s) and set timeline
4. **Design:** Create backend endpoints & database schema
5. **Develop:** Implement incrementally (Tier 1 → Tier 2 → Tier 3)
6. **Test:** Beta with 5-10 power users
7. **Launch:** Roll out to all users with documentation

---

## 📝 Document Updates

Last updated: 2026-02-25
- Added Tier 1 (ProfitChart automation)
- Added Tier 2 (MT5 webhooks) + Tier 2b (B3 market data)
- Added Tier 3 (Enterprise broker adapter)
- Included full architecture diagrams
- API reference with request/response examples

