import type { Brand } from "@/lib/brands"

/**
 * Maps account type to the corresponding brand theme.
 * This replaces the manual brand selector in settings — the theme
 * is now automatically derived from the account type.
 */
const getAccountTypeBrand = (accountType: string): Brand => {
	switch (accountType) {
		case "prop":
			return "tsr"
		case "replay":
			return "retro"
		default:
			return "bravo"
	}
}

export { getAccountTypeBrand }
