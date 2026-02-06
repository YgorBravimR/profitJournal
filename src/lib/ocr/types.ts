/**
 * OCR Types for ProfitChart Screenshot Import
 *
 * @see .claude/plans/ocr-profitchart-import.md for full implementation details
 */

// ==========================================
// ProfitChart Column Detection
// ==========================================

export type ProfitChartColumnType =
	| "asset"
	| "openingTime"
	| "closingTime"
	| "operationTime"
	| "quantity"
	| "buyPrice"
	| "sellPrice"
	| "tet"
	| "average"
	| "grossResult"
	| "percentResult"

export interface DetectedColumn {
	type: ProfitChartColumnType
	index: number
	header: string
	isRequired: boolean
}

export interface ColumnDetectionResult {
	columns: DetectedColumn[]
	missingRequired: ProfitChartColumnType[]
	hasAllRequired: boolean
}

// Required columns for successful import
export const REQUIRED_COLUMNS: ProfitChartColumnType[] = [
	"asset",
	"openingTime",
	"quantity",
	"buyPrice",
	"sellPrice",
]

// ==========================================
// Parsed Data Structures
// ==========================================

export interface ProfitChartSummary {
	asset: string
	originalContractCode: string
	openingTime: string // HH:MM:SS format
	closingTime: string | null
	totalQuantity: number
	avgBuyPrice: number | null
	avgSellPrice: number | null
	direction: "long" | "short" | null
}

export interface ProfitChartExecution {
	time: string // HH:MM:SS format
	quantity: number
	price: number
	type: "entry" | "exit"
	rowIndex: number
}

// ==========================================
// OCR Processing Results
// ==========================================

export interface OcrProgressInfo {
	status: "loading" | "initializing" | "recognizing" | "complete" | "error"
	progress: number // 0-100
	message: string
}

export interface OcrRawResult {
	text: string
	confidence: number
	lines: string[]
}

export interface OcrParseResult {
	success: boolean
	/** @deprecated Use trades array instead */
	summary: ProfitChartSummary | null
	/** @deprecated Use trades array instead */
	executions: ProfitChartExecution[]
	/** Array of all detected trades (supports multiple trades per screenshot) */
	trades: ParsedTrade[]
	rawText: string
	confidence: number
	columnDetection: ColumnDetectionResult
	errors: OcrError[]
	warnings: OcrWarning[]
}

export interface OcrError {
	line: number
	code: string
	message: string
}

export interface OcrWarning {
	line: number
	message: string
}

// ==========================================
// B3 Futures Asset Normalization
// ==========================================

export interface B3FuturesMapping {
	prefix: string
	description: string
	descriptionPt: string
}

export interface AssetNormalizationResult {
	originalCode: string
	normalizedSymbol: string
	isRecognized: boolean
	isFutures: boolean
	expirationMonth?: string
	expirationYear?: string
}

// B3 Futures month codes
export const B3_MONTH_CODES: Record<string, string> = {
	F: "January",
	G: "February",
	H: "March",
	J: "April",
	K: "May",
	M: "June",
	N: "July",
	Q: "August",
	U: "September",
	V: "October",
	X: "November",
	Z: "December",
}

// Common B3 futures prefixes
export const B3_FUTURES_MAPPINGS: B3FuturesMapping[] = [
	{ prefix: "WIN", description: "Mini Index", descriptionPt: "Mini Índice" },
	{ prefix: "WDO", description: "Mini Dollar", descriptionPt: "Mini Dólar" },
	{ prefix: "IND", description: "Full Index", descriptionPt: "Índice Cheio" },
	{ prefix: "DOL", description: "Full Dollar", descriptionPt: "Dólar Cheio" },
	{ prefix: "BGI", description: "Cattle", descriptionPt: "Boi Gordo" },
	{ prefix: "CCM", description: "Corn", descriptionPt: "Milho" },
	{ prefix: "ICF", description: "Coffee", descriptionPt: "Café" },
	{ prefix: "SFI", description: "Soy", descriptionPt: "Soja" },
	{ prefix: "DI1", description: "Interest Rate", descriptionPt: "DI Futuro" },
]

// ==========================================
// Parsed Trade Structure (supports multiple trades)
// ==========================================

export interface ParsedTrade {
	id: string // Unique ID for UI tracking
	summary: ProfitChartSummary
	executions: ProfitChartExecution[]
}

// ==========================================
// Import Input Structure
// ==========================================

export interface OcrImportExecution {
	executionType: "entry" | "exit"
	executionDate: Date
	price: number
	quantity: number
}

export interface OcrImportInput {
	asset: string
	originalContractCode: string
	direction: "long" | "short"
	entryDate: Date
	exitDate?: Date
	executions: OcrImportExecution[]
	strategyId?: string
	timeframeId?: string
	preTradeThoughts?: string
}

// Array of trades for bulk import
export type OcrBulkImportInput = OcrImportInput[]

// ==========================================
// UI State Types
// ==========================================

export interface OcrImportState {
	step: "upload" | "processing" | "review" | "importing" | "complete" | "error"
	image: string | null
	fileName: string | null
	progress: OcrProgressInfo | null
	parseResult: OcrParseResult | null
	editedData: OcrImportInput | null
	importError: string | null
}

// Header mappings for dynamic column detection
// Includes common OCR misreadings (e.g., "prego" when OCR misreads "preço")
export const HEADER_MAPPINGS: Record<string, ProfitChartColumnType> = {
	// Asset variations (including OCR errors like "ato" for "ativo")
	ativo: "asset",
	ato: "asset",
	atvo: "asset",
	atívo: "asset",
	asset: "asset",
	symbol: "asset",
	ticker: "asset",

	// Opening time variations
	abertura: "openingTime",
	opening: "openingTime",
	open: "openingTime",
	entrada: "openingTime",

	// Closing time variations
	fechamento: "closingTime",
	closing: "closingTime",
	close: "closingTime",
	saida: "closingTime",
	saída: "closingTime",

	// Operation time (not needed but detected)
	"tempo operação": "operationTime",
	"tempo operacao": "operationTime",
	"tempo op": "operationTime",
	duration: "operationTime",

	// Quantity variations
	qtd: "quantity",
	quantidade: "quantity",
	qty: "quantity",
	quantity: "quantity",
	contracts: "quantity",
	contratos: "quantity",

	// Buy price variations (including OCR errors: "prego" for "preço")
	"preço compra": "buyPrice",
	"preco compra": "buyPrice",
	"prego compra": "buyPrice",
	preçocompra: "buyPrice",
	precocompra: "buyPrice",
	pregocompra: "buyPrice",
	"buy price": "buyPrice",
	buy: "buyPrice",
	compra: "buyPrice",

	// Sell price variations (including OCR errors: "prego" for "preço")
	"preço venda": "sellPrice",
	"preco venda": "sellPrice",
	"prego venda": "sellPrice",
	preçovenda: "sellPrice",
	precovenda: "sellPrice",
	pregovenda: "sellPrice",
	"sell price": "sellPrice",
	sell: "sellPrice",
	venda: "sellPrice",

	// TET (Time Exposed to Trade)
	tet: "tet",
	"time exposed": "tet",

	// Average price
	médio: "average",
	medio: "average",
	average: "average",
	avg: "average",

	// Gross result
	"res. intervalo bruto": "grossResult",
	"res intervalo bruto": "grossResult",
	"gross result": "grossResult",
	resultado: "grossResult",

	// Percent result
	"res. intervalo (%)": "percentResult",
	"res intervalo (%)": "percentResult",
	"result %": "percentResult",
	"%": "percentResult",
}

export { type OcrProgressInfo as ProgressInfo }
