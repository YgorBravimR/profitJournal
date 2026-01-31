"use client"

import { useState, useEffect } from "react"
import { Moon, Save, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { upsertDailyNotes } from "@/app/actions/command-center"
import type { DailyAccountNote } from "@/db/schema"

interface PostMarketNotesProps {
	notes: DailyAccountNote | null
	onRefresh: () => void
}

export const PostMarketNotes = ({ notes, onRefresh }: PostMarketNotesProps) => {
	const t = useTranslations("commandCenter.notes")

	const [postMarketNotes, setPostMarketNotes] = useState("")
	const [saving, setSaving] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)

	// Initialize form values
	useEffect(() => {
		if (notes) {
			setPostMarketNotes(notes.postMarketNotes || "")
		}
	}, [notes])

	// Track changes
	useEffect(() => {
		const currentNotes = notes?.postMarketNotes || ""
		setHasChanges(postMarketNotes !== currentNotes)
	}, [postMarketNotes, notes])

	const handleSave = async () => {
		setSaving(true)
		try {
			await upsertDailyNotes({
				date: new Date().toISOString(),
				preMarketNotes: notes?.preMarketNotes || null,
				postMarketNotes: postMarketNotes || null,
				mood: (notes?.mood as "great" | "good" | "neutral" | "bad" | "terrible" | null) || null,
			})
			onRefresh()
		} catch (error) {
			console.error("Failed to save notes:", error)
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="rounded-lg border border-bg-300 bg-bg-200 p-m-500">
			{/* Header */}
			<div className="mb-m-400 flex items-center justify-between">
				<div className="flex items-center gap-s-200">
					<Moon className="h-5 w-5 text-accent-primary" />
					<h3 className="text-body font-semibold text-txt-100">{t("postMarket")}</h3>
				</div>
				{hasChanges && (
					<Button size="sm" onClick={handleSave} disabled={saving}>
						{saving ? (
							<Loader2 className="mr-s-100 h-4 w-4 animate-spin" />
						) : (
							<Save className="mr-s-100 h-4 w-4" />
						)}
						{saving ? t("saving") : t("save")}
					</Button>
				)}
			</div>

			{/* Notes */}
			<div>
				<label className="mb-s-200 block text-small text-txt-200">{t("postMarketLabel")}</label>
				<Textarea
					value={postMarketNotes}
					onChange={(e) => setPostMarketNotes(e.target.value)}
					placeholder={t("postMarketPlaceholder")}
					className="min-h-[120px] resize-none"
				/>
			</div>
		</div>
	)
}
