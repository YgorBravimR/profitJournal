"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ThemeSynchronizer } from "@/components/providers/theme-synchronizer"
import { BrandSynchronizer } from "@/components/providers/brand-synchronizer"
import { ReplayTopbar } from "@/components/layout/replay-topbar"
import { cn } from "@/lib/utils"

interface AppShellProps {
	children: React.ReactNode
	isReplayAccount?: boolean
	replayDate?: string
}

/**
 * Client-side shell that manages sidebar state, theme, and brand synchronizers.
 * Extracted from the (app) layout so the layout itself can be a server component.
 */
const AppShell = ({ children, isReplayAccount = false, replayDate }: AppShellProps) => {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

	return (
		<>
			<ThemeSynchronizer />
			<BrandSynchronizer />
			<Sidebar
				isCollapsed={isSidebarCollapsed}
				onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
			/>
			{isReplayAccount && replayDate && (
				<ReplayTopbar replayDate={replayDate} isSidebarCollapsed={isSidebarCollapsed} />
			)}
			<main
				className={cn(
					"min-h-screen transition-[margin-left] duration-300",
					isSidebarCollapsed ? "ml-16" : "ml-64",
					isReplayAccount && "pt-10"
				)}
			>
				{children}
			</main>
		</>
	)
}

export { AppShell }
