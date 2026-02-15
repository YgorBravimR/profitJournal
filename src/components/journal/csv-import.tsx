"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
	Upload,
	FileText,
	Download,
	X,
	Loader2,
	CheckCircle2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { useLoadingOverlay } from "@/components/ui/loading-overlay"
import { parseCsvContent, generateCsvTemplate } from "@/lib/csv-parser"
import type { CsvParseResult } from "@/lib/csv-parser"
import {
	validateCsvTrades,
	importCsvTrades,
	type ProcessedCsvTrade,
	type CsvValidationResult,
} from "@/app/actions/csv-import"
import { CsvImportSummary, type FilterStatus } from "./csv-import-summary"
import { CsvTradeCard } from "./csv-trade-card"

export const CsvImport = () => {
	const t = useTranslations("journal.csv")
	const tOverlay = useTranslations("overlay")
	const router = useRouter()
	const { showToast } = useToast()
	const { showLoading, updateLoading, hideLoading } = useLoadingOverlay()
	const fileInputRef = useRef<HTMLInputElement>(null)

	// File state
	const [isDragging, setIsDragging] = useState(false)
	const [fileName, setFileName] = useState<string | null>(null)
	const [parseResult, setParseResult] = useState<CsvParseResult | null>(null)

	// Validation state
	const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null)
	const [processedTrades, setProcessedTrades] = useState<ProcessedCsvTrade[]>([])
	const [isValidating, setIsValidating] = useState(false)

	// UI state
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
	const [filter, setFilter] = useState<FilterStatus>("all")

	// Import state
	const [isImporting, setIsImporting] = useState(false)
	const [importProgress, setImportProgress] = useState(0)

	// Filtered trades based on filter selection
	const filteredTrades = useMemo(() => {
		if (filter === "all") return processedTrades
		return processedTrades.filter((t) => t.status === filter)
	}, [processedTrades, filter])

	// Selectable trades (not skipped)
	const selectableTrades = useMemo(
		() => processedTrades.filter((t) => t.status !== "skipped"),
		[processedTrades]
	)

	const allSelected = useMemo(() => {
		if (selectableTrades.length === 0) return false
		return selectableTrades.every((t) => selectedIds.has(t.id))
	}, [selectableTrades, selectedIds])

	// File handling
	const handleFileSelect = useCallback(
		async (file: File) => {
			if (!file.name.endsWith(".csv")) {
				showToast("error", "Please select a CSV file")
				return
			}

			setFileName(file.name)
			setValidationResult(null)
			setProcessedTrades([])
			setExpandedIds(new Set())
			setSelectedIds(new Set())

			// Try reading with different encodings
			const tryParseWithEncoding = async (encoding: string) => {
				return new Promise<string>((resolve, reject) => {
					const reader = new FileReader()
					reader.onload = (e) => resolve(e.target?.result as string)
					reader.onerror = () => reject(new Error("Failed to read file"))
					reader.readAsText(file, encoding)
				})
			}

			try {
				// Try UTF-8 first
				let content = await tryParseWithEncoding("UTF-8")

				// Check for encoding issues
				const hasEncodingIssues = /[\ufffd]/.test(content)
				if (hasEncodingIssues) {
					content = await tryParseWithEncoding("ISO-8859-1")
				}

				const result = parseCsvContent(content)
				setParseResult(result)

				if (result.trades.length === 0) {
					showToast("error", "No trades found in CSV")
					return
				}

				// Validate trades on server
				setIsValidating(true)
				showLoading({ message: tOverlay("validatingTrades") })
				const validation = await validateCsvTrades(result.trades)

				if (validation.status === "error") {
					showToast("error", validation.message)
					setIsValidating(false)
					hideLoading()
					return
				}

				setValidationResult(validation.data!)
				setProcessedTrades(validation.data!.trades)

				// Auto-select all valid/warning trades
				const validIds = new Set(
					validation.data!.trades
						.filter((t) => t.status !== "skipped")
						.map((t) => t.id)
				)
				setSelectedIds(validIds)

				setIsValidating(false)
				hideLoading()
			} catch {
				hideLoading()
				showToast("error", "Failed to read file")
			}
		},
		[showToast, showLoading, hideLoading, tOverlay]
	)

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			setIsDragging(false)
			const file = e.dataTransfer.files[0]
			if (file) handleFileSelect(file)
		},
		[handleFileSelect]
	)

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
	}, [])

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			if (file) handleFileSelect(file)
		},
		[handleFileSelect]
	)

	const handleDownloadTemplate = () => {
		const template = generateCsvTemplate()
		const blob = new Blob([template], { type: "text/csv" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "trade-import-template.csv"
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	const handleClear = () => {
		setParseResult(null)
		setValidationResult(null)
		setProcessedTrades([])
		setFileName(null)
		setExpandedIds(new Set())
		setSelectedIds(new Set())
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	// Trade selection
	const handleToggleSelect = (tradeId: string) => {
		setSelectedIds((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(tradeId)) {
				newSet.delete(tradeId)
			} else {
				newSet.add(tradeId)
			}
			return newSet
		})
	}

	const handleSelectAll = (selected: boolean) => {
		if (selected) {
			setSelectedIds(new Set(selectableTrades.map((t) => t.id)))
		} else {
			setSelectedIds(new Set())
		}
	}

	// Trade expansion
	const handleToggleExpand = (tradeId: string) => {
		setExpandedIds((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(tradeId)) {
				newSet.delete(tradeId)
			} else {
				newSet.add(tradeId)
			}
			return newSet
		})
	}

	// Trade editing
	const handleEditTrade = (tradeId: string, edits: ProcessedCsvTrade["edits"]) => {
		setProcessedTrades((prev) =>
			prev.map((t) => (t.id === tradeId ? { ...t, edits } : t))
		)
	}

	// Import
	const handleImport = async () => {
		const selectedTrades = processedTrades.filter((t) => selectedIds.has(t.id))

		if (selectedTrades.length === 0) {
			showToast("error", "No trades selected")
			return
		}

		setIsImporting(true)
		setImportProgress(0)
		showLoading({
			message: tOverlay("importingTrades", { count: selectedTrades.length }),
			progress: 0,
		})

		try {
			// Simulate progress for UX
			const progressInterval = setInterval(() => {
				setImportProgress((prev) => {
					const next = Math.min(prev + 10, 90)
					updateLoading({ progress: next })
					return next
				})
			}, 200)

			const result = await importCsvTrades(selectedTrades)

			clearInterval(progressInterval)
			setImportProgress(100)
			updateLoading({ progress: 100 })

			if (result.status === "success") {
				showToast("success", result.message)
				setTimeout(() => router.push("/journal"), 500)
			} else {
				showToast("error", result.message)
			}
		} catch {
			showToast("error", "An unexpected error occurred")
		} finally {
			hideLoading()
			setIsImporting(false)
		}
	}

	const selectedCount = selectedIds.size

	return (
		<div className="space-y-m-600">
			{/* Upload Area */}
			{!validationResult && (
				<div
					className={`rounded-lg border-2 border-dashed p-l-800 text-center transition-colors ${
						isDragging
							? "border-acc-100 bg-acc-100/10"
							: "border-bg-300 hover:border-txt-300"
					}`}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
				>
					<input
						ref={fileInputRef}
						type="file"
						accept=".csv"
						onChange={handleInputChange}
						className="hidden"
						id="csv-file-input"
					/>

					{isValidating ? (
						<>
							<Loader2 className="mx-auto h-12 w-12 animate-spin text-acc-100" />
							<h3 className="mt-m-400 text-body font-semibold text-txt-100">
								Validating trades...
							</h3>
							<p className="mt-s-200 text-small text-txt-300">
								Looking up assets and calculating P&L
							</p>
						</>
					) : (
						<>
							<Upload className="mx-auto h-12 w-12 text-txt-300" />
							<h3 className="mt-m-400 text-body font-semibold text-txt-100">
								{t("dropHere")}
							</h3>
							<p className="mt-s-200 text-small text-txt-300">{t("orClick")}</p>

							<div className="mt-m-500 flex items-center justify-center gap-m-400">
								<Button
									id="csv-import-select-file"
									variant="default"
									onClick={() => fileInputRef.current?.click()}
								>
									<FileText className="mr-2 h-4 w-4" />
									{t("selectFile")}
								</Button>
								<Button id="csv-import-download-template" variant="outline" onClick={handleDownloadTemplate}>
									<Download className="mr-2 h-4 w-4" />
									{t("downloadTemplate")}
								</Button>
							</div>
						</>
					)}
				</div>
			)}

			{/* Validation Results */}
			{validationResult && (
				<div className="space-y-m-500">
					{/* File Info */}
					<div className="flex items-center justify-between rounded-lg bg-bg-200 p-m-400">
						<div className="flex items-center gap-s-300">
							<FileText className="h-5 w-5 text-txt-300" />
							<span className="text-small font-medium text-txt-100">{fileName}</span>
							<span className="text-tiny text-txt-300">
								({validationResult.summary.total} trades)
							</span>
						</div>
						<Button
							id="csv-import-clear-file"
							variant="ghost"
							size="icon"
							onClick={handleClear}
							aria-label="Clear file"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Summary */}
					<CsvImportSummary
						trades={processedTrades}
						filter={filter}
						onFilterChange={setFilter}
						selectedCount={selectedCount}
						selectableCount={selectableTrades.length}
						onSelectAll={handleSelectAll}
						allSelected={allSelected}
					/>

					{/* Trade Cards */}
					<div className="space-y-s-200">
						{filteredTrades.map((trade) => (
							<CsvTradeCard
								key={trade.id}
								trade={trade}
								isExpanded={expandedIds.has(trade.id)}
								isSelected={selectedIds.has(trade.id)}
								onToggleExpand={() => handleToggleExpand(trade.id)}
								onToggleSelect={() => handleToggleSelect(trade.id)}
								onEdit={(edits) => handleEditTrade(trade.id, edits)}
								strategies={validationResult.strategies}
								timeframes={validationResult.timeframes}
								tags={validationResult.tags}
							/>
						))}
					</div>

					{/* Actions */}
					<div className="flex items-center justify-between rounded-lg border border-bg-300 bg-bg-200 p-m-400">
						<Button id="csv-import-cancel" variant="outline" onClick={handleClear}>
							Cancel
						</Button>

						<div className="flex items-center gap-m-400">
							{selectedCount > 0 && (
								<span className="text-small text-txt-300">
									{selectedCount} trades selected
								</span>
							)}
							<Button
								id="csv-import-submit"
								onClick={handleImport}
								disabled={isImporting || selectedCount === 0}
								className="min-w-[160px]"
							>
								{isImporting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Importing...
									</>
								) : (
									<>
										<CheckCircle2 className="mr-2 h-4 w-4" />
										Import {selectedCount} Trades
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Help Section */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h3 className="text-small font-semibold text-txt-100">{t("formatGuide")}</h3>

				{/* ProfitChart Support */}
				<div className="mt-s-300 rounded-md border border-acc-100/30 bg-acc-100/10 p-s-300">
					<p className="text-small font-medium text-acc-100">
						✓ ProfitChart Export Supported
					</p>
					<p className="mt-s-100 text-tiny text-txt-300">
						Exports from ProfitChart are automatically detected and imported. Just
						export your trades and upload the file directly. Assets like WING26 are
						automatically normalized to WIN.
					</p>
				</div>

				<p className="mt-m-400 text-small text-txt-300">{t("requiredColumns")}</p>
				<ul className="mt-s-300 grid grid-cols-2 gap-s-200 text-small text-txt-200 md:grid-cols-5">
					<li>
						<code className="rounded bg-bg-100 px-s-100 text-tiny">asset</code>
					</li>
					<li>
						<code className="rounded bg-bg-100 px-s-100 text-tiny">direction</code>
					</li>
					<li>
						<code className="rounded bg-bg-100 px-s-100 text-tiny">entry_date</code>
					</li>
					<li>
						<code className="rounded bg-bg-100 px-s-100 text-tiny">entry_price</code>
					</li>
					<li>
						<code className="rounded bg-bg-100 px-s-100 text-tiny">position_size</code>
					</li>
				</ul>
				<p className="mt-m-400 text-small text-txt-300">{t("optionalColumns")}</p>
			</div>
		</div>
	)
}
