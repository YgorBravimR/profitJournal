"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ThemeSynchronizer } from "@/components/providers/theme-synchronizer"
import { BrandSynchronizer } from "@/components/providers/brand-synchronizer"
import { cn } from "@/lib/utils"
import type { Brand } from "@/lib/brands"

interface AppShellProps {
	children: React.ReactNode
	isReplayAccount?: boolean
	replayDate?: string
	serverBrand?: Brand
}

/**
 * Client-side shell that manages sidebar state, theme, and brand synchronizers.
 * Extracted from the (app) layout so the layout itself can be a server component.
 */
const AppShell = ({
	children,
	isReplayAccount = false,
	replayDate,
	serverBrand,
}: AppShellProps) => {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

	return (
		<>
			<ThemeSynchronizer />
			<BrandSynchronizer serverBrand={serverBrand} />
			<Sidebar
				isCollapsed={isSidebarCollapsed}
				onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
				isReplayAccount={isReplayAccount}
				replayDate={replayDate}
			/>
			<main
				className={cn(
					"min-h-screen transition-[margin-left] duration-300",
					isSidebarCollapsed ? "ml-16" : "ml-64"
				)}
			>
				{children}
			</main>
		</>
	)
}

export { AppShell }
