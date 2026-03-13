/**
 * Root layout error boundary.
 *
 * This catches errors that happen in the root layout itself — when this fires,
 * Tailwind/globals.css may not be available, so we use inline styles.
 * Colors are hardcoded from globals.css dark theme.
 */
"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

const GlobalError = (props: {
	error: Error & { digest?: string }
	reset: () => void
}) => {
	const { error, reset } = props

	useEffect(() => {
		Sentry.captureException(error)
	}, [error])

	return (
		<html lang="en">
			<body
				style={{
					backgroundColor: "rgb(11 14 17)",
					color: "rgb(240 242 245)",
					fontFamily: "system-ui, sans-serif",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100dvh",
					margin: 0,
					padding: "1.5rem",
				}}
			>
				<div
					style={{
						backgroundColor: "rgb(21 25 33)",
						borderRadius: "0.75rem",
						padding: "2.5rem",
						maxWidth: "28rem",
						width: "100%",
						textAlign: "center",
						boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
					}}
				>
					<div
						style={{
							width: "3rem",
							height: "3rem",
							margin: "0 auto 1.5rem",
							backgroundColor: "rgba(204, 85, 85, 0.2)",
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "1.5rem",
						}}
						aria-hidden="true"
					>
						!
					</div>

					<h1
						style={{
							fontSize: "1.25rem",
							fontWeight: 700,
							marginBottom: "0.75rem",
						}}
					>
						Something went wrong!
					</h1>

					<p
						style={{
							color: "rgb(170 180 195)",
							fontSize: "0.875rem",
							lineHeight: 1.6,
							marginBottom: "1.5rem",
						}}
					>
						A critical error occurred. Please try again or reload the page.
					</p>

					{error.digest && (
						<p
							style={{
								color: "rgb(140 150 165)",
								fontSize: "0.75rem",
								backgroundColor: "rgb(43 47 54)",
								padding: "0.5rem 1rem",
								borderRadius: "0.5rem",
								marginBottom: "1.5rem",
							}}
						>
							Reference: {error.digest}
						</p>
					)}

					<button
						type="button"
						onClick={reset}
						style={{
							backgroundColor: "rgb(204 162 72)",
							color: "rgb(11 14 17)",
							border: "none",
							borderRadius: "0.5rem",
							padding: "0.625rem 1.5rem",
							fontSize: "0.875rem",
							fontWeight: 600,
							cursor: "pointer",
						}}
						aria-label="Try again"
					>
						Try Again
					</button>
				</div>
			</body>
		</html>
	)
}

export default GlobalError
