import { getCurrentAccount } from "@/app/actions/auth"
import { getEffectiveDate } from "@/lib/effective-date"
import { formatDateKey } from "@/lib/dates"
import { EffectiveDateProvider } from "@/components/providers/effective-date-provider"
import { AppShell } from "@/components/layout/app-shell"

interface AppLayoutProps {
	children: React.ReactNode
}

const AppLayout = async ({ children }: AppLayoutProps) => {
	const account = await getCurrentAccount()
	const effectiveDate = getEffectiveDate(account)
	const isReplayAccount = account?.accountType === "replay"
	const replayDate = isReplayAccount ? formatDateKey(effectiveDate) : undefined

	return (
		<EffectiveDateProvider date={effectiveDate.toISOString()}>
			<AppShell isReplayAccount={isReplayAccount} replayDate={replayDate}>
				{children}
			</AppShell>
		</EffectiveDateProvider>
	)
}

export default AppLayout
