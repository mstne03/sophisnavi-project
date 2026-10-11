import { describe, expect, it } from "vitest";
import { shouldDeploy, stalePages, type PageState, type PageSummary } from "./publishDecision";

const ev = (type: string, updated_properties?: string[]) => ({ type, entity: { id: "p1", type: "page" }, data: { updated_properties } });
const published: PageState = { inTrash: false, status: "Publicado", statusPropertyId: "O2dmOw" };
const draft: PageState = { inTrash: false, status: "En proceso", statusPropertyId: "O2dmOw" };

// Protege: solo se despliega cuando el cambio puede afectar a lo publicado; las ediciones de borradores no gastan builds.
describe("shouldDeploy", () => {
  it("ignora entidades que no son páginas", () => {
    expect(shouldDeploy({ type: "page.content_updated", entity: { id: "x", type: "database" } }, published)).toBe(false);
  });

  it("despliega si la página desapareció o está en la papelera", () => {
    expect(shouldDeploy(ev("page.content_updated"), null)).toBe(true);
    expect(shouldDeploy(ev("page.content_updated"), { ...draft, inTrash: true })).toBe(true);
  });

  it("despliega siempre ante borrado, restauración o movimiento", () => {
    for (const t of ["page.deleted", "page.undeleted", "page.moved"]) expect(shouldDeploy(ev(t), draft)).toBe(true);
  });

  it("despliega cuando cambia la propiedad Estado, publique o despublique", () => {
    expect(shouldDeploy(ev("page.properties_updated", ["O2dmOw"]), draft)).toBe(true);
    expect(shouldDeploy(ev("page.properties_updated", ["O2dmOw"]), published)).toBe(true);
  });

  it("con otras propiedades, solo despliega si la página está publicada", () => {
    expect(shouldDeploy(ev("page.properties_updated", ["title"]), draft)).toBe(false);
    expect(shouldDeploy(ev("page.properties_updated", ["title"]), published)).toBe(true);
    expect(shouldDeploy(ev("page.properties_updated"), { ...published, statusPropertyId: null })).toBe(true);
  });

  it("el contenido solo cuenta si la página está publicada", () => {
    expect(shouldDeploy(ev("page.content_updated"), draft)).toBe(false);
    expect(shouldDeploy(ev("page.content_updated"), published)).toBe(true);
    expect(shouldDeploy(ev("page.created"), draft)).toBe(false);
  });

  it("ignora bloqueos y tipos desconocidos", () => {
    expect(shouldDeploy(ev("page.locked"), published)).toBe(false);
    expect(shouldDeploy(ev("comment.created"), published)).toBe(false);
  });
});

// Protege: la red de seguridad solo redespliega por cambios posteriores al build que tocan lo publicado.
describe("stalePages", () => {
  const builtAt = "2026-10-11T14:30:00.000Z";
  const page = (id: string, updatedAt: string, status: string | null = "Publicado", inTrash = false): PageSummary => ({ id, updatedAt, status, inTrash });

  it("detecta publicadas editadas tras el build y páginas del snapshot que se despublicaron o borraron", () => {
    const pages = [
      page("vieja", "2026-10-11T14:00:00.000Z"),
      page("sully", "2026-10-11T14:56:00.000Z"),
      page("retirada", "2026-10-11T15:00:00.000Z", "En proceso"),
      page("papelera", "2026-10-11T15:00:00.000Z", null, true),
      page("borrador", "2026-10-11T15:00:00.000Z", "En proceso"),
    ];
    const stale = stalePages(pages, builtAt, new Set(["vieja", "sully", "retirada", "papelera"]));
    expect(stale.map((p) => p.id)).toEqual(["sully", "retirada", "papelera"]);
  });

  it("sin cambios posteriores al build no hay nada desfasado", () => {
    expect(stalePages([page("a", builtAt)], builtAt, new Set(["a"]))).toEqual([]);
  });
});
