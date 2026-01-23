import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes"
import { ToastProvider } from "@/components/ui/toast"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Trading Study Tracker",
	description: "Stay organized with your daily trading study routine",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="data-theme"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange={false}
				>
					<ToastProvider>
						{children}
					</ToastProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
