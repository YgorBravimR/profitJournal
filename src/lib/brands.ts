/**
 * Shared brand constants and type definitions.
 *
 * This file has NO "use client" directive — it's safe to import from both
 * server components and client components without leaking module boundaries.
 */

type Brand = "bravo" | "midnight" | "retro" | "luxury" | "tsr" | "neon" | "default"

const DEFAULT_BRAND: Brand = "bravo"

const BRANDS: readonly Brand[] = [
	"bravo",
	"midnight",
	"retro",
	"luxury",
	"tsr",
	"neon",
	"default",
] as const

/**
 * Validates if a string is a valid Brand value.
 *
 * @param value - The value to validate
 * @returns True if the value is a valid Brand
 */
const isValidBrand = (value: string | null): value is Brand => {
	return value !== null && BRANDS.includes(value as Brand)
}

export { BRANDS, DEFAULT_BRAND, isValidBrand }
export type { Brand }
