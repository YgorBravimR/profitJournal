import { PageHeader } from "@/components/layout"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { RecalculateButton } from "./recalculate-button"

const SettingsPage = () => {
	return (
		<div className="flex h-full flex-col">
			<PageHeader title="Settings" description="Configure your preferences" />
			<div className="flex-1 overflow-auto p-m-600">
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

					{/* Data Maintenance */}
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
						<h2 className="text-body font-semibold text-txt-100">
							Data Maintenance
						</h2>
						<div className="mt-m-400 space-y-m-400">
							<div>
								<p className="text-small text-txt-100">Recalculate R Values</p>
								<p className="mb-m-400 text-tiny text-txt-300">
									Updates all trades that have stop loss data to calculate
									planned risk and realized R-multiple
								</p>
								<RecalculateButton />
							</div>
						</div>
					</div>

					{/* Data Import */}
					<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
						<h2 className="text-body font-semibold text-txt-100">Data Import</h2>
						<div className="mt-m-400">
							<p className="text-small text-txt-200">
								Import trades from CSV file
							</p>
							<p className="mt-m-400 text-tiny text-txt-300">
								Go to Journal → New Trade → CSV Import to import trades
							</p>
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
