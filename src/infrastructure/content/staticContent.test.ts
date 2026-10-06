import { describe, expect, it } from "vitest";
import { staticContent as repo } from "./staticContent";

// Protege: el seed de data/seed/content-seed.json se expone con las secciones del plan, en orden y con slugs válidos.
describe("staticContent", () => {
  it("lista las seis secciones en orden con slugs ES y EN", async () => {
    expect((await repo.listSections("es")).map((s) => s.slug)).toEqual(["pandora", "personajes", "clanes", "saga", "coleccion", "vida-fan"]);
    expect((await repo.listSections("en")).map((s) => s.slug)).toEqual(["pandora", "characters", "clans", "saga", "collection", "fan-life"]);
  });

  it("cada sección tiene título, descripción, intro y categorías con slugs kebab-case únicos", async () => {
    for (const s of await repo.listSections("es")) {
      expect(s.title.trim()).not.toBe("");
      expect(s.description.length).toBeLessThanOrEqual(155);
      expect(s.intro.split(/\s+/).length).toBeGreaterThanOrEqual(150);
      expect(s.categories.length).toBeGreaterThan(0);
      const slugs = s.categories.map((c) => c.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const slug of [s.slug, ...slugs]) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("devuelve una sección por slug y undefined si no existe", async () => {
    expect((await repo.getSection("es", "clanes"))?.title).toBe("Clanes y culturas");
    expect(await repo.getSection("es", "nope")).toBeUndefined();
  });

  it("lista las páginas de una sección y las resuelve por slug", async () => {
    const pages = await repo.listPages("es", "personajes");
    expect(pages).toHaveLength(3);
    expect(pages.every((p) => p.sectionSlug === "personajes" && p.categorySlug === "personajes-y-arcos")).toBe(true);
    const page = await repo.getPage("es", "coleccion", "mi-coleccion-de-avatar");
    expect(page?.type).toBe("gallery");
    expect(page?.media).toEqual([]);
    expect(await repo.getPage("es", "coleccion", "nope")).toBeUndefined();
  });

  it("sin filtro lista todas las páginas y en EN no inventa traducciones", async () => {
    expect(await repo.listPages("es")).toHaveLength(9);
    expect(await repo.listPages("en")).toHaveLength(0);
  });
});
