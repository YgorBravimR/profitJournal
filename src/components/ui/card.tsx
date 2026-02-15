import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
	id: string
}

const Card = ({ className, ...props }: CardProps) => {
	return (
		<div
			data-slot="card"
			className={cn(
				"bg-bg-200 text-txt-100 gap-m-600 border-bg-300 py-m-600 shadow-medium flex flex-col rounded-md border",
				className
			)}
			{...props}
		/>
	)
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"gap-s-200 px-m-600 [.border-b]:pb-m-600 @container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto]",
				className
			)}
			{...props}
		/>
	)
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn("leading-none font-semibold", className)}
			{...props}
		/>
	)
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-description"
			className={cn("text-txt-200 text-small", className)}
			{...props}
		/>
	)
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				className
			)}
			{...props}
		/>
	)
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-m-600", className)}
			{...props}
		/>
	)
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn(
				"px-m-600 [.border-t]:pt-m-600 flex items-center",
				className
			)}
			{...props}
		/>
	)
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
}
