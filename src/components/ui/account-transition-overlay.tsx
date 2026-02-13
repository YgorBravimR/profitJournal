"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { User, Building2, RotateCcw } from "lucide-react"

// ==========================================
// Types
// ==========================================

interface AccountTransitionOptions {
	accountName: string
	accountType: "personal" | "prop" | "replay"
}

interface AccountTransitionContextType {
	showAccountTransition: (options: AccountTransitionOptions & {
		onTransition: () => Promise<void>
	}) => void
	isTransitioning: boolean
}

type TransitionPhase = "idle" | "entering" | "active" | "expanding"

// ==========================================
// Context
// ==========================================

const AccountTransitionContext = createContext<AccountTransitionContextType | undefined>(undefined)

const useAccountTransition = () => {
	const context = useContext(AccountTransitionContext)
	if (!context) {
		throw new Error("useAccountTransition must be used within AccountTransitionOverlayProvider")
	}
	return context
}

// ==========================================
// Helpers
// ==========================================

const getAccountIcon = (accountType: string) => {
	switch (accountType) {
		case "prop":
			return Building2
		case "replay":
			return RotateCcw
		default:
			return User
	}
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ==========================================
// Provider
// ==========================================

const AccountTransitionOverlayProvider = ({ children }: { children: React.ReactNode }) => {
	const t = useTranslations("auth.accountSwitcher")
	const [phase, setPhase] = useState<TransitionPhase>("idle")
	const [options, setOptions] = useState<AccountTransitionOptions | null>(null)
	const overlayRef = useRef<HTMLDivElement>(null)
	const previousFocusRef = useRef<HTMLElement | null>(null)

	const isTransitioning = phase !== "idle"

	const showAccountTransition = useCallback((transitionOptions: AccountTransitionOptions & {
		onTransition: () => Promise<void>
	}) => {
		if (isTransitioning) return

		previousFocusRef.current = document.activeElement as HTMLElement | null
		setOptions({
			accountName: transitionOptions.accountName,
			accountType: transitionOptions.accountType,
		})
		setPhase("entering")

		// 300ms enter + 5700ms active + 500ms expand, then hard reload
		setTimeout(async () => {
			setPhase("active")

			const minimumDelay = sleep(5700)

			try {
				await Promise.all([transitionOptions.onTransition(), minimumDelay])
			} catch {
				// On error, still proceed to reload
			}

			// Video grows into screen, text fades out — overlay stays solid bg-bg-100
			setPhase("expanding")
			await sleep(500)

			// At this point the overlay is a solid bg-bg-100 with no visible content.
			// Hard reload now — the browser keeps the old document visible until the
			// new one is ready, so the solid background provides visual continuity.
			window.location.reload()
		}, 300)
	}, [isTransitioning])

	// Focus trap: move focus to overlay on mount
	useEffect(() => {
		if (isTransitioning && overlayRef.current) {
			overlayRef.current.focus()
		}
	}, [isTransitioning])

	// Trap keyboard events while overlay is visible
	useEffect(() => {
		if (!isTransitioning) return

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Tab" || e.key === "Escape") {
				e.preventDefault()
				e.stopPropagation()
			}
		}

		document.addEventListener("keydown", handleKeyDown, true)
		return () => document.removeEventListener("keydown", handleKeyDown, true)
	}, [isTransitioning])

	const getAccountTypeLabel = (accountType: string) => {
		switch (accountType) {
			case "prop":
				return t("propFirm")
			case "replay":
				return t("replay")
			default:
				return t("personal")
		}
	}

	return (
		<AccountTransitionContext.Provider value={{ showAccountTransition, isTransitioning }}>
			{children}

			{/* Transition Overlay */}
			{isTransitioning && options && (() => {
				const AccountIcon = getAccountIcon(options.accountType)
				const isExpanding = phase === "expanding"

				return (
					<div
						ref={overlayRef}
						role="alertdialog"
						aria-modal="true"
						aria-busy="true"
						aria-label={t("transitionLabel", { name: options.accountName })}
						tabIndex={-1}
						className="fixed inset-0 z-50 flex items-center justify-center bg-bg-100 outline-none animate-overlay-fade-in"
					>
						<div className="flex flex-col items-center gap-m-600">
							{/* Video with gold gradient ring — expands at the end */}
							<div className={isExpanding
								? "relative will-change-transform-opacity animate-transition-video-expand"
								: "relative animate-transition-scale-in"
							}>
								{/* Pulsing gold ring */}
								<div
									className="absolute -inset-3 rounded-full bg-linear-to-br from-brand-400 via-acc-100 to-brand-600 animate-transition-ring-pulse"
									aria-hidden="true"
								/>

								{/* Video container with logo fallback */}
								<div className="relative h-60 w-60 overflow-hidden rounded-full bg-[url('/logo_nobg.png')] bg-cover bg-center">
									<video
										autoPlay
										muted
										playsInline
										loop
										className="h-full w-full object-cover"
									>
										<source src="/Lion_Video_Details_and_Generation.mp4" type="video/mp4" />
									</video>
								</div>
							</div>

							{/* Gold pulse line divider — fade wrapper avoids dual-animation conflict */}
							<div className={isExpanding ? "animate-transition-content-fade" : ""}>
								<div
									className="h-0.5 w-20 rounded-full bg-acc-100 animate-overlay-pulse-line"
									aria-hidden="true"
								/>
							</div>

							{/* Text content — fade wrapper keeps fade separate from text-up animation */}
							<div className={isExpanding ? "animate-transition-content-fade" : ""}>
								<div className="flex flex-col items-center gap-s-200">
									<p className="text-small text-txt-300 animate-transition-text-up">
										{t("switchingTo")}
									</p>
									<p className="text-h3 font-semibold text-acc-100 animate-transition-text-up animation-delay-100">
										{options.accountName}
									</p>
									<div className="flex items-center gap-s-200 text-small text-txt-300 animate-transition-text-up animation-delay-200">
										<AccountIcon className="h-4 w-4" aria-hidden="true" />
										<span>{getAccountTypeLabel(options.accountType)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				)
			})()}
		</AccountTransitionContext.Provider>
	)
}

export { AccountTransitionOverlayProvider, useAccountTransition }
export type { AccountTransitionOptions, AccountTransitionContextType }
