"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { deleteExecution } from "@/app/actions/executions"
import type { TradeExecution } from "@/db/schema"
import { Plus, ArrowUp, ArrowDown, Trash2, Pencil, Loader2 } from "lucide-react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ExecutionListProps {
	executions: TradeExecution[]
	direction: "long" | "short"
	onAddExecution: () => void
	onEditExecution: (execution: TradeExecution) => void
	onExecutionDeleted?: () => void
	className?: string
}

export const ExecutionList = ({
	executions,
	direction,
	onAddExecution,
	onEditExecution,
	onExecutionDeleted,
	className,
}: ExecutionListProps) => {
	const t = useTranslations("execution")
	const tCommon = useTranslations("common")
	const [isPending, startTransition] = useTransition()
	const [deletingId, setDeletingId] = useState<string | null>(null)

	// Sort all executions chronologically (no entry/exit grouping)
	const sortedExecutions = executions.toSorted(
		(a, b) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime()
	)

	// Calculate totals
	const entries = executions.filter((e) => e.executionType === "entry")
	const exits = executions.filter((e) => e.executionType === "exit")
	const totalEntryQty = entries.reduce((sum, e) => sum + Number(e.quantity), 0)
	const totalExitQty = exits.reduce((sum, e) => sum + Number(e.quantity), 0)

	// Calculate average prices
	const avgEntryPrice =
		totalEntryQty > 0
			? entries.reduce((sum, e) => sum + Number(e.price) * Number(e.quantity), 0) /
			  totalEntryQty
			: 0

	const avgExitPrice =
		totalExitQty > 0
			? exits.reduce((sum, e) => sum + Number(e.price) * Number(e.quantity), 0) /
			  totalExitQty
			: 0

	const handleDelete = (id: string) => {
		setDeletingId(id)
		startTransition(async () => {
			const result = await deleteExecution(id)
			if (result.status === "success") {
				onExecutionDeleted?.()
			}
			setDeletingId(null)
		})
	}

	const formatPrice = (price: string | number) => {
		const num = typeof price === "string" ? parseFloat(price) : price
		return num.toLocaleString("pt-BR", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	}

	const formatQuantity = (qty: string | number) => {
		const num = typeof qty === "string" ? parseFloat(qty) : qty
		return num.toLocaleString("pt-BR", {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		})
	}

	return (
		<div className={cn("space-y-m-400", className)}>
			<div className="flex items-center justify-between">
				<h3 className="text-body font-semibold text-txt-100">{t("title")}</h3>
				<Button variant="outline" size="sm" onClick={onAddExecution}>
					<Plus className="mr-1 h-4 w-4" />
					{t("add")}
				</Button>
			</div>

			{executions.length === 0 ? (
				<div className="rounded-lg border border-stroke-100 bg-bg-200 p-m-400 text-center">
					<p className="text-small text-txt-300">{t("noExecutions")}</p>
					<Button
						variant="ghost"
						size="sm"
						className="mt-s-200"
						onClick={onAddExecution}
					>
						<Plus className="mr-1 h-4 w-4" />
						{t("addFirst")}
					</Button>
				</div>
			) : (
				<div className="space-y-m-300">
					{/* Chronological Execution List */}
					<div className="flex items-center gap-m-300 text-small text-txt-300">
						<span>{t("entries")}: {entries.length}</span>
						<span>{t("exits")}: {exits.length}</span>
					</div>
					<div className="space-y-s-200">
						{sortedExecutions.map((execution) => (
							<ExecutionRow
								key={execution.id}
								execution={execution}
								type={execution.executionType as "entry" | "exit"}
								onEdit={() => onEditExecution(execution)}
								onDelete={() => handleDelete(execution.id)}
								isDeleting={deletingId === execution.id}
								formatPrice={formatPrice}
								formatQuantity={formatQuantity}
								t={t}
								tCommon={tCommon}
							/>
						))}
					</div>

					{/* Summary */}
					<div className="rounded-lg border border-stroke-100 bg-bg-200 p-m-300">
						<div className="grid grid-cols-2 gap-m-300 text-small">
							<div>
								<span className="text-txt-300">{t("totalIn")}:</span>
								<span className="ml-s-200 font-mono tabular-nums text-txt-100">
									{formatQuantity(totalEntryQty)}
								</span>
							</div>
							<div>
								<span className="text-txt-300">{t("totalOut")}:</span>
								<span className="ml-s-200 font-mono tabular-nums text-txt-100">
									{formatQuantity(totalExitQty)}
								</span>
							</div>
							<div>
								<span className="text-txt-300">{t("avgEntry")}:</span>
								<span className="ml-s-200 font-mono tabular-nums text-txt-100">
									{formatPrice(avgEntryPrice)}
								</span>
							</div>
							<div>
								<span className="text-txt-300">{t("avgExit")}:</span>
								<span className="ml-s-200 font-mono tabular-nums text-txt-100">
									{totalExitQty > 0 ? formatPrice(avgExitPrice) : "-"}
								</span>
							</div>
							<div className="col-span-2">
								<span className="text-txt-300">{t("remaining")}:</span>
								<span
									className={cn(
										"ml-s-200 font-mono tabular-nums font-semibold",
										totalEntryQty - totalExitQty > 0
											? "text-fb-warning"
											: "text-trade-buy"
									)}
								>
									{formatQuantity(totalEntryQty - totalExitQty)}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

interface ExecutionRowProps {
	execution: TradeExecution
	type: "entry" | "exit"
	onEdit: () => void
	onDelete: () => void
	isDeleting: boolean
	formatPrice: (price: string | number) => string
	formatQuantity: (qty: string | number) => string
	t: ReturnType<typeof useTranslations>
	tCommon: ReturnType<typeof useTranslations>
}

const ExecutionRow = ({
	execution,
	type,
	onEdit,
	onDelete,
	isDeleting,
	formatPrice,
	formatQuantity,
	t,
	tCommon,
}: ExecutionRowProps) => {
	return (
		<div
			className={cn(
				"flex items-center justify-between rounded-md border px-m-300 py-s-200",
				type === "entry"
					? "border-action-buy/20 bg-action-buy/5"
					: "border-action-sell/20 bg-action-sell/5"
			)}
		>
			<div className="flex items-center gap-m-400">
				{/* Type indicator */}
				{type === "entry" ? (
					<ArrowUp className="h-3.5 w-3.5 shrink-0 text-action-buy" aria-label={t("entry")} />
				) : (
					<ArrowDown className="h-3.5 w-3.5 shrink-0 text-action-sell" aria-label={t("exit")} />
				)}
				<div className="text-small tabular-nums">
					<span className="text-txt-300">
						{format(new Date(execution.executionDate), "dd/MM HH:mm:ss")}
					</span>
				</div>
				<div className="text-small tabular-nums">
					<span className="font-mono font-semibold text-txt-100">
						{formatQuantity(execution.quantity)}
					</span>
					<span className="mx-s-100 text-txt-300">@</span>
					<span className="font-mono text-txt-100">
						{formatPrice(execution.price)}
					</span>
				</div>
				{execution.orderType && (
					<span className="rounded bg-bg-300 px-s-200 py-s-100 text-caption text-txt-300">
						{execution.orderType}
					</span>
				)}
			</div>
			<div className="flex items-center gap-s-200">
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={onEdit}
					aria-label={t("edit")}
				>
					<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
				</Button>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 text-fb-error hover:text-fb-error"
							disabled={isDeleting}
							aria-label={t("delete")}
						>
							{isDeleting ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
							) : (
								<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
							)}
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
							<AlertDialogDescription>
								{t("deleteDescription")}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
							<AlertDialogAction
								className="bg-fb-error hover:bg-fb-error/90"
								onClick={onDelete}
							>
								{tCommon("delete")}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	)
}
