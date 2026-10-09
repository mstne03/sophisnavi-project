import { describe, expect, it } from "vitest";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata, SITE_URL, websiteJsonLd } from "./metadata";

// Protege: canonical, hreflang (es + x-default), Open Graph completo, Twitter y robots salen de una sola función.
describe("pageMetadata", () => {
  it("construye los metadatos de la portada", () => {
    const m = pageMetadata({ title: "Sophisnavi", description: "Portal", path: "/" });
    expect(m.title).toEqual({ absolute: "Sophisnavi" });
    expect(m.alternates).toEqual({ canonical: SITE_URL, languages: { es: SITE_URL, "x-default": SITE_URL } });
    expect(m.openGraph).toMatchObject({ type: "website", locale: "es_ES", url: SITE_URL, siteName: "Sophisnavi" });
    expect(m.openGraph.images[0].url).toBe(`${SITE_URL}/opengraph-image`);
    expect(m.twitter.card).toBe("summary_large_image");
    expect(m.robots.googleBot["max-image-preview"]).toBe("large");
  });

  it("construye los metadatos de un artículo con fechas e imagen propia", () => {
    const m = pageMetadata({
      title: "El mundo",
      description: "d",
      path: "/pandora/el-mundo",
      type: "article",
      publishedAt: "2026-10-08",
      updatedAt: "2026-10-09",
      image: { url: `${SITE_URL}/content/x/1.webp`, alt: "Pandora" },
    });
    expect(m.title).toBe("El mundo"); // el sufijo lo pone la plantilla del layout
    expect(m.alternates.canonical).toBe(`${SITE_URL}/pandora/el-mundo`);
    expect(m.openGraph).toMatchObject({ type: "article", publishedTime: "2026-10-08", modifiedTime: "2026-10-09", authors: ["Sofi"] });
    expect(m.openGraph.images[0]).toMatchObject({ url: `${SITE_URL}/content/x/1.webp`, alt: "Pandora" });
  });
});

describe("JSON-LD", () => {
  it("WebSite lleva Person con sus redes; BreadcrumbList y Article apuntan a URLs absolutas", () => {
    expect(websiteJsonLd()).toMatchObject({ "@type": "WebSite", inLanguage: "es", author: { "@type": "Person", sameAs: expect.arrayContaining([expect.stringContaining("tiktok")]) } });
    expect(breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Pandora", path: "/pandora" }]).itemListElement[1]).toEqual({ "@type": "ListItem", position: 2, name: "Pandora", item: `${SITE_URL}/pandora` });
    const a = articleJsonLd({ title: "t", description: "d", path: "/pandora/x", publishedAt: "p", updatedAt: "u", section: "Pandora", image: "/content/x/1.webp" });
    expect(a).toMatchObject({ "@type": "Article", datePublished: "p", dateModified: "u", image: [`${SITE_URL}/content/x/1.webp`] });
    expect(articleJsonLd({ title: "t", description: "d", path: "/p/x", publishedAt: "p", updatedAt: "u", section: "P" })).not.toHaveProperty("image");
  });
});
