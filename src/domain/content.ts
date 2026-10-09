// Entidades puras del contenido. No importan nada.
// Fuente única: la base de datos de Notion «Web Sophisnavi» (ADR-0007). Las secciones son fijas en el código;
// la columna «Sección» de Notion se corresponde con ellas.

export type SectionSlug = "pandora" | "personajes" | "clanes" | "saga" | "coleccion" | "vida-fan";

export type Section = {
  slug: SectionSlug;
  title: string;
  description: string; // tarjeta del menú y meta description de la sección
  notionNames: readonly string[]; // valores de la columna «Sección» que caen aquí
};

export const SECTIONS: readonly Section[] = [
  {
    slug: "pandora",
    title: "Pandora",
    description: "Lore, naturaleza y datos reales de Pandora: Eywa, la flora bioluminiscente, los animales y la ciencia que James Cameron tomó de la Tierra.",
    notionNames: ["Pandora"],
  },
  {
    slug: "personajes",
    title: "Personajes",
    description: "Jake, Neytiri, Lo'ak, Kiri, Tsireya, Varang, Quaritch… arcos, motivaciones y detalles que se pierden en un primer visionado de Avatar.",
    notionNames: ["Personajes"],
  },
  {
    slug: "clanes",
    title: "Clanes y culturas",
    description: "Omatikaya, Metkayina, Mangkwan y los demás clanes na'vi: cómo viven, qué creen, cómo se visten y en qué se diferencian.",
    notionNames: ["Clanes y culturas"],
  },
  {
    slug: "saga",
    title: "La saga",
    description: "Detrás de cámaras de Avatar, noticias comentadas y teorías con fundamento sobre Avatar 4 y 5. Lo que se sabe y lo que es especulación.",
    notionNames: ["La saga", "Teorías", "Detrás de cámaras"],
  },
  {
    slug: "coleccion",
    title: "Colección",
    description: "Mi colección de Avatar: figuras, libros de arte, ediciones físicas y merchandising. Qué merece la pena, dónde encontrarlo y qué evitar.",
    notionNames: ["Colección"],
  },
  {
    slug: "vida-fan",
    title: "Vida fan",
    description: "Mi historia con Avatar desde 2009, la experiencia de ser fan en España, viajes, eventos, cosplay, tatuajes y comunidad.",
    notionNames: ["Vida fan"],
  },
];

export const HOME_NOTION_NAME = "Home";

export const sectionForNotionName = (name: string | null | undefined): Section | undefined =>
  SECTIONS.find((s) => s.notionNames.includes(name ?? ""));

export type ImageMeta = { src: string; width: number; height: number; alt: string };

export type Intro = { id: string; body: string; updatedAt: string; images: ImageMeta[] };

export type Article = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string; // Markdown estándar (ya normalizado)
  sectionSlug: SectionSlug;
  createdAt: string; // ISO; fija el orden del carrusel y anterior/siguiente
  updatedAt: string; // ISO; lastModified del sitemap
  images: ImageMeta[];
};

export type Content = {
  generatedAt: string;
  home?: Intro;
  intros: Partial<Record<SectionSlug, Intro>>;
  articles: Article[];
};

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // marcas diacríticas combinantes tras NFD
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // cada racha de separadores queda en un solo guion…
    .replace(/^-|-$/g, ""); // …así que como mucho sobra uno al inicio y otro al final
}

export const isSlug = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

// Primer párrafo del Markdown, sin marcas, recortado a `max` sin partir palabras.
export function excerpt(markdown: string, max = 155): string {
  const paragraph = markdown
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b !== "" && !/^(#|!\[|>|-|\d+\.)/.test(b));
  if (!paragraph) return "";
  const plain = paragraph
    .replace(/\s{2,}\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/[*_`]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`;
}
