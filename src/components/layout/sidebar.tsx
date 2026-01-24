"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
	LayoutDashboard,
	BookOpen,
	BarChart3,
	FileText,
	FileBarChart,
	Settings,
	ChevronLeft,
	ChevronRight,
	type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
	label: string
	href: string
	icon: LucideIcon
}

const navItems: NavItem[] = [
	{ label: "Dashboard", href: "/", icon: LayoutDashboard },
	{ label: "Journal", href: "/journal", icon: BookOpen },
	{ label: "Analytics", href: "/analytics", icon: BarChart3 },
	{ label: "Playbook", href: "/playbook", icon: FileText },
	{ label: "Reports", href: "/reports", icon: FileBarChart },
	{ label: "Settings", href: "/settings", icon: Settings },
]

export const Sidebar = () => {
	const [isCollapsed, setIsCollapsed] = useState(false)
	const pathname = usePathname()

	const handleToggleCollapse = () => {
		setIsCollapsed((prev) => !prev)
	}

	return (
		<aside
			className={cn(
				"flex h-screen flex-col border-r border-bg-300 bg-bg-200 transition-all duration-300",
				isCollapsed ? "w-16" : "w-64"
			)}
		>
			{/* Logo */}
			<div className="flex h-16 items-center justify-between border-b border-bg-300 px-4">
				{!isCollapsed && (
					<span className="text-h3 font-bold text-acc-100">ProfitJournal</span>
				)}
				<button
					type="button"
					onClick={handleToggleCollapse}
					className="rounded-md p-2 text-txt-200 hover:bg-bg-300 hover:text-txt-100"
					aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					{isCollapsed ? (
						<ChevronRight className="h-5 w-5" />
					) : (
						<ChevronLeft className="h-5 w-5" />
					)}
				</button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-1 p-2">
				{navItems.map((item) => {
					const isActive =
						item.href === "/"
							? pathname === "/"
							: pathname.startsWith(item.href)

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-small transition-colors",
								isActive
									? "bg-acc-100/10 text-acc-100"
									: "text-txt-200 hover:bg-bg-300 hover:text-txt-100",
								isCollapsed && "justify-center"
							)}
							aria-current={isActive ? "page" : undefined}
						>
							<item.icon className="h-5 w-5 flex-shrink-0" />
							{!isCollapsed && <span>{item.label}</span>}
						</Link>
					)
				})}
			</nav>

			{/* Footer */}
			<div className="border-t border-bg-300 p-4">
				{!isCollapsed && (
					<p className="text-tiny text-txt-300">Trading Journal v1.0</p>
				)}
			</div>
		</aside>
	)
}
