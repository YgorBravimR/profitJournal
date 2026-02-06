/**
 * Vision Provider Types
 *
 * Shared types for all vision AI providers used for image analysis.
 */

// ==========================================
// Provider Types
// ==========================================

export type VisionProviderType = "openai" | "google" | "claude" | "groq" | "tesseract"

export interface VisionProviderConfig {
	type: VisionProviderType
	name: string
	isAvailable: () => boolean
	priority: number
}

// ==========================================
// Extraction Types
// ==========================================

export interface VisionExtractionRequest {
	imageBase64: string
	mimeType: string
	prompt: string
}

export interface VisionExtractionResponse {
	provider: VisionProviderType
	content: string
	confidence: number
	usage?: {
		promptTokens?: number
		completionTokens?: number
		totalTokens?: number
	}
}

// ==========================================
// Trade Extraction (ProfitChart specific)
// ==========================================

export interface ExtractedTradeData {
	asset: string
	openingTime: string
	closingTime: string | null
	avgBuyPrice: number | null
	avgSellPrice: number | null
	executions: Array<{
		time: string
		quantity: number
		price: number
		type: "entry" | "exit"
	}>
}

export interface TradeExtractionResult {
	provider: VisionProviderType
	trades: ExtractedTradeData[]
	rawText: string
	confidence: number
}
