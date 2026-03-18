import type { PageGuideConfig } from "@/types/page-guide"

const playbookGuide: PageGuideConfig = {
	pageKey: "playbook",
	steps: [
		{
			targetId: "playbook-compliance",
			titleKey: "compliance",
			descriptionKey: "complianceDesc",
			placement: "bottom",
		},
		{
			targetId: "playbook-strategies",
			titleKey: "strategies",
			descriptionKey: "strategiesDesc",
			placement: "top",
		},
	],
}

export { playbookGuide }
