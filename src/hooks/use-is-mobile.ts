import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Returns `true` when the viewport is below the `md` breakpoint (768px).
 *
 * Defaults to `false` during SSR and on initial client render so the
 * server-rendered HTML always matches the first client paint (no hydration
 * mismatch). The auth-gate / loading overlays hide the brief desktop-first
 * flash on mobile devices.
 */
const useIsMobile = (): boolean => {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

		const handleChange = () => {
			setIsMobile(mql.matches)
		}

		// Set initial value
		handleChange()

		mql.addEventListener("change", handleChange)
		return () => mql.removeEventListener("change", handleChange)
	}, [])

	return isMobile
}

export { useIsMobile }
