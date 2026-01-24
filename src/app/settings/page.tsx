import { PageHeader } from "@/components/layout"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const SettingsPage = () => {
	return (
		<div className="flex h-full flex-col">
			<PageHeader title="Settings" description="Configure your preferences" />
			<div className="flex-1 p-m-600">
				<div className="mx-auto max-w-2xl space-y-m-600">
					{/* Appearance */}
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
						<h2 className="text-body font-semibold text-txt-100">Appearance</h2>
						<div className="mt-m-400 flex items-center justify-between">
							<div>
								<p className="text-small text-txt-100">Theme</p>
								<p className="text-tiny text-txt-300">
									Switch between dark and light mode
								</p>
							</div>
							<ThemeToggle />
						</div>
					</div>

					{/* Risk Settings */}
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
						<h2 className="text-body font-semibold text-txt-100">Risk Settings</h2>
						<div className="mt-m-400 space-y-m-400">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-small text-txt-100">Default Risk %</p>
									<p className="text-tiny text-txt-300">
										Default position risk percentage
									</p>
								</div>
								<span className="text-small text-txt-200">1.0%</span>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-small text-txt-100">Account Balance</p>
									<p className="text-tiny text-txt-300">Current trading capital</p>
								</div>
								<span className="text-small text-txt-200">$10,000</span>
							</div>
						</div>
						<p className="mt-m-500 text-tiny text-txt-300">
							Settings editing coming in Phase 6
						</p>
					</div>

					{/* Data Import */}
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
						<h2 className="text-body font-semibold text-txt-100">Data Import</h2>
						<div className="mt-m-400">
							<p className="text-small text-txt-200">
								Import trades from CSV file
							</p>
							<div className="mt-m-400 flex h-24 items-center justify-center rounded-md border-2 border-dashed border-bg-300 text-txt-300">
								CSV import coming in Phase 6
							</div>
						</div>
					</div>

					{/* Data Export */}
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
						<h2 className="text-body font-semibold text-txt-100">Data Export</h2>
						<p className="mt-m-400 text-small text-txt-200">
							Export your trade data for backup or analysis
						</p>
						<p className="mt-m-400 text-tiny text-txt-300">
							Export functionality coming in Phase 6
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SettingsPage
