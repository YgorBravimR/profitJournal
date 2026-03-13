# Testing Checklist

Manual verification checklist for features before launch. Each section includes pre-requisites, steps, and expected outcomes.

---

## Auth Security Hardening

### Pre-requisites

- [x] Run `pnpm drizzle-kit push` (or verify migration `0015_lush_satana.sql` was applied)
- [x] Verify `RESEND_API_KEY` is set in `.env` (needed for verification emails)
- [x] Verify `EMAIL_FROM` is set in `.env` (or default `noreply@bravojournal.com` will be used)
- [x] Start dev server: `pnpm dev`
- [x] Have access to a real email inbox for testing (or check Resend dashboard for sent emails)

---

### Fix 1: Database-Backed Rate Limiting

#### 1.1 Login rate limiting persists across server restarts

- [x] Go to `/login`
- [x] Enter a valid email with a wrong password 4 times
- [x] Stop the dev server (`Ctrl+C`) and restart it (`pnpm dev`)
- [x] Try one more wrong login with the same email
- [x] **Expected:** "Too many login attempts. Please try again in X minute(s)." appears (the 5th attempt is blocked even after restart)

#### 1.2 Password recovery rate limiting

- [x] Go to `/forgot-password`
- [x] Request a reset code for a valid email
- [x] On the code entry step, enter wrong codes 5 times
- [x] **Expected:** "Too many attempts. Try again in X minute(s)." appears

#### 1.3 CSV import rate limiting

- [ ] Go to the CSV import page
- [ ] Upload and process a valid CSV file
- [ ] Immediately try to upload another CSV for the same account
- [ ] **Expected:** 429 response with cooldown message (~30 min)
- [ ] Restart the dev server and try again
- [ ] **Expected:** Still blocked (DB-backed, not reset by restart)

#### 1.4 Database cleanup

- [x] Open your database client and query: `SELECT COUNT(*) FROM rate_limit_attempts;`
- [x] Verify rows exist after the tests above
- [x] After 24h (or manually delete old rows), verify cleanup occurs

---

### Fix 2: JWT maxAge (7 days)

#### 2.1 Cookie expiry verification

- [x] Log in successfully
- [x] Open browser DevTools > Application > Cookies
- [x] Find the `authjs.session-token` cookie (or `__Secure-authjs.session-token` in production)
- [x] **Expected:** Expiry date is approximately 7 days from now (not 30 days)

#### 2.2 Session duration

- [x] Log in and note the time
- [x] Keep the tab open for a while, navigate around
- [x] **Expected:** Session remains active within the 7-day window
- [x] (Optional) Manually set cookie expiry to the past in DevTools, then refresh
- [x] **Expected:** Redirected to `/login`

---

### Fix 3: Email Verification

#### 3.1 New user registration flow

- [x] Go to `/register`
- [x] Fill in name, email (use a real inbox), password, confirm password
- [x] Click "Create Account"
- [x] **Expected:** Redirected to `/verify-email?email=your@email.com`
- [x] **Expected:** NOT auto-logged in (no dashboard access)

#### 3.2 Verification email received

- [x] Check the email inbox (or Resend dashboard)
- [x] **Expected:** Email with subject "Verify Your Email - Bravo Journal" received
- [x] **Expected:** Email contains a 6-digit code with Bravo Journal branding

#### 3.3 Verify email page UI

- [x] On `/verify-email?email=...`, verify:
- [x] Page shows "Verify Your Email" title
- [x] Email address is displayed below the subtitle
- [x] 6-digit OTP input is centered
- [x] "Back to login" link is visible

#### 3.4 Wrong code handling

- [x] Enter an incorrect 6-digit code
- [x] **Expected:** Error message "Invalid or expired code" appears
- [x] **Expected:** OTP input is cleared for retry

#### 3.5 Correct code handling

- [x] Enter the correct 6-digit code from the email
- [x] **Expected:** Success screen with "Email Verified!" and checkmark
- [x] **Expected:** Auto-redirects to `/login?verified=true` after ~2 seconds

#### 3.6 Resend code

- [x] On the verify-email page, check the resend timer
- [x] **Expected:** "Resend code in Xs" countdown (starts at 60s)
- [x] Wait for countdown to finish, click "Resend code"
- [x] **Expected:** New email arrives with a fresh code
- [x] **Expected:** Timer resets to 60s

#### 3.7 Login blocked for unverified user

- [x] Register a new user but do NOT verify the email
- [x] Go to `/login` and enter the unverified user's credentials
- [x] **Expected:** "Email not verified" banner appears (not generic error)
- [x] **Expected:** Banner includes a "Resend verification code" button
- [x] Click the resend button
- [x] **Expected:** Redirected to `/verify-email?email=...`

#### 3.8 Login works after verification

- [x] Complete the verification flow for the user from 3.7
- [x] Go to `/login` and enter the now-verified user's credentials
- [x] **Expected:** Login succeeds, redirected to dashboard

#### 3.9 Verification rate limiting

- [x] On the verify-email page, enter wrong codes 5 times
- [x] **Expected:** "Too many attempts. Try again in X minute(s)." appears

#### 3.10 Request rate limiting

- [x] Click "Resend code" 3 times rapidly (waiting for cooldown each time)
- [x] **Expected:** After 3rd request within 5 minutes, rate limit error appears

---

### Fix 4: Account Lockout (Exponential Backoff)

#### 4.1 Tier 1 lockout (5 failures)

- [x] Go to `/login` with a valid (verified) email
- [x] Enter wrong password 5 times
- [x] **Expected:** "Account temporarily locked... try again in 15 minute(s)" message

#### 4.2 Lockout persists across restarts

- [x] While locked out, restart the dev server
- [x] Try to login again with the same email
- [x] **Expected:** Still locked (DB-backed)

#### 4.3 Lockout clears on success

- [x] Wait for the lockout period to pass (or manually clear `rate_limit_attempts` rows with `login-fail:` prefix)
- [x] Login with correct password
- [x] **Expected:** Login succeeds
- [x] Verify in DB: `SELECT COUNT(*) FROM rate_limit_attempts WHERE identifier LIKE 'login-fail:%';`
- [x] **Expected:** Rows for that email are deleted

#### 4.4 Tier escalation (if testable)

- [x] (Optional) To test tier 2: accumulate 10 failures within 24h
- [x] **Expected:** Lockout message mentions ~60 minute(s)
- [x] (Optional) To test tier 3: accumulate 20 failures within 24h
- [x] **Expected:** Lockout message mentions ~1440 minute(s) (24h)

---

### Fix 5: CSRF Verification (Audit)

#### 5.1 CSRF cookie exists

- [x] Go to `/login` (do not log in yet)
- [x] Open browser DevTools > Application > Cookies
- [x] **Expected:** `authjs.csrf-token` cookie exists (dev) or `__Host-authjs.csrf-token` (prod/HTTPS)

#### 5.2 CSRF token sent on login

- [x] Open DevTools > Network tab
- [x] Submit the login form
- [x] Click the `POST` request to `/api/auth/callback/credentials`
- [x] **Expected:** Request body includes `csrfToken` field

#### 5.3 Security headers

- [x] Open DevTools > Network tab
- [x] Load any page and inspect response headers
- [x] **Expected:** Headers include:
  - [x] `Strict-Transport-Security` (HSTS)
  - [x] `X-Frame-Options: DENY` or `SAMEORIGIN`
  - [x] `X-Content-Type-Options: nosniff`
  - [x] `Content-Security-Policy` (with `script-src`, `style-src`)

---

### Public Path Access

- [x] In an incognito/private window (no session), navigate to:
  - [x] `/login` — **Expected:** Page loads (no redirect)
  - [x] `/register` — **Expected:** Page loads (no redirect)
  - [x] `/forgot-password` — **Expected:** Page loads (no redirect)
  - [x] `/verify-email` — **Expected:** Page loads (no redirect)
- [x] Navigate to a protected route like `/journal`
  - [x] **Expected:** Redirected to `/login` with `callbackUrl` param

---

## Sentry Error Tracking Integration

### Pre-requisites

- [x] Create a Sentry project at sentry.io (org: `bravo-fn`, project: `javascript-nextjs`)
- [x] Add `NEXT_PUBLIC_SENTRY_DSN` to `.env` (get from Sentry > Settings > Projects > Client Keys)
- [x] Add `SENTRY_ORG=bravo-fn` to `.env`
- [x] Add `SENTRY_PROJECT=javascript-nextjs` to `.env`
- [x] Create an Organization Token in Sentry (Settings > Developer Settings > Organization Tokens) with scopes: `project:releases`, `org:read`
- [x] Add `SENTRY_AUTH_TOKEN` to Vercel environment variables (not `.env` — build-time only)
- [x] Temporarily change `enabled: process.env.NODE_ENV === "production"` to `enabled: true` in both `sentry.server.config.ts` and `sentry.client.config.ts` (revert after testing)
- [x] Start dev server: `pnpm dev`

---

### 1. Server-Side Error Reporting (via toSafeErrorMessage)

#### 1.1 Server action errors reach Sentry

- [x] Log in and trigger a server-side error (e.g., create a trade with invalid data that bypasses client validation, or temporarily throw in a server action)
- [x] **Expected:** Error appears in Sentry Issues dashboard within ~30 seconds
- [x] **Expected:** Issue has tag `error.category: unknown` (default when no category is passed)
- [x] **Expected:** Issue has `error.context` tag matching the context string from the call site (e.g., `trades.create`)

#### 1.2 Validation errors are NOT sent to Sentry

- [x] Submit a form with invalid data (e.g., empty required field)
- [x] **Expected:** Validation error shown to user in the UI
- [x] **Expected:** NO new issue appears in Sentry (validation errors are filtered to save quota)

---

### 2. Client-Side Error Boundary

#### 2.1 Page error boundary (`error.tsx`)

- [x] Temporarily add `throw new Error("Test error boundary")` inside a client component's render
- [x] Navigate to that page
- [x] **Expected:** Error boundary UI appears with "Something went wrong!" message and error digest
- [x] **Expected:** Error appears in Sentry Issues with stack trace
- [x] Remove the temporary throw

#### 2.2 Root layout error boundary (`global-error.tsx`)

- [x] This is hard to trigger manually (requires root layout crash). Visual inspection only:
  - [x] Open `src/app/global-error.tsx` and verify it uses inline styles (not Tailwind)
  - [x] Verify colors match the dark theme: bg `rgb(11 14 17)`, card `rgb(21 25 33)`, button `rgb(204 162 72)`
  - [x] Verify it calls `Sentry.captureException(error)` in `useEffect`

---

### 3. Tunnel Route (Ad-Blocker Bypass)

> **Note:** The tunnel route only works in production builds. In dev mode, Sentry sends directly to `ingest.us.sentry.io`. Test this after deploying to Vercel.

#### 3.1 Sentry traffic goes through `/monitoring` (Vercel deploy only)

- [x] Deploy to Vercel
- [x] Open DevTools > Network tab on the deployed app
- [x] Trigger an error (or just navigate with tracing enabled)
- [x] **Expected:** Sentry requests go to `your-domain/monitoring` (not `ingest.us.sentry.io`)
- [x] **Expected:** No requests blocked by ad-blockers (if using one)

---

### 4. Error Filtering (Quota Protection)

#### 4.1 Navigation errors are dropped

- [x] Use the app normally (navigate between pages, use redirects)
- [x] **Expected:** No `NEXT_REDIRECT` or `NEXT_NOT_FOUND` issues appear in Sentry

#### 4.2 Network flakes are dropped

- [x] Open DevTools > Network tab, enable throttling to "Offline"
- [x] Click around to trigger failed fetches
- [x] Go back online
- [x] **Expected:** No "Failed to fetch" / "NetworkError" / "Load failed" issues in Sentry

---

### 5. Session Replay (Error-Only)

#### 5.1 Replay captured on error

- [x] Trigger a client-side error (e.g., the test from 2.1)
- [x] Go to Sentry > Replays
- [x] **Expected:** A replay exists showing the user session leading up to the error
- [x] **Expected:** All text is masked (PII protection — `maskAllText: true`)
- [x] **Expected:** No media is captured (`blockAllMedia: true`)

#### 5.2 No replay on normal sessions

- [x] Navigate the app without triggering errors
- [x] **Expected:** No new replays appear (sample rate is 0% for normal sessions, 100% on error)

---

### 6. Source Maps (Vercel Deploy Only)

#### 6.1 Readable stack traces in production

- [ ] Deploy to Vercel (ensure `SENTRY_AUTH_TOKEN` is set in Vercel env vars)
- [ ] **Expected:** Build logs show source map upload (unless `silent: true` suppresses it — check Sentry Releases instead)
- [ ] Trigger an error in the deployed app
- [ ] **Expected:** Stack trace in Sentry shows original TypeScript file paths and line numbers (not minified `.next` bundles)

#### 6.2 Source maps not publicly accessible

- [ ] In the deployed app, try to access a `.map` file directly (e.g., `your-domain/_next/static/chunks/main-abc123.js.map`)
- [ ] **Expected:** 404 (source maps are deleted after upload)

---

### 7. Environment Separation

#### 7.1 Environment tag is set

- [ ] Check any Sentry issue created during testing
- [ ] **Expected:** Issue has `environment: development` tag (since you're testing locally)
- [ ] After deploying to Vercel, trigger an error
- [ ] **Expected:** Issue has `environment: production` tag
- [ ] **Expected:** Sentry dashboard allows filtering by environment

---

### 8. Cleanup After Testing

- [x] Revert `enabled: true` back to `enabled: process.env.NODE_ENV === "production"` in `sentry.server.config.ts`
- [x] Revert `enabled: true` back to `enabled: process.env.NODE_ENV === "production"` in `sentry.client.config.ts`
- [x] Remove any temporary `throw` statements added during testing
- [x] Run `pnpm build` to confirm everything compiles
- [x] Run `pnpm vitest run` to confirm all tests pass (354 tests including 91 Sentry tests)

---

## Automated Test Commands

```bash
# Unit tests (354 tests — includes 91 Sentry integration tests)
pnpm vitest run

# E2E tests (34 tests) — requires dev server running
pnpm playwright test auth-security

# Type check
npx tsc --noEmit
```
