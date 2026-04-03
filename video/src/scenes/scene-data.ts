/**
 * Scene definitions with real timestamps from the recorded video.
 * Source video: video/public/axion-demo.webm (272.4s)
 *
 * All sourceStartSec/sourceEndSec refer to the recorded video.
 * Remotion skips gaps between scenes (cuts) and adds title cards.
 *
 * Timestamps calibrated using: actual_video_duration(272.4s) / total_frames(570)
 * = 0.4779s per frame. Frame positions verified at 500ms capture resolution.
 */

import type { SceneDefinition } from "./types"

const scenes: SceneDefinition[] = [
	// ── LOGIN + ACCOUNTS (frame 1-36 → 0.5s-17.2s) ───────────────────
	{
		id: "login",
		label: "Login e Seleção de Conta",
		sourceStartSec: 0.5,
		sourceEndSec: 17.2,
		titleCard: false,
		narration: [
			{
				offsetSec: 1,
				durationSec: 5,
				text: "Gerencie todas as suas contas: pessoal, prop firm e replay.",
			},
			{
				offsetSec: 7,
				durationSec: 5,
				text: "Importe do Profit PRO para mapeamento automático.",
			},
		],
		zoom: [],
	},

	// ── JOURNAL (frame 40-61 → 19.1s-29.2s) ──────────────────────────
	{
		id: "journal",
		label: "Diário de Trades",
		sourceStartSec: 19.1,
		sourceEndSec: 29.2,
		titleCard: true,
		narration: [
			{
				offsetSec: 1,
				durationSec: 5,
				text: "O journal mostra seus trades por dia. Filtre datas para análise direta.",
			},
		],
		zoom: [],
	},

	// ── TRADE DETAIL (frame 86-108 → 41.1s-51.6s) ────────────────────
	{
		id: "trade-detail",
		label: "",
		sourceStartSec: 41.1,
		sourceEndSec: 51.6,
		titleCard: false,
		narration: [
			{
				offsetSec: 0,
				durationSec: 6,
				text: "Clique em qualquer trade para o breakdown completo de cada execução.",
			},
		],
		zoom: [
			{ offsetSec: 3, durationSec: 4, scale: 1.3, originX: 0.5, originY: 0.55 },
		],
	},

	// ── DASHBOARD (frame 113-136 → 54.0s-65.0s) ──────────────────────
	{
		id: "dashboard",
		label: "Dashboard",
		sourceStartSec: 54.0,
		sourceEndSec: 65.0,
		titleCard: true,
		narration: [
			{
				offsetSec: 0,
				durationSec: 8,
				text: "O dashboard traz a visão geral: PL, taxa de acerto, fator de lucro, R médio e fatores de disciplina.",
			},
		],
		zoom: [
			{ offsetSec: 0, durationSec: 4, scale: 1.3, originX: 0.5, originY: 0.15 },
		],
	},

	// ── PAGE GUIDE (frame 143-160 → 68.3s-76.5s) ─────────────────────
	{
		id: "page-guide",
		label: "Guia Interativo",
		sourceStartSec: 68.3,
		sourceEndSec: 76.5,
		titleCard: true,
		narration: [
			{
				offsetSec: 0,
				durationSec: 7,
				text: "Viu a lâmpada dourada? Guias interativos explicam cada métrica com exemplos em R$.",
			},
		],
		zoom: [],
	},

	// ── COMMAND CENTER (frame 198-240 → 94.6s-114.7s) ─────────────────
	{
		id: "command-center",
		label: "Central de Comando",
		sourceStartSec: 94.6,
		sourceEndSec: 114.7,
		titleCard: true,
		narration: [
			{
				offsetSec: 0,
				durationSec: 6,
				text: "A Central de Comando é seu cockpit diário. Monitore resultados em tempo real.",
			},
			{
				offsetSec: 6,
				durationSec: 5,
				text: "Circuit Breaker, trades ao vivo, risco e modo de recuperação.",
			},
		],
		zoom: [],
	},

	// ── ANALYTICS (frame 278-296 → 132.9s-141.5s) ────────────────────
	{
		id: "analytics",
		label: "Análises Avançadas",
		sourceStartSec: 132.9,
		sourceEndSec: 141.5,
		titleCard: true,
		narration: [
			{
				offsetSec: 0,
				durationSec: 9,
				text: "Análises profundas: descubra seu edge sobre o mercado e as sessões que encaixam melhor com seu operacional.",
			},
		],
		zoom: [
			{ offsetSec: 5, durationSec: 4, scale: 1.2, originX: 0.5, originY: 0.4 },
		],
	},

	// ── MONTE CARLO RESULTS (frame 345-373 → 164.9s-178.3s) ──────────
	{
		id: "monte-carlo",
		label: "Simulação Monte Carlo",
		sourceStartSec: 164.9,
		sourceEndSec: 178.3,
		titleCard: true,
		narration: [
			{
				offsetSec: 0,
				durationSec: 7,
				text: "Simulação de Monte Carlo: use seus números reais para gerar milhares de sequências possíveis.",
			},
			{
				offsetSec: 8,
				durationSec: 6,
				text: "Prove que seu edge se sobressai independente das condições do mercado.",
			},
		],
		zoom: [],
	},

	// ── RISK SIMULATION SETUP (frame 380-418 → 181.6s-199.8s) ─────────
	{
		id: "risk-simulation-setup",
		label: "Simulador de Risco",
		sourceStartSec: 181.6,
		sourceEndSec: 199.8,
		titleCard: true,
		narration: [
			{
				offsetSec: 0,
				durationSec: 7,
				text: "O Simulador de Risco replica seus trades com regras personalizadas de gerenciamento.",
			},
		],
		zoom: [],
	},

	// ── RISK SIMULATION RESULTS (frame 435-450 → 207.9s-215.1s) ───────
	{
		id: "risk-simulation-results",
		label: "",
		sourceStartSec: 207.9,
		sourceEndSec: 215.1,
		titleCard: false,
		narration: [
			{
				offsetSec: 0,
				durationSec: 7,
				text: "Operasse sempre com 2% do capital, quebraria sua conta? Compare a curva original contra a simulada.",
			},
		],
		zoom: [
			{ offsetSec: 0, durationSec: 5, scale: 1.2, originX: 0.5, originY: 0.4 },
		],
	},

	// ── REPORTS (frame 458-491 → 218.9s-234.6s) ──────────────────────
	{
		id: "reports",
		label: "Relatórios",
		sourceStartSec: 218.9,
		sourceEndSec: 234.6,
		titleCard: true,
		narration: [
			{
				offsetSec: 0,
				durationSec: 7,
				text: "Relatórios semanais e mensais, detalhados por dia e por ativo.",
			},
			{
				offsetSec: 7,
				durationSec: 6,
				text: "Overtrade, horários de notícias — descubra com a análise de erros.",
			},
		],
		zoom: [
			{ offsetSec: 10, durationSec: 4, scale: 1.3, originX: 0.5, originY: 0.5 },
		],
	},

	// ── MONTHLY (frame 498-523 → 238.0s-249.9s) ─────────────────────
	{
		id: "monthly",
		label: "Plano Mensal",
		sourceStartSec: 238.0,
		sourceEndSec: 249.9,
		titleCard: true,
		narration: [
			{
				offsetSec: 0,
				durationSec: 8,
				text: "Acompanhe sua performance mensal. Para prop firms, veja sua participação após divisão de lucros e impostos.",
			},
		],
		zoom: [],
	},

	// ── PLAYBOOK / STRATEGIES (frame 530-555 → 253.3s-265.2s) ────────
	{
		id: "playbook",
		label: "Playbook de Estratégias",
		sourceStartSec: 253.3,
		sourceEndSec: 265.2,
		titleCard: true,
		narration: [
			{
				offsetSec: 0,
				durationSec: 6,
				text: "Rastreie execuções por estratégia. Dez K paga mais que a Trava?",
			},
			{
				offsetSec: 6,
				durationSec: 4,
				text: "Rompimento dá lucro ou é furada?",
			},
		],
		zoom: [
			{ offsetSec: 0, durationSec: 4, scale: 1.2, originX: 0.5, originY: 0.15 },
		],
	},
]

export { scenes }
