import { setRequestLocale, getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/layout"
import { MonthlyContent } from "@/components/monthly"

interface MonthlyPageProps {
	params: Promise<{ locale: string }>
}

const MonthlyPage = async ({ params }: MonthlyPageProps) => {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations("monthly")

	return (
		<div className="min-h-screen bg-bg-100">
			<PageHeader title={t("title")} description={t("description")} />

			<main className="mx-auto max-w-5xl px-m-500 py-m-600">
				<MonthlyContent />
			</main>
		</div>
	)
}

export default MonthlyPage
