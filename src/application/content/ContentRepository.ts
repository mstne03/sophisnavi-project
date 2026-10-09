import type { Article, Intro, Section, SectionSlug } from "@/domain/content";

export type ArticleLink = { slug: string; title: string };
export type ArticleView = { article: Article; prev?: ArticleLink; next?: ArticleLink };

// Puerto de lectura del contenido. Adaptador: staticContent (JSON generado en el build desde Notion, ADR-0007).
export interface ContentRepository {
  listSections(): Promise<Section[]>;
  getSection(slug: string): Promise<(Section & { intro?: Intro }) | undefined>;
  getHome(): Promise<Intro | undefined>;
  listArticles(sectionSlug?: SectionSlug): Promise<Article[]>;
  getArticle(sectionSlug: string, slug: string): Promise<ArticleView | undefined>;
}
