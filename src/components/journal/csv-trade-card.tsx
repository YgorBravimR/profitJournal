"use client"

import { useState } from "react"
import {
	ChevronDown,
	ChevronUp,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProcessedCsvTrade } from "@/app/actions/csv-import"
import type { Strategy, Tag, Timeframe } from "@/db/schema"

interface CsvTradeCardProps {
	trade: ProcessedCsvTrade
	isExpanded: boolean
	isSelected: boolean
	onToggleExpand: () => void
	onToggleSelect: () => void
	onEdit: (edits: ProcessedCsvTrade["edits"]) => void
	strategies: Strategy[]
	timeframes: Timeframe[]
	tags: Tag[]
}

export const CsvTradeCard = ({
	trade,
	isExpanded,
	isSelected,
	onToggleExpand,
	onToggleSelect,
	onEdit,
	strategies,
	timeframes,
	tags,
}: CsvTradeCardProps) => {
	const [activeTab, setActiveTab] = useState("basic")

	const formatCurrency = (value: number | null) => {
		if (value === null) return "--"
		const formatted = new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
			minimumFractionDigits: 2,
		}).format(value)
		return value >= 0 ? `+${formatted}` : formatted
	}

	const formatPrice = (value: number | string | undefined) => {
		if (!value) return "--"
		return new Intl.NumberFormat("pt-BR", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(Number(value))
	}

	const formatTime = (date: Date | string | number | undefined) => {
		if (!date) return "--"
		const d = date instanceof Date ? date : new Date(date)
		return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
	}

	const formatDate = (date: Date | string | number | undefined) => {
		if (!date) return "--"
		const d = date instanceof Date ? date : new Date(date)
		return d.toLocaleDateString("pt-BR")
	}

	const handleEditField = <K extends keyof ProcessedCsvTrade["edits"]>(
		field: K,
		value: ProcessedCsvTrade["edits"][K]
	) => {
		onEdit({ ...trade.edits, [field]: value })
	}

	const setupTags = tags.filter((t) => t.type === "setup")
	const mistakeTags = tags.filter((t) => t.type === "mistake")

	const handleTagToggle = (tagId: string) => {
		const currentTags = trade.edits.tagIds || []
		const newTags = currentTags.includes(tagId)
			? currentTags.filter((id) => id !== tagId)
			: [...currentTags, tagId]
		handleEditField("tagIds", newTags)
	}

	const isSkipped = trade.status === "skipped"
	const isWarning = trade.status === "warning"

	return (
		<div
			className={cn(
				"rounded-lg border transition-all",
				isSkipped
					? "border-fb-error/30 bg-fb-error/5"
					: isWarning
						? "border-warning/30 bg-warning/5"
						: "border-bg-300 bg-bg-200",
				isExpanded && "ring-1 ring-acc-100"
			)}
		>
			{/* Collapsed Header */}
			<div
				className={cn(
					"flex items-center gap-m-400 px-m-400 py-s-300",
					!isSkipped && "cursor-pointer"
				)}
				onClick={() => !isSkipped && onToggleExpand()}
				onKeyDown={(e) => e.key === "Enter" && !isSkipped && onToggleExpand()}
				tabIndex={isSkipped ? -1 : 0}
				role="button"
				aria-expanded={isExpanded}
			>
				{/* Select Checkbox */}
				<div onClick={(e) => e.stopPropagation()}>
					<Checkbox
						checked={isSelected}
						onCheckedChange={() => onToggleSelect()}
						disabled={isSkipped}
						aria-label={`Select trade ${trade.rowNumber}`}
					/>
				</div>

				{/* Status Icon */}
				<div className="flex-shrink-0">
					{isSkipped ? (
						<XCircle className="h-5 w-5 text-fb-error" />
					) : isWarning ? (
						<AlertTriangle className="h-5 w-5 text-warning" />
					) : (
						<CheckCircle2 className="h-5 w-5 text-trade-buy" />
					)}
				</div>

				{/* Row Number */}
				<span className="text-tiny text-txt-300">#{trade.rowNumber}</span>

				{/* Asset */}
				<div className="flex items-center gap-s-100">
					<span className="text-small font-semibold text-txt-100">
						{trade.originalData.normalizedAsset}
					</span>
					{trade.originalData.originalAssetCode !==
						trade.originalData.normalizedAsset && (
						<Tooltip>
							<TooltipTrigger>
								<Info className="h-3 w-3 text-txt-300" />
							</TooltipTrigger>
							<TooltipContent>
								Original: {trade.originalData.originalAssetCode}
							</TooltipContent>
						</Tooltip>
					)}
				</div>

				{/* Direction */}
				<span
					className={cn(
						"rounded px-s-200 py-s-100 text-tiny font-medium",
						trade.originalData.direction === "long"
							? "bg-action-buy/20 text-action-buy"
							: "bg-action-sell/20 text-action-sell"
					)}
				>
					{trade.originalData.direction.toUpperCase()}
				</span>

				{/* Time Range */}
				<span className="text-small text-txt-200">
					{formatTime(trade.originalData.entryDate)}
					{trade.originalData.exitDate &&
						` → ${formatTime(trade.originalData.exitDate)}`}
				</span>

				{/* Position Size */}
				<span className="text-small text-txt-300">
					{trade.originalData.positionSize} contracts
				</span>

				{/* Spacer */}
				<div className="flex-1" />

				{/* Skipped Reason or P&L */}
				{isSkipped ? (
					<span className="text-small text-fb-error">{trade.skipReason}</span>
				) : (
					<div className="flex items-center gap-m-400">
						{/* Entry → Exit */}
						<span className="text-small text-txt-200">
							{formatPrice(trade.originalData.entryPrice)} →{" "}
							{formatPrice(trade.originalData.exitPrice)}
						</span>

						{/* Net P&L */}
						<span
							className={cn(
								"text-small font-semibold",
								trade.netPnl !== null
									? trade.netPnl >= 0
										? "text-trade-buy"
										: "text-trade-sell"
									: "text-txt-300"
							)}
						>
							{formatCurrency(trade.netPnl)}
						</span>

						{/* Expand Button */}
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								onToggleExpand()
							}}
							className="rounded p-s-100 text-txt-300 hover:bg-bg-100 hover:text-txt-100"
							aria-label={isExpanded ? "Collapse" : "Expand"}
						>
							{isExpanded ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</button>
					</div>
				)}
			</div>

			{/* Expanded Content */}
			{isExpanded && !isSkipped && (
				<div className="border-t border-bg-300 p-m-400">
					{/* P&L Breakdown */}
					{trade.assetConfig && (
						<div className="mb-m-400 rounded-lg border border-bg-300 bg-bg-100 p-s-300">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-m-400 text-small">
									<span className="text-txt-300">
										Ticks: {trade.ticksGained?.toFixed(1) || "--"}
									</span>
									<span className="text-txt-300">
										Gross: {formatCurrency(trade.grossPnl)}
									</span>
									<span className="text-txt-300">
										Costs: {formatCurrency(trade.totalCosts ? -trade.totalCosts : null)}
									</span>
								</div>
								<span
									className={cn(
										"text-body font-bold",
										trade.netPnl !== null
											? trade.netPnl >= 0
												? "text-trade-buy"
												: "text-trade-sell"
											: "text-txt-300"
									)}
								>
									Net: {formatCurrency(trade.netPnl)}
								</span>
							</div>
							<div className="mt-s-200 text-tiny text-txt-300">
								Commission: R${((trade.assetConfig.commission / 100) * Number(trade.originalData.positionSize) * 2).toFixed(2)} |
								Fees: R${((trade.assetConfig.fees / 100) * Number(trade.originalData.positionSize) * 2).toFixed(2)} |
								Tick Size: {trade.assetConfig.tickSize} |
								Tick Value: R${(trade.assetConfig.tickValue / 100).toFixed(2)}
							</div>
						</div>
					)}

					{/* Tabbed Editor */}
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="mb-m-400 w-full justify-start">
							<TabsTrigger value="basic">Basic Info</TabsTrigger>
							<TabsTrigger value="risk">Risk</TabsTrigger>
							<TabsTrigger value="journal">Journal</TabsTrigger>
							<TabsTrigger value="tags">Tags</TabsTrigger>
						</TabsList>

						{/* Basic Info Tab */}
						<TabsContent value="basic" className="space-y-m-400">
							<div className="grid grid-cols-2 gap-m-400 md:grid-cols-4">
								{/* Date */}
								<div>
									<Label className="text-tiny text-txt-300">Date</Label>
									<div className="mt-s-100 text-small text-txt-100">
										{formatDate(trade.originalData.entryDate)}
									</div>
								</div>

								{/* Direction (readonly) */}
								<div>
									<Label className="text-tiny text-txt-300">Direction</Label>
									<div
										className={cn(
											"mt-s-100 text-small font-medium",
											trade.originalData.direction === "long"
												? "text-action-buy"
												: "text-action-sell"
										)}
									>
										{trade.originalData.direction.toUpperCase()}
									</div>
								</div>

								{/* Strategy */}
								<div>
									<Label className="text-tiny text-txt-300">Strategy</Label>
									<Select
										value={trade.edits.strategyId || ""}
										onValueChange={(v) => handleEditField("strategyId", v || undefined)}
									>
										<SelectTrigger className="mt-s-100 h-8">
											<SelectValue placeholder="Select..." />
										</SelectTrigger>
										<SelectContent>
											{strategies.map((s) => (
												<SelectItem key={s.id} value={s.id}>
													{s.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Timeframe */}
								<div>
									<Label className="text-tiny text-txt-300">Timeframe</Label>
									<Select
										value={trade.edits.timeframeId || ""}
										onValueChange={(v) => handleEditField("timeframeId", v || undefined)}
									>
										<SelectTrigger className="mt-s-100 h-8">
											<SelectValue placeholder="Select..." />
										</SelectTrigger>
										<SelectContent>
											{timeframes.map((tf) => (
												<SelectItem key={tf.id} value={tf.id}>
													{tf.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Prices (readonly) */}
							<div className="grid grid-cols-2 gap-m-400 md:grid-cols-4">
								<div>
									<Label className="text-tiny text-txt-300">Entry Price</Label>
									<div className="mt-s-100 text-small text-txt-100">
										{formatPrice(trade.originalData.entryPrice)}
									</div>
								</div>
								<div>
									<Label className="text-tiny text-txt-300">Exit Price</Label>
									<div className="mt-s-100 text-small text-txt-100">
										{formatPrice(trade.originalData.exitPrice)}
									</div>
								</div>
								<div>
									<Label className="text-tiny text-txt-300">Position Size</Label>
									<div className="mt-s-100 text-small text-txt-100">
										{trade.originalData.positionSize}
									</div>
								</div>
								<div>
									<Label className="text-tiny text-txt-300">
										P&L from CSV
									</Label>
									<div className="mt-s-100 text-small text-txt-100">
										{trade.originalData.pnl
											? formatCurrency(Number(trade.originalData.pnl))
											: "--"}
									</div>
								</div>
							</div>
						</TabsContent>

						{/* Risk Tab */}
						<TabsContent value="risk" className="space-y-m-400">
							<div className="grid grid-cols-2 gap-m-400 md:grid-cols-4">
								<div>
									<Label htmlFor={`sl-${trade.id}`} className="text-tiny text-txt-300">
										Stop Loss
									</Label>
									<Input
										id={`sl-${trade.id}`}
										type="number"
										step="0.01"
										value={trade.edits.stopLoss || ""}
										onChange={(e) =>
											handleEditField(
												"stopLoss",
												e.target.value ? Number(e.target.value) : undefined
											)
										}
										className="mt-s-100 h-8"
										placeholder="Optional"
									/>
								</div>
								<div>
									<Label htmlFor={`tp-${trade.id}`} className="text-tiny text-txt-300">
										Take Profit
									</Label>
									<Input
										id={`tp-${trade.id}`}
										type="number"
										step="0.01"
										value={trade.edits.takeProfit || ""}
										onChange={(e) =>
											handleEditField(
												"takeProfit",
												e.target.value ? Number(e.target.value) : undefined
											)
										}
										className="mt-s-100 h-8"
										placeholder="Optional"
									/>
								</div>
								<div>
									<Label className="text-tiny text-txt-300">MFE (from CSV)</Label>
									<div className="mt-s-100 text-small text-txt-100">
										{trade.originalData.mfe
											? formatCurrency(Number(trade.originalData.mfe))
											: "--"}
									</div>
								</div>
								<div>
									<Label className="text-tiny text-txt-300">MAE (from CSV)</Label>
									<div className="mt-s-100 text-small text-txt-100">
										{trade.originalData.mae
											? formatCurrency(-Number(trade.originalData.mae))
											: "--"}
									</div>
								</div>
							</div>
						</TabsContent>

						{/* Journal Tab */}
						<TabsContent value="journal" className="space-y-m-400">
							<div>
								<Label
									htmlFor={`thoughts-${trade.id}`}
									className="text-tiny text-txt-300"
								>
									Pre-Trade Thoughts
								</Label>
								<Textarea
									id={`thoughts-${trade.id}`}
									value={trade.edits.preTradeThoughts || ""}
									onChange={(e) => handleEditField("preTradeThoughts", e.target.value)}
									className="mt-s-100 min-h-[80px]"
									placeholder="What was your plan for this trade?"
								/>
							</div>

							<div>
								<Label
									htmlFor={`reflection-${trade.id}`}
									className="text-tiny text-txt-300"
								>
									Post-Trade Reflection
								</Label>
								<Textarea
									id={`reflection-${trade.id}`}
									value={trade.edits.postTradeReflection || ""}
									onChange={(e) => handleEditField("postTradeReflection", e.target.value)}
									className="mt-s-100 min-h-[80px]"
									placeholder="How did the trade go? What happened?"
								/>
							</div>

							<div>
								<Label
									htmlFor={`lesson-${trade.id}`}
									className="text-tiny text-txt-300"
								>
									Lesson Learned
								</Label>
								<Textarea
									id={`lesson-${trade.id}`}
									value={trade.edits.lessonLearned || ""}
									onChange={(e) => handleEditField("lessonLearned", e.target.value)}
									className="mt-s-100 min-h-[60px]"
									placeholder="What did you learn from this trade?"
								/>
							</div>

							{/* Follow Plan */}
							<div className="flex items-center gap-m-400">
								<Label className="text-tiny text-txt-300">Did you follow your plan?</Label>
								<div className="flex gap-s-200">
									<button
										type="button"
										onClick={() => handleEditField("followedPlan", true)}
										className={cn(
											"rounded-md px-m-400 py-s-200 text-small font-medium transition-colors",
											trade.edits.followedPlan === true
												? "bg-trade-buy text-bg-100"
												: "bg-bg-300 text-txt-200 hover:bg-bg-100"
										)}
									>
										Yes
									</button>
									<button
										type="button"
										onClick={() => handleEditField("followedPlan", false)}
										className={cn(
											"rounded-md px-m-400 py-s-200 text-small font-medium transition-colors",
											trade.edits.followedPlan === false
												? "bg-fb-error text-white"
												: "bg-bg-300 text-txt-200 hover:bg-bg-100"
										)}
									>
										No
									</button>
								</div>
							</div>

							{/* Discipline Notes (shown when followedPlan is false) */}
							{trade.edits.followedPlan === false && (
								<div>
									<Label
										htmlFor={`discipline-${trade.id}`}
										className="text-tiny text-txt-300"
									>
										What went wrong?
									</Label>
									<Textarea
										id={`discipline-${trade.id}`}
										value={trade.edits.disciplineNotes || ""}
										onChange={(e) => handleEditField("disciplineNotes", e.target.value)}
										className="mt-s-100 min-h-[60px]"
										placeholder="Describe what didn't go according to plan..."
									/>
								</div>
							)}
						</TabsContent>

						{/* Tags Tab */}
						<TabsContent value="tags" className="space-y-m-400">
							{/* Setup Tags */}
							{setupTags.length > 0 && (
								<div>
									<Label className="text-tiny text-txt-300">Setup Type</Label>
									<div className="mt-s-200 flex flex-wrap gap-s-200">
										{setupTags.map((tag) => (
											<button
												key={tag.id}
												type="button"
												onClick={() => handleTagToggle(tag.id)}
												className={cn(
													"rounded-full px-s-300 py-s-100 text-tiny font-medium transition-colors",
													trade.edits.tagIds?.includes(tag.id)
														? "bg-acc-100 text-bg-100"
														: "bg-bg-300 text-txt-200 hover:bg-bg-100"
												)}
												style={
													trade.edits.tagIds?.includes(tag.id) && tag.color
														? { backgroundColor: tag.color }
														: undefined
												}
											>
												{tag.name}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Mistake Tags */}
							{mistakeTags.length > 0 && (
								<div>
									<Label className="text-tiny text-txt-300">Mistakes</Label>
									<div className="mt-s-200 flex flex-wrap gap-s-200">
										{mistakeTags.map((tag) => (
											<button
												key={tag.id}
												type="button"
												onClick={() => handleTagToggle(tag.id)}
												className={cn(
													"rounded-full px-s-300 py-s-100 text-tiny font-medium transition-colors",
													trade.edits.tagIds?.includes(tag.id)
														? "bg-warning text-bg-100"
														: "bg-bg-300 text-txt-200 hover:bg-bg-100"
												)}
											>
												{tag.name}
											</button>
										))}
									</div>
								</div>
							)}

							{setupTags.length === 0 && mistakeTags.length === 0 && (
								<p className="text-small text-txt-300">
									No tags configured. Add tags in Settings → Tags.
								</p>
							)}
						</TabsContent>
					</Tabs>
				</div>
			)}
		</div>
	)
}
