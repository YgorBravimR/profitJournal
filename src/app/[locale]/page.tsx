import { getTranslations, setRequestLocale } from "next-intl/server"
import { PageHeader } from "@/components/layout"
import { DashboardContent } from "@/components/dashboard"
import {
	getOverallStats,
	getDisciplineScore,
	getEquityCurve,
	getStreakData,
	getDailyPnL,
} from "@/app/actions/analytics"

interface DashboardPageProps {
	params: Promise<{ locale: string }>
}

const DashboardPage = async ({ params }: DashboardPageProps) => {
	const { locale } = await params
	setRequestLocale(locale)

	const t = await getTranslations("dashboard")
	const now = new Date()
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
	const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

	const [statsResult, disciplineResult, equityCurveResult, streakResult, dailyPnLResult] =
		await Promise.all([
			getOverallStats(),
			getDisciplineScore(),
			getEquityCurve(monthStart, monthEnd),
			getStreakData(),
			getDailyPnL(now),
		])

	const stats = statsResult.status === "success" ? statsResult.data ?? null : null
	const discipline = disciplineResult.status === "success" ? disciplineResult.data ?? null : null
	const equityCurve = equityCurveResult.status === "success" ? equityCurveResult.data ?? [] : []
	const streakData = streakResult.status === "success" ? streakResult.data ?? null : null
	const dailyPnL = dailyPnLResult.status === "success" ? dailyPnLResult.data ?? [] : []

	return (
		<div className="flex h-full flex-col">
			<PageHeader title={t("title")} description={t("description")} />
			<div className="flex-1 p-m-600">
				<DashboardContent
					initialStats={stats}
					initialDiscipline={discipline}
					initialEquityCurve={equityCurve}
					initialStreakData={streakData}
					initialDailyPnL={dailyPnL}
					initialMonth={now}
				/>
			</div>
		</div>
	)
}

export default DashboardPage
