"use client"

import { useRegisterPageGuide } from "@/components/ui/page-guide"
import { strategyDetailGuide } from "@/components/ui/page-guide/guide-configs/strategy-detail"

const StrategyDetailGuide = () => {
	useRegisterPageGuide(strategyDetailGuide)
	return null
}

export { StrategyDetailGuide }
