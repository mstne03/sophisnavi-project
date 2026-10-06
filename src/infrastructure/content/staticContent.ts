import type { ContentRepository } from "@/application/content/ContentRepository";
import type { Locale, Page, PageStatus, PageType, Section } from "@/domain/content";
import seed from "../../../data/seed/content-seed.json";

type SeedPage = (typeof seed.pages)[number];
type Translation = { slug: string; title: string; seo_description: string; body_md: string };

const sectionOf = (categorySlug: string) => seed.categories.find((c) => c.slug_es === categorySlug)?.section_slug ?? "";

function toSection(s: (typeof seed.sections)[number], locale: Locale): Section {
  return {
    slug: s[`slug_${locale}`],
    title: s[`title_${locale}`],
    description: s[`seo_description_${locale}`],
    intro: s[`intro_md_${locale}`],
    updatedAt: s.updated_at,
    categories: seed.categories
      .filter((c) => c.section_slug === s.slug_es)
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ slug: c[`slug_${locale}`], name: c[`name_${locale}`] })),
  };
}

// El seed solo tiene traducción ES de las páginas; en EN no se publican copias (sin contenido duplicado).
function toPage(p: SeedPage, locale: Locale): Page | undefined {
  const t = (p.translations as Partial<Record<Locale, Translation>>)[locale];
  if (!t) return undefined;
  const sectionEs = sectionOf(p.category_slug);
  const section = seed.sections.find((s) => s.slug_es === sectionEs);
  const category = seed.categories.find((c) => c.slug_es === p.category_slug);
  return {
    slug: t.slug,
    type: p.type as PageType,
    status: p.status as PageStatus,
    title: t.title,
    description: t.seo_description,
    body: t.body_md,
    sectionSlug: section?.[`slug_${locale}`] ?? sectionEs,
    categorySlug: category?.[`slug_${locale}`] ?? p.category_slug,
    updatedAt: p.updated_at,
    sources: p.sources,
    media: "media" in p ? (p.media as string[]) : [],
  };
}

const sections = (locale: Locale) => [...seed.sections].sort((a, b) => a.position - b.position).map((s) => toSection(s, locale));
const pages = (locale: Locale) => seed.pages.map((p) => toPage(p, locale)).filter((p): p is Page => p !== undefined);

export const staticContent: ContentRepository = {
  async listSections(locale) {
    return sections(locale);
  },
  async getSection(locale, slug) {
    return sections(locale).find((s) => s.slug === slug);
  },
  async listPages(locale, sectionSlug) {
    return pages(locale).filter((p) => !sectionSlug || p.sectionSlug === sectionSlug);
  },
  async getPage(locale, sectionSlug, pageSlug) {
    return pages(locale).find((p) => p.sectionSlug === sectionSlug && p.slug === pageSlug);
  },
};
