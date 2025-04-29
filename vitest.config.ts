import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		environmentMatchGlobs: [["**/*.dom.test.ts", "happy-dom"]],

		include: ["**/*.test.ts"],
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/cypress/**",
			"**/.{idea,git,cache,output,temp}/**",
		],
		typecheck: {
			enabled: true,
			tsconfig: "./tsconfig.json",
			include: ["**/*.test.ts"],
			exclude: [
				"**/node_modules/**",
				"**/dist/**",
				"**/cypress/**",
				"**/.{idea,git,cache,output,temp}/**",
			],
			allowJs: false,
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
});
