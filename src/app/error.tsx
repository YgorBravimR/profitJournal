"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

/**
 * Error boundary for main dashboard
 */
const Error = (props: {
	error: Error & { digest?: string }
	reset: () => void
}) => {
	const { error, reset } = props

	useEffect(() => {
		console.error("Dashboard error:", error)
	}, [error])

	return (
		<div className="bg-bg-100 p-m-600 flex min-h-screen items-center justify-center">
			<Card className="bg-bg-200 p-l-700 max-w-lg shadow-xl">
				<div className="flex flex-col items-center text-center">
					<div className="bg-fb-error/20 p-m-600 rounded-full">
						<AlertTriangle className="text-fb-error h-12 w-12" />
					</div>

					<h1 className="mt-m-600 text-h2 text-txt-100 font-bold">
						Something went wrong!
					</h1>

					<p className="mt-m-400 text-body text-txt-200">
						An error occurred while loading the dashboard. This could be a
						temporary issue.
					</p>

					{error.message && (
						<div className="mt-m-500 bg-bg-300 p-m-400 w-full rounded-lg">
							<p className="text-small text-txt-300">
								<strong>Error:</strong> {error.message}
							</p>
						</div>
					)}

					<div className="mt-l-700 gap-m-400 flex">
						<Button
							onClick={reset}
							className="bg-acc-100 text-bg-100 hover:bg-acc-100/90"
							type="button"
						>
							Try Again
						</Button>
						<Button variant="ghost" onClick={() => window.location.reload()}>
							Reload Page
						</Button>
					</div>
				</div>
			</Card>
		</div>
	)
}

export default Error
