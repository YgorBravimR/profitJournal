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
	Target,
	Dices,
	Plus,
	RotateCcw,
	type LucideIcon,
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { AccountSwitcher } from "./account-switcher"
import { UserMenu } from "./user-menu"

interface NavItem {
	labelKey:
		| "dashboard"
		| "journal"
		| "analytics"
		| "playbook"
		| "reports"
		| "monthly"
		| "commandCenter"
		| "monteCarlo"
		| "settings"
	href:
		| "/"
		| "/journal"
		| "/analytics"
		| "/playbook"
		| "/reports"
		| "/monthly"
		| "/command-center"
		| "/monte-carlo"
		| "/settings"
	icon: LucideIcon
}

const navItems: NavItem[] = [
	{ labelKey: "dashboard", href: "/", icon: LayoutDashboard },
	{ labelKey: "commandCenter", href: "/command-center", icon: Target },
	{ labelKey: "journal", href: "/journal", icon: BookOpen },
	{ labelKey: "analytics", href: "/analytics", icon: BarChart3 },
	{ labelKey: "monteCarlo", href: "/monte-carlo", icon: Dices },
	{ labelKey: "playbook", href: "/playbook", icon: FileText },
	{ labelKey: "reports", href: "/reports", icon: FileBarChart },
	{ labelKey: "monthly", href: "/monthly", icon: CalendarDays },
	{ labelKey: "settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
	isCollapsed: boolean
	onToggleCollapse: () => void
	isReplayAccount?: boolean
	replayDate?: string
}

export const Sidebar = ({
	isCollapsed,
	onToggleCollapse,
	isReplayAccount = false,
	replayDate,
}: SidebarProps) => {
	const t = useTranslations("nav")
	const tReplay = useTranslations("commandCenter.dateNavigator")
	const tCommon = useTranslations("common")
	const pathname = usePathname()

	return (
		<aside
			className={cn(
				"border-bg-300 bg-bg-200 fixed top-0 left-0 z-40 flex h-screen flex-col border-r transition-[width] duration-300",
				isCollapsed ? "w-16" : "w-64"
			)}
		>
			{/* Logo */}
			<div className="border-bg-300 flex h-16 items-center justify-between border-b px-4">
				{isCollapsed ? (
					<Image
						src="/logo_nobg.png"
						alt="Bravo"
						width={32}
						height={32}
						className="h-8 w-8 object-contain"
						priority
					/>
				) : (
					<Image
						src="/bravo-nobg.png"
						alt="Bravo"
						width={140}
						height={40}
						className="h-10 w-auto object-contain"
						priority
					/>
				)}
				<button
					type="button"
					onClick={onToggleCollapse}
					className="text-txt-200 hover:bg-bg-300 hover:text-txt-100 focus-visible:ring-acc-100 rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none"
					aria-label={
						isCollapsed ? tCommon("expandSidebar") : tCommon("collapseSidebar")
					}
				>
					{isCollapsed ? (
						<ChevronRight className="h-5 w-5" />
					) : (
						<ChevronLeft className="h-5 w-5" />
					)}
				</button>
			</div>

			{/* New Trade Button */}
			<div className="px-2 pt-2">
				{pathname === "/journal/new" ? (
					<span
						className={cn(
							"bg-acc-100/10 text-acc-100 text-small flex items-center gap-3 rounded-md px-3 py-2 font-medium",
							isCollapsed && "justify-center"
						)}
						aria-current="page"
					>
						<Plus className="h-5 w-5 shrink-0" />
						{!isCollapsed && <span>{t("newTrade")}</span>}
					</span>
				) : (
					<Link
						href="/journal/new"
						className={cn(
							"bg-acc-100 hover:bg-acc-100/90 text-small flex items-center gap-3 rounded-md px-3 py-2 font-medium text-white transition-colors",
							isCollapsed && "justify-center"
						)}
						aria-label={t("newTrade")}
					>
						<Plus className="h-5 w-5 shrink-0" />
						{!isCollapsed && <span>{t("newTrade")}</span>}
					</Link>
				)}
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
								"text-small flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
								isActive
									? "bg-acc-100/10 text-acc-100"
									: "text-txt-200 hover:bg-bg-300 hover:text-txt-100",
								isCollapsed && "justify-center"
							)}
							aria-current={isActive ? "page" : undefined}
						>
							<item.icon className="h-5 w-5 shrink-0" />
							{!isCollapsed && <span>{t(item.labelKey)}</span>}
						</Link>
					)
				})}
			</nav>

			{/* Replay Mode Badge */}
			{isReplayAccount && replayDate && (
				<div
					className={cn(
						"border-bg-300 border-t px-3 py-2",
						isCollapsed && "flex justify-center px-0"
					)}
				>
					{isCollapsed ? (
						<div
							className="bg-acc-100/10 flex h-8 w-8 items-center justify-center rounded-md"
							aria-label={tReplay("replayMode")}
							title={`${tReplay("replayMode")} — ${replayDate}`}
						>
							<RotateCcw className="text-acc-100 h-4 w-4" />
						</div>
					) : (
						<div className="gap-s-200 bg-acc-100/10 px-s-300 py-s-200 flex flex-col rounded-md">
							<div className="flex items-center gap-2">
								<RotateCcw
									className="text-acc-100 h-3.5 w-3.5 shrink-0"
									aria-hidden="true"
								/>
								<span className="text-tiny text-acc-100 font-medium">
									{tReplay("replayMode")}
								</span>
							</div>
							<span className="text-tiny text-txt-300">{replayDate}</span>
						</div>
					)}
				</div>
			)}

			{/* Account Switcher */}
			<div
				className={cn(
					"border-bg-300 border-t",
					isCollapsed
						? "flex flex-col items-center gap-2 py-4"
						: "space-y-2 p-4"
				)}
			>
				<AccountSwitcher isCollapsed={isCollapsed} />
				<UserMenu isCollapsed={isCollapsed} />
			</div>
		</aside>
	)
}
