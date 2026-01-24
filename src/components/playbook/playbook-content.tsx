"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StrategyCard, ComplianceDashboard } from "@/components/playbook"
import { DeleteConfirmDialog } from "@/components/playbook/delete-confirm-dialog"
import { deleteStrategy } from "@/app/actions/strategies"
import type { StrategyWithStats, ComplianceOverview } from "@/app/actions/strategies"

interface PlaybookContentProps {
	initialStrategies: StrategyWithStats[]
	initialCompliance: ComplianceOverview | null
}

export const PlaybookContent = ({
	initialStrategies,
	initialCompliance,
}: PlaybookContentProps) => {
	const router = useRouter()
	const [strategies, setStrategies] = useState<StrategyWithStats[]>(initialStrategies)
	const [compliance] = useState<ComplianceOverview | null>(initialCompliance)
	const [deleteTarget, setDeleteTarget] = useState<StrategyWithStats | null>(null)
	const [isPending, startTransition] = useTransition()

	const handleDelete = (strategyId: string) => {
		const strategy = strategies.find((s) => s.id === strategyId)
		if (strategy) {
			setDeleteTarget(strategy)
		}
	}

	const handleConfirmDelete = () => {
		if (!deleteTarget) return

		startTransition(async () => {
			const result = await deleteStrategy(deleteTarget.id)
			if (result.status === "success") {
				setStrategies((prev) => prev.filter((s) => s.id !== deleteTarget.id))
			}
			setDeleteTarget(null)
		})
	}

	const handleEdit = (strategy: StrategyWithStats) => {
		router.push(`/playbook/${strategy.id}/edit`)
	}

	return (
		<div className="space-y-m-600">
			{/* Compliance Overview */}
			<ComplianceDashboard data={compliance} />

			{/* Strategy List */}
			<div className="border-bg-300 bg-bg-200 rounded-lg border p-m-500">
				<div className="flex items-center justify-between">
					<h2 className="text-body text-txt-100 font-semibold">Your Strategies</h2>
					<Link href="/playbook/new">
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							New Strategy
						</Button>
					</Link>
				</div>

				{strategies.length === 0 ? (
					<div className="mt-m-500 flex flex-col items-center justify-center py-l-700 text-center">
						<p className="text-body text-txt-200">No strategies defined yet</p>
						<p className="text-small text-txt-300 mt-s-200">
							Create your first trading strategy to track performance and compliance
						</p>
						<Link href="/playbook/new">
							<Button variant="outline" className="mt-m-500">
								<Plus className="mr-2 h-4 w-4" />
								Add Strategy
							</Button>
						</Link>
					</div>
				) : (
					<div className="mt-m-500 grid grid-cols-1 gap-m-400 lg:grid-cols-2">
						{strategies.map((strategy) => (
							<StrategyCard
								key={strategy.id}
								strategy={strategy}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						))}
					</div>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			{deleteTarget && (
				<DeleteConfirmDialog
					strategyName={deleteTarget.name}
					strategyCode={deleteTarget.code}
					onConfirm={handleConfirmDelete}
					onCancel={() => setDeleteTarget(null)}
					isPending={isPending}
				/>
			)}
		</div>
	)
}
