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
    description: "Conoce más a fondo a tus personajes favoritos a través de análisis y descubre detalles que probablemente no sabías.",
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

// Vídeo enlazado desde Notion (bookmark) con su vista previa descargada en el build: la web no pide nada a la plataforma.
export type VideoMeta = { url: string; title: string; author: string; thumbnail: ImageMeta };

// `videos` es opcional: los snapshots anteriores no lo tienen.
export type Intro = { id: string; body: string; updatedAt: string; images: ImageMeta[]; videos?: VideoMeta[] };

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
  videos?: VideoMeta[];
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

// Artículos que se leen entrada a entrada (SOPHIE-3): cada título de nivel 2 del cuerpo abre la entrada de un personaje
// y la web muestra solo la elegida, con un selector con el nombre de cada uno. Lista explícita por slug: en otros
// artículos Sofi usa títulos para estructurar el texto, no como entradas alternativas.
export const TOGGLE_ARTICLE_SLUGS: readonly string[] = ["los-sully"];
export const hasEntryToggle = (slug: string) => TOGGLE_ARTICLE_SLUGS.includes(slug);

export type BodyEntry = { id: string; label: string; body: string }; // body incluye su título
export type SplitBody = { intro: string; entries: BodyEntry[] };

// Nombre para el selector: lo que va antes de los dos puntos del título («JAKE SULLY: DE PROTAGONISTA A MCGUFFIN» →
// «Jake Sully»). Sofi escribe los títulos en mayúsculas; si todo el nombre lo está, se pasa a mayúscula inicial por palabra.
export function entryLabel(heading: string): string {
  const name = heading
    .split(":")[0]
    .replace(/[*_`]/g, "")
    .trim();
  if (name !== name.toUpperCase()) return name;
  return name.toLowerCase().replace(/(^|\s)(\S)/g, (_, sp: string, c: string) => sp + c.toUpperCase());
}

// Parte el Markdown por los títulos de nivel 2: el texto anterior al primero es la introducción común y cada título
// (con todo lo que le sigue hasta el próximo) es una entrada. Sin títulos de nivel 2 todo es introducción.
export function splitEntries(markdown: string): SplitBody {
  // Solo corta en títulos al inicio de línea; «### » no empieza por «## » en esa posición.
  const [first, ...rest] = markdown.split(/\n(?=## )/);
  const blocks = first.startsWith("## ") ? [first, ...rest] : rest;
  const intro = first.startsWith("## ") ? "" : first.trim();
  const entries = blocks.map((block) => {
    const label = entryLabel(block.split("\n")[0].slice(3));
    return { id: slugify(label), label, body: block.trim() };
  });
  return { intro, entries };
}

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
