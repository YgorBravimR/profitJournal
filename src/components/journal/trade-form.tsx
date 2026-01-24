"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowUpRight, ArrowDownRight, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createTradeSchema, type TradeFormInput } from "@/lib/validations/trade"
import { createTrade, updateTrade } from "@/app/actions/trades"
import { calculatePnL, calculateRMultiple } from "@/lib/calculations"
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
import type { Trade, Strategy, Tag } from "@/db/schema"

interface TradeFormProps {
	trade?: Trade & {
		tradeTags?: Array<{ tag: Tag }>
	}
	strategies?: Strategy[]
	tags?: Tag[]
	onSuccess?: () => void
}

const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"] as const

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
	onSuccess,
}: TradeFormProps) => {
	const router = useRouter()
	const { showToast } = useToast()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const isEditing = !!trade

	const defaultValues: Partial<TradeFormInput> = trade
		? {
				asset: trade.asset,
				direction: trade.direction,
				timeframe: trade.timeframe ?? undefined,
				entryDate: formatDateTimeLocal(new Date(trade.entryDate)),
				exitDate: trade.exitDate
					? formatDateTimeLocal(new Date(trade.exitDate))
					: undefined,
				entryPrice: Number(trade.entryPrice),
				exitPrice: trade.exitPrice ? Number(trade.exitPrice) : undefined,
				positionSize: Number(trade.positionSize),
				stopLoss: trade.stopLoss ? Number(trade.stopLoss) : undefined,
				takeProfit: trade.takeProfit ? Number(trade.takeProfit) : undefined,
				// plannedRiskAmount and plannedRMultiple are auto-calculated, not stored in form
				pnl: trade.pnl ? Number(trade.pnl) : undefined,
				mfe: trade.mfe ? Number(trade.mfe) : undefined,
				mae: trade.mae ? Number(trade.mae) : undefined,
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

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<TradeFormInput>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(createTradeSchema) as any,
		defaultValues,
	})

	const direction = watch("direction")
	const entryPrice = watch("entryPrice")
	const exitPrice = watch("exitPrice")
	const positionSize = watch("positionSize")
	const stopLoss = watch("stopLoss")
	const takeProfit = watch("takeProfit")
	const selectedTagIds = watch("tagIds") || []

	// Auto-calculate planned risk from stop loss (always derived, never user input)
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

	// Calculate P&L preview (fees applied from settings in future)
	const calculatedPnL =
		entryPrice && exitPrice && positionSize
			? calculatePnL({
					direction: direction || "long",
					entryPrice: Number(entryPrice),
					exitPrice: Number(exitPrice),
					positionSize: Number(positionSize),
				})
			: null

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

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-m-600">
			<Tabs defaultValue="basic" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="basic">Basic</TabsTrigger>
					<TabsTrigger value="risk">Risk</TabsTrigger>
					<TabsTrigger value="journal">Journal</TabsTrigger>
					<TabsTrigger value="tags">Tags</TabsTrigger>
				</TabsList>

				{/* Basic Info Tab */}
				<TabsContent value="basic" className="space-y-m-500 pt-m-500">
					{/* Direction Toggle */}
					<div className="space-y-s-200">
						<Label>Direction</Label>
						<div className="flex gap-m-400">
							<button
								type="button"
								onClick={() => setValue("direction", "long")}
								className={cn(
									"flex flex-1 items-center justify-center gap-s-200 rounded-lg border-2 p-m-400 transition-colors",
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
									"flex flex-1 items-center justify-center gap-s-200 rounded-lg border-2 p-m-400 transition-colors",
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
					<div className="grid grid-cols-2 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="asset">Asset *</Label>
							<Input
								id="asset"
								placeholder="NVDA, SPY, BTC..."
								className="uppercase"
								{...register("asset")}
							/>
							{errors.asset && (
								<p className="text-tiny text-fb-error">{errors.asset.message}</p>
							)}
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="timeframe">Timeframe</Label>
							<Select
								value={watch("timeframe") || ""}
								onValueChange={(value) =>
									setValue("timeframe", value as (typeof timeframes)[number])
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select timeframe" />
								</SelectTrigger>
								<SelectContent>
									{timeframes.map((tf) => (
										<SelectItem key={tf} value={tf}>
											{tf}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Dates */}
					<div className="grid grid-cols-2 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="entryDate">Entry Date *</Label>
							<Input
								id="entryDate"
								type="datetime-local"
								{...register("entryDate")}
							/>
							{errors.entryDate && (
								<p className="text-tiny text-fb-error">
									{errors.entryDate.message}
								</p>
							)}
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="exitDate">Exit Date</Label>
							<Input
								id="exitDate"
								type="datetime-local"
								{...register("exitDate")}
							/>
						</div>
					</div>

					{/* Prices */}
					<div className="grid grid-cols-2 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="entryPrice">Entry Price *</Label>
							<Input
								id="entryPrice"
								type="number"
								step="any"
								placeholder="0.00"
								{...register("entryPrice")}
							/>
							{errors.entryPrice && (
								<p className="text-tiny text-fb-error">
									{errors.entryPrice.message}
								</p>
							)}
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="exitPrice">Exit Price</Label>
							<Input
								id="exitPrice"
								type="number"
								step="any"
								placeholder="0.00"
								{...register("exitPrice")}
							/>
						</div>
					</div>

					{/* Position Size */}
					<div className="space-y-s-200">
						<Label htmlFor="positionSize">Position Size *</Label>
						<Input
							id="positionSize"
							type="number"
							step="any"
							placeholder="Number of shares/contracts"
							{...register("positionSize")}
						/>
						{errors.positionSize && (
							<p className="text-tiny text-fb-error">
								{errors.positionSize.message}
							</p>
						)}
					</div>

					{/* Strategy */}
					{strategies.length > 0 && (
						<div className="space-y-s-200">
							<Label htmlFor="strategyId">Strategy</Label>
							<Select
								value={watch("strategyId") || ""}
								onValueChange={(value) => setValue("strategyId", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select strategy" />
								</SelectTrigger>
								<SelectContent>
									{strategies.map((strategy) => (
										<SelectItem key={strategy.id} value={strategy.id}>
											{strategy.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</TabsContent>

				{/* Risk Management Tab */}
				<TabsContent value="risk" className="space-y-m-500 pt-m-500">
					{/* Stop Loss and Take Profit */}
					<div className="grid grid-cols-2 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="stopLoss">Stop Loss</Label>
							<Input
								id="stopLoss"
								type="number"
								step="any"
								placeholder="0.00"
								{...register("stopLoss")}
							/>
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="takeProfit">Take Profit</Label>
							<Input
								id="takeProfit"
								type="number"
								step="any"
								placeholder="0.00"
								{...register("takeProfit")}
							/>
						</div>
					</div>

					{/* Planned Risk (calculated from SL) */}
					<div className="space-y-s-200">
						<Label>Planned Risk ($)</Label>
						<div className="flex h-10 items-center rounded-md border border-bg-300 bg-bg-100 px-s-300">
							{calculatedRisk !== null ? (
								<span className="text-small font-medium text-txt-100">
									${calculatedRisk.toFixed(2)}
								</span>
							) : (
								<span className="text-small text-txt-300">
									Enter stop loss to calculate
								</span>
							)}
						</div>
						<p className="text-tiny text-txt-300">
							Auto-calculated from entry, stop loss, and position size
						</p>
					</div>

					{/* Planned R-Multiple (calculated from TP/SL) */}
					<div className="space-y-s-200">
						<Label>Planned R Target</Label>
						<div className="flex h-10 items-center rounded-md border border-bg-300 bg-bg-100 px-s-300">
							{calculatedPlannedR !== null ? (
								<span className="text-small font-medium text-txt-100">
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
					<div className="grid grid-cols-2 gap-m-400">
						<div className="space-y-s-200">
							<Label htmlFor="mfe">MFE (Max Favorable)</Label>
							<Input
								id="mfe"
								type="number"
								step="any"
								placeholder="Best price during trade"
								{...register("mfe")}
							/>
						</div>
						<div className="space-y-s-200">
							<Label htmlFor="mae">MAE (Max Adverse)</Label>
							<Input
								id="mae"
								type="number"
								step="any"
								placeholder="Worst price during trade"
								{...register("mae")}
							/>
						</div>
					</div>

					{/* P&L Preview */}
					{calculatedPnL !== null && (
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
							<p className="text-small text-txt-300">Calculated P&L</p>
							<p
								className={cn(
									"font-mono text-h3 font-bold",
									calculatedPnL >= 0 ? "text-trade-buy" : "text-trade-sell"
								)}
							>
								{calculatedPnL >= 0 ? "+" : ""}${calculatedPnL.toFixed(2)}
								{calculatedR !== null && (
									<span className="ml-2 text-body">
										({calculatedR >= 0 ? "+" : ""}
										{calculatedR.toFixed(2)}R)
									</span>
								)}
							</p>
						</div>
					)}
				</TabsContent>

				{/* Journal Tab */}
				<TabsContent value="journal" className="space-y-m-500 pt-m-500">
					<div className="space-y-s-200">
						<Label htmlFor="preTradeThoughts">Pre-Trade Thoughts</Label>
						<Textarea
							id="preTradeThoughts"
							placeholder="Why did I take this trade? What was my thesis?"
							rows={4}
							{...register("preTradeThoughts")}
						/>
					</div>

					<div className="space-y-s-200">
						<Label htmlFor="postTradeReflection">Post-Trade Reflection</Label>
						<Textarea
							id="postTradeReflection"
							placeholder="How did I feel during the trade? What happened?"
							rows={4}
							{...register("postTradeReflection")}
						/>
					</div>

					<div className="space-y-s-200">
						<Label htmlFor="lessonLearned">Lesson Learned</Label>
						<Textarea
							id="lessonLearned"
							placeholder="What can I learn from this trade?"
							rows={3}
							{...register("lessonLearned")}
						/>
					</div>

					{/* Compliance */}
					<div className="space-y-s-200">
						<Label>Did you follow your plan?</Label>
						<div className="flex gap-m-400">
							<button
								type="button"
								onClick={() => setValue("followedPlan", true)}
								className={cn(
									"flex-1 rounded-lg border-2 p-m-400 text-center transition-colors",
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
									"flex-1 rounded-lg border-2 p-m-400 text-center transition-colors",
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
						<div className="space-y-s-200">
							<Label htmlFor="disciplineNotes">What went wrong?</Label>
							<Textarea
								id="disciplineNotes"
								placeholder="Describe the discipline breach..."
								rows={3}
								{...register("disciplineNotes")}
							/>
						</div>
					)}
				</TabsContent>

				{/* Tags Tab */}
				<TabsContent value="tags" className="space-y-m-500 pt-m-500">
					{/* Setup Tags */}
					{setupTags.length > 0 && (
						<div className="space-y-s-200">
							<Label>Setup Type</Label>
							<div className="flex flex-wrap gap-s-200">
								{setupTags.map((tag) => (
									<button
										key={tag.id}
										type="button"
										onClick={() => handleTagToggle(tag.id)}
										className={cn(
											"rounded-full border px-m-400 py-s-200 text-small transition-colors",
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
							<div className="flex flex-wrap gap-s-200">
								{mistakeTags.map((tag) => (
									<button
										key={tag.id}
										type="button"
										onClick={() => handleTagToggle(tag.id)}
										className={cn(
											"rounded-full border px-m-400 py-s-200 text-small transition-colors",
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
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-600 text-center">
							<p className="text-txt-200">No tags available yet</p>
							<p className="mt-s-200 text-small text-txt-300">
								Create tags in the Analytics section
							</p>
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Submit Button */}
			<div className="flex justify-end gap-m-400 border-t border-bg-300 pt-m-500">
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
	)
}
