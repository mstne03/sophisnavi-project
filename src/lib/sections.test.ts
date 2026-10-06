import { describe, expect, it } from "vitest";
import { SECTIONS } from "./sections";

// Protege: el menú y las rutas estáticas dependen de slugs únicos y válidos en URL.
describe("SECTIONS", () => {
  it("tiene slugs únicos en kebab-case", () => {
    const slugs = SECTIONS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("tiene título y descripción en todas las secciones", () => {
    for (const s of SECTIONS) {
      expect(s.title.trim()).not.toBe("");
      expect(s.description.trim()).not.toBe("");
    }
  });
});
