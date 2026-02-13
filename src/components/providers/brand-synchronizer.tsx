"use client"

import { useEffect } from "react"
import { useBrand } from "@/components/providers/brand-provider"
import { getCurrentAccount } from "@/app/actions/auth"
import { getAccountTypeBrand } from "@/lib/account-brand"

/**
 * Synchronizes the brand theme based on the current account's type.
 * personal → "bravo", prop → "tsr", replay → "retro"
 * Re-runs whenever the component mounts (e.g. after account switch).
 */
export const BrandSynchronizer = () => {
	const { setBrand } = useBrand()

	useEffect(() => {
		const syncBrand = async () => {
			const account = await getCurrentAccount()
			if (account) {
				setBrand(getAccountTypeBrand(account.accountType))
			}
		}

		syncBrand()
	}, [setBrand])

	return null
}
