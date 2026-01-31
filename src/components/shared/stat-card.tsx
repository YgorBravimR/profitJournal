import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type TrendType = "up" | "down" | "stable"

interface StatCardProps {
	label: string
	value: string | React.ReactNode
	subValue?: string
	trend?: TrendType
	valueColorClass?: string
	size?: "sm" | "md" | "lg"
	className?: string
}

const sizeClasses = {
	sm: {
		container: "p-s-300",
		label: "text-tiny",
		value: "text-small",
		subValue: "text-tiny",
	},
	md: {
		container: "p-m-500",
		label: "text-tiny",
		value: "text-h3",
		subValue: "text-tiny",
	},
	lg: {
		container: "p-m-600",
		label: "text-small",
		value: "text-h2",
		subValue: "text-small",
	},
}

const TrendIcon = ({ trend }: { trend: TrendType }) => {
	switch (trend) {
		case "up":
			return <TrendingUp className="h-4 w-4 text-trade-buy" />
		case "down":
			return <TrendingDown className="h-4 w-4 text-trade-sell" />
		case "stable":
			return <Minus className="h-4 w-4 text-txt-300" />
	}
}

/**
 * A reusable stat card component for displaying KPI metrics.
 * Supports trend indicators and customizable styling.
 *
 * @param label - The stat label/title
 * @param value - The main value (can be string or ReactNode)
 * @param subValue - Optional secondary value or description
 * @param trend - Optional trend indicator (up, down, stable)
 * @param valueColorClass - Optional color class for the value
 * @param size - Size variant (sm, md, lg)
 * @param className - Additional CSS classes
 */
export const StatCard = ({
	label,
	value,
	subValue,
	trend,
	valueColorClass,
	size = "md",
	className,
}: StatCardProps) => {
	const sizes = sizeClasses[size]

	return (
		<div
			className={cn(
				"rounded-lg border border-bg-300 bg-bg-200",
				sizes.container,
				className
			)}
		>
			<p className={cn("text-txt-300", sizes.label)}>{label}</p>
			<div className="mt-s-200 flex items-baseline gap-s-200">
				{typeof value === "string" ? (
					<p className={cn("font-bold", sizes.value, valueColorClass || "text-txt-100")}>
						{value}
					</p>
				) : (
					value
				)}
				{trend && <TrendIcon trend={trend} />}
			</div>
			{subValue && (
				<p className={cn("mt-s-100 text-txt-300", sizes.subValue)}>{subValue}</p>
			)}
		</div>
	)
}

export { type StatCardProps, type TrendType }
