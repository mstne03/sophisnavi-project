import type { Article, Content } from "@/domain/content";

// Contenido de prueba estable. Los tests nunca leen `data/content/content.json`: ese fichero es un snapshot de Notion
// que cambia cada vez que Sofi publica o retira algo, y no debe poder romper la suite (lo mockea vitest.setup.ts).
const article = (a: Pick<Article, "slug" | "title" | "body" | "createdAt"> & Partial<Article>): Article => ({
  id: a.slug,
  description: `Descripción de ${a.title}`,
  sectionSlug: "pandora",
  updatedAt: a.createdAt,
  images: [],
  ...a,
});

export const contentFixture: Content = {
  generatedAt: "2026-01-01T00:00:00.000Z",
  home: { id: "home", body: "Soy Sofi, texto de bienvenida.", updatedAt: "2026-01-01T00:00:00.000Z", images: [] },
  intros: { pandora: { id: "intro-pandora", body: "Intro de Pandora.", updatedAt: "2026-01-01T00:00:00.000Z", images: [] } },
  articles: [
    article({ slug: "el-mundo-de-avatar", title: "El mundo de AVATAR", body: "Primer artículo.", createdAt: "2026-01-01T00:00:00.000Z" }),
    article({
      slug: "la-ciencia-real-detras-de-avatar",
      title: "La ciencia real detrás de AVATAR",
      body: "Intro.\n\n![Figura](/content/ciencia/1.webp)\n\n> Una cita\n\nFin.",
      createdAt: "2026-01-02T00:00:00.000Z",
      images: [{ src: "/content/ciencia/1.webp", width: 1200, height: 800, alt: "Figura" }],
    }),
  ],
};
