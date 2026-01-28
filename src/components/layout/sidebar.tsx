"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/routing"
import {
	LayoutDashboard,
	BookOpen,
	BarChart3,
	FileText,
	FileBarChart,
	CalendarDays,
	Settings,
	ChevronLeft,
	ChevronRight,
	type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AccountSwitcher } from "./account-switcher"
import { UserMenu } from "./user-menu"

interface NavItem {
	labelKey: "dashboard" | "journal" | "analytics" | "playbook" | "reports" | "monthly" | "settings"
	href: "/" | "/journal" | "/analytics" | "/playbook" | "/reports" | "/monthly" | "/settings"
	icon: LucideIcon
}

const navItems: NavItem[] = [
	{ labelKey: "dashboard", href: "/", icon: LayoutDashboard },
	{ labelKey: "journal", href: "/journal", icon: BookOpen },
	{ labelKey: "analytics", href: "/analytics", icon: BarChart3 },
	{ labelKey: "playbook", href: "/playbook", icon: FileText },
	{ labelKey: "reports", href: "/reports", icon: FileBarChart },
	{ labelKey: "monthly", href: "/monthly", icon: CalendarDays },
	{ labelKey: "settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
	isCollapsed: boolean
	onToggleCollapse: () => void
}

export const Sidebar = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
	const t = useTranslations("nav")
	const pathname = usePathname()

	return (
		<aside
			className={cn(
				"fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-bg-300 bg-bg-200 transition-all duration-300",
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
					onClick={onToggleCollapse}
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
							{!isCollapsed && <span>{t(item.labelKey)}</span>}
						</Link>
					)
				})}
			</nav>

			{/* Account Switcher */}
			<div className={cn(
				"border-t border-bg-300",
				isCollapsed ? "flex flex-col items-center gap-2 py-4" : "space-y-2 p-4"
			)}>
				<AccountSwitcher isCollapsed={isCollapsed} />
				<UserMenu isCollapsed={isCollapsed} />
			</div>
		</aside>
	)
}
