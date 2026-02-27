import {
	forwardRef,
	type ComponentPropsWithoutRef,
	type HTMLAttributes,
} from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const Breadcrumb = forwardRef<
	HTMLElement,
	ComponentPropsWithoutRef<"nav"> & { separator?: React.ReactNode }
>(({ ...props }, ref) => (
	<nav ref={ref} aria-label="breadcrumb" {...props} />
))
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = forwardRef<
	HTMLOListElement,
	ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
	<ol
		ref={ref}
		className={cn(
			"text-txt-300 flex flex-wrap items-center gap-1.5 break-words text-small sm:gap-2.5",
			className
		)}
		{...props}
	/>
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = forwardRef<
	HTMLLIElement,
	ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
	<li
		ref={ref}
		className={cn("inline-flex items-center gap-1.5", className)}
		{...props}
	/>
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = forwardRef<
	HTMLAnchorElement,
	ComponentPropsWithoutRef<"a"> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
	const Comp = asChild ? Slot : "a"
	return (
		<Comp
			ref={ref}
			className={cn(
				"text-txt-300 hover:text-txt-100 transition-colors",
				className
			)}
			{...props}
		/>
	)
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = forwardRef<
	HTMLSpanElement,
	ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
	<span
		ref={ref}
		role="link"
		aria-disabled="true"
		aria-current="page"
		className={cn("text-txt-100 font-medium", className)}
		{...props}
	/>
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
	children,
	className,
	...props
}: HTMLAttributes<HTMLLIElement>) => (
	<li
		role="presentation"
		aria-hidden="true"
		className={cn("[&>svg]:h-3.5 [&>svg]:w-3.5", className)}
		{...props}
	>
		{children ?? <ChevronRight />}
	</li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
}
