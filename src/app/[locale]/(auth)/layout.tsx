import type { ReactNode } from "react"

interface AuthLayoutProps {
	children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
	return (
		<div className="relative flex min-h-dvh items-center justify-center p-m-400">
			{children}
			<footer className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5">
				<span className="text-micro text-txt-placeholder tracking-wide">
					© {new Date().getFullYear()} Axion
				</span>
				<span className="text-micro text-txt-placeholder">·</span>
				<span className="text-micro text-txt-placeholder tracking-wide">by</span>
				<span className="text-micro text-acc-200 tracking-[0.15em] font-medium">
					BRAVO
				</span>
			</footer>
		</div>
	)
}

export default AuthLayout
