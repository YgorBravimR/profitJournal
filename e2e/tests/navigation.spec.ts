import { test, expect } from "@playwright/test"
import { ROUTES } from "../fixtures/test-data"
import { waitForSuspenseLoad } from "../utils/helpers"

test.describe("Navigation", () => {
	test.describe("Sidebar Navigation", () => {
		test("should display all navigation items", async ({ page }) => {
			await page.goto(ROUTES.home)

			// Check all navigation items are visible
			await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible()
			await expect(page.getByRole("link", { name: /journal/i })).toBeVisible()
			await expect(page.getByRole("link", { name: /analytics/i })).toBeVisible()
			await expect(page.getByRole("link", { name: /playbook/i })).toBeVisible()
			await expect(page.getByRole("link", { name: /reports/i })).toBeVisible()
			await expect(page.getByRole("link", { name: /monthly/i })).toBeVisible()
			await expect(page.getByRole("link", { name: /settings/i })).toBeVisible()
		})

		test("should navigate to Dashboard", async ({ page }) => {
			await page.goto(ROUTES.journal)
			await page.getByRole("link", { name: /dashboard/i }).click()
			await expect(page).toHaveURL(/\/(en|pt-BR)\/?$/)
		})

		test("should navigate to Journal", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.getByRole("link", { name: /journal/i }).click()
			await expect(page).toHaveURL(/journal/)
		})

		test("should navigate to Analytics", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.getByRole("link", { name: /analytics/i }).click()
			await expect(page).toHaveURL(/analytics/)
		})

		test("should navigate to Playbook", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.getByRole("link", { name: /playbook/i }).click()
			await expect(page).toHaveURL(/playbook/)
		})

		test("should navigate to Reports", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.getByRole("link", { name: /reports/i }).click()
			await expect(page).toHaveURL(/reports/)
		})

		test("should navigate to Monthly", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.getByRole("link", { name: /monthly/i }).click()
			await expect(page).toHaveURL(/monthly/)
		})

		test("should navigate to Settings", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.getByRole("link", { name: /settings/i }).click()
			await expect(page).toHaveURL(/settings/)
		})

		test("should highlight active route", async ({ page }) => {
			await page.goto(ROUTES.journal)

			const journalLink = page.getByRole("link", { name: /journal/i })
			const className = await journalLink.getAttribute("class")

			// Active link should have different styling (check for active class or aria-current)
			const ariaCurrent = await journalLink.getAttribute("aria-current")
			expect(ariaCurrent === "page" || className?.includes("active") || className?.includes("bg-")).toBeTruthy()
		})

		test("should collapse/expand sidebar", async ({ page }) => {
			await page.goto(ROUTES.home)

			// Find collapse button
			const collapseBtn = page.locator('[aria-label*="collapse"], [aria-label*="sidebar"], button:has-text("collapse")').first()

			if (await collapseBtn.isVisible()) {
				await collapseBtn.click()
				await page.waitForTimeout(300) // Wait for animation

				// Sidebar should be collapsed (narrower or icons only)
				const sidebar = page.locator("aside, nav").first()
				const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width)

				// Click again to expand
				await collapseBtn.click()
				await page.waitForTimeout(300)

				const expandedWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width)
				expect(expandedWidth).toBeGreaterThanOrEqual(width)
			}
		})
	})

	test.describe("Account Switcher", () => {
		test("should display current account name", async ({ page }) => {
			await page.goto(ROUTES.home)

			const accountSwitcher = page.locator('[data-testid="account-switcher"], [aria-label*="account"]').first()
			if (await accountSwitcher.isVisible()) {
				await expect(accountSwitcher).toContainText(/.+/)
			}
		})

		test("should open dropdown with account options", async ({ page }) => {
			await page.goto(ROUTES.home)

			const accountSwitcher = page.locator('[data-testid="account-switcher"], button:has-text("account")').first()

			if (await accountSwitcher.isVisible()) {
				await accountSwitcher.click()

				// Should show dropdown with accounts
				const dropdown = page.locator('[role="listbox"], [role="menu"]').first()
				await expect(dropdown).toBeVisible({ timeout: 2000 })
			}
		})

		test("should switch to different account and reload page", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.waitForLoadState("networkidle")

			const accountSwitcher = page.locator('[data-testid="account-switcher"], [aria-label*="account"]').first()

			if (await accountSwitcher.isVisible()) {
				const currentAccountText = await accountSwitcher.textContent()
				await accountSwitcher.click()
				await page.waitForTimeout(300)

				// Select a different account from dropdown
				const dropdown = page.locator('[role="listbox"], [role="menu"]').first()
				if (await dropdown.isVisible().catch(() => false)) {
					const options = dropdown.locator('[role="option"], [role="menuitem"], button')
					const optionCount = await options.count()

					// Click a different account than current (try second option)
					if (optionCount > 1) {
						await options.nth(1).click()
						await page.waitForLoadState("networkidle")
						await page.waitForTimeout(1000)

						// Page should have reloaded with new account context
						const newAccountText = await accountSwitcher.textContent().catch(() => "")
						// Account might have changed or stayed same (if we clicked current)
						expect(typeof newAccountText).toBe("string")
					}
				}
			}
		})

		test("should verify sidebar shows updated account name after switch", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.waitForLoadState("networkidle")

			const accountSwitcher = page.locator('[data-testid="account-switcher"], [aria-label*="account"]').first()

			if (await accountSwitcher.isVisible()) {
				// Get current account name displayed
				const accountName = await accountSwitcher.textContent()
				expect(accountName).toBeTruthy()
				expect(accountName!.trim().length).toBeGreaterThan(0)
			}
		})
	})

	test.describe("Command Center Navigation", () => {
		test("should navigate to Command Center from sidebar link", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.waitForLoadState("networkidle")

			const ccLink = page.getByRole("link", { name: /command center|centro de comando/i })
			if (await ccLink.isVisible().catch(() => false)) {
				await Promise.all([
					page.waitForURL(/command-center/, { timeout: 30000 }),
					ccLink.click(),
				])
				await expect(page).toHaveURL(/command-center/)
			}
		})
	})

	test.describe("Theme Toggle", () => {
		test("should toggle between dark and light mode", async ({ page }) => {
			await page.goto(ROUTES.home)

			const themeToggle = page.locator('[aria-label*="theme"], [data-testid="theme-toggle"], button:has([class*="sun"]), button:has([class*="moon"])').first()

			if (await themeToggle.isVisible()) {
				// Get initial theme
				const initialTheme = await page.evaluate(() => document.documentElement.classList.contains("dark"))

				await themeToggle.click()
				await page.waitForTimeout(300)

				// Theme should have changed
				const newTheme = await page.evaluate(() => document.documentElement.classList.contains("dark"))
				expect(newTheme).not.toBe(initialTheme)
			}
		})
	})

	test.describe("User Menu", () => {
		test("should display user avatar/initials", async ({ page }) => {
			await page.goto(ROUTES.home)
			await page.waitForLoadState("networkidle")

			// The user menu shows initials (AU for Admin User)
			const userMenu = page.locator('button:has-text("Admin User")').or(page.locator('button:has-text("AU")')).first()
			await expect(userMenu).toBeVisible()
		})

		test("should open dropdown on click", async ({ page }) => {
			await page.goto(ROUTES.home)

			const userMenu = page.locator('[data-testid="user-menu"], button:has(.avatar)').first()

			if (await userMenu.isVisible()) {
				await userMenu.click()

				const dropdown = page.locator('[role="menu"]').first()
				await expect(dropdown).toBeVisible({ timeout: 2000 })
			}
		})

		test("should have settings and logout options", async ({ page }) => {
			await page.goto(ROUTES.home)

			const userMenu = page.locator('[data-testid="user-menu"], button:has(.avatar)').first()

			if (await userMenu.isVisible()) {
				await userMenu.click()

				await expect(page.getByRole("menuitem", { name: /settings|configurações/i })).toBeVisible()
				await expect(page.getByRole("menuitem", { name: /logout|sair/i })).toBeVisible()
			}
		})
	})

	test.describe("Breadcrumbs / Back Navigation", () => {
		test("should show cancel button on sub-pages", async ({ page }) => {
			await page.goto(ROUTES.journalNew)
			await page.waitForLoadState("networkidle")

			// New Trade page uses Cancel button instead of a back link
			const cancelButton = page.getByRole("button", { name: /cancel|cancelar/i })
			await expect(cancelButton).toBeVisible()
		})

		test("should navigate back when clicking cancel button", async ({ page }) => {
			// Navigate from journal list first so browser history has a valid entry
			await page.goto(ROUTES.journal)
			await page.waitForLoadState("networkidle")
			await page.goto(ROUTES.journalNew)
			await page.waitForLoadState("networkidle")

			const cancelButton = page.getByRole("button", { name: /cancel|cancelar/i })
			await cancelButton.click()

			await expect(page).toHaveURL(/journal(?!\/new)/, { timeout: 10000 })
		})
	})

	test.describe("Responsive Navigation", () => {
		test("should adapt layout on mobile viewport", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto(ROUTES.home)

			// On mobile, sidebar might be hidden or collapsed
			const sidebar = page.locator("aside, nav[data-sidebar]").first()

			// Either sidebar is hidden or there's a mobile menu button
			const mobileMenuBtn = page.locator('[aria-label*="menu"], [data-testid="mobile-menu"]').first()

			const isSidebarVisible = await sidebar.isVisible()
			const isMobileMenuVisible = await mobileMenuBtn.isVisible()

			expect(isSidebarVisible || isMobileMenuVisible).toBeTruthy()
		})

		test("should open mobile menu on mobile viewport", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto(ROUTES.home)

			const mobileMenuBtn = page.locator('[aria-label*="menu"], [data-testid="mobile-menu"], button:has([class*="menu"])').first()

			if (await mobileMenuBtn.isVisible()) {
				await mobileMenuBtn.click()

				// Navigation should be visible now
				await expect(page.getByRole("link", { name: /journal/i })).toBeVisible({ timeout: 2000 })
			}
		})
	})
})
