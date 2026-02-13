import { z } from "zod"

const calculatorInputSchema = z.object({
	assetId: z.string().min(1, "Asset is required"),
	direction: z.enum(["long", "short"]),
	entryPrice: z.coerce.number().positive("Entry price must be positive"),
	stopPrice: z.coerce.number().positive("Stop price must be positive"),
	targetPrice: z.coerce.number().positive("Target price must be positive").optional().nullable(),
	manualContracts: z.coerce.number().int().positive("Contracts must be positive").optional().nullable(),
})

type CalculatorInput = z.infer<typeof calculatorInputSchema>

export { calculatorInputSchema }
export type { CalculatorInput }
