"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ThemeSynchronizer } from "@/components/providers/theme-synchronizer"
import { BrandSynchronizer } from "@/components/providers/brand-synchronizer"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
	children: React.ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

	return (
		<>
			<ThemeSynchronizer />
			<BrandSynchronizer />
			<Sidebar
				isCollapsed={isSidebarCollapsed}
				onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
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

export default AppLayout
