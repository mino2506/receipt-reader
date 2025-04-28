// eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config";

import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
	globalIgnores([
		"**/node_modules/**",
		"**/.next/**",
		"**/dist/**",
		"**/build/**",
		"**/.vercel/**",
		"**/*.d.ts",
	]),
	{
		files: ["**/*.ts", "**/*.tsx"],
		ignores: [
			"**/node_modules/**",
			"**/.next/**",
			"**/dist/**",
			"**/build/**",
			"**/.vercel/**",
			"**/*.d.ts",
		],
		languageOptions: {
			parser: tsParser, // ← ここ！！
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: process.cwd(),
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/explicit-module-boundary-types": "off",
		},
	},
]);
