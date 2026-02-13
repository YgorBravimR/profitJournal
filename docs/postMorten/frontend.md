# Frontend Post-Mortem Log

---

> **[FIX-2026-02-13]** `Severity: Medium` — **Affected:** `src/components/journal/trade-form.tsx`, `src/components/journal/scaled-trade-form.tsx`, `src/app/[locale]/(app)/journal/new/page.tsx`
> **Report:** "The replay date is from January and on create a new trade it is from today, February 13th"
> **Fix:** The trade form used `new Date()` for default entry/exit dates instead of the account's effective date. Added `getCurrentAccount()` fetch to the new trade page, computed effective date via `getEffectiveDate(account)`, and threaded it as `defaultDate` prop through `NewTradeTabs` → `TradeForm` / `ScaledTradeForm`. Also updated the `max` attribute on date inputs to use the effective date instead of real today.
