import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

// Protege: el sitemap lista portada, las seis secciones y cada artículo publicado, con lastModified del contenido y sus imágenes.
describe("sitemap", () => {
  it("incluye portada, secciones y artículos con URL absolutas", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls[0]).toBe("https://www.sophisnavi.com");
    expect(urls).toContain("https://www.sophisnavi.com/pandora");
    expect(urls).toContain("https://www.sophisnavi.com/vida-fan");
    expect(urls).toContain("https://www.sophisnavi.com/pandora/la-ciencia-real-detras-de-avatar");
    expect(urls.every((u) => u.startsWith("https://www.sophisnavi.com"))).toBe(true);
  });

  it("toma lastModified del contenido y añade las imágenes de los artículos", async () => {
    const entries = await sitemap();
    const ciencia = entries.find((e) => e.url.endsWith("/la-ciencia-real-detras-de-avatar"))!;
    expect(String(ciencia.lastModified)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(ciencia.images?.length).toBeGreaterThanOrEqual(1);
    const saga = entries.find((e) => e.url.endsWith("/saga"))!;
    expect(saga.lastModified).toBeUndefined();
  });
});
