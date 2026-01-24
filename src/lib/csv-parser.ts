import type { CreateTradeInput } from "./validations/trade"

export interface CsvParseResult {
	success: boolean
	trades: CreateTradeInput[]
	errors: Array<{
		row: number
		field: string
		message: string
	}>
	warnings: Array<{
		row: number
		message: string
	}>
}

export interface CsvColumn {
	header: string
	field: keyof CreateTradeInput | null
	required: boolean
}

// Expected CSV columns mapping
const COLUMN_MAPPINGS: Record<string, keyof CreateTradeInput> = {
	// Asset
	asset: "asset",
	symbol: "asset",
	ticker: "asset",
	pair: "asset",

	// Direction
	direction: "direction",
	side: "direction",
	type: "direction",

	// Timeframe
	timeframe: "timeframe",
	tf: "timeframe",

	// Dates
	entry_date: "entryDate",
	entrydate: "entryDate",
	entry: "entryDate",
	open_date: "entryDate",
	opendate: "entryDate",
	exit_date: "exitDate",
	exitdate: "exitDate",
	close_date: "exitDate",
	closedate: "exitDate",

	// Prices
	entry_price: "entryPrice",
	entryprice: "entryPrice",
	open_price: "entryPrice",
	openprice: "entryPrice",
	exit_price: "exitPrice",
	exitprice: "exitPrice",
	close_price: "exitPrice",
	closeprice: "exitPrice",

	// Position
	position_size: "positionSize",
	positionsize: "positionSize",
	size: "positionSize",
	quantity: "positionSize",
	qty: "positionSize",
	amount: "positionSize",
	contracts: "positionSize",

	// Risk Management
	stop_loss: "stopLoss",
	stoploss: "stopLoss",
	sl: "stopLoss",
	take_profit: "takeProfit",
	takeprofit: "takeProfit",
	tp: "takeProfit",
	planned_risk: "plannedRiskAmount",
	plannedrisk: "plannedRiskAmount",
	risk_amount: "plannedRiskAmount",
	riskamount: "plannedRiskAmount",
	planned_r: "plannedRMultiple",
	plannedr: "plannedRMultiple",

	// Results
	pnl: "pnl",
	profit: "pnl",
	profit_loss: "pnl",
	profitloss: "pnl",
	realized_r: "realizedRMultiple",
	realizedr: "realizedRMultiple",
	r_multiple: "realizedRMultiple",
	rmultiple: "realizedRMultiple",

	// MFE/MAE
	mfe: "mfe",
	mae: "mae",
	max_favorable: "mfe",
	maxfavorable: "mfe",
	max_adverse: "mae",
	maxadverse: "mae",

	// Notes
	notes: "preTradeThoughts",
	pre_trade_thoughts: "preTradeThoughts",
	pretradethoughts: "preTradeThoughts",
	setup: "preTradeThoughts",
	post_trade_reflection: "postTradeReflection",
	posttradereflection: "postTradeReflection",
	reflection: "postTradeReflection",
	review: "postTradeReflection",
	lesson: "lessonLearned",
	lessonlearned: "lessonLearned",
	lesson_learned: "lessonLearned",

	// Compliance
	followed_plan: "followedPlan",
	followedplan: "followedPlan",
	discipline: "followedPlan",
	discipline_notes: "disciplineNotes",
	disciplinenotes: "disciplineNotes",
}

const REQUIRED_FIELDS: Array<keyof CreateTradeInput> = [
	"asset",
	"direction",
	"entryDate",
	"entryPrice",
	"positionSize",
]

const VALID_DIRECTIONS = ["long", "short", "buy", "sell"]
const VALID_TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"]

const normalizeHeader = (header: string): string => {
	return header.toLowerCase().trim().replace(/[\s-]/g, "_")
}

const parseDirection = (value: string): "long" | "short" | null => {
	const normalized = value.toLowerCase().trim()
	if (normalized === "long" || normalized === "buy") return "long"
	if (normalized === "short" || normalized === "sell") return "short"
	return null
}

const parseTimeframe = (value: string): CreateTradeInput["timeframe"] | null => {
	const normalized = value.toLowerCase().trim()
	if (VALID_TIMEFRAMES.includes(normalized)) {
		return normalized as CreateTradeInput["timeframe"]
	}
	return null
}

const parseDate = (value: string): Date | null => {
	if (!value) return null

	// Try ISO format first
	let date = new Date(value)
	if (!isNaN(date.getTime())) return date

	// Try common date formats
	const formats = [
		/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
		/^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
		/^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY or DD-MM-YYYY
	]

	for (const format of formats) {
		const match = value.match(format)
		if (match) {
			// Assume MM/DD/YYYY for US format
			const [, part1, part2, part3] = match
			if (part1.length === 4) {
				date = new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3))
			} else if (part3.length === 4) {
				date = new Date(parseInt(part3), parseInt(part1) - 1, parseInt(part2))
			}
			if (!isNaN(date.getTime())) return date
		}
	}

	return null
}

const parseNumber = (value: string): number | null => {
	if (!value) return null
	// Remove currency symbols and commas
	const cleaned = value.replace(/[$,€£]/g, "").trim()
	const num = parseFloat(cleaned)
	return isNaN(num) ? null : num
}

const parseBoolean = (value: string): boolean | null => {
	const normalized = value.toLowerCase().trim()
	if (["true", "yes", "1", "y"].includes(normalized)) return true
	if (["false", "no", "0", "n"].includes(normalized)) return false
	return null
}

export const parseCsvContent = (content: string): CsvParseResult => {
	const result: CsvParseResult = {
		success: true,
		trades: [],
		errors: [],
		warnings: [],
	}

	// Split into lines and handle different line endings
	const lines = content.split(/\r?\n/).filter((line) => line.trim())

	if (lines.length < 2) {
		result.success = false
		result.errors.push({
			row: 0,
			field: "file",
			message: "CSV must have at least a header row and one data row",
		})
		return result
	}

	// Parse header row
	const headerLine = lines[0]
	const headers = parseCSVLine(headerLine).map(normalizeHeader)

	// Map headers to fields
	const columnMap: Array<{ index: number; field: keyof CreateTradeInput }> = []
	const unmappedHeaders: string[] = []

	headers.forEach((header, index) => {
		const field = COLUMN_MAPPINGS[header]
		if (field) {
			columnMap.push({ index, field })
		} else if (header) {
			unmappedHeaders.push(header)
		}
	})

	// Check for required fields
	const mappedFields = columnMap.map((c) => c.field)
	const missingRequired = REQUIRED_FIELDS.filter((f) => !mappedFields.includes(f))

	if (missingRequired.length > 0) {
		result.success = false
		result.errors.push({
			row: 1,
			field: "headers",
			message: `Missing required columns: ${missingRequired.join(", ")}`,
		})
		return result
	}

	// Warn about unmapped headers
	if (unmappedHeaders.length > 0) {
		result.warnings.push({
			row: 1,
			message: `Ignored columns: ${unmappedHeaders.join(", ")}`,
		})
	}

	// Parse data rows
	for (let i = 1; i < lines.length; i++) {
		const rowNumber = i + 1
		const line = lines[i].trim()

		if (!line) continue

		const values = parseCSVLine(line)
		const trade: Partial<CreateTradeInput> = {}
		let rowHasErrors = false

		for (const { index, field } of columnMap) {
			const value = values[index]?.trim() || ""

			if (!value) {
				if (REQUIRED_FIELDS.includes(field)) {
					result.errors.push({
						row: rowNumber,
						field,
						message: `${field} is required`,
					})
					rowHasErrors = true
				}
				continue
			}

			// Parse based on field type
			switch (field) {
				case "asset":
					trade.asset = value.toUpperCase()
					break

				case "direction": {
					const direction = parseDirection(value)
					if (direction) {
						trade.direction = direction
					} else {
						result.errors.push({
							row: rowNumber,
							field,
							message: `Invalid direction: ${value}. Use "long" or "short"`,
						})
						rowHasErrors = true
					}
					break
				}

				case "timeframe": {
					const timeframe = parseTimeframe(value)
					if (timeframe) {
						trade.timeframe = timeframe
					} else {
						result.warnings.push({
							row: rowNumber,
							message: `Invalid timeframe: ${value}. Skipping field.`,
						})
					}
					break
				}

				case "entryDate":
				case "exitDate": {
					const date = parseDate(value)
					if (date) {
						trade[field] = date
					} else {
						if (field === "entryDate") {
							result.errors.push({
								row: rowNumber,
								field,
								message: `Invalid date format: ${value}`,
							})
							rowHasErrors = true
						} else {
							result.warnings.push({
								row: rowNumber,
								message: `Invalid exit date format: ${value}. Skipping field.`,
							})
						}
					}
					break
				}

				case "entryPrice":
				case "exitPrice":
				case "positionSize":
				case "stopLoss":
				case "takeProfit":
				case "plannedRiskAmount":
				case "plannedRMultiple":
				case "pnl":
				case "realizedRMultiple":
				case "mfe":
				case "mae": {
					const num = parseNumber(value)
					if (num !== null) {
						trade[field] = num
					} else {
						if (REQUIRED_FIELDS.includes(field)) {
							result.errors.push({
								row: rowNumber,
								field,
								message: `Invalid number: ${value}`,
							})
							rowHasErrors = true
						} else {
							result.warnings.push({
								row: rowNumber,
								message: `Invalid number for ${field}: ${value}. Skipping field.`,
							})
						}
					}
					break
				}

				case "followedPlan": {
					const bool = parseBoolean(value)
					if (bool !== null) {
						trade.followedPlan = bool
					}
					break
				}

				case "preTradeThoughts":
				case "postTradeReflection":
				case "lessonLearned":
				case "disciplineNotes":
					trade[field] = value
					break
			}
		}

		if (!rowHasErrors) {
			result.trades.push(trade as CreateTradeInput)
		}
	}

	if (result.errors.length > 0) {
		result.success = false
	}

	return result
}

// Parse a single CSV line handling quoted values
const parseCSVLine = (line: string): string[] => {
	const result: string[] = []
	let current = ""
	let inQuotes = false

	for (let i = 0; i < line.length; i++) {
		const char = line[i]
		const nextChar = line[i + 1]

		if (char === '"') {
			if (inQuotes && nextChar === '"') {
				// Escaped quote
				current += '"'
				i++
			} else {
				// Toggle quote mode
				inQuotes = !inQuotes
			}
		} else if (char === "," && !inQuotes) {
			result.push(current.trim())
			current = ""
		} else {
			current += char
		}
	}

	result.push(current.trim())
	return result
}

// Generate a sample CSV template
export const generateCsvTemplate = (): string => {
	const headers = [
		"asset",
		"direction",
		"entry_date",
		"exit_date",
		"entry_price",
		"exit_price",
		"position_size",
		"stop_loss",
		"take_profit",
		"pnl",
		"timeframe",
		"notes",
		"followed_plan",
	]

	const sampleRow = [
		"BTCUSD",
		"long",
		"2024-01-15",
		"2024-01-16",
		"42000",
		"43500",
		"0.5",
		"41000",
		"44000",
		"750",
		"4h",
		"Breakout setup",
		"yes",
	]

	return `${headers.join(",")}\n${sampleRow.join(",")}`
}
