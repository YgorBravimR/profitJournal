"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Menu } from "lucide-react"
import Image from "next/image"
import { Sidebar } from "@/components/layout/sidebar"
import { ThemeSynchronizer } from "@/components/providers/theme-synchronizer"
import { BrandSynchronizer } from "@/components/providers/brand-synchronizer"
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-is-mobile"
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
 *
 * On mobile (< md) the sidebar is hidden behind a Sheet (hamburger menu).
 * On desktop (>= md) the sidebar is the fixed aside as before.
 */
const AppShell = ({
	children,
	isReplayAccount = false,
	replayDate,
	serverBrand,
}: AppShellProps) => {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const isMobile = useIsMobile()
	const tCommon = useTranslations("common")

	return (
		<>
			<ThemeSynchronizer />
			<BrandSynchronizer serverBrand={serverBrand} />

			{isMobile ? (
				<>
					{/* Mobile top bar */}
					<header className="border-bg-300 bg-bg-200 fixed top-0 right-0 left-0 z-40 flex h-14 items-center border-b px-4">
						<Sheet
							open={isMobileMenuOpen}
							onOpenChange={setIsMobileMenuOpen}
						>
							<SheetTrigger asChild>
								<button
									type="button"
									className="text-txt-200 hover:bg-bg-300 hover:text-txt-100 focus-visible:ring-acc-100 -ml-2 rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none"
									aria-label={tCommon("openMenu")}
								>
									<Menu className="h-5 w-5" />
								</button>
							</SheetTrigger>

							<SheetContent
								id="mobile-sidebar-sheet"
								side="left"
								className="w-64 p-0"
							>
								<SheetTitle className="sr-only">
									{tCommon("openMenu")}
								</SheetTitle>
								<Sidebar
									isCollapsed={false}
									onToggleCollapse={() => {}}
									isReplayAccount={isReplayAccount}
									replayDate={replayDate}
									variant="sheet"
									onNavigate={() => setIsMobileMenuOpen(false)}
								/>
							</SheetContent>
						</Sheet>

						<Image
							src="/bravo-nobg.png"
							alt="Bravo"
							width={100}
							height={28}
							className="ml-2 h-7 w-auto object-contain"
							priority
						/>
					</header>

					{/* Mobile main content */}
					<main className="min-h-screen pt-14">{children}</main>
				</>
			) : (
				<>
					{/* Desktop sidebar */}
					<Sidebar
						isCollapsed={isSidebarCollapsed}
						onToggleCollapse={() =>
							setIsSidebarCollapsed((prev) => !prev)
						}
						isReplayAccount={isReplayAccount}
						replayDate={replayDate}
					/>

					{/* Desktop main content */}
					<main
						className={cn(
							"min-h-screen transition-[margin-left] duration-300",
							isSidebarCollapsed ? "ml-16" : "ml-64"
						)}
					>
						{children}
					</main>
				</>
			)}
		</>
	)
}

export { AppShell }
