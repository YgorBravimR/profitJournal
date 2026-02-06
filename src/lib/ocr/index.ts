/**
 * OCR Module for ProfitChart Screenshot Import
 *
 * This module provides:
 * - Tesseract.js wrapper for OCR text extraction (fallback)
 * - OpenAI GPT-4 Vision for high-accuracy extraction (recommended)
 * - ProfitChart-specific parser for trade data
 * - B3 futures asset normalization
 */

// Types
export * from "./types"

// Tesseract Worker (fallback)
export {
	recognizeImage,
	preprocessImage,
	isTesseractAvailable,
} from "./tesseract-worker"

// OpenAI Vision (recommended)
export {
	recognizeWithVision,
	isOpenAIVisionAvailable,
	extractWithVision,
	visionResultToParseResult,
} from "./openai-vision"

// ProfitChart Parser
export {
	parseProfitChartOcr,
	toImportInput,
	toImportInputs,
	detectColumns,
	normalizeB3Asset,
	parseBrazilianNumber,
	parseTimeString,
	parseQuantity,
} from "./profitchart-parser"
