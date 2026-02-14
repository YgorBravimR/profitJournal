"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getStrategy, updateStrategy } from "@/app/actions/strategies"
import type { StrategyWithStats } from "@/app/actions/strategies"

interface EditStrategyPageProps {
	params: Promise<{ id: string }>
}

const EditStrategyPage = ({ params }: EditStrategyPageProps) => {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [strategy, setStrategy] = useState<StrategyWithStats | null>(null)
	const [strategyId, setStrategyId] = useState<string | null>(null)

	useEffect(() => {
		const loadStrategy = async () => {
			const { id } = await params
			setStrategyId(id)
			const result = await getStrategy(id)
			if (result.status === "success" && result.data) {
				setStrategy(result.data)
			} else {
				setError("Strategy not found")
			}
			setIsLoading(false)
		}
		loadStrategy()
	}, [params])

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!strategyId) return
		setError(null)

		const formData = new FormData(e.currentTarget)

		const data = {
			code: (formData.get("code") as string).toUpperCase(),
			name: formData.get("name") as string,
			description: (formData.get("description") as string) || undefined,
			entryCriteria: (formData.get("entryCriteria") as string) || undefined,
			exitCriteria: (formData.get("exitCriteria") as string) || undefined,
			riskRules: (formData.get("riskRules") as string) || undefined,
			targetRMultiple: formData.get("targetRMultiple")
				? Number(formData.get("targetRMultiple"))
				: undefined,
			maxRiskPercent: formData.get("maxRiskPercent")
				? Number(formData.get("maxRiskPercent"))
				: undefined,
			screenshotUrl: (formData.get("screenshotUrl") as string) || undefined,
			notes: (formData.get("notes") as string) || undefined,
			isActive: true,
		}

		startTransition(async () => {
			const result = await updateStrategy(strategyId, data)

			if (result.status === "success") {
				router.push("/playbook")
			} else {
				setError(result.message)
			}
		})
	}

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-txt-300">Loading strategy...</p>
			</div>
		)
	}

	if (!strategy) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-m-400">
				<p className="text-txt-300">Strategy not found</p>
				<Link href="/playbook">
					<Button variant="outline">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Playbook
					</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 overflow-y-auto p-m-600">
				<div className="mx-auto max-w-3xl">
					<form onSubmit={handleSubmit} className="space-y-m-600">
						{error && (
							<div className="bg-fb-error/10 text-fb-error rounded-lg p-s-300 text-small">
								{error}
							</div>
						)}

						{/* Basic Info Section */}
						<div className="border-bg-300 bg-bg-200 rounded-lg border p-m-500">
							<h2 className="text-body text-txt-100 mb-m-400 font-semibold">
								Basic Info
							</h2>

							<div className="space-y-m-400">
								<div className="grid grid-cols-3 gap-m-400">
									<div>
										<Label htmlFor="code">Code *</Label>
										<Input
											id="code"
											name="code"
											defaultValue={strategy.code}
											placeholder="e.g., PWBK"
											required
											maxLength={10}
											minLength={3}
											className="mt-s-200 uppercase"
										/>
										<p className="text-tiny text-txt-300 mt-s-100">
											Short identifier (3-10 characters)
										</p>
									</div>
									<div className="col-span-2">
										<Label htmlFor="name">Strategy Name *</Label>
										<Input
											id="name"
											name="name"
											defaultValue={strategy.name}
											placeholder="e.g., 15m Breakout, London Session Reversal"
											required
											className="mt-s-200"
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										name="description"
										defaultValue={strategy.description || ""}
										placeholder="Brief description of this strategy..."
										rows={3}
										className="mt-s-200"
									/>
								</div>

								<div>
									<Label htmlFor="screenshotUrl">Reference Image URL</Label>
									<Input
										id="screenshotUrl"
										name="screenshotUrl"
										type="url"
										defaultValue={strategy.screenshotUrl || ""}
										placeholder="https://example.com/chart-screenshot.png"
										className="mt-s-200"
									/>
									<p className="text-tiny text-txt-300 mt-s-100">
										Optional: Link to an example chart or setup screenshot
									</p>
								</div>
							</div>
						</div>

						{/* Rules & Criteria Section */}
						<div className="border-bg-300 bg-bg-200 rounded-lg border p-m-500">
							<h2 className="text-body text-txt-100 mb-m-400 font-semibold">
								Rules & Criteria
							</h2>

							<div className="space-y-m-400">
								<div>
									<Label htmlFor="entryCriteria">Entry Criteria</Label>
									<Textarea
										id="entryCriteria"
										name="entryCriteria"
										defaultValue={strategy.entryCriteria || ""}
										placeholder="List your entry conditions:&#10;- Condition 1&#10;- Condition 2&#10;- Condition 3"
										rows={5}
										className="mt-s-200"
									/>
									<p className="text-tiny text-txt-300 mt-s-100">
										What conditions must be met before entering a trade?
									</p>
								</div>

								<div>
									<Label htmlFor="exitCriteria">Exit Criteria</Label>
									<Textarea
										id="exitCriteria"
										name="exitCriteria"
										defaultValue={strategy.exitCriteria || ""}
										placeholder="List your exit rules:&#10;- Take profit at...&#10;- Stop loss at...&#10;- Trail stop when..."
										rows={5}
										className="mt-s-200"
									/>
									<p className="text-tiny text-txt-300 mt-s-100">
										How do you manage the trade and when do you exit?
									</p>
								</div>

								<div>
									<Label htmlFor="notes">Additional Notes</Label>
									<Textarea
										id="notes"
										name="notes"
										defaultValue={strategy.notes || ""}
										placeholder="Any other important notes about this strategy..."
										rows={3}
										className="mt-s-200"
									/>
								</div>
							</div>
						</div>

						{/* Risk Settings Section */}
						<div className="border-bg-300 bg-bg-200 rounded-lg border p-m-500">
							<h2 className="text-body text-txt-100 mb-m-400 font-semibold">
								Risk Settings
							</h2>

							<div className="space-y-m-400">
								<div>
									<Label htmlFor="riskRules">Risk Management Rules</Label>
									<Textarea
										id="riskRules"
										name="riskRules"
										defaultValue={strategy.riskRules || ""}
										placeholder="Your risk rules:&#10;- Max position size...&#10;- Stop loss placement...&#10;- When to avoid trading..."
										rows={5}
										className="mt-s-200"
									/>
								</div>

								<div className="grid grid-cols-2 gap-m-400">
									<div>
										<Label htmlFor="targetRMultiple">Target R-Multiple</Label>
										<Input
											id="targetRMultiple"
											name="targetRMultiple"
											type="number"
											step="0.1"
											min="0.1"
											defaultValue={strategy.targetRMultiple || ""}
											placeholder="e.g., 2.0"
											className="mt-s-200"
										/>
										<p className="text-tiny text-txt-300 mt-s-100">
											Your target reward:risk ratio
										</p>
									</div>

									<div>
										<Label htmlFor="maxRiskPercent">Max Risk per Trade (%)</Label>
										<Input
											id="maxRiskPercent"
											name="maxRiskPercent"
											type="number"
											step="0.1"
											min="0.1"
											max="100"
											defaultValue={strategy.maxRiskPercent || ""}
											placeholder="e.g., 1.0"
											className="mt-s-200"
										/>
										<p className="text-tiny text-txt-300 mt-s-100">
											Maximum % of account to risk
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex justify-end gap-s-300">
							<Link href="/playbook">
								<Button type="button" variant="outline" disabled={isPending}>
									Cancel
								</Button>
							</Link>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default EditStrategyPage
