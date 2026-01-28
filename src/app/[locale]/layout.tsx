import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { ThemeProvider } from "next-themes"
import { ToastProvider } from "@/components/ui/toast"
import { AuthProvider } from "@/components/auth"
import { routing } from "@/i18n/routing"

interface LocaleLayoutProps {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}

export const generateStaticParams = () => {
	return routing.locales.map((locale) => ({ locale }))
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
	const { locale } = await params

	// Validate that the incoming `locale` parameter is valid
	if (!routing.locales.includes(locale as "pt-BR" | "en")) {
		notFound()
	}

	// Enable static rendering
	setRequestLocale(locale)

	// Providing all messages to the client side
	const messages = await getMessages()

	return (
		<NextIntlClientProvider messages={messages}>
			<ThemeProvider
				attribute="data-theme"
				defaultTheme="dark"
				enableSystem={false}
				disableTransitionOnChange={false}
			>
				<ToastProvider>
					<AuthProvider>
						<div className="min-h-screen bg-bg-100">
							{children}
						</div>
					</AuthProvider>
				</ToastProvider>
			</ThemeProvider>
		</NextIntlClientProvider>
	)
}

export default LocaleLayout
