"use client"

import { useTranslations } from "next-intl"
import { Globe, Database, LineChart } from "lucide-react"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import type { DataSourceOption, DataSource } from "@/types/monte-carlo"

interface DataSourceSelectorProps {
	options: DataSourceOption[]
	selectedSource: DataSource | null
	onSourceChange: (source: DataSource) => void
	isLoading: boolean
}

export const DataSourceSelector = ({
	options,
	selectedSource,
	onSourceChange,
	isLoading,
}: DataSourceSelectorProps) => {
	const t = useTranslations("monteCarlo.dataSource")

	const handleValueChange = (value: string) => {
		if (value === "all_strategies") {
			onSourceChange({ type: "all_strategies" })
		} else if (value === "universal") {
			onSourceChange({ type: "universal" })
		} else {
			onSourceChange({ type: "strategy", strategyId: value })
		}
	}

	const getCurrentValue = (): string => {
		if (!selectedSource) return ""
		if (selectedSource.type === "strategy") return selectedSource.strategyId
		return selectedSource.type
	}

	const getIcon = (type: DataSource["type"]) => {
		switch (type) {
			case "strategy":
				return <LineChart className="h-4 w-4" />
			case "all_strategies":
				return <Database className="h-4 w-4" />
			case "universal":
				return <Globe className="h-4 w-4" />
		}
	}

	// Group options by type
	const strategyOptions = options.filter((o) => o.type === "strategy")
	const aggregateOptions = options.filter((o) => o.type !== "strategy")

	return (
		<div className="border-bg-300 bg-bg-200 p-m-400 rounded-lg border">
			<h3 className="mb-m-300 text-small text-txt-200 font-medium">
				{t("title")}
			</h3>

			<Select
				value={getCurrentValue()}
				onValueChange={handleValueChange}
				disabled={isLoading}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder={t("selectSource")} />
				</SelectTrigger>
				<SelectContent>
					{/* Individual Strategies */}
					{strategyOptions.length > 0 && (
						<>
							<div className="text-tiny text-txt-300 px-2 py-1.5 font-medium">
								{t("individual")}
							</div>
							{strategyOptions.map((option) => (
								<SelectItem
									key={option.strategyId}
									value={option.strategyId!}
									disabled={option.disabled}
								>
									<div className="gap-s-200 flex items-center">
										{getIcon(option.type)}
										<span>{option.label}</span>
										<span className="text-tiny text-txt-300">
											({option.tradesCount} trades)
										</span>
									</div>
								</SelectItem>
							))}
							<div className="border-bg-300 my-1 border-t" />
						</>
					)}

					{/* Aggregate Options */}
					{aggregateOptions.map((option) => (
						<SelectItem
							key={option.type}
							value={option.type}
							disabled={option.disabled}
						>
							<div className="gap-s-200 flex items-center">
								{getIcon(option.type)}
								<div className="flex flex-col">
									<span>{option.label}</span>
									{option.description && (
										<span className="text-tiny text-txt-300">
											{option.description}
										</span>
									)}
								</div>
								<span className="text-tiny text-txt-300 ml-auto">
									({option.tradesCount} trades)
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
