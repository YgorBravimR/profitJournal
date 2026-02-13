"use client"

import { useTranslations } from "next-intl"
import { Calculator, TrendingUp, Shield, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fromCents } from "@/lib/money"
import type { CalculatorResult } from "@/lib/calculator"

interface CalculatorResultsProps {
	result: CalculatorResult | null
	hasAssetSelected: boolean
	hasPrices: boolean
	currency?: string
}

const formatCurrency = (cents: number, currency = "R$"): string => {
	const value = fromCents(cents)
	const absValue = Math.abs(value)
	const prefix = value < 0 ? "-" : ""
	return `${prefix}${currency} ${absValue.toFixed(2)}`
}

const formatPoints = (points: number): string => {
	// Use reasonable precision: if value has decimals show them, otherwise show integer
	if (points === Math.floor(points)) {
		return points.toString()
	}
	return points.toFixed(2)
}

const getRiskRewardColor = (ratio: number): string => {
	if (ratio >= 2) return "text-trade-buy"
	if (ratio >= 1) return "text-acc-100"
	return "text-trade-sell"
}

const CalculatorResults = ({
	result,
	hasAssetSelected,
	hasPrices,
	currency = "R$",
}: CalculatorResultsProps) => {
	const t = useTranslations("commandCenter.calculator")

	// Empty state: no asset selected
	if (!hasAssetSelected) {
		return (
			<div className="flex h-full items-center justify-center rounded-lg border border-dashed border-bg-300 p-m-500">
				<div className="text-center">
					<Calculator className="mx-auto mb-s-200 h-8 w-8 text-txt-300" />
					<p className="text-small text-txt-300">{t("selectAssetToStart")}</p>
				</div>
			</div>
		)
	}

	// Empty state: no prices yet
	if (!hasPrices || !result) {
		return (
			<div className="flex h-full items-center justify-center rounded-lg border border-dashed border-bg-300 p-m-500">
				<div className="text-center">
					<BarChart3 className="mx-auto mb-s-200 h-8 w-8 text-txt-300" />
					<p className="text-small text-txt-300">{t("enterPricesToCalculate")}</p>
				</div>
			</div>
		)
	}

	// Validation errors
	if (!result.isValid) {
		return (
			<div className="rounded-lg border border-trade-sell/30 bg-trade-sell/5 p-m-500">
				<div className="space-y-s-200">
					{result.errors.map((error) => (
						<p key={error} className="text-small text-trade-sell">
							{t(error)}
						</p>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-m-400">
			{/* Risk Section */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
				<div className="mb-s-300 flex items-center gap-s-200">
					<Shield className="h-4 w-4 text-trade-sell" />
					<h4 className="text-small font-semibold text-txt-100">
						{t("riskAnalysis")}
					</h4>
				</div>

				<div className="grid grid-cols-2 gap-m-300">
					{/* Stop Distance */}
					<div>
						<p className="text-tiny text-txt-300">{t("stopPoints")}</p>
						<p className="text-body font-semibold text-txt-100">
							{formatPoints(result.stopPoints)} {t("points")}
						</p>
					</div>

					{/* Risk Per Contract */}
					<div>
						<p className="text-tiny text-txt-300">{t("riskPerContract")}</p>
						<p className="text-body font-semibold text-trade-sell">
							{formatCurrency(result.riskPerContractCents, currency)}
						</p>
					</div>

					{/* Max Allowed Risk */}
					<div>
						<p className="text-tiny text-txt-300">
							{t("maxAllowedRisk")}
							<span className="ml-s-100 text-acc-100">({t("fromSettings")})</span>
						</p>
						<p className="text-body font-semibold text-txt-100">
							{formatCurrency(result.maxAllowedRiskCents, currency)}
						</p>
					</div>

					{/* Total Risk */}
					<div>
						<p className="text-tiny text-txt-300">{t("totalRisk")}</p>
						<p
							className={cn(
								"text-body font-semibold",
								result.totalRiskCents > result.maxAllowedRiskCents
									? "text-fb-error"
									: "text-trade-sell"
							)}
						>
							{formatCurrency(result.totalRiskCents, currency)}
						</p>
						{result.totalRiskCents > result.maxAllowedRiskCents && (
							<p className="text-tiny text-fb-error">{t("exceedsMaxRisk")}</p>
						)}
					</div>
				</div>
			</div>

			{/* Position Size Section */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
				<div className="mb-s-300 flex items-center gap-s-200">
					<BarChart3 className="h-4 w-4 text-acc-100" />
					<h4 className="text-small font-semibold text-txt-100">
						{t("positionSizing")}
					</h4>
				</div>

				<div className="grid grid-cols-2 gap-m-300">
					{/* Suggested Contracts */}
					<div>
						<p className="text-tiny text-txt-300">{t("suggestedContracts")}</p>
						<p className="text-body font-semibold text-acc-100">
							{result.suggestedContracts} {t("contracts")}
						</p>
					</div>

					{/* Actual Contracts */}
					<div>
						<p className="text-tiny text-txt-300">{t("actualContracts")}</p>
						<p
							className={cn(
								"text-body font-semibold",
								result.actualContracts !== result.suggestedContracts
									? "text-acc-100"
									: "text-txt-100"
							)}
						>
							{result.actualContracts} {t("contracts")}
						</p>
					</div>
				</div>
			</div>

			{/* Target / R:R Section */}
			{result.targetPoints !== null && (
				<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
					<div className="mb-s-300 flex items-center gap-s-200">
						<TrendingUp className="h-4 w-4 text-trade-buy" />
						<h4 className="text-small font-semibold text-txt-100">
							{t("targetAnalysis")}
						</h4>
					</div>

					<div className="grid grid-cols-2 gap-m-300">
						{/* Target Distance */}
						<div>
							<p className="text-tiny text-txt-300">{t("targetPoints")}</p>
							<p className="text-body font-semibold text-txt-100">
								{formatPoints(result.targetPoints)} {t("points")}
							</p>
						</div>

						{/* Return Per Contract */}
						{result.returnPerContractCents !== null && (
							<div>
								<p className="text-tiny text-txt-300">{t("returnPerContract")}</p>
								<p className="text-body font-semibold text-trade-buy">
									{formatCurrency(result.returnPerContractCents, currency)}
								</p>
							</div>
						)}

						{/* R:R Ratio */}
						{result.riskRewardRatio !== null && (
							<div className="col-span-2">
								<p className="text-tiny text-txt-300">{t("riskRewardRatio")}</p>
								<p
									className={cn(
										"text-h3 font-bold",
										getRiskRewardColor(result.riskRewardRatio)
									)}
								>
									1 : {result.riskRewardRatio.toFixed(2)}
								</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export { CalculatorResults }
export type { CalculatorResultsProps }
