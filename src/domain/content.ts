// Entidades puras del contenido. No importan nada.
export type Locale = "es" | "en";
export const LOCALES: readonly Locale[] = ["es", "en"];

export type Category = { slug: string; name: string };

export type Section = {
  slug: string;
  title: string;
  description: string; // meta description
  intro: string; // markdown
  updatedAt: string; // ISO date
  categories: Category[];
};

export type PageType = "article" | "gallery";
export type PageStatus = "draft" | "published";

export type Page = {
  slug: string;
  type: PageType;
  status: PageStatus;
  title: string;
  description: string;
  body: string; // markdown
  sectionSlug: string;
  categorySlug: string;
  updatedAt: string;
  sources: string[];
  media: string[]; // solo gallery; URLs
};
