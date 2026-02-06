"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Brand = "bravo" | "retro" | "luxury" | "tsr" | "neon"

interface BrandContextType {
	brand: Brand
	setBrand: (brand: Brand) => void
	brands: readonly Brand[]
}

interface BrandProviderProps {
	children: React.ReactNode
	defaultBrand?: Brand
}

const STORAGE_KEY = "profit-journal-brand"
const DEFAULT_BRAND: Brand = "bravo"
const BRANDS: readonly Brand[] = ["bravo", "retro", "luxury", "tsr", "neon"] as const

const BrandContext = createContext<BrandContextType | undefined>(undefined)

/**
 * Validates if a string is a valid Brand value.
 *
 * @param value - The value to validate
 * @returns True if the value is a valid Brand
 */
const isValidBrand = (value: string | null): value is Brand => {
	return value !== null && BRANDS.includes(value as Brand)
}

/**
 * Provider component for brand theming context.
 * Manages brand selection state and persists it to localStorage.
 *
 * @param props - The provider props
 * @param props.children - Child components to wrap
 * @param props.defaultBrand - Default brand to use if none is stored
 */
const BrandProvider = ({ children, defaultBrand = DEFAULT_BRAND }: BrandProviderProps) => {
	const [brand, setBrandState] = useState<Brand>(defaultBrand)
	const [mounted, setMounted] = useState(false)

	// Initialize brand from localStorage on mount
	useEffect(() => {
		const storedBrand = localStorage.getItem(STORAGE_KEY)
		if (isValidBrand(storedBrand)) {
			setBrandState(storedBrand)
			document.documentElement.setAttribute("data-brand", storedBrand)
		} else {
			document.documentElement.setAttribute("data-brand", defaultBrand)
		}
		setMounted(true)
	}, [defaultBrand])

	const setBrand = useCallback((newBrand: Brand) => {
		setBrandState(newBrand)
		localStorage.setItem(STORAGE_KEY, newBrand)
		document.documentElement.setAttribute("data-brand", newBrand)
	}, [])

	// Prevent hydration mismatch by only rendering children after mount
	// The brand is applied via useEffect to avoid SSR/client mismatch
	const value: BrandContextType = {
		brand: mounted ? brand : defaultBrand,
		setBrand,
		brands: BRANDS,
	}

	return (
		<BrandContext.Provider value={value}>
			{children}
		</BrandContext.Provider>
	)
}

/**
 * Hook to access the brand context.
 * Must be used within a BrandProvider.
 *
 * @returns The brand context containing current brand and setter
 * @throws Error if used outside of BrandProvider
 */
const useBrand = (): BrandContextType => {
	const context = useContext(BrandContext)
	if (context === undefined) {
		throw new Error("useBrand must be used within a BrandProvider")
	}
	return context
}

export { BrandProvider, useBrand, BRANDS, DEFAULT_BRAND }
export type { Brand }
