import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ArticlePage, { dynamicParams, generateMetadata, generateStaticParams } from "./page";

const props = (section: string, article: string) => ({ params: Promise.resolve({ section, article }), searchParams: Promise.resolve({}) });

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Protege: cada artículo publicado se prerenderiza con su cuerpo, sus imágenes, datos estructurados y anterior/siguiente.
describe("ArticlePage", () => {
  it("genera un parámetro estático por artículo publicado", async () => {
    expect(dynamicParams).toBe(false);
    const params = await generateStaticParams();
    expect(params).toContainEqual({ section: "pandora", article: "la-ciencia-real-detras-de-avatar" });
  });

  it("renderiza el artículo con figuras, citas, navegación y JSON-LD", async () => {
    const { container } = render(await ArticlePage(props("pandora", "la-ciencia-real-detras-de-avatar")));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("La ciencia real detrás de AVATAR");
    expect(container.querySelectorAll("figure img").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll("blockquote").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /anterior/i }).getAttribute("href")).toBe("/pandora/el-mundo-de-avatar");
    expect(screen.queryByRole("link", { name: /siguiente/i })).toBeNull();
    expect(screen.getByRole("link", { name: /volver a pandora/i }).getAttribute("href")).toBe("/pandora");
    const ld = [...container.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent ?? ""));
    expect(ld.map((d) => d["@type"])).toEqual(["BreadcrumbList", "Article"]);
  });

  it("el primer artículo no tiene anterior pero sí siguiente", async () => {
    render(await ArticlePage(props("pandora", "el-mundo-de-avatar")));
    expect(screen.queryByRole("link", { name: /anterior/i })).toBeNull();
    expect(screen.getByRole("link", { name: /siguiente/i }).getAttribute("href")).toBe("/pandora/la-ciencia-real-detras-de-avatar");
  });

  it("genera metadatos de artículo con fechas, canonical e imagen de portada", async () => {
    const m = await generateMetadata(props("pandora", "la-ciencia-real-detras-de-avatar"));
    expect(m.alternates?.canonical).toBe("https://www.sophisnavi.com/pandora/la-ciencia-real-detras-de-avatar");
    expect(m.openGraph).toMatchObject({ type: "article" });
    expect(await generateMetadata(props("pandora", "nope"))).toEqual({});
  });

  it("llama a notFound con un slug desconocido o una sección equivocada", async () => {
    await expect(ArticlePage(props("pandora", "nope"))).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(ArticlePage(props("saga", "el-mundo-de-avatar"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
