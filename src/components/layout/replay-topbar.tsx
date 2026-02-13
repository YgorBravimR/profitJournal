"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface ReplayTopbarProps {
	replayDate: string
	isSidebarCollapsed: boolean
}

const ReplayTopbar = ({ replayDate, isSidebarCollapsed }: ReplayTopbarProps) => {
	const t = useTranslations("commandCenter.dateNavigator")

	return (
		<div
			className={cn(
				"fixed top-0 right-0 z-40 flex h-10 items-center justify-end gap-s-200 border-b border-bg-300 bg-bg-200/95 px-m-500 backdrop-blur-sm transition-[left] duration-300",
				isSidebarCollapsed ? "left-16" : "left-64"
			)}
		>
			<span className="rounded-sm bg-acc-100/10 px-s-200 py-s-100 text-tiny font-medium text-acc-100">
				{t("replayMode")}
			</span>
			<span className="text-tiny text-txt-300">{replayDate}</span>
		</div>
	)
}

export { ReplayTopbar }
