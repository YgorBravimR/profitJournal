"use client"

import { Sidebar } from "./sidebar"

interface MainLayoutProps {
	children: React.ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
	return (
		<div className="flex min-h-screen bg-bg-100">
			<Sidebar />
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	)
}
