import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    clearMocks: true,
    pool: "threads",
    maxWorkers: 1,
    coverage: {
      provider: "v8",
      include: [
        "components/**/*.{ts,tsx}",
        "src/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "app/api/**/*.ts",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.d.ts",
        "src/types/**",
        // Type-only file: no executable code to cover.
        "lib/types.ts",
      ],
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
