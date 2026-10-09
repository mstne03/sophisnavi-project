import { describe, expect, it } from "vitest";
import type { Article, Content } from "@/domain/content";
import { createContentRepository } from "./staticContent";

const art = (slug: string, createdAt: string, sectionSlug: Article["sectionSlug"] = "pandora"): Article => ({
  id: slug,
  slug,
  title: slug.toUpperCase(),
  description: "d",
  body: "b",
  sectionSlug,
  createdAt,
  updatedAt: createdAt,
  images: [],
});

const content: Content = {
  generatedAt: "2026-10-09T00:00:00.000Z",
  home: { id: "h", body: "Kaltxì", updatedAt: "2026-10-09T00:00:00.000Z", images: [] },
  intros: { pandora: { id: "ip", body: "Pandora es una luna.", updatedAt: "2026-10-09T00:00:00.000Z", images: [] } },
  // Desordenados a propósito: el orden lo fija createdAt.
  articles: [art("ciencia", "2026-10-08T21:31:10.000Z"), art("mundo", "2026-10-08T21:11:02.000Z"), art("flora", "2026-10-09T00:00:00.000Z"), art("clan", "2026-10-01T00:00:00.000Z", "clanes")],
};
const repo = createContentRepository(content);

// Protege: las seis secciones siempre existen (con o sin intro); los artículos se ordenan por creación y
// anterior/siguiente se calculan dentro de la sección.
describe("createContentRepository", () => {
  it("lista las seis secciones fijas y añade la intro de Notion cuando existe", async () => {
    expect((await repo.listSections()).map((s) => s.slug)).toEqual(["pandora", "personajes", "clanes", "saga", "coleccion", "vida-fan"]);
    expect((await repo.getSection("pandora"))?.intro?.body).toBe("Pandora es una luna.");
    expect((await repo.getSection("saga"))?.intro).toBeUndefined();
    expect(await repo.getSection("nope")).toBeUndefined();
    expect((await repo.getHome())?.body).toBe("Kaltxì");
  });

  it("ordena los artículos por fecha de creación, por sección o todos", async () => {
    expect((await repo.listArticles("pandora")).map((a) => a.slug)).toEqual(["mundo", "ciencia", "flora"]);
    expect((await repo.listArticles()).map((a) => a.slug)).toEqual(["clan", "mundo", "ciencia", "flora"]);
    expect(await repo.listArticles("saga")).toEqual([]);
  });

  it("resuelve un artículo con anterior y siguiente dentro de su sección", async () => {
    expect(await repo.getArticle("pandora", "ciencia")).toMatchObject({ prev: { slug: "mundo", title: "MUNDO" }, next: { slug: "flora", title: "FLORA" } });
    expect((await repo.getArticle("pandora", "mundo"))?.prev).toBeUndefined();
    expect((await repo.getArticle("pandora", "flora"))?.next).toBeUndefined();
    expect(await repo.getArticle("clanes", "ciencia")).toBeUndefined();
  });
});
