import { getTasksForDate, getTasksForWeek } from "@/app/actions/tasks"
import { getGoalsForPeriod } from "@/app/actions/goals"
import { getStreakData, getOverallStats } from "@/app/actions/analytics"
import { getWeekBoundaries } from "@/lib/dates"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { TodaysFocus } from "@/components/dashboard/todays-focus"
import { WeekGoals } from "@/components/dashboard/week-goals"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { Flame, Target, Calendar, TrendingUp } from "lucide-react"

/**
 * Main Dashboard Page - Server Component
 * Displays today's tasks, this week's goals, and quick statistics
 */
const HomePage = async () => {
	// Fetch data for dashboard
	const today = new Date()
	const weekBoundaries = getWeekBoundaries(today)

	const [todaysTasksResult, streakResult, overallStatsResult, weekGoalsResult] =
		await Promise.all([
			getTasksForDate(today),
			getStreakData(),
			getOverallStats(),
			getGoalsForPeriod(weekBoundaries.start, weekBoundaries.end),
		])

	const todaysTasks =
		todaysTasksResult.status === "success" ? todaysTasksResult.data || [] : []
	const streakData =
		streakResult.status === "success"
			? streakResult.data
			: { currentStreak: 0, longestStreak: 0, lastCompletionDate: null }
	const overallStats =
		overallStatsResult.status === "success"
			? overallStatsResult.data
			: {
					totalCompletions: 0,
					currentStreak: 0,
					longestStreak: 0,
					mostProductiveDay: { dayName: "N/A", completionCount: 0 },
					averageCompletionsPerDay: 0,
				}
	const weekGoals =
		weekGoalsResult.status === "success" ? weekGoalsResult.data || [] : []

	// Calculate today's completion rate
	const todaysCompletedCount = todaysTasks.filter((t) => t.completion).length
	const todaysCompletionRate =
		todaysTasks.length > 0
			? Math.round((todaysCompletedCount / todaysTasks.length) * 100)
			: 0

	return (
		<div className="min-h-screen bg-bg-100 p-m-600">
			{/* Header */}
			<header className="mb-l-700 flex w-full items-center justify-between">
				<div>
					<h1 className="text-h1 font-bold text-acc-100">Trading Study Tracker</h1>
					<p className="mt-s-200 text-body text-txt-200">
						Stay organized with your daily study routine
					</p>
				</div>
				<ThemeToggle />
			</header>

			{/* Main Dashboard Grid */}
			<div className="grid grid-cols-1 gap-l-700 lg:grid-cols-3">
				{/* Left Column - Stats */}
				<div className="space-y-m-600">
					<QuickStats
						stats={{
							currentStreak: overallStats?.currentStreak ?? 0,
							todaysCompletionRate,
							totalCompletions: overallStats?.totalCompletions ?? 0,
							mostProductiveDay: overallStats?.mostProductiveDay?.dayName ?? "N/A",
						}}
					/>
				</div>

				{/* Middle Column - Today's Focus */}
				<div className="lg:col-span-2">
					<TodaysFocus tasks={todaysTasks} date={today} />
				</div>
			</div>

			{/* Week Goals Section */}
			<div className="mt-l-700">
				<WeekGoals goals={weekGoals} weekStart={weekBoundaries.start} />
			</div>
		</div>
	)
}

export default HomePage
