import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Lista única de exclusiones de cobertura (ADR-0006). sonar-project.properties usa la misma lista.
export const coverageExclusions = [
  "src/lib/tree-scene.ts", // WebGL: lo cubre el E2E; en 0.5 pasa a ui/tree-scene/{renderer,shaders}.ts
  "data/seed/**", // datos JSON de la sesión de contenido, no código
];

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: [...coverageExclusions, "src/**/*.test.{ts,tsx}", "src/**/*.d.ts"],
      thresholds: { lines: 85, branches: 85, functions: 85, statements: 85 },
      reporter: ["text-summary", "lcov"],
    },
  },
});
