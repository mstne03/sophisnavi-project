import { test as base, expect } from "@playwright/test";

// Harness estricto (EDS-3 §3.8): cualquier console.error o error de página hace fallar el test.
export const test = base.extend({
  page: async ({ page }, provide) => {
    const consoleErrors: { text: string; url: string }[] = [];
    const pageErrors: string[] = [];
    const documents404 = new Set<string>();
    page.on("response", (r) => r.request().resourceType() === "document" && r.status() === 404 && documents404.add(r.url()));
    page.on("console", (m) => m.type() === "error" && consoleErrors.push({ text: m.text(), url: m.location().url }));
    page.on("pageerror", (e) => pageErrors.push(e.message));
    await provide(page);
    // El 404 del propio documento lo comprueba el test con el status; cualquier otro recurso roto sí falla.
    // Se filtra al final porque el evento de consola puede llegar antes que el de la respuesta.
    const errors = consoleErrors.filter((e) => !(documents404.has(e.url) && /\b404\b/.test(e.text))).map((e) => e.text);
    expect([...errors, ...pageErrors], "errores en consola").toEqual([]);
  },
});

export { expect };
