import { cn } from "@/lib/utils"

interface PageHeaderProps {
	title: string
	description?: string
	action?: React.ReactNode
	className?: string
}

export const PageHeader = ({
	title,
	description,
	action,
	className,
}: PageHeaderProps) => {
	return (
		<header
			className={cn(
				"flex items-center justify-between border-b border-bg-300 bg-bg-200 px-m-600 py-m-500",
				className
			)}
		>
			<div>
				<h1 className="text-h2 font-bold text-txt-100">{title}</h1>
				{description && (
					<p className="mt-s-100 text-small text-txt-200">{description}</p>
				)}
			</div>
			{action && <div>{action}</div>}
		</header>
	)
}
