"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, ArrowDownRight, Save, Loader2, Plus, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { createScaledTrade } from "@/app/actions/trades"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { InlineExecutionRow, type ExecutionRowData } from "./inline-execution-row"
import type { Strategy, Tag, Timeframe } from "@/db/schema"
import type { AssetWithType } from "@/app/actions/assets"
import { format } from "date-fns"

interface ScaledTradeFormProps {
	strategies?: Strategy[]
	tags?: Tag[]
	assets?: AssetWithType[]
	timeframes?: Timeframe[]
	onSuccess?: () => void
	onModeChange?: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const createEmptyExecution = (type: "entry" | "exit"): ExecutionRowData => ({
	id: generateId(),
	executionType: type,
	date: format(new Date(), "yyyy-MM-dd"),
	time: format(new Date(), "HH:mm"),
	price: "",
	quantity: "",
	commission: "0",
})

export const ScaledTradeForm = ({
	strategies = [],
	tags = [],
	assets = [],
	timeframes: configuredTimeframes = [],
	onSuccess,
	onModeChange,
}: ScaledTradeFormProps) => {
	const router = useRouter()
	const { showToast } = useToast()
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Basic info
	const [asset, setAsset] = useState("")
	const [direction, setDirection] = useState<"long" | "short">("long")
	const [timeframeId, setTimeframeId] = useState<string | null>(null)
	const [strategyId, setStrategyId] = useState<string | null>(null)

	// Risk management
	const [stopLoss, setStopLoss] = useState("")
	const [takeProfit, setTakeProfit] = useState("")
	const [riskAmount, setRiskAmount] = useState("")

	// Journal
	const [preTradeThoughts, setPreTradeThoughts] = useState("")
	const [postTradeReflection, setPostTradeReflection] = useState("")
	const [lessonLearned, setLessonLearned] = useState("")
	const [followedPlan, setFollowedPlan] = useState<boolean | undefined>()
	const [disciplineNotes, setDisciplineNotes] = useState("")

	// Tags
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

	// Executions
	const [entries, setEntries] = useState<ExecutionRowData[]>([
		createEmptyExecution("entry"),
	])
	const [exits, setExits] = useState<ExecutionRowData[]>([])

	const selectedAsset = useMemo(
		() => assets.find((a) => a.symbol === asset) ?? null,
		[assets, asset]
	)

	const hasConfiguredAssets = assets.length > 0
	const hasConfiguredTimeframes = configuredTimeframes.length > 0

	// Calculate position summary
	const positionSummary = useMemo(() => {
		const validEntries = entries.filter(
			(e) => e.price && e.quantity && parseFloat(e.price) > 0 && parseFloat(e.quantity) > 0
		)
		const validExits = exits.filter(
			(e) => e.price && e.quantity && parseFloat(e.price) > 0 && parseFloat(e.quantity) > 0
		)

		const totalEntryQty = validEntries.reduce((sum, e) => sum + parseFloat(e.quantity), 0)
		const totalExitQty = validExits.reduce((sum, e) => sum + parseFloat(e.quantity), 0)

		const avgEntryPrice =
			totalEntryQty > 0
				? validEntries.reduce(
						(sum, e) => sum + parseFloat(e.price) * parseFloat(e.quantity),
						0
					) / totalEntryQty
				: 0

		const avgExitPrice =
			totalExitQty > 0
				? validExits.reduce(
						(sum, e) => sum + parseFloat(e.price) * parseFloat(e.quantity),
						0
					) / totalExitQty
				: 0

		const totalCommission =
			[...validEntries, ...validExits].reduce(
				(sum, e) => sum + (parseFloat(e.commission) || 0),
				0
			)

		// Calculate P&L
		let grossPnl = 0
		if (totalExitQty > 0 && avgEntryPrice > 0 && avgExitPrice > 0) {
			const priceDiff = direction === "long" ? avgExitPrice - avgEntryPrice : avgEntryPrice - avgExitPrice
			// Use the smaller of entry/exit qty for closed P&L
			const closedQty = Math.min(totalEntryQty, totalExitQty)

			if (selectedAsset) {
				// Use tick-based calculation
				const tickSize = parseFloat(selectedAsset.tickSize)
				const tickValue = fromCents(selectedAsset.tickValue)
				const ticks = priceDiff / tickSize
				grossPnl = ticks * tickValue * closedQty
			} else {
				grossPnl = priceDiff * closedQty
			}
		}

		const netPnl = grossPnl - totalCommission

		// Determine position status
		let status: "open" | "partial" | "closed" = "open"
		if (totalExitQty >= totalEntryQty && totalEntryQty > 0) {
			status = "closed"
		} else if (totalExitQty > 0 && totalExitQty < totalEntryQty) {
			status = "partial"
		}

		return {
			totalEntryQty,
			totalExitQty,
			avgEntryPrice,
			avgExitPrice,
			totalCommission,
			grossPnl,
			netPnl,
			status,
			validEntries: validEntries.length,
			validExits: validExits.length,
		}
	}, [entries, exits, direction, selectedAsset])

	// Calculate R-multiple
	const calculatedR = useMemo(() => {
		const risk = parseFloat(riskAmount) || 0
		if (risk <= 0 || positionSummary.netPnl === 0) return null
		return positionSummary.netPnl / risk
	}, [riskAmount, positionSummary.netPnl])

	const handleExecutionChange = useCallback(
		(
			type: "entry" | "exit",
			id: string,
			field: keyof ExecutionRowData,
			value: string
		) => {
			const setter = type === "entry" ? setEntries : setExits
			setter((prev) =>
				prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
			)
		},
		[]
	)

	const handleAddExecution = useCallback((type: "entry" | "exit") => {
		const setter = type === "entry" ? setEntries : setExits
		setter((prev) => [...prev, createEmptyExecution(type)])
	}, [])

	const handleRemoveExecution = useCallback((type: "entry" | "exit", id: string) => {
		const setter = type === "entry" ? setEntries : setExits
		setter((prev) => prev.filter((e) => e.id !== id))
	}, [])

	const handleTagToggle = (tagId: string) => {
		setSelectedTagIds((prev) =>
			prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			// Validate basic info
			if (!asset) {
				showToast("error", "Please select an asset")
				setIsSubmitting(false)
				return
			}

			if (positionSummary.validEntries === 0) {
				showToast("error", "Please add at least one entry execution")
				setIsSubmitting(false)
				return
			}

			// Build executions array
			const executions = [
				...entries
					.filter((e) => e.price && e.quantity)
					.map((e) => ({
						executionType: "entry" as const,
						executionDate: new Date(`${e.date}T${e.time}`),
						price: parseFloat(e.price),
						quantity: parseFloat(e.quantity),
						commission: parseFloat(e.commission) || 0,
					})),
				...exits
					.filter((e) => e.price && e.quantity)
					.map((e) => ({
						executionType: "exit" as const,
						executionDate: new Date(`${e.date}T${e.time}`),
						price: parseFloat(e.price),
						quantity: parseFloat(e.quantity),
						commission: parseFloat(e.commission) || 0,
					})),
			]

			const result = await createScaledTrade({
				asset,
				direction,
				timeframeId: timeframeId || undefined,
				strategyId: strategyId || undefined,
				stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
				takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
				riskAmount: riskAmount ? parseFloat(riskAmount) : undefined,
				preTradeThoughts: preTradeThoughts || undefined,
				postTradeReflection: postTradeReflection || undefined,
				lessonLearned: lessonLearned || undefined,
				followedPlan,
				disciplineNotes: disciplineNotes || undefined,
				tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
				executions,
			})

			if (result.status === "success") {
				showToast("success", "Scaled trade created successfully")
				onSuccess?.()
				router.push("/journal")
			} else {
				showToast("error", result.message || "Failed to create trade")
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
		<form onSubmit={handleSubmit} className="space-y-m-600">
			<Tabs defaultValue="executions" className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="executions">Executions</TabsTrigger>
					<TabsTrigger value="basic">Basic Info</TabsTrigger>
					<TabsTrigger value="journal">Journal</TabsTrigger>
					<TabsTrigger value="tags">Tags</TabsTrigger>
				</TabsList>

				{/* Executions Tab */}
				<TabsContent value="executions" className="space-y-m-500 pt-m-500">
					{/* Direction Toggle */}
					<div className="space-y-s-200">
						<Label>Direction</Label>
						<div className="flex gap-m-400">
							<button
								type="button"
								onClick={() => setDirection("long")}
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
								onClick={() => setDirection("short")}
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

					{/* Asset */}
					<div className="space-y-s-200">
						<div className="flex items-center gap-s-200">
							<Label>Asset *</Label>
							{selectedAsset && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Info className="h-4 w-4 text-txt-300" />
									</TooltipTrigger>
									<TooltipContent>
										<div className="space-y-1 text-tiny">
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
							value={asset}
							onValueChange={setAsset}
							disabled={!hasConfiguredAssets}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										hasConfiguredAssets ? "Select asset" : "No assets configured"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{assets.map((a) => (
									<SelectItem key={a.id} value={a.symbol}>
										<span className="font-mono">{a.symbol}</span>
										<span className="ml-2 text-txt-300">{a.name}</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Entries Section */}
					<div className="space-y-s-300">
						<div className="flex items-center justify-between">
							<Label className="text-trade-buy">Entries</Label>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => handleAddExecution("entry")}
								className="h-7 text-tiny"
							>
								<Plus className="mr-1 h-3 w-3" />
								Add Entry
							</Button>
						</div>

						<div className="space-y-s-200">
							{/* Header */}
							<div className="grid grid-cols-[1fr_80px_100px_100px_80px_40px] gap-s-200 text-tiny text-txt-300">
								<span>Date</span>
								<span>Time</span>
								<span>Price</span>
								<span>Quantity</span>
								<span>Comm.</span>
								<span></span>
							</div>

							{entries.map((entry) => (
								<InlineExecutionRow
									key={entry.id}
									data={entry}
									onChange={(id, field, value) =>
										handleExecutionChange("entry", id, field, value)
									}
									onRemove={(id) => handleRemoveExecution("entry", id)}
									canRemove={entries.length > 1}
									currency={selectedAsset?.currency ?? "$"}
								/>
							))}
						</div>

						{positionSummary.totalEntryQty > 0 && (
							<p className="text-small text-txt-200">
								Total: {positionSummary.totalEntryQty} contracts @{" "}
								<span className="font-mono">
									{positionSummary.avgEntryPrice.toFixed(2)}
								</span>{" "}
								avg
							</p>
						)}
					</div>

					{/* Exits Section */}
					<div className="space-y-s-300">
						<div className="flex items-center justify-between">
							<Label className="text-trade-sell">Exits</Label>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => handleAddExecution("exit")}
								className="h-7 text-tiny"
							>
								<Plus className="mr-1 h-3 w-3" />
								Add Exit
							</Button>
						</div>

						{exits.length > 0 ? (
							<div className="space-y-s-200">
								{/* Header */}
								<div className="grid grid-cols-[1fr_80px_100px_100px_80px_40px] gap-s-200 text-tiny text-txt-300">
									<span>Date</span>
									<span>Time</span>
									<span>Price</span>
									<span>Quantity</span>
									<span>Comm.</span>
									<span></span>
								</div>

								{exits.map((exit) => (
									<InlineExecutionRow
										key={exit.id}
										data={exit}
										onChange={(id, field, value) =>
											handleExecutionChange("exit", id, field, value)
										}
										onRemove={(id) => handleRemoveExecution("exit", id)}
										canRemove={true}
										currency={selectedAsset?.currency ?? "$"}
									/>
								))}
							</div>
						) : (
							<div className="rounded-lg border border-dashed border-bg-300 p-m-400 text-center">
								<p className="text-small text-txt-300">
									No exits yet - position is open
								</p>
							</div>
						)}

						{positionSummary.totalExitQty > 0 && (
							<p className="text-small text-txt-200">
								Total: {positionSummary.totalExitQty} contracts @{" "}
								<span className="font-mono">
									{positionSummary.avgExitPrice.toFixed(2)}
								</span>{" "}
								avg
							</p>
						)}
					</div>

					{/* Position Summary */}
					{positionSummary.validEntries > 0 && (
						<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-400">
							<p className="text-small font-medium text-txt-100">Position Summary</p>
							<div className="mt-s-300 grid grid-cols-4 gap-m-300 text-small">
								<div>
									<p className="text-tiny text-txt-300">Status</p>
									<p
										className={cn(
											"font-medium",
											positionSummary.status === "closed"
												? "text-txt-100"
												: positionSummary.status === "partial"
													? "text-warning"
													: "text-trade-buy"
										)}
									>
										{positionSummary.status.toUpperCase()}
									</p>
								</div>
								<div>
									<p className="text-tiny text-txt-300">Entries</p>
									<p className="font-medium text-txt-100">
										{positionSummary.validEntries} ({positionSummary.totalEntryQty})
									</p>
								</div>
								<div>
									<p className="text-tiny text-txt-300">Exits</p>
									<p className="font-medium text-txt-100">
										{positionSummary.validExits} ({positionSummary.totalExitQty})
									</p>
								</div>
								<div>
									<p className="text-tiny text-txt-300">Fees</p>
									<p className="font-medium text-txt-100">
										{selectedAsset?.currency ?? "$"}
										{positionSummary.totalCommission.toFixed(2)}
									</p>
								</div>
							</div>

							{positionSummary.status !== "open" && (
								<div className="mt-m-400 border-t border-bg-300 pt-m-400">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-tiny text-txt-300">Net P&L</p>
											<p
												className={cn(
													"text-h3 font-mono font-bold",
													positionSummary.netPnl >= 0
														? "text-trade-buy"
														: "text-trade-sell"
												)}
											>
												{positionSummary.netPnl >= 0 ? "+" : ""}
												{selectedAsset?.currency ?? "$"}
												{positionSummary.netPnl.toFixed(2)}
												{calculatedR !== null && (
													<span className="ml-2 text-body">
														({calculatedR >= 0 ? "+" : ""}
														{calculatedR.toFixed(2)}R)
													</span>
												)}
											</p>
										</div>
										<div className="text-right">
											<p className="text-tiny text-txt-300">Gross P&L</p>
											<p className="font-mono text-txt-100">
												{selectedAsset?.currency ?? "$"}
												{positionSummary.grossPnl.toFixed(2)}
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Risk Management */}
					<div className="space-y-m-400">
						<Label>Risk Management</Label>
						<div className="grid grid-cols-3 gap-m-400">
							<div className="space-y-s-200">
								<Label htmlFor="stopLoss" className="text-small text-txt-300">
									Stop Loss
								</Label>
								<Input
									id="stopLoss"
									type="number"
									step="any"
									placeholder="0.00"
									value={stopLoss}
									onChange={(e) => setStopLoss(e.target.value)}
								/>
							</div>
							<div className="space-y-s-200">
								<Label htmlFor="takeProfit" className="text-small text-txt-300">
									Take Profit
								</Label>
								<Input
									id="takeProfit"
									type="number"
									step="any"
									placeholder="0.00"
									value={takeProfit}
									onChange={(e) => setTakeProfit(e.target.value)}
								/>
							</div>
							<div className="space-y-s-200">
								<Label htmlFor="riskAmount" className="text-small text-txt-300">
									Risk Amount ($)
								</Label>
								<Input
									id="riskAmount"
									type="number"
									step="any"
									placeholder="0.00"
									value={riskAmount}
									onChange={(e) => setRiskAmount(e.target.value)}
								/>
							</div>
						</div>
					</div>
				</TabsContent>

				{/* Basic Info Tab */}
				<TabsContent value="basic" className="space-y-m-500 pt-m-500">
					<div className="grid grid-cols-2 gap-m-400">
						<div className="space-y-s-200">
							<Label>Timeframe</Label>
							<Select
								value={timeframeId || ""}
								onValueChange={(value) => setTimeframeId(value || null)}
								disabled={!hasConfiguredTimeframes}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={
											hasConfiguredTimeframes
												? "Select timeframe"
												: "No timeframes configured"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{configuredTimeframes.map((tf) => (
										<SelectItem key={tf.id} value={tf.id}>
											{tf.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{strategies.length > 0 && (
							<div className="space-y-s-200">
								<Label>Strategy</Label>
								<Select
									value={strategyId || ""}
									onValueChange={(value) => setStrategyId(value || null)}
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
					</div>

					{/* Switch to simple mode */}
					<div className="rounded-lg border border-bg-300 bg-bg-100 p-m-400">
						<p className="text-small text-txt-200">
							Need a simple single entry/exit trade?
						</p>
						<Button
							type="button"
							variant="link"
							className="h-auto p-0 text-brand-500"
							onClick={onModeChange}
						>
							Switch to Simple Mode
						</Button>
					</div>
				</TabsContent>

				{/* Journal Tab */}
				<TabsContent value="journal" className="space-y-m-500 pt-m-500">
					<div className="space-y-s-200">
						<Label htmlFor="preTradeThoughts">Pre-Trade Thoughts</Label>
						<Textarea
							id="preTradeThoughts"
							placeholder="Why did I take this trade? What was my thesis?"
							rows={4}
							value={preTradeThoughts}
							onChange={(e) => setPreTradeThoughts(e.target.value)}
						/>
					</div>

					<div className="space-y-s-200">
						<Label htmlFor="postTradeReflection">Post-Trade Reflection</Label>
						<Textarea
							id="postTradeReflection"
							placeholder="How did I feel during the trade? What happened?"
							rows={4}
							value={postTradeReflection}
							onChange={(e) => setPostTradeReflection(e.target.value)}
						/>
					</div>

					<div className="space-y-s-200">
						<Label htmlFor="lessonLearned">Lesson Learned</Label>
						<Textarea
							id="lessonLearned"
							placeholder="What can I learn from this trade?"
							rows={3}
							value={lessonLearned}
							onChange={(e) => setLessonLearned(e.target.value)}
						/>
					</div>

					{/* Compliance */}
					<div className="space-y-s-200">
						<Label>Did you follow your plan?</Label>
						<div className="flex gap-m-400">
							<button
								type="button"
								onClick={() => setFollowedPlan(true)}
								className={cn(
									"flex-1 rounded-lg border-2 p-m-400 text-center transition-colors",
									followedPlan === true
										? "border-trade-buy bg-trade-buy/10 text-trade-buy"
										: "border-bg-300 text-txt-200 hover:border-trade-buy/50"
								)}
							>
								Yes
							</button>
							<button
								type="button"
								onClick={() => setFollowedPlan(false)}
								className={cn(
									"flex-1 rounded-lg border-2 p-m-400 text-center transition-colors",
									followedPlan === false
										? "border-trade-sell bg-trade-sell/10 text-trade-sell"
										: "border-bg-300 text-txt-200 hover:border-trade-sell/50"
								)}
							>
								No
							</button>
						</div>
					</div>

					{followedPlan === false && (
						<div className="space-y-s-200">
							<Label htmlFor="disciplineNotes">What went wrong?</Label>
							<Textarea
								id="disciplineNotes"
								placeholder="Describe the discipline breach..."
								rows={3}
								value={disciplineNotes}
								onChange={(e) => setDisciplineNotes(e.target.value)}
							/>
						</div>
					)}
				</TabsContent>

				{/* Tags Tab */}
				<TabsContent value="tags" className="space-y-m-500 pt-m-500">
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
							Creating...
						</>
					) : (
						<>
							<Save className="mr-2 h-4 w-4" />
							Create Scaled Trade
						</>
					)}
				</Button>
			</div>
		</form>
	)
}
