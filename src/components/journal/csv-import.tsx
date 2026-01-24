"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
	Upload,
	FileText,
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Download,
	X,
	Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { parseCsvContent, generateCsvTemplate } from "@/lib/csv-parser"
import type { CsvParseResult } from "@/lib/csv-parser"
import { bulkCreateTrades } from "@/app/actions/trades"

export const CsvImport = () => {
	const router = useRouter()
	const { showToast } = useToast()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [isDragging, setIsDragging] = useState(false)
	const [parseResult, setParseResult] = useState<CsvParseResult | null>(null)
	const [isImporting, setIsImporting] = useState(false)
	const [fileName, setFileName] = useState<string | null>(null)

	const handleFileSelect = useCallback((file: File) => {
		if (!file.name.endsWith(".csv")) {
			showToast("error", "Please select a CSV file")
			return
		}

		setFileName(file.name)

		const reader = new FileReader()
		reader.onload = (e) => {
			const content = e.target?.result as string
			const result = parseCsvContent(content)
			setParseResult(result)
		}
		reader.onerror = () => {
			showToast("error", "Failed to read file")
		}
		reader.readAsText(file)
	}, [showToast])

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			setIsDragging(false)

			const file = e.dataTransfer.files[0]
			if (file) {
				handleFileSelect(file)
			}
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
			if (file) {
				handleFileSelect(file)
			}
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

	const handleImport = async () => {
		if (!parseResult || parseResult.trades.length === 0) {
			showToast("error", "No valid trades to import")
			return
		}

		setIsImporting(true)
		try {
			const result = await bulkCreateTrades(parseResult.trades)

			if (result.status === "success") {
				showToast("success", result.message)
				router.push("/journal")
			} else {
				showToast("error", result.message)
			}
		} catch {
			showToast("error", "An unexpected error occurred")
		} finally {
			setIsImporting(false)
		}
	}

	const handleClear = () => {
		setParseResult(null)
		setFileName(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	return (
		<div className="space-y-m-600">
			{/* Upload Area */}
			{!parseResult && (
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

					<Upload className="mx-auto h-12 w-12 text-txt-300" />
					<h3 className="mt-m-400 text-body font-semibold text-txt-100">
						Drop your CSV file here
					</h3>
					<p className="mt-s-200 text-small text-txt-300">
						or click to browse
					</p>

					<div className="mt-m-500 flex items-center justify-center gap-m-400">
						<Button
							variant="default"
							onClick={() => fileInputRef.current?.click()}
						>
							<FileText className="mr-2 h-4 w-4" />
							Select File
						</Button>
						<Button variant="outline" onClick={handleDownloadTemplate}>
							<Download className="mr-2 h-4 w-4" />
							Download Template
						</Button>
					</div>
				</div>
			)}

			{/* Parse Results */}
			{parseResult && (
				<div className="space-y-m-500">
					{/* File Info */}
					<div className="flex items-center justify-between rounded-lg bg-bg-200 p-m-400">
						<div className="flex items-center gap-s-300">
							<FileText className="h-5 w-5 text-txt-300" />
							<span className="text-small font-medium text-txt-100">
								{fileName}
							</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClear}
							aria-label="Clear file"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Summary */}
					<div className="grid grid-cols-3 gap-m-400">
						<div className="rounded-lg bg-bg-200 p-m-400 text-center">
							<p className="text-h3 font-bold text-trade-buy">
								{parseResult.trades.length}
							</p>
							<p className="text-tiny text-txt-300">Valid Trades</p>
						</div>
						<div className="rounded-lg bg-bg-200 p-m-400 text-center">
							<p className="text-h3 font-bold text-fb-error">
								{parseResult.errors.length}
							</p>
							<p className="text-tiny text-txt-300">Errors</p>
						</div>
						<div className="rounded-lg bg-bg-200 p-m-400 text-center">
							<p className="text-h3 font-bold text-warning">
								{parseResult.warnings.length}
							</p>
							<p className="text-tiny text-txt-300">Warnings</p>
						</div>
					</div>

					{/* Errors */}
					{parseResult.errors.length > 0 && (
						<div className="rounded-lg border border-fb-error/30 bg-fb-error/10 p-m-400">
							<div className="flex items-center gap-s-200 text-fb-error">
								<AlertCircle className="h-4 w-4" />
								<span className="text-small font-medium">
									Errors ({parseResult.errors.length})
								</span>
							</div>
							<ul className="mt-s-300 space-y-s-200 text-small text-txt-200">
								{parseResult.errors.slice(0, 10).map((error, i) => (
									<li key={i}>
										Row {error.row}: {error.message}
									</li>
								))}
								{parseResult.errors.length > 10 && (
									<li className="text-txt-300">
										...and {parseResult.errors.length - 10} more errors
									</li>
								)}
							</ul>
						</div>
					)}

					{/* Warnings */}
					{parseResult.warnings.length > 0 && (
						<div className="rounded-lg border border-warning/30 bg-warning/10 p-m-400">
							<div className="flex items-center gap-s-200 text-warning">
								<AlertTriangle className="h-4 w-4" />
								<span className="text-small font-medium">
									Warnings ({parseResult.warnings.length})
								</span>
							</div>
							<ul className="mt-s-300 space-y-s-200 text-small text-txt-200">
								{parseResult.warnings.slice(0, 5).map((warning, i) => (
									<li key={i}>
										Row {warning.row}: {warning.message}
									</li>
								))}
								{parseResult.warnings.length > 5 && (
									<li className="text-txt-300">
										...and {parseResult.warnings.length - 5} more warnings
									</li>
								)}
							</ul>
						</div>
					)}

					{/* Preview Table */}
					{parseResult.trades.length > 0 && (
						<div className="rounded-lg border border-bg-300 bg-bg-200">
							<div className="border-b border-bg-300 p-m-400">
								<h3 className="text-small font-semibold text-txt-100">
									Preview (first 10 trades)
								</h3>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-bg-300 bg-bg-100">
											<th className="px-m-400 py-s-300 text-left text-tiny font-medium text-txt-300">
												Asset
											</th>
											<th className="px-m-400 py-s-300 text-left text-tiny font-medium text-txt-300">
												Direction
											</th>
											<th className="px-m-400 py-s-300 text-left text-tiny font-medium text-txt-300">
												Entry Date
											</th>
											<th className="px-m-400 py-s-300 text-right text-tiny font-medium text-txt-300">
												Entry Price
											</th>
											<th className="px-m-400 py-s-300 text-right text-tiny font-medium text-txt-300">
												Exit Price
											</th>
											<th className="px-m-400 py-s-300 text-right text-tiny font-medium text-txt-300">
												Size
											</th>
											<th className="px-m-400 py-s-300 text-right text-tiny font-medium text-txt-300">
												P&L
											</th>
										</tr>
									</thead>
									<tbody>
										{parseResult.trades.slice(0, 10).map((trade, i) => (
											<tr
												key={i}
												className="border-b border-bg-300 last:border-0"
											>
												<td className="px-m-400 py-s-300 text-small font-medium text-txt-100">
													{trade.asset}
												</td>
												<td className="px-m-400 py-s-300">
													<span
														className={`text-small ${
															trade.direction === "long"
																? "text-trade-buy"
																: "text-trade-sell"
														}`}
													>
														{trade.direction.toUpperCase()}
													</span>
												</td>
												<td className="px-m-400 py-s-300 text-small text-txt-200">
													{trade.entryDate instanceof Date
														? trade.entryDate.toLocaleDateString()
														: new Date(trade.entryDate).toLocaleDateString()}
												</td>
												<td className="px-m-400 py-s-300 text-right text-small text-txt-200">
													{Number(trade.entryPrice).toLocaleString()}
												</td>
												<td className="px-m-400 py-s-300 text-right text-small text-txt-200">
													{trade.exitPrice
														? Number(trade.exitPrice).toLocaleString()
														: "-"}
												</td>
												<td className="px-m-400 py-s-300 text-right text-small text-txt-200">
													{Number(trade.positionSize).toLocaleString()}
												</td>
												<td
													className={`px-m-400 py-s-300 text-right text-small font-medium ${
														trade.pnl
															? Number(trade.pnl) >= 0
																? "text-trade-buy"
																: "text-trade-sell"
															: "text-txt-300"
													}`}
												>
													{trade.pnl
														? `${Number(trade.pnl) >= 0 ? "+" : ""}$${Number(trade.pnl).toLocaleString()}`
														: "-"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							{parseResult.trades.length > 10 && (
								<div className="border-t border-bg-300 p-s-300 text-center text-tiny text-txt-300">
									...and {parseResult.trades.length - 10} more trades
								</div>
							)}
						</div>
					)}

					{/* Success Message */}
					{parseResult.success && parseResult.trades.length > 0 && (
						<div className="flex items-center gap-s-200 rounded-lg border border-trade-buy/30 bg-trade-buy/10 p-m-400 text-trade-buy">
							<CheckCircle2 className="h-4 w-4" />
							<span className="text-small font-medium">
								Ready to import {parseResult.trades.length} trades
							</span>
						</div>
					)}

					{/* Actions */}
					<div className="flex items-center justify-end gap-m-400">
						<Button variant="outline" onClick={handleClear}>
							Cancel
						</Button>
						<Button
							onClick={handleImport}
							disabled={
								isImporting ||
								!parseResult.success ||
								parseResult.trades.length === 0
							}
						>
							{isImporting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Importing...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Import {parseResult.trades.length} Trades
								</>
							)}
						</Button>
					</div>
				</div>
			)}

			{/* Help Section */}
			<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
				<h3 className="text-small font-semibold text-txt-100">
					CSV Format Guide
				</h3>
				<p className="mt-s-200 text-small text-txt-300">
					Your CSV should include these required columns:
				</p>
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
				<p className="mt-m-400 text-small text-txt-300">
					Optional columns: exit_date, exit_price, stop_loss, take_profit, pnl,
					timeframe, notes, followed_plan
				</p>
			</div>
		</div>
	)
}
