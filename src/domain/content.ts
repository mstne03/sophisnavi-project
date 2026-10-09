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
    description: "Explora su fauna, flora, ecosistemas, y descubre por qué los Na'vi son azules, en qué se basa Eywa y la ciencia real detrás de Avatar.",
    notionNames: ["Pandora"],
  },
  {
    slug: "personajes",
    title: "Personajes",
    description: "Conoce más a fondo a tus personajes favoritos, desde sus personalidades y habilidades hasta detalles que probablemente no sabías.",
    notionNames: ["Personajes"],
  },
  {
    slug: "clanes",
    title: "Clanes y culturas",
    description: "Adéntrate en las tradiciones, creencias y formas de vida de los diferentes clanes Na'vi. ¿Qué costumbres tienen y por qué son tan diferentes?",
    notionNames: ["Clanes y culturas"],
  },
  {
    slug: "saga",
    title: "La saga",
    description: "Explora noticias, análisis, teorías y detalles que revelan todo lo que se esconde detrás de las películas. ¿Sabías que existen cómics y videojuegos?",
    notionNames: ["La saga", "Teorías", "Detrás de cámaras"],
  },
  {
    slug: "coleccion",
    title: "Colección",
    description: "Un rincón dedicado a los míos: los coleccionistas. Descubre todas las figuras, ediciones especiales, libros y formas de convertir tu habitación en Pandora.",
    notionNames: ["Colección"],
  },
  {
    slug: "vida-fan",
    title: "Vida fan",
    description: "Un espacio personal para compartir lo que significa para mí ser fan de Avatar, desde experiencias, eventos, mi historia y momentos especiales con vosotros.",
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
    .split(/\n[ \t]*\n/) // líneas en blanco; [ \t] no solapa con \n (sin retroceso)
    .map((b) => b.trim())
    .find((b) => b !== "" && !/^(#|!\[|>|-|\d+\.)/.test(b));
  if (!paragraph) return "";
  const plain = paragraph
    .replace(/[ \t]{2,}\n/g, " ") // salto de línea duro de Markdown
    .replace(/\n/g, " ")
    .replace(/[*_`]/g, "")
    .replace(/\[([^[\]]*)\]\([^()]*\)/g, "$1") // [texto](url) → texto; sin [ ni ( anidados, lineal
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`;
}
