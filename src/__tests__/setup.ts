/**
 * Global Vitest setup — runs before each test file.
 *
 * Resets module-level mutable state (like the trade factory counter)
 * to prevent ID accumulation across tests within the same worker process.
 */

import { beforeEach } from "vitest"
import { resetTradeIdCounter } from "./lib/fixtures/trade-factory"

beforeEach(() => {
	resetTradeIdCounter()
})
