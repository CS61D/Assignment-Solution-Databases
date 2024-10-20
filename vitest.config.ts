// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		sequence: {
			concurrent: false, // Ensures tests do not run concurrently
		},
	},
});
