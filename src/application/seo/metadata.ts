// Metadatos de cada página en un solo sitio (plan 0.9). Pura: devuelve objetos que las rutas pasan a Next.
// La fusión de `metadata` en Next es superficial (openGraph de una página sustituye entero al del layout),
// así que cada página construye su bloque completo desde aquí.

export const SITE_URL = "https://www.sophisnavi.com";
export const SITE_NAME = "Sophisnavi";
export const AUTHOR = { name: "Sofi", handle: "sophisnavi", description: "Fan y creadora de contenido de Avatar en España desde 2009." };
// Perfiles de la autora: sameAs de la Person y enlaces con logo en «Quién soy» (SOPHIE-8).
export const SOCIAL = [
  { network: "tiktok", name: "TikTok", url: "https://www.tiktok.com/@sophisnavi" },
  { network: "instagram", name: "Instagram", url: "https://www.instagram.com/sophisnavi" },
  { network: "youtube", name: "YouTube", url: "https://www.youtube.com/@sophisnavi" },
  { network: "pinterest", name: "Pinterest", url: "https://www.pinterest.com/sophisnavi" },
] as const;
export type SocialNetwork = (typeof SOCIAL)[number]["network"];
export const LOCALE = "es";
export const AUTHOR_PATH = "/quien-soy"; // página de autora: url de la Person en todos los datos estructurados

export type PageMeta = {
  title: string;
  description: string;
  path: string; // "/", "/pandora", "/pandora/el-mundo-de-avatar"
  type?: "website" | "article";
  publishedAt?: string;
  updatedAt?: string;
  image?: { url: string; alt: string; width?: number; height?: number }; // sin medidas: tarjeta OG de 1200×630
};

export function pageMetadata(m: PageMeta) {
  const url = `${SITE_URL}${m.path === "/" ? "" : m.path}`;
  const image = m.image ?? { url: `${url}/opengraph-image`, alt: m.path === "/" ? SITE_NAME : `${m.title} · ${SITE_NAME}` };
  return {
    // El layout añade « · Sophisnavi» con su plantilla; la portada se queda solo con la marca.
    title: m.path === "/" ? { absolute: SITE_NAME } : m.title,
    description: m.description,
    alternates: {
      canonical: url,
      // Solo español por ahora; cuando exista la versión EN se añade `en` aquí (plan 0.7).
      languages: { [LOCALE]: url, "x-default": url },
    },
    openGraph: {
      type: m.type ?? "website",
      locale: "es_ES",
      siteName: SITE_NAME,
      url,
      title: m.title,
      description: m.description,
      images: [{ url: image.url, width: image.width ?? 1200, height: image.height ?? 630, alt: image.alt }],
      ...(m.type === "article" ? { publishedTime: m.publishedAt, modifiedTime: m.updatedAt, authors: [AUTHOR.name] } : {}),
    },
    twitter: { card: "summary_large_image" as const, title: m.title, description: m.description, images: [image.url] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1, "max-video-preview": -1 } },
  };
}

// JSON-LD. Se serializa en la UI escapando "<" para que no cierre el <script>.
export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: LOCALE,
  author: personJsonLd(),
});

export const personJsonLd = () => ({
  "@type": "Person",
  name: AUTHOR.name,
  alternateName: AUTHOR.handle,
  description: AUTHOR.description,
  url: `${SITE_URL}${AUTHOR_PATH}`,
  sameAs: SOCIAL.map((s) => s.url),
});

// Página «Quién soy»: la Person es su entidad principal.
export const profilePageJsonLd = (p: { name: string; updatedAt?: string }) => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  name: p.name,
  url: `${SITE_URL}${AUTHOR_PATH}`,
  inLanguage: LOCALE,
  ...(p.updatedAt ? { dateModified: p.updatedAt } : {}),
  mainEntity: personJsonLd(),
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path === "/" ? "" : it.path}` })),
});

export const articleJsonLd = (a: { title: string; description: string; path: string; publishedAt: string; updatedAt: string; section: string; image?: string }) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: a.title,
  description: a.description,
  inLanguage: LOCALE,
  url: `${SITE_URL}${a.path}`,
  mainEntityOfPage: `${SITE_URL}${a.path}`,
  datePublished: a.publishedAt,
  dateModified: a.updatedAt,
  articleSection: a.section,
  author: personJsonLd(),
  publisher: personJsonLd(),
  ...(a.image ? { image: [`${SITE_URL}${a.image}`] } : {}),
});
