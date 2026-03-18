"use client"

import { useRegisterPageGuide } from "@/components/ui/page-guide"
import { tradeDetailGuide } from "@/components/ui/page-guide/guide-configs/trade-detail"

const TradeDetailGuide = () => {
	useRegisterPageGuide(tradeDetailGuide)
	return null
}

export { TradeDetailGuide }
