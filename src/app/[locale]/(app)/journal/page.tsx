import { getTranslations, setRequestLocale } from "next-intl/server"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { JournalContent } from "@/components/journal"
import { Link } from "@/i18n/routing"

// Force dynamic rendering to ensure account-specific data
export const dynamic = "force-dynamic"

interface JournalPageProps {
	params: Promise<{ locale: string }>
}

const JournalPage = async ({ params }: JournalPageProps) => {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations("journal")
	const tTrade = await getTranslations("trade")

	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title={t("title")}
				description={t("description")}
				action={
					<Link href="/journal/new">
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							{tTrade("newTrade")}
						</Button>
					</Link>
				}
			/>
			<div className="flex-1 overflow-auto p-m-600">
				<JournalContent />
			</div>
		</div>
	)
}

export default JournalPage
