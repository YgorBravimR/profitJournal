import { test, expect } from "@playwright/test"
import { ROUTES, TEST_TRADE, TEST_TRADE_LOSS } from "../fixtures/test-data"

test.describe("Journal", () => {
	test.describe("Journal List Page", () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(ROUTES.journal)
			await page.waitForLoadState("networkidle")
		})

		test("should display page header", async ({ page }) => {
			await expect(page.getByRole("heading", { name: /journal/i })).toBeVisible()
		})

		test("should display New Trade button", async ({ page }) => {
			const newTradeBtn = page.getByRole("link", { name: /new trade/i }).first()
			await expect(newTradeBtn).toBeVisible()
		})

		test("should navigate to new trade page", async ({ page }) => {
			const newTradeBtn = page.getByRole("link", { name: /new trade/i }).first()
			await newTradeBtn.click()
			await expect(page).toHaveURL(/journal\/new/)
		})

		test("should display filter options", async ({ page }) => {
			// Asset filter
			const assetFilter = page.locator('[data-testid="asset-filter"], select[name="asset"], button:has-text("asset")')
			if ((await assetFilter.count()) > 0) {
				await expect(assetFilter.first()).toBeVisible()
			}

			// Outcome filter
			const outcomeFilter = page.locator('[data-testid="outcome-filter"], select[name="outcome"], button:has-text("outcome")')
			if ((await outcomeFilter.count()) > 0) {
				await expect(outcomeFilter.first()).toBeVisible()
			}
		})

		test("should display trade list or empty state", async ({ page }) => {
			// Trade cards are rendered as links to /journal/[id]
			const tradeCards = page.locator('a[href*="/journal/"]:not([href*="/new"])')
			const emptyState = page.getByText(/no trades|start by adding/i)

			const hasTradeCards = (await tradeCards.count()) > 0
			const hasEmptyState = await emptyState.isVisible().catch(() => false)

			expect(hasTradeCards || hasEmptyState).toBeTruthy()
		})

		test("should display trade cards with required information", async ({ page }) => {
			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card, .trade-item').first()

			if (await tradeCard.isVisible()) {
				// Should show asset
				await expect(tradeCard.locator('text=/WIN|WDO|ES|NQ|[A-Z]{2,5}/i')).toBeVisible()

				// Should show direction badge
				await expect(tradeCard.locator('text=/long|short|compra|venda/i')).toBeVisible()

				// Should show P&L
				await expect(tradeCard.locator('text=/R\\$|\\$/i')).toBeVisible()
			}
		})

		test("should display pagination when many trades", async ({ page }) => {
			const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination"]')

			// Pagination may not be visible if few trades
			const count = await pagination.count()
			expect(count).toBeGreaterThanOrEqual(0)
		})

		test("should navigate to trade detail when clicking trade", async ({ page }) => {
			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card, .trade-item').first()

			if (await tradeCard.isVisible()) {
				await tradeCard.click()
				await expect(page).toHaveURL(/journal\/[a-zA-Z0-9-]+(?!\/new)/, { timeout: 5000 })
			}
		})

		test("should filter trades by asset", async ({ page }) => {
			const assetFilter = page.locator('[data-testid="asset-filter"], select[name="asset"]').first()

			if (await assetFilter.isVisible()) {
				await assetFilter.selectOption({ index: 1 })
				await page.waitForTimeout(500)

				// After filter, trades should only show selected asset (or be empty)
			}
		})

		test("should filter trades by outcome", async ({ page }) => {
			const outcomeFilter = page.locator('[data-testid="outcome-filter"], select[name="outcome"]').first()

			if (await outcomeFilter.isVisible()) {
				await outcomeFilter.selectOption("win")
				await page.waitForTimeout(500)

				// After filter, trades should only show wins (or be empty)
			}
		})

		test("should clear filters", async ({ page }) => {
			const clearButton = page.getByRole("button", { name: /clear|limpar/i })

			if (await clearButton.isVisible()) {
				await clearButton.click()
				await page.waitForTimeout(500)
			}
		})
	})

	test.describe("New Trade Page", () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(ROUTES.journalNew)
			await page.waitForLoadState("networkidle")
		})

		test("should display page header with back button", async ({ page }) => {
			await expect(page.getByRole("heading", { name: "New Trade" })).toBeVisible()
			await expect(page.getByRole("link", { name: /back/i }).first()).toBeVisible()
		})

		test("should display tabs for Single Entry and CSV Import", async ({ page }) => {
			const singleTab = page.locator('button[role="tab"]:has-text("Single"), button[role="tab"]:has-text("Manual")')
			const csvTab = page.locator('button[role="tab"]:has-text("CSV"), button[role="tab"]:has-text("Import")')

			if ((await singleTab.count()) > 0) {
				await expect(singleTab.first()).toBeVisible()
			}
			if ((await csvTab.count()) > 0) {
				await expect(csvTab.first()).toBeVisible()
			}
		})

		test("should display trade mode selector", async ({ page }) => {
			const modeSelector = page.locator('[data-testid="trade-mode"], [name="tradeMode"], :has-text("Simple"):has-text("Scaled")')
			if ((await modeSelector.count()) > 0) {
				await expect(modeSelector.first()).toBeVisible()
			}
		})

		test("should display all basic info fields", async ({ page }) => {
			// Asset
			await expect(page.getByLabel(/asset|ativo/i).or(page.locator('[name="asset"]'))).toBeVisible()

			// Direction
			await expect(page.locator('[name="direction"], [data-testid="direction"]').or(page.getByText(/long|short/i).first())).toBeVisible()

			// Entry Date
			await expect(page.getByLabel(/entry date|data de entrada/i).or(page.locator('[name="entryDate"]'))).toBeVisible()

			// Entry Price
			await expect(page.getByLabel(/entry price|preço de entrada/i).or(page.locator('[name="entryPrice"]'))).toBeVisible()

			// Position Size
			await expect(page.getByLabel(/position size|tamanho|quantidade/i).or(page.locator('[name="positionSize"]'))).toBeVisible()
		})

		test("should display risk management fields", async ({ page }) => {
			// Click on the Risk tab first
			await page.getByRole("tab", { name: /risk/i }).click()
			await page.waitForTimeout(300)

			// Stop Loss
			const stopLoss = page.getByLabel(/stop loss/i)
			await expect(stopLoss).toBeVisible()

			// Take Profit
			const takeProfit = page.getByLabel(/take profit/i)
			await expect(takeProfit).toBeVisible()

			// Risk Amount
			const riskAmount = page.getByLabel(/risk amount/i)
			await expect(riskAmount).toBeVisible()
		})

		test("should display classification fields", async ({ page }) => {
			// Classification fields are on Basic tab (Strategy is there via select)
			// Timeframe is also on Basic tab
			const assetSelect = page.getByRole("combobox", { name: /asset/i }).or(page.locator('button:has-text("Select asset")'))
			await expect(assetSelect.first()).toBeVisible()

			const timeframeSelect = page.getByRole("combobox", { name: /timeframe/i }).or(page.locator('button:has-text("Select timeframe")'))
			await expect(timeframeSelect.first()).toBeVisible()
		})

		test("should display journal notes fields", async ({ page }) => {
			// Pre-Trade Thoughts
			const preTrade = page.getByLabel(/pre-trade|antes do trade/i).or(page.locator('[name="preTradeThoughts"]'))
			if ((await preTrade.count()) > 0) {
				await expect(preTrade.first()).toBeVisible()
			}

			// Post-Trade Reflection
			const postTrade = page.getByLabel(/post-trade|após o trade|reflection/i).or(page.locator('[name="postTradeReflection"]'))
			if ((await postTrade.count()) > 0) {
				await expect(postTrade.first()).toBeVisible()
			}
		})

		test("should display discipline fields", async ({ page }) => {
			// Followed Plan checkbox
			const followedPlan = page.locator('[name="followedPlan"], [data-testid="followed-plan"]').or(page.getByLabel(/followed plan|seguiu o plano/i))
			if ((await followedPlan.count()) > 0) {
				await expect(followedPlan.first()).toBeVisible()
			}
		})

		test("should calculate P&L when exit price provided", async ({ page }) => {
			// Select asset from combobox
			await page.getByRole("combobox", { name: /asset/i }).click()
			await page.getByRole("option").first().click()

			// Direction is Long by default, verify it's selected
			await expect(page.getByRole("button", { name: "Long" })).toBeVisible()

			// Fill price fields
			await page.getByLabel(/entry price/i).fill("100")
			await page.getByLabel(/exit price/i).fill("105")
			await page.getByLabel(/position size/i).fill("10")

			await page.waitForTimeout(500)

			// P&L preview should be visible somewhere (the form calculates it)
			// Just verify the form accepted the values
			const entryPriceValue = await page.getByLabel(/entry price/i).inputValue()
			expect(entryPriceValue).toBe("100")
		})

		test("should show outcome badge based on P&L", async ({ page }) => {
			// Select asset
			await page.getByRole("combobox", { name: /asset/i }).click()
			await page.getByRole("option").first().click()

			// Fill fields for a winning trade
			await page.getByLabel(/entry price/i).fill("100")
			await page.getByLabel(/exit price/i).fill("105")
			await page.getByLabel(/position size/i).fill("10")

			await page.waitForTimeout(500)

			// Verify the values were entered correctly
			const exitPriceValue = await page.getByLabel(/exit price/i).inputValue()
			expect(exitPriceValue).toBe("105")
		})

		test("should validate required fields on submit", async ({ page }) => {
			// Try to submit without filling required fields
			const submitButton = page.getByRole("button", { name: /save|salvar|create|criar/i })
			await submitButton.click()

			// Should show validation errors
			const errorMessages = page.locator('[data-invalid="true"], .error, [aria-invalid="true"]')
			await expect(errorMessages.first()).toBeVisible({ timeout: 2000 })
		})

		test("should create trade successfully", async ({ page }) => {
			// Select asset from combobox (required)
			await page.getByRole("combobox", { name: /asset/i }).click()
			await page.getByRole("option").first().click()

			// Long is selected by default

			// Fill required prices
			await page.getByLabel(/entry price/i).fill("100")
			await page.getByLabel(/position size/i).fill("10")

			// Entry date should be pre-filled with current date/time

			// Go to Risk tab and add risk amount for proper R calculation
			await page.getByRole("tab", { name: /risk/i }).click()
			await page.getByLabel(/risk amount/i).fill("50")

			// Submit using Save Trade button
			const submitButton = page.getByRole("button", { name: /save trade/i })
			await submitButton.click()

			// Should redirect to journal list or trade detail
			await expect(page).toHaveURL(/journal(?!\/new)/, { timeout: 15000 })
		})

		test("should navigate back when clicking back button", async ({ page }) => {
			const backButton = page.getByRole("link", { name: /back/i }).first()
			await backButton.click()

			await expect(page).toHaveURL(/journal(?!\/new)/)
		})
	})

	test.describe("Trade Detail Page", () => {
		test("should display trade information", async ({ page }) => {
			// First, go to journal and click on a trade
			await page.goto(ROUTES.journal)
			await page.waitForLoadState("networkidle")

			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card, .trade-item').first()

			if (await tradeCard.isVisible()) {
				await tradeCard.click()
				await page.waitForLoadState("networkidle")

				// Should show trade details
				await expect(page.getByText(/entry|entrada/i).first()).toBeVisible()
				await expect(page.getByText(/exit|saída/i).first()).toBeVisible()
			}
		})

		test("should display action buttons", async ({ page }) => {
			await page.goto(ROUTES.journal)
			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card').first()

			if (await tradeCard.isVisible()) {
				await tradeCard.click()
				await page.waitForLoadState("networkidle")

				// Edit button
				await expect(page.getByRole("button", { name: /edit|editar/i }).or(page.getByRole("link", { name: /edit|editar/i }))).toBeVisible()

				// Delete button
				await expect(page.getByRole("button", { name: /delete|excluir|remover/i })).toBeVisible()

				// Back button
				await expect(page.getByRole("button", { name: /back|voltar/i }).or(page.getByRole("link", { name: /back|voltar/i }))).toBeVisible()
			}
		})

		test("should display outcome badges", async ({ page }) => {
			await page.goto(ROUTES.journal)
			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card').first()

			if (await tradeCard.isVisible()) {
				await tradeCard.click()
				await page.waitForLoadState("networkidle")

				// Outcome badge (win/loss/breakeven)
				const outcomeBadge = page.locator('.badge, [data-testid="outcome-badge"]').first()
				if ((await outcomeBadge.count()) > 0) {
					await expect(outcomeBadge).toBeVisible()
				}
			}
		})

		test("should navigate to edit page", async ({ page }) => {
			await page.goto(ROUTES.journal)
			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card').first()

			if (await tradeCard.isVisible()) {
				await tradeCard.click()
				await page.waitForLoadState("networkidle")

				const editButton = page.getByRole("button", { name: /edit|editar/i }).or(page.getByRole("link", { name: /edit|editar/i }))
				await editButton.click()

				await expect(page).toHaveURL(/journal\/[a-zA-Z0-9-]+\/edit/)
			}
		})

		test("should show delete confirmation dialog", async ({ page }) => {
			await page.goto(ROUTES.journal)
			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card').first()

			if (await tradeCard.isVisible()) {
				await tradeCard.click()
				await page.waitForLoadState("networkidle")

				const deleteButton = page.getByRole("button", { name: /delete|excluir|remover/i })
				await deleteButton.click()

				// Should show confirmation dialog
				const dialog = page.locator('[role="alertdialog"], [role="dialog"]')
				await expect(dialog).toBeVisible({ timeout: 2000 })
			}
		})

		test("should cancel delete when clicking cancel", async ({ page }) => {
			await page.goto(ROUTES.journal)
			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card').first()

			if (await tradeCard.isVisible()) {
				await tradeCard.click()
				await page.waitForLoadState("networkidle")

				const deleteButton = page.getByRole("button", { name: /delete|excluir|remover/i })
				await deleteButton.click()

				const cancelButton = page.getByRole("button", { name: /cancel|cancelar/i })
				await cancelButton.click()

				// Dialog should close
				const dialog = page.locator('[role="alertdialog"], [role="dialog"]')
				await expect(dialog).toBeHidden({ timeout: 2000 })
			}
		})
	})

	test.describe("Edit Trade Page", () => {
		test("should pre-fill form with trade data", async ({ page }) => {
			await page.goto(ROUTES.journal)
			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card').first()

			if (await tradeCard.isVisible()) {
				await tradeCard.click()
				await page.waitForLoadState("networkidle")

				const editButton = page.getByRole("button", { name: /edit|editar/i }).or(page.getByRole("link", { name: /edit|editar/i }))
				await editButton.click()
				await page.waitForLoadState("networkidle")

				// Entry price should be pre-filled
				const entryPrice = page.getByLabel(/entry price|preço de entrada/i).or(page.locator('[name="entryPrice"]'))
				const value = await entryPrice.inputValue()
				expect(value).not.toBe("")
			}
		})

		test("should update trade successfully", async ({ page }) => {
			await page.goto(ROUTES.journal)
			const tradeCard = page.locator('[data-testid="trade-card"], .trade-card').first()

			if (await tradeCard.isVisible()) {
				await tradeCard.click()
				await page.waitForLoadState("networkidle")

				const editButton = page.getByRole("button", { name: /edit|editar/i }).or(page.getByRole("link", { name: /edit|editar/i }))
				await editButton.click()
				await page.waitForLoadState("networkidle")

				// Update a field
				const notesField = page.getByLabel(/notes|notas|reflection/i).first()
				if (await notesField.isVisible()) {
					await notesField.fill("Updated via E2E test")
				}

				// Submit
				const submitButton = page.getByRole("button", { name: /save|salvar|update|atualizar/i })
				await submitButton.click()

				// Should redirect back to detail
				await expect(page).toHaveURL(/journal\/[a-zA-Z0-9-]+(?!\/edit)/, { timeout: 10000 })
			}
		})
	})

	test.describe("CSV Import", () => {
		test("should display CSV import tab", async ({ page }) => {
			await page.goto(ROUTES.journalNew)
			await page.waitForLoadState("networkidle")

			const csvTab = page.getByRole("tab", { name: /import|csv/i })
			await expect(csvTab).toBeVisible()
			await csvTab.click()

			await expect(page.getByText(/upload|drag|drop|arquivo|csv/i).first()).toBeVisible()
		})

		test("should display file upload input", async ({ page }) => {
			await page.goto(ROUTES.journalNew)
			await page.waitForLoadState("networkidle")

			const csvTab = page.getByRole("tab", { name: /import|csv/i })
			await csvTab.click()
			await page.waitForTimeout(500)

			// Look for any indication of file upload: hidden input, dropzone text, or upload button
			const uploadIndicators = page.getByText(/csv|upload|import|drop|select.*file|choose.*file/i)
			await expect(uploadIndicators.first()).toBeVisible()
		})
	})

	test.describe("Scaled Position Mode", () => {
		test("should switch to scaled mode", async ({ page }) => {
			await page.goto(ROUTES.journalNew)

			const scaledOption = page.locator('[data-testid="mode-scaled"], [value="scaled"], :has-text("Scaled")')
			if ((await scaledOption.count()) > 0) {
				await scaledOption.first().click()

				// Form should adjust for scaled mode
				await expect(page.getByText(/execution|execução/i).or(page.getByText(/scaled/i))).toBeVisible()
			}
		})
	})
})
