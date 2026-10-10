// Vídeos de TikTok enlazados desde Notion. Todo lo que llega de fuera (la URL del bookmark y la respuesta del oEmbed)
// es entrada no confiable: se valida con patrones estrictos antes de usarlo.

// Solo vídeos de tiktok.com por https. El ancla final impide dominios parecidos (tiktok.com.evil.example).
const VIDEO = /^https:\/\/(?:www\.)?tiktok\.com\/@([A-Za-z0-9._]{1,30})\/video\/(\d{1,25})(?:[/?#]|$)/;

// URL canónica sin parámetros: los de compartir (web_id, sender_device…) identifican el dispositivo de quien enlaza.
export function canonicalTikTokUrl(url: string): string | undefined {
  const m = VIDEO.exec(url);
  return m ? `https://www.tiktok.com/@${m[1]}/video/${m[2]}` : undefined;
}

export const tiktokOEmbedUrl = (videoUrl: string) => `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;

export type OEmbed = { title: string; author: string; thumbnailUrl: string };

// Del oEmbed solo interesan título, autor y miniatura; cualquier otra forma se descarta (el enlace queda sin vista previa).
export function parseOEmbed(json: unknown): OEmbed | undefined {
  if (typeof json !== "object" || json === null) return undefined;
  const { title, author_name, thumbnail_url } = json as Record<string, unknown>;
  if (typeof thumbnail_url !== "string" || !thumbnail_url.startsWith("https://")) return undefined;
  const text = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
  return { title: text(title), author: text(author_name), thumbnailUrl: thumbnail_url };
}
