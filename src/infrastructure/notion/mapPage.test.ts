import type { PageObjectResponse } from "@notionhq/client";
import { describe, expect, it } from "vitest";
import { mapNotionPage } from "./mapPage";

const rt = (content: string) => [{ type: "text", text: { content, link: null }, plain_text: content, href: null, annotations: {} }];
const page = (over: Partial<Record<string, unknown>> = {}, props: Record<string, unknown> = {}) =>
  ({
    object: "page",
    id: "3f31-1",
    created_time: "2026-10-08T21:31:10.000Z",
    last_edited_time: "2026-10-09T12:08:00.159Z",
    in_trash: false,
    properties: {
      Vlog: { id: "title", type: "title", title: rt("La ciencia real detrás de AVATAR") },
      Estado: { id: "O2dmOw", type: "status", status: { id: "x", name: "Publicado", color: "green" } },
      Tipo: { id: "XlNQQw", type: "select", select: { id: "y", name: "Artículo", color: "default" } },
      Sección: { id: "aFt5VA", type: "select", select: { id: "z", name: "Pandora", color: "green" } },
      Slug: { id: "s", type: "rich_text", rich_text: [] },
      Descripción: { id: "d", type: "rich_text", rich_text: rt("Qué parte de Avatar es ciencia real.") },
      ...props,
    },
    ...over,
  }) as unknown as PageObjectResponse;

// Protege: las columnas de Notion (Vlog, Estado, Tipo, Sección, Slug, Descripción) se leen de forma determinista.
describe("mapNotionPage", () => {
  it("lee título, estado, tipo, sección, descripción, fechas y deriva el slug del título", () => {
    expect(mapNotionPage(page())).toEqual({
      id: "3f31-1",
      title: "La ciencia real detrás de AVATAR",
      status: "Publicado",
      statusPropertyId: "O2dmOw",
      kind: "article",
      section: "pandora",
      slug: "la-ciencia-real-detras-de-avatar",
      description: "Qué parte de Avatar es ciencia real.",
      createdAt: "2026-10-08T21:31:10.000Z",
      updatedAt: "2026-10-09T12:08:00.159Z",
      inTrash: false,
    });
  });

  it("respeta el Slug explícito (normalizado) y reconoce Home e Introducción", () => {
    const p = page(
      {},
      {
        Slug: { id: "s", type: "rich_text", rich_text: rt("  Ciencia REAL ") },
        Tipo: { id: "XlNQQw", type: "select", select: { id: "y", name: "Introducción", color: "gray" } },
        Sección: { id: "aFt5VA", type: "select", select: { id: "z", name: "Home", color: "orange" } },
      },
    );
    expect(mapNotionPage(p)).toMatchObject({ slug: "ciencia-real", kind: "intro", section: "home" });
  });

  it("devuelve null en lo que falte y no revienta con propiedades vacías", () => {
    const p = page({ in_trash: true }, { Estado: { id: "O2dmOw", type: "status", status: null }, Tipo: { id: "t", type: "select", select: null }, Sección: { id: "a", type: "select", select: null }, Descripción: undefined });
    expect(mapNotionPage(p)).toMatchObject({ status: null, kind: null, section: null, description: "", inTrash: true });
  });
});
