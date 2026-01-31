import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["html", { open: "never" }], ["list"]],
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "on-first-retry",
	},
	projects: [
		{
			name: "setup",
			testMatch: /global\.setup\.ts/,
		},
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				storageState: "e2e/.auth/user.json",
			},
			dependencies: ["setup"],
		},
		{
			name: "mobile",
			use: {
				...devices["iPhone 14"],
				storageState: "e2e/.auth/user.json",
			},
			dependencies: ["setup"],
		},
	],
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3001",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
})
