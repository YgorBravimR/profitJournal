"use client"

import { useEffect, useRef } from "react"
import { useBrand } from "@/components/providers/brand-provider"
import { getAccountBrand } from "@/app/actions/settings"

/**
 * Synchronizes the current account's brand preference (from DB) with the BrandProvider.
 * Runs once on mount in authenticated layouts to apply the account's saved brand.
 */
export const BrandSynchronizer = () => {
	const { setBrand } = useBrand()
	const hasSynced = useRef(false)

	useEffect(() => {
		if (hasSynced.current) return
		hasSynced.current = true

		const syncBrand = async () => {
			const result = await getAccountBrand()
			if (result.status === "success" && result.data) {
				setBrand(result.data as Parameters<typeof setBrand>[0])
			}
		}

		syncBrand()
	}, [setBrand])

	return null
}
