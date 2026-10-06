import type { Locale, Page, Section } from "@/domain/content";

// Puerto de lectura del contenido. Fase 0: staticContent (seed JSON); fase 1: SupabaseContentRepository.
export interface ContentRepository {
  listSections(locale: Locale): Promise<Section[]>;
  getSection(locale: Locale, slug: string): Promise<Section | undefined>;
  listPages(locale: Locale, sectionSlug?: string): Promise<Page[]>;
  getPage(locale: Locale, sectionSlug: string, pageSlug: string): Promise<Page | undefined>;
}
