"use client"

import { useEffect, useRef } from "react"
import type { Brand } from "@/lib/brands"
import { useBrand } from "@/components/providers/brand-provider"
import { getCurrentAccount } from "@/app/actions/auth"
import { getAccountTypeBrand } from "@/lib/account-brand"

interface BrandSynchronizerProps {
	serverBrand?: Brand
}

/**
 * Synchronizes the brand theme based on the current account's type.
 * personal → "bravo", prop → "tsr", replay → "retro"
 *
 * When serverBrand is provided (from server layout), it uses that directly
 * instead of making a redundant getCurrentAccount() call.
 * Only calls setBrand if the server-derived brand differs from the current brand.
 * Uses a ref guard to prevent double-firing in React StrictMode.
 */
const BrandSynchronizer = ({ serverBrand }: BrandSynchronizerProps) => {
	const { brand, setBrand } = useBrand()
	const hasSynced = useRef(false)

	useEffect(() => {
		if (hasSynced.current) return
		hasSynced.current = true

		if (serverBrand) {
			if (serverBrand !== brand) {
				setBrand(serverBrand)
			}
			return
		}

		const syncBrand = async () => {
			const account = await getCurrentAccount()
			if (account) {
				const accountBrand = getAccountTypeBrand(account.accountType)
				if (accountBrand !== brand) {
					setBrand(accountBrand)
				}
			}
		}

		syncBrand()
	}, [serverBrand, brand, setBrand])

	return null
}

export { BrandSynchronizer }
