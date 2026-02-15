# Frontend Post-Mortem Log

---

> **[FIX-2026-02-13]** `Severity: Medium` — **Affected:** `src/components/journal/trade-form.tsx`, `src/components/journal/scaled-trade-form.tsx`, `src/app/[locale]/(app)/journal/new/page.tsx`
> **Report:** "The replay date is from January and on create a new trade it is from today, February 13th"
> **Fix:** The trade form used `new Date()` for default entry/exit dates instead of the account's effective date. Added `getCurrentAccount()` fetch to the new trade page, computed effective date via `getEffectiveDate(account)`, and threaded it as `defaultDate` prop through `NewTradeTabs` → `TradeForm` / `ScaledTradeForm`. Also updated the `max` attribute on date inputs to use the effective date instead of real today.

---

> **[FIX-2026-02-15]** `Severity: Low` — **Affected:** `/src/components/journal/scaled-trade-form.tsx`
> **Report:** "Exit table headers misaligned compared to entry headers in scaled position form"
> **Fix:** The exits section header used `grid-cols-[1fr_80px_90px_90px_100px_40px]` (fixed pixel widths) while the entries header and `InlineExecutionRow` both used `grid-cols-[4fr_2fr_3fr_2fr_3fr_1fr]` (fractional widths). Changed exits header to match: `grid-cols-[4fr_2fr_3fr_2fr_3fr_1fr]`.

---

> **[FIX-2026-02-15]** `Severity: Low` — **Affected:** `/src/components/journal/inline-execution-row.tsx`
> **Report:** "Commission currency placeholder 'BRL' overlaps with input value in the commission column"
> **Fix:** The input had `pl-5` (20px left padding) which was insufficient for 3-character currency codes like "BRL" positioned at `left-2` (8px). Increased to `pl-10` (40px) for adequate clearance. Also added `pointer-events-none` to the currency prefix span to prevent it from blocking input clicks.
