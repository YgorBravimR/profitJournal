import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Profit Journal",
	description: "Personal trading performance analysis and journaling platform",
	icons: {
		icon: "/logo_nobg.png",
		shortcut: "/logo_nobg.png",
		apple: "/logo_nobg.png",
	},
}

interface RootLayoutProps {
	children: React.ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
	return (
		<html suppressHydrationWarning data-brand="bravo">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	)
}

export default RootLayout
