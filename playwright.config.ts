import { defineConfig, devices } from "@playwright/test"

/**
 * Ordered test execution via project dependencies.
 *
 * Data flow: settings (assets/timeframes) → playbook (strategies) → journal (trades)
 * → dashboard/analytics/reports/etc. (read trade data)
 *
 * Phase 1 — Foundation:  auth → navigation (no data needed)
 * Phase 2 — Data setup:  settings → playbook → journal (sequential, each creates data)
 * Phase 3 — Validation:  all data-dependent pages (parallel, just read data)
 */

const authState = { storageState: "e2e/.auth/user.json" }

/** Sequential test phases — order matters for data dependencies */
const orderedPhases = [
	{ name: "auth", testMatch: /auth\.spec\.ts/ },
	{ name: "navigation", testMatch: /navigation\.spec\.ts/ },
	{ name: "settings", testMatch: /settings\.spec\.ts/ },
	{ name: "playbook", testMatch: /playbook\.spec\.ts/ },
	{ name: "journal", testMatch: /journal\.spec\.ts/ },
]

/** Data-dependent tests — run in parallel after journal completes */
const dataPhases = [
	{ name: "dashboard", testMatch: /dashboard\.spec\.ts/ },
	{ name: "analytics", testMatch: /analytics\.spec\.ts/ },
	{ name: "reports", testMatch: /reports\.spec\.ts/ },
	{ name: "monthly", testMatch: /monthly\.spec\.ts/ },
	{ name: "command-center", testMatch: /command-center\.spec\.ts/ },
	{ name: "monthly-plan", testMatch: /monthly-plan\.spec\.ts/ },
	{ name: "monte-carlo", testMatch: /monte-carlo\.spec\.ts/ },
	{ name: "market-monitor", testMatch: /market-monitor\.spec\.ts/ },
]

interface DeviceConfig {
	[key: string]: unknown
}

const buildDeviceProjects = (device: string, deviceUse: DeviceConfig) => {
	const use = { ...deviceUse, ...authState }
	const prefix = (name: string) => `${device}-${name}`

	// Sequential chain: setup → auth → navigation → settings → playbook → journal
	const sequential = orderedPhases.map((phase, index) => ({
		name: prefix(phase.name),
		testMatch: phase.testMatch,
		use,
		dependencies: index === 0 ? ["setup"] : [prefix(orderedPhases[index - 1].name)],
	}))

	// Parallel fan-out: all depend on journal completing
	const lastOrdered = prefix(orderedPhases[orderedPhases.length - 1].name)
	const parallel = dataPhases.map((phase) => ({
		name: prefix(phase.name),
		testMatch: phase.testMatch,
		use,
		dependencies: [lastOrdered],
	}))

	return [...sequential, ...parallel]
}

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["html", { open: "never" }], ["list"]],
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "on-first-retry",
	},
	projects: [
		{
			name: "setup",
			testMatch: /global\.setup\.ts/,
		},
		...buildDeviceProjects("chromium", devices["Desktop Chrome"]),
		...buildDeviceProjects("mobile", devices["iPhone 14"]),
	],
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
})
