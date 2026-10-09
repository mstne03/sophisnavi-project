import type { ContentRepository } from "@/application/content/ContentRepository";
import { SECTIONS, type Content, type SectionSlug } from "@/domain/content";

// Adaptador de lectura sobre el JSON que genera `scripts/notion-pull.ts` en el build (ADR-0007).
export function createContentRepository(content: Content): ContentRepository {
  const byDate = (a: { createdAt: string }, b: { createdAt: string }) => a.createdAt.localeCompare(b.createdAt);
  const articles = (section?: string) => content.articles.filter((a) => !section || a.sectionSlug === section).sort(byDate);
  const link = (a?: { slug: string; title: string }) => (a ? { slug: a.slug, title: a.title } : undefined);
  return {
    async listSections() {
      return [...SECTIONS];
    },
    async getSection(slug) {
      const s = SECTIONS.find((x) => x.slug === slug);
      return s && { ...s, intro: content.intros[s.slug] };
    },
    async getHome() {
      return content.home;
    },
    async listArticles(sectionSlug?: SectionSlug) {
      return articles(sectionSlug);
    },
    async getArticle(sectionSlug, slug) {
      const list = articles(sectionSlug);
      const i = list.findIndex((a) => a.slug === slug);
      if (i < 0) return undefined;
      return { article: list[i], prev: link(list[i - 1]), next: link(list[i + 1]) };
    },
  };
}
