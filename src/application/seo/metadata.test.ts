import { describe, expect, it } from "vitest";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata, profilePageJsonLd, SITE_URL, websiteJsonLd } from "./metadata";

// Protege: canonical, hreflang (es + x-default), Open Graph completo, Twitter y robots salen de una sola función.
describe("pageMetadata", () => {
  it("construye los metadatos de la portada", () => {
    const m = pageMetadata({ title: "Sophisnavi", description: "Portal", path: "/" });
    expect(m.title).toEqual({ absolute: "Sophisnavi" });
    expect(m.alternates).toEqual({ canonical: SITE_URL, languages: { es: SITE_URL, "x-default": SITE_URL } });
    expect(m.openGraph).toMatchObject({ type: "website", locale: "es_ES", url: SITE_URL, siteName: "Sophisnavi" });
    expect(m.openGraph.images[0]).toEqual({ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Sophisnavi" });
    expect(pageMetadata({ title: "Pandora", description: "d", path: "/pandora" }).openGraph.images[0].alt).toBe("Pandora · Sophisnavi");
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
      image: { url: `${SITE_URL}/content/x/1.webp`, alt: "Pandora", width: 1200, height: 750 },
    });
    expect(m.title).toBe("El mundo"); // el sufijo lo pone la plantilla del layout
    expect(m.alternates.canonical).toBe(`${SITE_URL}/pandora/el-mundo`);
    expect(m.openGraph).toMatchObject({ type: "article", publishedTime: "2026-10-08", modifiedTime: "2026-10-09", authors: ["Sofi"] });
    // Las medidas declaradas son las de la imagen, no las de la tarjeta OG.
    expect(m.openGraph.images[0]).toEqual({ url: `${SITE_URL}/content/x/1.webp`, width: 1200, height: 750, alt: "Pandora" });
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

  it("la Person apunta a /quien-soy, que es una ProfilePage con ella como entidad principal", () => {
    expect(websiteJsonLd().author.url).toBe(`${SITE_URL}/quien-soy`);
    expect(profilePageJsonLd({ name: "Quién soy", updatedAt: "u" })).toMatchObject({
      "@type": "ProfilePage",
      url: `${SITE_URL}/quien-soy`,
      dateModified: "u",
      mainEntity: { "@type": "Person", name: "Sofi" },
    });
    expect(profilePageJsonLd({ name: "Quién soy" })).not.toHaveProperty("dateModified");
  });
});
