import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Public_Sans, Geist_Mono } from "next/font/google"
import { BrandScript } from "@/components/providers/brand-script"
import "./globals.css"

const publicSans = Public_Sans({
	variable: "--font-public-sans",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
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
	children: ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
	return (
		<html suppressHydrationWarning data-brand="bravo">
			{/* <head>
				<BrandScript />
			</head> */}
			<body
				className={`${publicSans.variable} ${geistMono.variable} font-sans antialiased`}
			>
				{children}
			</body>
		</html>
	)
}

export default RootLayout
