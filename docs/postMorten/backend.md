# Backend Post-Mortem Log

---

## [BUG-2026-02-25] Encryption works in dev but all decrypted values return null/zero in production

**Date:** 2026-02-25
**Severity:** Critical
**Affected Area:** `src/lib/crypto.ts`, `src/lib/user-crypto.ts`, `next.config.ts`, all server actions using encryption

### Cause
Two compounding issues:

1. **Module resolution:** `import { ... } from "crypto"` (bare specifier) is ambiguous to Turbopack in production builds. The `node:` prefix was missing, causing the bundler to potentially shim or polyfill the module instead of resolving to Node.js built-in `crypto`. This works in `next dev` because development mode has different module resolution behavior.

2. **Silent error swallowing:** The `decrypt()` function in `crypto.ts` had a bare `catch { return null }` block. When `createDecipheriv` or related functions failed (due to the shim not implementing full AES-256-GCM), the error was silently swallowed. This `null` propagated through `decryptDek` -> `getUserDek` -> every server action, causing all encrypted fields to remain as ciphertext.

The cascading failure path:
- `getUserDek` returns `null` (DEK decryption failed silently)
- Server actions check `if (dek)` and skip decryption
- Raw encrypted ciphertext passes through to `fromCents()` which calls `parseInt` on it
- `parseInt("FqIGpqLxnA3aU8PA:...")` returns `NaN`, which falls back to `0`
- User sees R$0 for all monetary values and encrypted gibberish for text fields

### Effect
- All monetary displays (Gross P&L, Net P&L, Avg Win/Loss) show as R$0
- User name shows as encrypted ciphertext instead of readable name
- Profit Factor and other derived metrics show as 0.00
- Calendar cells show R$0 instead of colored +/- values
- The app appears functional but displays entirely wrong data

### Solution
1. Changed `import { ... } from "crypto"` to `import { ... } from "node:crypto"` in `src/lib/crypto.ts`
2. Added `console.error` logging in the `catch` block of `decrypt()` so failures are visible in server logs
3. Added diagnostic logging in `getUserDek()` when DEK decryption returns null
4. Added `serverExternalPackages: ["bcryptjs"]` in `next.config.ts` to prevent Turbopack from incorrectly bundling native modules

### Prevention
- See general knowledge post-mortem in `~/.claude/post-mortems/nextjs.md` for the `node:` prefix rule
- All future Node.js built-in imports MUST use the `node:` prefix
- Never use bare `catch { return null }` in security-critical code paths
- Add a build-time smoke test that verifies encrypt/decrypt round-trip

### Related Files
- `src/lib/crypto.ts`
- `src/lib/user-crypto.ts`
- `next.config.ts`
- All server actions in `src/app/actions/` (consumers of encryption)

---

## [BUG-2026-02-25] Non-admin users get "Unauthorized: admin access required" on Settings page

**Date:** 2026-02-25
**Severity:** High
**Affected Area:** `src/app/[locale]/(app)/settings/page.tsx`, `src/app/actions/seed-risk-profiles.ts`

### Cause
The `seedBuiltInRiskProfiles()` server action contained a hard authorization gate that threw `new Error("Unauthorized: admin access required")` when called by a non-admin user (line 52 of `seed-risk-profiles.ts`). The Settings page server component (`settings/page.tsx`, line 27) called this function unconditionally on every render, regardless of the user's role.

This is a contract mismatch: the function was written to be admin-only (fail loudly), but the call site was an all-users page that already had the `user` object with `isAdmin` available from the `getCurrentUser()` call in the same `Promise.all` block.

### Effect
Any non-admin user navigating to the Settings page received an unhandled server error: `Error: Unauthorized: admin access required`. The entire Settings page failed to render, completely blocking non-admin users from accessing their profile, account, asset, timeframe, and tag settings.

### Solution
Applied a two-layer fix (defense in depth):

1. **`seed-risk-profiles.ts`**: Changed the admin check from `throw new Error(...)` to `return []`. The function now silently returns an empty array for non-admin users, making it inherently safe to call from any context. This aligns with the function's own JSDoc which describes it as "safe to call on every page load."

2. **`settings/page.tsx`**: Added a conditional guard `if (user?.isAdmin)` before calling `seedBuiltInRiskProfiles()`. This prevents the unnecessary auth check and DB query for non-admin users, improving performance as a secondary benefit.

### Prevention
- Server actions that are meant to be called from shared pages should never throw on authorization checks. Use early returns instead.
- When a page-level server component already has user role information, use it as a gatekeeper before calling role-restricted functions.
- Review all `throw new Error("Unauthorized...")` patterns in server actions to ensure they are only reachable from appropriately guarded call sites.

### Related Files
- `src/app/[locale]/(app)/settings/page.tsx`
- `src/app/actions/seed-risk-profiles.ts`
