import { Card } from "@/components/ui/card"

/**
 * Loading state for main dashboard
 */
const Loading = () => {
	return (
		<div className="min-h-screen bg-bg-100 p-m-600">
			{/* Header skeleton */}
			<header className="mb-l-700 flex w-full items-center justify-between">
				<div>
					<div className="h-12 w-64 animate-pulse rounded-lg bg-bg-200" />
					<div className="mt-s-200 h-6 w-96 animate-pulse rounded-lg bg-bg-200" />
				</div>
				<div className="h-10 w-10 animate-pulse rounded-lg bg-bg-200" />
			</header>

			{/* Main grid skeleton */}
			<div className="grid grid-cols-1 gap-l-700 lg:grid-cols-3">
				{/* Stats column */}
				<div className="space-y-m-600">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i} className="bg-bg-200 p-m-600 shadow-medium">
							<div className="space-y-s-300 animate-pulse">
								<div className="h-4 w-20 rounded bg-bg-300" />
								<div className="h-8 w-32 rounded bg-bg-300" />
								<div className="h-4 w-24 rounded bg-bg-300" />
							</div>
						</Card>
					))}
				</div>

				{/* Tasks column */}
				<div className="lg:col-span-2">
					<Card className="bg-bg-200 p-l-700 shadow-medium">
						<div className="space-y-m-500 animate-pulse">
							<div className="h-8 w-48 rounded bg-bg-300" />
							<div className="space-y-m-400">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-32 w-full rounded-lg bg-bg-300" />
								))}
							</div>
						</div>
					</Card>
				</div>
			</div>

			{/* Week goals skeleton */}
			<div className="mt-l-700">
				<Card className="bg-bg-200 p-l-700 shadow-medium">
					<div className="space-y-m-500 animate-pulse">
						<div className="h-8 w-56 rounded bg-bg-300" />
						<div className="space-y-m-400">
							{[1, 2].map((i) => (
								<div key={i} className="h-40 w-full rounded-lg bg-bg-300" />
							))}
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}

export default Loading
