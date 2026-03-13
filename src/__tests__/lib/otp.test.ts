/**
 * Unit tests for src/lib/otp.ts.
 *
 * The OTP utilities are pure, side-effect-free functions — no mocking required.
 *
 * Test coverage:
 *   generateOTP():
 *     - Produces a 6-character string
 *     - Contains only digit characters
 *     - Does not include leading zeros (range is 100000–999999)
 *     - Produces varied output across multiple calls (statistical uniqueness)
 *
 *   hashOTP():
 *     - Returns a 64-character lowercase hex string (SHA-256)
 *     - Is deterministic: same input → same output
 *     - Produces different hashes for different inputs
 *     - Is not reversible (the input is not recoverable from the hash)
 *
 *   OTP_EXPIRY_MINUTES:
 *     - Exported constant is a reasonable positive integer
 */

import { describe, it, expect } from "vitest"
import { generateOTP, hashOTP, OTP_EXPIRY_MINUTES } from "@/lib/otp"

// ---------------------------------------------------------------------------
// generateOTP
// ---------------------------------------------------------------------------

describe("generateOTP()", () => {
	it("should return a string of exactly 6 characters", () => {
		const otp = generateOTP()
		expect(otp).toHaveLength(6)
	})

	it("should contain only digit characters", () => {
		const otp = generateOTP()
		expect(/^\d{6}$/.test(otp)).toBe(true)
	})

	it("should never produce a value below 100000 (no leading zeros)", () => {
		// The implementation uses randomInt(100000, 1000000) so the
		// resulting string should always be >= 100000 and have no leading zeros.
		// Run 200 samples to cover the lower-bound edge with confidence.
		for (let index = 0; index < 200; index++) {
			const otp = generateOTP()
			expect(parseInt(otp, 10)).toBeGreaterThanOrEqual(100_000)
		}
	})

	it("should never produce a value above 999999 (fits in 6 digits)", () => {
		for (let index = 0; index < 200; index++) {
			const otp = generateOTP()
			expect(parseInt(otp, 10)).toBeLessThanOrEqual(999_999)
		}
	})

	it("should produce varied output across multiple calls", () => {
		// Generate 50 OTPs and verify they are not all identical (randomness check)
		const otps = new Set(Array.from({ length: 50 }, () => generateOTP()))
		// 50 random 6-digit numbers: the chance of all 50 being identical is astronomically small
		expect(otps.size).toBeGreaterThan(1)
	})
})

// ---------------------------------------------------------------------------
// hashOTP
// ---------------------------------------------------------------------------

describe("hashOTP()", () => {
	it("should return a 64-character string (SHA-256 hex digest)", () => {
		const hash = hashOTP("123456")
		expect(hash).toHaveLength(64)
	})

	it("should contain only lowercase hexadecimal characters", () => {
		const hash = hashOTP("123456")
		expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true)
	})

	it("should be deterministic — same input always produces the same hash", () => {
		const code = "987654"
		const hash1 = hashOTP(code)
		const hash2 = hashOTP(code)
		expect(hash1).toBe(hash2)
	})

	it("should produce a different hash for different inputs", () => {
		const hash1 = hashOTP("111111")
		const hash2 = hashOTP("111112")
		expect(hash1).not.toBe(hash2)
	})

	it("should produce a known SHA-256 digest for the input '000000'", () => {
		// SHA-256("000000") — verified via Node.js crypto module.
		// This pins the hashing algorithm to SHA-256 with no transform.
		const expected = "91b4d142823f7d20c5f08df69122de43f35f057a988d9619f6d3138485c9a203"
		expect(hashOTP("000000")).toBe(expected)
	})

	it("should not expose the original code in the output", () => {
		const code = "123456"
		const hash = hashOTP(code)
		expect(hash).not.toContain(code)
	})
})

// ---------------------------------------------------------------------------
// OTP_EXPIRY_MINUTES
// ---------------------------------------------------------------------------

describe("OTP_EXPIRY_MINUTES", () => {
	it("should be a positive integer", () => {
		expect(typeof OTP_EXPIRY_MINUTES).toBe("number")
		expect(Number.isInteger(OTP_EXPIRY_MINUTES)).toBe(true)
		expect(OTP_EXPIRY_MINUTES).toBeGreaterThan(0)
	})

	it("should be at least 5 minutes (usability floor)", () => {
		expect(OTP_EXPIRY_MINUTES).toBeGreaterThanOrEqual(5)
	})

	it("should be at most 60 minutes (security ceiling)", () => {
		expect(OTP_EXPIRY_MINUTES).toBeLessThanOrEqual(60)
	})
})
