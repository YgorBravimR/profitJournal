import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		include: ["src/__tests__/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/lib/**/*.ts", "src/types/**/*.ts"],
			exclude: ["src/**/*.d.ts"],
		},
	},
})
