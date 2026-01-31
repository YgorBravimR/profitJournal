import { cn } from "@/lib/utils"
import { formatRMultiple } from "@/lib/calculations"

interface RMultipleBarProps {
	planned?: number
	actual: number
	maxR?: number
	className?: string
}

export const RMultipleBar = ({
	planned,
	actual,
	maxR = 5,
	className,
}: RMultipleBarProps) => {
	// Normalize values to percentage of maxR
	const normalizeToPercent = (value: number) => {
		const clamped = Math.max(-maxR, Math.min(maxR, value))
		return ((clamped + maxR) / (2 * maxR)) * 100
	}

	const actualPercent = normalizeToPercent(actual)
	const plannedPercent = planned ? normalizeToPercent(planned) : null
	const zeroPercent = 50 // Zero is at the center

	const isPositive = actual > 0
	const hitTarget = planned ? actual >= planned : false

	return (
		<div className={cn("space-y-s-200", className)}>
			{/* Labels */}
			<div className="flex items-center justify-between text-tiny">
				<span className="text-txt-300">Realized R</span>
				<span
					className={cn(
						"font-mono font-semibold",
						isPositive ? "text-trade-buy" : "text-trade-sell"
					)}
				>
					{formatRMultiple(actual)}
				</span>
			</div>

			{/* Bar */}
			<div className="relative h-3 rounded-full bg-bg-300">
				{/* Zero line */}
				<div
					className="absolute top-0 h-full w-px bg-txt-300"
					style={{ left: "50%" }}
				/>

				{/* Actual R bar */}
				{actual !== 0 && (
					<div
						className={cn(
							"absolute top-0 h-full rounded-full transition-[width,left]",
							isPositive ? "bg-trade-buy" : "bg-trade-sell"
						)}
						style={{
							left: isPositive ? "50%" : `${actualPercent}%`,
							width: `${Math.abs(actualPercent - 50)}%`,
						}}
					/>
				)}

				{/* Planned R marker */}
				{plannedPercent !== null && (
					<div
						className={cn(
							"absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full",
							hitTarget ? "bg-trade-buy" : "bg-warning"
						)}
						style={{ left: `${plannedPercent}%` }}
						title={`Planned: ${formatRMultiple(planned!)}`}
					/>
				)}
			</div>

			{/* Scale */}
			<div className="flex justify-between text-tiny text-txt-300">
				<span>-{maxR}R</span>
				<span>0</span>
				<span>+{maxR}R</span>
			</div>

			{/* Planned vs Actual comparison */}
			{planned !== undefined && (
				<div className="flex items-center justify-between text-tiny">
					<span className="text-txt-300">
						Planned: <span className="font-mono">{formatRMultiple(planned)}</span>
					</span>
					<span
						className={cn(
							"font-medium",
							hitTarget ? "text-trade-buy" : "text-warning"
						)}
					>
						{hitTarget ? "Target hit" : "Below target"}
					</span>
				</div>
			)}
		</div>
	)
}
