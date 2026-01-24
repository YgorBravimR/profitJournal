import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"

const NewTradePage = () => {
	return (
		<div className="flex h-full flex-col">
			<PageHeader
				title="New Trade"
				description="Record a new trade entry"
				action={
					<Link href="/journal">
						<Button variant="ghost">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
					</Link>
				}
			/>
			<div className="flex-1 p-m-600">
				<div className="mx-auto max-w-3xl">
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-600">
						<p className="text-center text-txt-200">
							Trade form will be implemented in Phase 2
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NewTradePage
