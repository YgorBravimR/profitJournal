import { cn } from "@/lib/utils"

type FilterVariant = "default" | "positive" | "negative" | "accent"

interface FilterPillProps {
	label: string
	isActive: boolean
	onClick: () => void
	variant?: FilterVariant
	className?: string
}

const baseClasses =
	"rounded-md border px-s-300 py-s-100 text-tiny transition-colors focus:outline-none focus:ring-2 focus:ring-acc-100/50"

const variantClasses: Record<FilterVariant, { active: string; inactive: string }> = {
	default: {
		active: "border-acc-100 bg-acc-100/20 text-acc-100",
		inactive: "border-bg-300 bg-bg-100 text-txt-200 hover:border-txt-300",
	},
	positive: {
		active: "border-trade-buy bg-trade-buy/20 text-trade-buy",
		inactive: "border-bg-300 bg-bg-100 text-txt-200 hover:border-txt-300",
	},
	negative: {
		active: "border-trade-sell bg-trade-sell/20 text-trade-sell",
		inactive: "border-bg-300 bg-bg-100 text-txt-200 hover:border-txt-300",
	},
	accent: {
		active: "border-acc-100 bg-acc-100/20 text-acc-100",
		inactive: "border-bg-300 bg-bg-100 text-txt-200 hover:border-txt-300",
	},
}

/**
 * A reusable filter pill button component for filter panels.
 * Supports active/inactive states with different color variants.
 *
 * @param label - The text to display in the pill
 * @param isActive - Whether the filter is currently active
 * @param onClick - Click handler
 * @param variant - Color variant for active state
 * @param className - Additional CSS classes
 */
export const FilterPill = ({
	label,
	isActive,
	onClick,
	variant = "default",
	className,
}: FilterPillProps) => {
	const variantStyles = variantClasses[variant]

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				baseClasses,
				isActive ? variantStyles.active : variantStyles.inactive,
				className
			)}
			aria-pressed={isActive}
		>
			{label}
		</button>
	)
}

export { type FilterPillProps, type FilterVariant }
