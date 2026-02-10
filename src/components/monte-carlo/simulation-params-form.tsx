"use client"

import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import type { SimulationParams } from "@/types/monte-carlo"
import { SIMULATION_BUDGET_CAP } from "@/lib/validations/monte-carlo"
import { cn } from "@/lib/utils"

interface SimulationParamsFormProps {
	params: SimulationParams
	onChange: (params: SimulationParams) => void
	disabled?: boolean
}

export const SimulationParamsForm = ({
	params,
	onChange,
	disabled = false,
}: SimulationParamsFormProps) => {
	const t = useTranslations("monteCarlo.params")

	const handleChange = (
		field: keyof SimulationParams,
		value: string | number
	) => {
		onChange({
			...params,
			[field]: value,
		})
	}

	const totalIterations = params.numberOfTrades * params.simulationCount
	const budgetUsage = totalIterations / SIMULATION_BUDGET_CAP
	const isOverBudget = totalIterations > SIMULATION_BUDGET_CAP

	return (
		<div className="border-bg-300 bg-bg-200 p-m-400 rounded-lg border">
			<h3 className="mb-m-400 text-body text-txt-100 font-semibold">
				{t("title")}
			</h3>

			<div className="gap-m-400 grid md:grid-cols-3">
				{/* Initial Balance */}
				<div>
					<Label className="mb-s-200 text-small text-txt-200 block">
						{t("initialBalance")}
					</Label>
					<div className="relative">
						<span className="text-tiny text-txt-300 absolute top-1/2 left-3 -translate-y-1/2">
							$
						</span>
						<Input
							type="number"
							min={100}
							max={100000000}
							value={params.initialBalance}
							onChange={(e) =>
								handleChange("initialBalance", parseFloat(e.target.value) || 0)
							}
							className="pl-7"
							disabled={disabled}
						/>
					</div>
				</div>

				{/* Risk Type */}
				<div>
					<Label className="mb-s-200 text-small text-txt-200 block">
						{t("riskType")}
					</Label>
					<Select
						value={params.riskType}
						onValueChange={(value) =>
							handleChange("riskType", value as "percentage" | "fixed")
						}
						disabled={disabled}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="percentage">
								{t("riskTypePercentage")}
							</SelectItem>
							<SelectItem value="fixed">{t("riskTypeFixed")}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Risk Per Trade */}
				<div>
					<Label className="mb-s-200 text-small text-txt-200 block">
						{t("riskPerTrade")}
					</Label>
					<div className="relative">
						<Input
							type="number"
							step="0.1"
							min={0.01}
							max={
								params.riskType === "percentage" ? 100 : params.initialBalance
							}
							value={params.riskPerTrade}
							onChange={(e) =>
								handleChange("riskPerTrade", parseFloat(e.target.value) || 0)
							}
							className={params.riskType === "percentage" ? "pr-7" : "pl-7"}
							disabled={disabled}
						/>
						<span
							className={cn(
								"text-tiny text-txt-300 absolute top-1/2 -translate-y-1/2",
								params.riskType === "percentage" ? "right-3" : "left-3"
							)}
						>
							{params.riskType === "percentage" ? "%" : "$"}
						</span>
					</div>
				</div>

				{/* Win Rate */}
				<div>
					<Label className="mb-s-200 text-small text-txt-200 block">
						{t("winRate")}
					</Label>
					<div className="relative">
						<Input
							type="number"
							step="1"
							min={1}
							max={99}
							value={params.winRate}
							onChange={(e) =>
								handleChange("winRate", parseFloat(e.target.value) || 0)
							}
							className="pr-7"
							disabled={disabled}
						/>
						<span className="text-tiny text-txt-300 absolute top-1/2 right-3 -translate-y-1/2">
							%
						</span>
					</div>
				</div>

				{/* Reward/Risk Ratio */}
				<div>
					<Label className="mb-s-200 text-small text-txt-200 block">
						{t("rewardRiskRatio")}
					</Label>
					<Input
						type="number"
						step="0.1"
						min={0.1}
						max={20}
						value={params.rewardRiskRatio}
						onChange={(e) =>
							handleChange("rewardRiskRatio", parseFloat(e.target.value) || 0)
						}
						disabled={disabled}
					/>
				</div>

				{/* Number of Trades */}
				<div>
					<Label className="mb-s-200 text-small text-txt-200 block">
						{t("numberOfTrades")}
					</Label>
					<Input
						type="number"
						step="10"
						min={10}
						max={10000}
						value={params.numberOfTrades}
						onChange={(e) =>
							handleChange("numberOfTrades", parseInt(e.target.value) || 0)
						}
						disabled={disabled}
					/>
				</div>

				{/* Commission */}
				<div>
					<Label className="mb-s-200 text-small text-txt-200 block">
						{t("commissionPerTrade")}
					</Label>
					<div className="relative">
						<Input
							type="number"
							step="0.01"
							min={0}
							max={10}
							value={params.commissionPerTrade}
							onChange={(e) =>
								handleChange(
									"commissionPerTrade",
									parseFloat(e.target.value) || 0
								)
							}
							className="pr-7"
							disabled={disabled}
						/>
						<span className="text-tiny text-txt-300 absolute top-1/2 right-3 -translate-y-1/2">
							%
						</span>
					</div>
				</div>

				{/* Simulation Count */}
				<div>
					<Label className="mb-s-200 text-small text-txt-200 block">
						{t("simulationCount")}
					</Label>
					<Input
						type="number"
						step="1000"
						min={100}
						max={50000}
						value={params.simulationCount}
						onChange={(e) =>
							handleChange("simulationCount", parseInt(e.target.value) || 0)
						}
						disabled={disabled}
					/>
				</div>
			</div>

			{/* Budget Indicator */}
			<div className="mt-m-400 flex items-center justify-between text-small">
				<span className="text-txt-300">
					{t("totalIterations")}: {totalIterations.toLocaleString()} / {SIMULATION_BUDGET_CAP.toLocaleString()}
				</span>
				<span
					className={cn(
						"",
						isOverBudget
							? "text-fb-error font-semibold"
							: budgetUsage > 0.8
								? "text-fb-warning"
								: "text-txt-300"
					)}
				>
					{(budgetUsage * 100).toFixed(0)}%
				</span>
			</div>
			{isOverBudget && (
				<p className="mt-s-200 text-caption text-fb-error">
					{t("budgetExceeded", {
						maxTrades: Math.floor(SIMULATION_BUDGET_CAP / params.simulationCount).toLocaleString(),
						maxSimulations: Math.floor(SIMULATION_BUDGET_CAP / params.numberOfTrades).toLocaleString(),
					})}
				</p>
			)}
		</div>
	)
}
