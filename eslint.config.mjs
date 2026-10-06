import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Regla de capas (docs/standards.md): domain → application → infrastructure → ui → app.
// Las dependencias van en un solo sentido; si alguien la rompe, el lint falla.
const layer = (files, forbidden) => ({
  files,
  rules: {
    "no-restricted-imports": [
      "error",
      { patterns: [{ group: forbidden, message: "Rompe la regla de capas. Ver docs/standards.md." }] },
    ],
  },
});
const outer = (...names) => names.flatMap((n) => [`@/${n}/**`, `**/${n}/**`]);
const frameworks = ["react", "react-dom", "next", "next/**", "three", "three/**", "motion", "motion/**"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  layer(["src/domain/**"], [...outer("application", "infrastructure", "ui", "app"), ...frameworks]),
  layer(["src/application/**"], [...outer("infrastructure", "ui", "app"), ...frameworks]),
  layer(["src/infrastructure/**"], outer("ui", "app")),
  layer(["src/ui/**"], outer("infrastructure", "app")),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
