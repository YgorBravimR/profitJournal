"use client"

import { useTranslations } from "next-intl"
import type { QuoteGroup } from "@/types/market"
import { QuoteRow } from "./quote-row"

interface QuoteSectionProps {
	group: QuoteGroup
}

export const QuoteSection = ({ group }: QuoteSectionProps) => {
	const t = useTranslations("market")

	if (group.quotes.length === 0) return null

	// labelKey is relative to "market" namespace (e.g., "groups.indices")
	const groupLabel = t(group.labelKey)

	return (
		<div className="border-bg-300 bg-bg-200 rounded-lg border">
			{/* Header */}
			<div className="border-bg-300 border-b px-4 py-3">
				<h3 className="text-small text-txt-100 font-semibold">{groupLabel}</h3>
			</div>

			{/* Quotes table */}
			<div className="overflow-x-auto px-4 py-2">
				<table className="w-full" role="table" aria-label={groupLabel}>
					<thead>
						<tr className="text-tiny text-txt-300">
							<th className="pb-1 text-left font-medium">{t("quote.name")}</th>
							<th className="pb-1 text-right font-medium">{t("quote.price")}</th>
							<th className="pb-1 text-right font-medium">{t("quote.change")}</th>
						</tr>
					</thead>
					<tbody>
						{group.quotes.map((quote) => (
							<QuoteRow key={quote.symbol} quote={quote} />
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
