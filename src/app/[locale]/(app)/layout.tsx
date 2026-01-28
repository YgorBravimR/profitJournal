"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
	children: React.ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

	return (
		<>
			<Sidebar
				isCollapsed={isSidebarCollapsed}
				onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
			/>
			<main
				className={cn(
					"min-h-screen transition-all duration-300",
					isSidebarCollapsed ? "ml-16" : "ml-64"
				)}
			>
				{children}
			</main>
		</>
	)
}

export default AppLayout
