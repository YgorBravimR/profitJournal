import { PageHeader } from "@/components/layout"
import { DashboardContent } from "@/components/dashboard"
import {
	getOverallStats,
	getDisciplineScore,
	getEquityCurve,
	getStreakData,
	getDailyPnL,
} from "@/app/actions/analytics"

const DashboardPage = async () => {
	const currentMonth = new Date()

	const [statsResult, disciplineResult, equityCurveResult, streakResult, dailyPnLResult] =
		await Promise.all([
			getOverallStats(),
			getDisciplineScore(),
			getEquityCurve(),
			getStreakData(),
			getDailyPnL(currentMonth),
		])

	const stats = statsResult.status === "success" ? statsResult.data ?? null : null
	const discipline = disciplineResult.status === "success" ? disciplineResult.data ?? null : null
	const equityCurve = equityCurveResult.status === "success" ? equityCurveResult.data ?? [] : []
	const streakData = streakResult.status === "success" ? streakResult.data ?? null : null
	const dailyPnL = dailyPnLResult.status === "success" ? dailyPnLResult.data ?? [] : []

	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="Command Center"
				description="Your trading performance at a glance"
			/>
			<div className="flex-1 p-m-600">
				<DashboardContent
					initialStats={stats}
					initialDiscipline={discipline}
					initialEquityCurve={equityCurve}
					initialStreakData={streakData}
					initialDailyPnL={dailyPnL}
					initialMonth={currentMonth}
				/>
			</div>
		</div>
	)
}

export default DashboardPage
