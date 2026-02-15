# Database Post-Mortem Log

---

## [BUG-2026-02-15] WINFUT/WDOFUT tick_value seed data 20x too high, causing incorrect P&L

**Date:** 2026-02-15
**Severity:** Critical
**Affected Area:** `scripts/seed.ts`, `src/components/journal/scaled-trade-form.tsx`, `src/app/actions/trades.ts`

### Cause
The `tick_value` column in the `assets` table stores the monetary value of one tick (one minimum price fluctuation) in cents. For WINFUT, one tick = 5 points, and each point is worth R$0.20, so one tick = R$1.00 = 100 cents. However, the seed script stored `2000` (R$20.00) instead of `100` (R$1.00). Similarly, WDOFUT stored `1000` instead of the correct `500`.

The origin of the error appears to be a confusion between "value per point" and "value per tick":
- WINFUT: R$0.20/point was incorrectly stored as 2000 cents (should be 100 cents per tick)
- WDOFUT: R$10.00/point was stored as 1000 cents (should be 500 cents per tick)

### Effect
All P&L calculations for WINFUT trades were 20x too high. For a short trade from 185665 with exits at 185365 (6 contracts) and 185225 (6 contracts), the system displayed R$17,760.00 instead of the correct R$888.00. The same 20x multiplier affected risk calculations, R-multiple, and any server-side stored P&L values.

WDOFUT trades would have been 2x too high.

### Solution
1. Corrected seed values: WINFUT `tick_value` from `2000` to `100`, WDOFUT from `1000` to `500`.
2. Added inline comments in the seed script explaining the tick_value calculation formula: `tick_value_cents = tick_size * point_value * 100`.
3. Updated the `calculateAssetPnL` docstring in `src/lib/calculations.ts` which had an incorrect example (showed tickValue=0.20 for WINFUT, corrected to 1.00).
4. Updated the asset form placeholder from "0.20" to "1.00" and added a hint explaining the tick value calculation.

**Important**: Existing databases that were seeded with the incorrect values will need their asset tick_values manually corrected through the Settings > Assets page. Re-running the seed will also fix it due to the `ON CONFLICT ... DO UPDATE` clause.

### Prevention
- Add a unit test that verifies seed asset tick_values produce correct P&L for known scenarios (e.g., WINFUT 100-point move = R$20/contract).
- The asset form now includes a hint explaining how to calculate tick value from tick size and point value.
- Consider adding a validation check in the asset creation flow that warns users if tick_value seems disproportionate to tick_size.

### Related Files
- `scripts/seed.ts`
- `src/lib/calculations.ts`
- `src/components/journal/scaled-trade-form.tsx`
- `src/app/actions/trades.ts`
- `src/components/settings/asset-form.tsx`
- `messages/en.json`
- `messages/pt-BR.json`
