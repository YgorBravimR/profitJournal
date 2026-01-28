"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowUpRight, ArrowDownRight, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createTradeSchema, type TradeFormInput } from "@/lib/validations/trade"
import { createTrade, updateTrade } from "@/app/actions/trades"
import { calculatePnL, calculateRMultiple } from "@/lib/calculations"
import { fromCents } from "@/lib/money"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import type { Trade, Strategy, Tag, Timeframe } from "@/db/schema"
import type { AssetWithType } from "@/app/actions/assets"
import { calculateAssetPnL } from "@/lib/calculations"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface TradeFormProps {
	trade?: Trade & {
		tradeTags?: Array<{ tag: Tag }>
	}
	strategies?: Strategy[]
	tags?: Tag[]
	assets?: AssetWithType[]
	timeframes?: Timeframe[]
	onSuccess?: () => void
}

// Format Date to datetime-local input value (YYYY-MM-DDTHH:mm)
const formatDateTimeLocal = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	const hours = String(date.getHours()).padStart(2, "0")
	const minutes = String(date.getMinutes()).padStart(2, "0")
	return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const TradeForm = ({
	trade,
	strategies = [],
	tags = [],
	assets = [],
	timeframes: configuredTimeframes = [],
	onSuccess,
}: TradeFormProps) => {
	const router = useRouter()
	const { showToast } = useToast()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [selectedAsset, setSelectedAsset] = useState<AssetWithType | null>(
		() => {
			if (trade?.asset && assets.length > 0) {
				return assets.find((a) => a.symbol === trade.asset) ?? null
			}
			return null
		}
	)

	const isEditing = !!trade
	const hasConfiguredAssets = assets.length > 0
	const hasConfiguredTimeframes = configuredTimeframes.length > 0

	const defaultValues: Partial<TradeFormInput> = trade
		? {
				asset: trade.asset,
				direction: trade.direction,
				timeframeId: trade.timeframeId ?? undefined,
				entryDate: formatDateTimeLocal(new Date(trade.entryDate)),
				exitDate: trade.exitDate
					? formatDateTimeLocal(new Date(trade.exitDate))
					: undefined,
				entryPrice: Number(trade.entryPrice),
				exitPrice: trade.exitPrice ? Number(trade.exitPrice) : undefined,
				positionSize: Number(trade.positionSize),
				stopLoss: trade.stopLoss ? Number(trade.stopLoss) : undefined,
				takeProfit: trade.takeProfit ? Number(trade.takeProfit) : undefined,
				// riskAmount can be manually entered or calculated from stopLoss
				riskAmount: trade.plannedRiskAmount ? fromCents(trade.plannedRiskAmount) : undefined,
				pnl: trade.pnl ? fromCents(trade.pnl) : undefined,
				mfe: trade.mfe ? Number(trade.mfe) : undefined,
				mae: trade.mae ? Number(trade.mae) : undefined,
				contractsExecuted: trade.contractsExecuted ? Number(trade.contractsExecuted) : undefined,
				preTradeThoughts: trade.preTradeThoughts ?? undefined,
				postTradeReflection: trade.postTradeReflection ?? undefined,
				lessonLearned: trade.lessonLearned ?? undefined,
				strategyId: trade.strategyId ?? undefined,
				followedPlan: trade.followedPlan ?? undefined,
				disciplineNotes: trade.disciplineNotes ?? undefined,
				tagIds: trade.tradeTags?.map((tt) => tt.tag.id) ?? [],
			}
		: {
				direction: "long",
				entryDate: formatDateTimeLocal(new Date()),
				tagIds: [],
			}

	const form = useForm<TradeFormInput>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(createTradeSchema) as any,
		defaultValues,
	})

	const { handleSubmit, watch, setValue, reset, formState: { errors } } = form

	// Reset form when trade prop changes (for edit mode)
	useEffect(() => {
		if (trade) {
			reset({
				asset: trade.asset,
				direction: trade.direction,
				timeframeId: trade.timeframeId ?? undefined,
				entryDate: formatDateTimeLocal(new Date(trade.entryDate)),
				exitDate: trade.exitDate
					? formatDateTimeLocal(new Date(trade.exitDate))
					: undefined,
				entryPrice: Number(trade.entryPrice),
				exitPrice: trade.exitPrice ? Number(trade.exitPrice) : undefined,
				positionSize: Number(trade.positionSize),
				stopLoss: trade.stopLoss ? Number(trade.stopLoss) : undefined,
				takeProfit: trade.takeProfit ? Number(trade.takeProfit) : undefined,
				riskAmount: trade.plannedRiskAmount ? fromCents(trade.plannedRiskAmount) : undefined,
				pnl: trade.pnl ? fromCents(trade.pnl) : undefined,
				mfe: trade.mfe ? Number(trade.mfe) : undefined,
				mae: trade.mae ? Number(trade.mae) : undefined,
				contractsExecuted: trade.contractsExecuted ? Number(trade.contractsExecuted) : undefined,
				preTradeThoughts: trade.preTradeThoughts ?? undefined,
				postTradeReflection: trade.postTradeReflection ?? undefined,
				lessonLearned: trade.lessonLearned ?? undefined,
				strategyId: trade.strategyId ?? undefined,
				followedPlan: trade.followedPlan ?? undefined,
				disciplineNotes: trade.disciplineNotes ?? undefined,
				tagIds: trade.tradeTags?.map((tt) => tt.tag.id) ?? [],
			})
			// Update selected asset when trade changes
			const asset = assets.find((a) => a.symbol === trade.asset)
			setSelectedAsset(asset ?? null)
		}
	}, [trade, reset, assets])

	const direction = watch("direction")
	const entryPrice = watch("entryPrice")
	const exitPrice = watch("exitPrice")
	const positionSize = watch("positionSize")
	const stopLoss = watch("stopLoss")
	const takeProfit = watch("takeProfit")
	const selectedTagIds = watch("tagIds") || []

	// Watch riskAmount for auto-fill logic
	const riskAmountValue = watch("riskAmount")

	// Auto-calculate planned risk from stop loss
	const calculatedRisk = useMemo(() => {
		if (!entryPrice || !stopLoss || !positionSize) return null
		const entry = Number(entryPrice)
		const sl = Number(stopLoss)
		const size = Number(positionSize)
		if (isNaN(entry) || isNaN(sl) || isNaN(size)) return null
		const riskPerUnit =
			direction === "long" ? entry - sl : sl - entry
		return Math.abs(riskPerUnit * size)
	}, [entryPrice, stopLoss, positionSize, direction])

	// Auto-fill riskAmount when calculatedRisk changes and user hasn't manually entered a value
	useEffect(() => {
		if (calculatedRisk !== null && !riskAmountValue) {
			setValue("riskAmount", calculatedRisk)
		}
	}, [calculatedRisk, riskAmountValue, setValue])

	// Auto-calculate planned R target from TP/SL ratio (always derived, never user input)
	const calculatedPlannedR = useMemo(() => {
		if (!entryPrice || !stopLoss || !takeProfit) return null
		const entry = Number(entryPrice)
		const sl = Number(stopLoss)
		const tp = Number(takeProfit)
		if (isNaN(entry) || isNaN(sl) || isNaN(tp)) return null
		const riskPerUnit = direction === "long" ? entry - sl : sl - entry
		if (riskPerUnit === 0) return null
		const rewardPerUnit = direction === "long" ? tp - entry : entry - tp
		return Math.abs(rewardPerUnit / riskPerUnit)
	}, [entryPrice, stopLoss, takeProfit, direction])

	const contractsExecutedValue = watch("contractsExecuted")

	// Calculate P&L preview using asset-based calculation when available
	const calculatedPnLResult = useMemo(() => {
		if (!entryPrice || !exitPrice || !positionSize) return null

		const entry = Number(entryPrice)
		const exit = Number(exitPrice)
		const size = Number(positionSize)
		const dir = direction || "long"
		// Default contractsExecuted to positionSize * 2 (entry + exit) if not specified
		const contracts = contractsExecutedValue ? Number(contractsExecutedValue) : size * 2

		if (selectedAsset) {
			// Use asset-based calculation with tick size and tick value
			// tickValue is stored in cents, convert to dollars
			// TODO: Get commission/fees from account settings in Task #9
			return calculateAssetPnL({
				entryPrice: entry,
				exitPrice: exit,
				positionSize: size,
				direction: dir,
				tickSize: parseFloat(selectedAsset.tickSize),
				tickValue: fromCents(selectedAsset.tickValue),
				commission: 0,
				fees: 0,
				contractsExecuted: contracts,
			})
		}

		// Fallback to simple P&L calculation
		const simplePnl = calculatePnL({
			direction: dir,
			entryPrice: entry,
			exitPrice: exit,
			positionSize: size,
		})

		return {
			ticksGained: 0,
			grossPnl: simplePnl,
			netPnl: simplePnl,
			totalCosts: 0,
		}
	}, [entryPrice, exitPrice, positionSize, direction, selectedAsset, contractsExecutedValue])

	const calculatedPnL = calculatedPnLResult?.netPnl ?? null

	// Calculate R-Multiple preview
	const calculatedR =
		calculatedPnL !== null && calculatedRisk
			? calculateRMultiple(calculatedPnL, calculatedRisk)
			: null

	const handleTagToggle = (tagId: string) => {
		const current = selectedTagIds || []
		const updated = current.includes(tagId)
			? current.filter((id) => id !== tagId)
			: [...current, tagId]
		setValue("tagIds", updated)
	}

	const onSubmit = async (data: TradeFormInput) => {
		console.log("Submitting trade data:", data)
		setIsSubmitting(true)
		try {
			const result = isEditing
				? await updateTrade(trade.id, data)
				: await createTrade(data)

			if (result.status === "success") {
				showToast(
					"success",
					isEditing ? "Trade updated successfully" : "Trade created successfully"
				)
				onSuccess?.()
				// Redirect to journal list - refresh happens automatically on navigation
				router.push("/journal")
			} else {
				showToast("error", result.message || "Failed to save trade")
			}
		} catch {
			showToast("error", "An unexpected error occurred")
		} finally {
			setIsSubmitting(false)
		}
	}

	const setupTags = tags.filter((t) => t.type === "setup")
	const mistakeTags = tags.filter((t) => t.type === "mistake")

	// Map fields to tabs for error highlighting
	const basicFields = ["asset", "entryDate", "entryPrice", "positionSize", "direction", "timeframeId", "exitDate", "exitPrice", "strategyId"] as const
	const riskFields = ["stopLoss", "takeProfit", "mfe", "mae"] as const
	const journalFields = ["preTradeThoughts", "postTradeReflection", "lessonLearned", "followedPlan", "disciplineNotes"] as const
	const tagFields = ["tagIds"] as const

	const hasBasicErrors = basicFields.some((field) => errors[field])
	const hasRiskErrors = riskFields.some((field) => errors[field])
	const hasJournalErrors = journalFields.some((field) => errors[field])
	const hasTagErrors = tagFields.some((field) => errors[field])

	return (
		<Form {...form}>
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-m-600">
			<Tabs defaultValue="basic" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger
						value="basic"
						className={cn(
							hasBasicErrors &&
								"text-fb-error data-[state=active]:text-fb-error"
						)}
					>
						Basic
						{hasBasicErrors && (
							<span className="bg-fb-error ml-1 h-2 w-2 rounded-full" />
						)}
					</TabsTrigger>
					<TabsTrigger
						value="risk"
						className={cn(
							hasRiskErrors && "text-fb-error data-[state=active]:text-fb-error"
						)}
					>
						Risk
						{hasRiskErrors && (
							<span className="bg-fb-error ml-1 h-2 w-2 rounded-full" />
						)}
					</TabsTrigger>
					<TabsTrigger
						value="journal"
						className={cn(
							hasJournalErrors &&
								"text-fb-error data-[state=active]:text-fb-error"
						)}
					>
						Journal
						{hasJournalErrors && (
							<span className="bg-fb-error ml-1 h-2 w-2 rounded-full" />
						)}
					</TabsTrigger>
					<TabsTrigger
						value="tags"
						className={cn(
							hasTagErrors && "text-fb-error data-[state=active]:text-fb-error"
						)}
					>
						Tags
						{hasTagErrors && (
							<span className="bg-fb-error ml-1 h-2 w-2 rounded-full" />
						)}
					</TabsTrigger>
				</TabsList>

				{/* Basic Info Tab */}
				<TabsContent value="basic" className="space-y-m-500 pt-m-500">
					{/* Direction Toggle */}
					<div className="space-y-s-200">
						<Label>Direction</Label>
						<div className="gap-m-400 flex">
							<button
								type="button"
								onClick={() => setValue("direction", "long")}
								className={cn(
									"gap-s-200 p-m-400 flex flex-1 items-center justify-center rounded-lg border-2 transition-colors",
									direction === "long"
										? "border-trade-buy bg-trade-buy/10 text-trade-buy"
										: "border-bg-300 text-txt-200 hover:border-trade-buy/50"
								)}
							>
								<ArrowUpRight className="h-5 w-5" />
								<span className="font-medium">Long</span>
							</button>
							<button
								type="button"
								onClick={() => setValue("direction", "short")}
								className={cn(
									"gap-s-200 p-m-400 flex flex-1 items-center justify-center rounded-lg border-2 transition-colors",
									direction === "short"
										? "border-trade-sell bg-trade-sell/10 text-trade-sell"
										: "border-bg-300 text-txt-200 hover:border-trade-sell/50"
								)}
							>
								<ArrowDownRight className="h-5 w-5" />
								<span className="font-medium">Short</span>
							</button>
						</div>
					</div>

					{/* Asset and Timeframe */}
					<div className="gap-m-400 grid grid-cols-2">
						<FormField
							control={form.control}
							name="asset"
							render={({ field }) => (
								<FormItem>
									<div className="gap-s-200 flex items-center">
										<FormLabel>Asset *</FormLabel>
										{selectedAsset && (
											<Tooltip>
												<TooltipTrigger asChild>
													<Info className="text-txt-300 h-4 w-4" />
												</TooltipTrigger>
												<TooltipContent>
													<div className="text-tiny space-y-1">
														<p>
															<span className="text-txt-300">Type:</span>{" "}
															{selectedAsset.assetType.name}
														</p>
														<p>
															<span className="text-txt-300">Tick Size:</span>{" "}
															{parseFloat(selectedAsset.tickSize)}
														</p>
														<p>
															<span className="text-txt-300">Tick Value:</span>{" "}
															{selectedAsset.currency}{" "}
															{fromCents(selectedAsset.tickValue)}
														</p>
													</div>
												</TooltipContent>
											</Tooltip>
										)}
									</div>
									<Select
										value={field.value || ""}
										onValueChange={(value) => {
											field.onChange(value)
											const asset = assets.find((a) => a.symbol === value)
											setSelectedAsset(asset ?? null)
										}}
										disabled={!hasConfiguredAssets}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														hasConfiguredAssets
															? "Select asset"
															: "No assets configured"
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{assets.map((asset) => (
												<SelectItem key={asset.id} value={asset.symbol}>
													<span className="font-mono">{asset.symbol}</span>
													<span className="text-txt-300 ml-2">{asset.name}</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{!hasConfiguredAssets && (
										<p className="text-tiny text-txt-300">
											Add assets in{" "}
											<a href="/settings" className="text-acc-100 hover:underline">
												Settings → Assets
											</a>
										</p>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="timeframeId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Timeframe</FormLabel>
									<Select
										value={field.value || ""}
										onValueChange={(value) => field.onChange(value || null)}
										disabled={!hasConfiguredTimeframes}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder={hasConfiguredTimeframes ? "Select timeframe" : "No timeframes configured"} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{configuredTimeframes.map((tf) => (
												<SelectItem key={tf.id} value={tf.id}>
													{tf.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{!hasConfiguredTimeframes && (
										<p className="text-tiny text-txt-300">
											Add timeframes in{" "}
											<a href="/settings" className="text-acc-100 hover:underline">
												Settings → Timeframes
											</a>
										</p>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Dates */}
					<div className="gap-m-400 grid grid-cols-2">
						<FormField
							control={form.control}
							name="entryDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Entry Date *</FormLabel>
									<FormControl>
										<Input
											type="datetime-local"
											value={typeof field.value === 'string' ? field.value : ''}
											onChange={field.onChange}
											onBlur={field.onBlur}
											name={field.name}
											ref={field.ref}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="exitDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Exit Date</FormLabel>
									<FormControl>
										<Input
											type="datetime-local"
											value={typeof field.value === 'string' ? field.value : ''}
											onChange={field.onChange}
											onBlur={field.onBlur}
											name={field.name}
											ref={field.ref}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Prices */}
					<div className="gap-m-400 grid grid-cols-2">
						<FormField
							control={form.control}
							name="entryPrice"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Entry Price *</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="any"
											placeholder="0.00"
											{...field}
											onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="exitPrice"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Exit Price</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="any"
											placeholder="0.00"
											{...field}
											value={field.value ?? ""}
											onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Position Size */}
					<FormField
						control={form.control}
						name="positionSize"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Position Size *</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="any"
										placeholder="Number of shares/contracts"
										{...field}
										onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Strategy */}
					{strategies.length > 0 && (
						<FormField
							control={form.control}
							name="strategyId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Strategy</FormLabel>
									<Select
										value={field.value || ""}
										onValueChange={field.onChange}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select strategy" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{strategies.map((strategy) => (
												<SelectItem key={strategy.id} value={strategy.id}>
													{strategy.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
				</TabsContent>

				{/* Risk Management Tab */}
				<TabsContent value="risk" className="space-y-m-500 pt-m-500">
					{/* Stop Loss and Take Profit */}
					<div className="gap-m-400 grid grid-cols-2">
						<FormField
							control={form.control}
							name="stopLoss"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Stop Loss</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="any"
											placeholder="0.00"
											{...field}
											value={field.value ?? ""}
											onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="takeProfit"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Take Profit</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="any"
											placeholder="0.00"
											{...field}
											value={field.value ?? ""}
											onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Risk Amount (can be calculated from SL or manually entered) */}
					<FormField
						control={form.control}
						name="riskAmount"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center gap-s-200">
									<FormLabel>Risk Amount ($)</FormLabel>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className="text-txt-300 h-4 w-4 cursor-help" />
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-tiny max-w-[200px]">
												Required for R-multiple calculation. Auto-calculated from stop loss, or enter manually if not using a stop loss.
											</p>
										</TooltipContent>
									</Tooltip>
								</div>
								<FormControl>
									<Input
										type="number"
										step="any"
										placeholder={calculatedRisk !== null ? calculatedRisk.toFixed(2) : "Enter risk amount"}
										{...field}
										value={field.value ?? (calculatedRisk !== null ? calculatedRisk.toFixed(2) : "")}
										onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
									/>
								</FormControl>
								<p className="text-tiny text-txt-300">
									{calculatedRisk !== null
										? "Auto-calculated from stop loss (you can override)"
										: "Enter your risk amount to calculate R-multiple"}
								</p>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Planned R-Multiple (calculated from TP/SL) */}
					<div className="space-y-s-200">
						<Label>Planned R Target</Label>
						<div className="border-bg-300 bg-bg-100 px-s-300 flex h-10 items-center rounded-md border">
							{calculatedPlannedR !== null ? (
								<span className="text-small text-txt-100 font-medium">
									{calculatedPlannedR.toFixed(2)}R
								</span>
							) : (
								<span className="text-small text-txt-300">
									Enter TP & SL to calculate
								</span>
							)}
						</div>
						<p className="text-tiny text-txt-300">
							Auto-calculated from take profit / stop loss ratio
						</p>
					</div>

					{/* MFE/MAE */}
					<div className="gap-m-400 grid grid-cols-2">
						<FormField
							control={form.control}
							name="mfe"
							render={({ field }) => (
								<FormItem>
									<FormLabel>MFE (Max Favorable)</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="any"
											placeholder="Best price during trade"
											{...field}
											value={field.value ?? ""}
											onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="mae"
							render={({ field }) => (
								<FormItem>
									<FormLabel>MAE (Max Adverse)</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="any"
											placeholder="Worst price during trade"
											{...field}
											value={field.value ?? ""}
											onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Contracts Executed (for fee calculation) */}
					<FormField
						control={form.control}
						name="contractsExecuted"
						render={({ field }) => (
							<FormItem>
								<div className="gap-s-200 flex items-center">
									<FormLabel>Contracts Executed</FormLabel>
									<Tooltip>
										<TooltipTrigger asChild>
											<Info className="text-txt-300 h-4 w-4" />
										</TooltipTrigger>
										<TooltipContent>
											<div className="text-tiny max-w-xs space-y-1">
												<p>Total contract executions including entry, exit, and any scaling.</p>
												<p>Default: Position Size × 2 (1 entry + 1 exit per contract)</p>
												<p>Increase if you scaled in/out during the trade.</p>
											</div>
										</TooltipContent>
									</Tooltip>
								</div>
								<FormControl>
									<Input
										type="number"
										step="1"
										placeholder={positionSize ? `${Number(positionSize) * 2} (default)` : "Auto-calculated"}
										{...field}
										value={field.value ?? ""}
										onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* P&L Preview */}
					{calculatedPnLResult !== null && (
						<div className="border-bg-300 bg-bg-200 p-m-400 rounded-lg border">
							<p className="text-small text-txt-300">Calculated P&L</p>
							<p
								className={cn(
									"text-h3 font-mono font-bold",
									calculatedPnLResult.netPnl >= 0
										? "text-trade-buy"
										: "text-trade-sell"
								)}
							>
								{calculatedPnLResult.netPnl >= 0 ? "+" : ""}
								{selectedAsset?.currency ?? "$"}
								{calculatedPnLResult.netPnl.toFixed(2)}
								{calculatedR !== null && (
									<span className="text-body ml-2">
										({calculatedR >= 0 ? "+" : ""}
										{calculatedR.toFixed(2)}R)
									</span>
								)}
							</p>
							{selectedAsset && calculatedPnLResult.ticksGained !== 0 && (
								<div className="mt-s-200 gap-m-400 text-tiny text-txt-300 flex">
									<span>
										{calculatedPnLResult.ticksGained.toFixed(1)} ticks
									</span>
									{calculatedPnLResult.totalCosts > 0 && (
										<span>
											Costs: {selectedAsset.currency}
											{calculatedPnLResult.totalCosts.toFixed(2)}
										</span>
									)}
								</div>
							)}
						</div>
					)}
				</TabsContent>

				{/* Journal Tab */}
				<TabsContent value="journal" className="space-y-m-500 pt-m-500">
					<FormField
						control={form.control}
						name="preTradeThoughts"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Pre-Trade Thoughts</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Why did I take this trade? What was my thesis?"
										rows={4}
										{...field}
										value={field.value || ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="postTradeReflection"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Post-Trade Reflection</FormLabel>
								<FormControl>
									<Textarea
										placeholder="How did I feel during the trade? What happened?"
										rows={4}
										{...field}
										value={field.value || ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="lessonLearned"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Lesson Learned</FormLabel>
								<FormControl>
									<Textarea
										placeholder="What can I learn from this trade?"
										rows={3}
										{...field}
										value={field.value || ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Compliance */}
					<div className="space-y-s-200">
						<Label>Did you follow your plan?</Label>
						<div className="gap-m-400 flex">
							<button
								type="button"
								onClick={() => setValue("followedPlan", true)}
								className={cn(
									"p-m-400 flex-1 rounded-lg border-2 text-center transition-colors",
									watch("followedPlan") === true
										? "border-trade-buy bg-trade-buy/10 text-trade-buy"
										: "border-bg-300 text-txt-200 hover:border-trade-buy/50"
								)}
							>
								Yes
							</button>
							<button
								type="button"
								onClick={() => setValue("followedPlan", false)}
								className={cn(
									"p-m-400 flex-1 rounded-lg border-2 text-center transition-colors",
									watch("followedPlan") === false
										? "border-trade-sell bg-trade-sell/10 text-trade-sell"
										: "border-bg-300 text-txt-200 hover:border-trade-sell/50"
								)}
							>
								No
							</button>
						</div>
					</div>

					{watch("followedPlan") === false && (
						<FormField
							control={form.control}
							name="disciplineNotes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>What went wrong?</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe the discipline breach..."
											rows={3}
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
				</TabsContent>

				{/* Tags Tab */}
				<TabsContent value="tags" className="space-y-m-500 pt-m-500">
					{/* Setup Tags */}
					{setupTags.length > 0 && (
						<div className="space-y-s-200">
							<Label>Setup Type</Label>
							<div className="gap-s-200 flex flex-wrap">
								{setupTags.map((tag) => (
									<button
										key={tag.id}
										type="button"
										onClick={() => handleTagToggle(tag.id)}
										className={cn(
											"px-m-400 py-s-200 text-small rounded-full border transition-colors",
											selectedTagIds.includes(tag.id)
												? "border-trade-buy bg-trade-buy/10 text-trade-buy"
												: "border-bg-300 text-txt-200 hover:border-trade-buy/50"
										)}
									>
										{tag.name}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Mistake Tags */}
					{mistakeTags.length > 0 && (
						<div className="space-y-s-200">
							<Label>Mistakes (if any)</Label>
							<div className="gap-s-200 flex flex-wrap">
								{mistakeTags.map((tag) => (
									<button
										key={tag.id}
										type="button"
										onClick={() => handleTagToggle(tag.id)}
										className={cn(
											"px-m-400 py-s-200 text-small rounded-full border transition-colors",
											selectedTagIds.includes(tag.id)
												? "border-warning bg-warning/10 text-warning"
												: "border-bg-300 text-txt-200 hover:border-warning/50"
										)}
									>
										{tag.name}
									</button>
								))}
							</div>
						</div>
					)}

					{tags.length === 0 && (
						<div className="border-bg-300 bg-bg-200 p-m-600 rounded-lg border text-center">
							<p className="text-txt-200">No tags available yet</p>
							<p className="mt-s-200 text-small text-txt-300">
								Create tags in the Analytics section
							</p>
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Submit Button */}
			<div className="gap-m-400 border-bg-300 pt-m-500 flex justify-end border-t">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</>
					) : (
						<>
							<Save className="mr-2 h-4 w-4" />
							{isEditing ? "Update Trade" : "Save Trade"}
						</>
					)}
				</Button>
			</div>
		</form>
		</Form>
	)
}
