import js from "@eslint/js"

export default [
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				React: "readonly",
				JSX: "readonly",
				console: "readonly",
				process: "readonly",
				Promise: "readonly",
				Intl: "readonly",
				Date: "readonly",
				Array: "readonly",
				Object: "readonly",
				Math: "readonly",
				Infinity: "readonly",
				setTimeout: "readonly",
			},
		},
		rules: {
			"react/no-unescaped-entities": "off",
			"no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
		},
	},
	{
		ignores: [".next/*", "node_modules/*"],
	},
]
