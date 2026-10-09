import type { MetadataRoute } from "next";
import { SITE_URL } from "@/application/seo/metadata";
import { content } from "./content";

// Se genera en el build desde el contenido: cada publicación en Notion lo actualiza (ADR-0007).
// lastModified sale de cada entrada, nunca de la fecha del build.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, articles, home] = await Promise.all([content.listSections(), content.listArticles(), content.getHome()]);
  // Fechas ISO: la mayor lexicográfica es la más reciente. Sin sort(): no muta y Sonar exige comparador.
  const latest = (dates: string[]) => (dates.length > 0 ? dates.reduce((a, b) => (b > a ? b : a)) : undefined);
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: latest([home?.updatedAt ?? "", ...articles.map((a) => a.updatedAt)].filter(Boolean)), changeFrequency: "weekly", priority: 1 },
  ];
  for (const s of sections) {
    const own = await content.getSection(s.slug);
    const dates = [own?.intro?.updatedAt ?? "", ...articles.filter((a) => a.sectionSlug === s.slug).map((a) => a.updatedAt)].filter(Boolean);
    entries.push({ url: `${SITE_URL}/${s.slug}`, lastModified: latest(dates), changeFrequency: "weekly", priority: 0.8 });
  }
  for (const a of articles) {
    entries.push({
      url: `${SITE_URL}/${a.sectionSlug}/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
      ...(a.images.length > 0 ? { images: a.images.map((i) => `${SITE_URL}${i.src}`) } : {}),
    });
  }
  return entries;
}
