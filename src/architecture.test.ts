import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

// Protege: la regla de capas (domain -> application -> infrastructure -> ui/app) la impone ESLint, no una convención.
// Una sola instancia: la carga de la config de Next tarda ~15 s la primera vez.
const eslint = new ESLint({ cwd: process.cwd() });
const lint = async (filePath: string, code: string) => {
  const [r] = await eslint.lintText(code, { filePath });
  return r.messages.filter((m) => m.ruleId === "no-restricted-imports");
};

const forbidden: [string, string][] = [
  ["src/domain/x.ts", 'import "@/application/a";'],
  ["src/domain/x.ts", 'import "react";'],
  ["src/application/x.ts", 'import "@/infrastructure/a";'],
  ["src/application/x.ts", 'import "@/ui/a";'],
  ["src/infrastructure/x.ts", 'import "@/ui/a";'],
  ["src/ui/x.tsx", 'import "@/infrastructure/a";'],
  ["src/ui/x.tsx", 'import "@/app/a";'],
];

const allowed: [string, string][] = [
  ["src/application/x.ts", 'import "@/domain/a";'],
  ["src/infrastructure/x.ts", 'import "@/application/a";'],
  ["src/ui/x.tsx", 'import "@/application/a";'],
  ["src/app/x.tsx", 'import "@/infrastructure/a";'],
];

describe("fronteras entre capas", { timeout: 60_000 }, () => {
  it.each(forbidden)("%s no puede importar %s", async (file, code) => {
    expect(await lint(file, code)).not.toHaveLength(0);
  });

  it.each(allowed)("%s puede importar %s", async (file, code) => {
    expect(await lint(file, code)).toHaveLength(0);
  });
});
