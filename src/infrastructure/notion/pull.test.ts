import { describe, expect, it } from "vitest";
import type { NotionGateway } from "./gateway";
import type { NotionPage } from "./mapPage";
import { pullContent, type PullDeps } from "./pull";

const row = (over: Partial<NotionPage>): NotionPage => ({
  id: "id-" + (over.slug ?? over.title ?? "x"),
  title: "Título",
  status: "Publicado",
  statusPropertyId: "O2dmOw",
  kind: "article",
  section: "pandora",
  slug: "titulo",
  description: "",
  createdAt: "2026-10-08T00:00:00.000Z",
  updatedAt: "2026-10-09T00:00:00.000Z",
  inTrash: false,
  ...over,
});

const REF = "notion-file-block://3f41-aaaa/e0a1?space_id=1&name=foto.jpg";
// Bookmarks tal como los da el endpoint de Markdown: la URL es la del bloque en Notion; la del enlace, aparte.
const bookmark = (id: string) => `<unknown url="https://app.notion.com/p/pagina#${id}" alt="bookmark"/>`;
const [TIKTOK, OTRO, ROTO] = ["a".repeat(32), "b".repeat(32), "c".repeat(32)];
const BOOKMARKS: Record<string, string> = {
  [TIKTOK]: "https://www.tiktok.com/@sophisnavi/video/123?is_from_webapp=1&web_id=999",
  [OTRO]: "https://example.com/a(b)",
};

function deps(rows: NotionPage[], markdown: Record<string, string> = {}): PullDeps & { stored: string[]; logs: string[] } {
  const stored: string[] = [];
  const logs: string[] = [];
  const gateway: NotionGateway = {
    listPages: async () => rows,
    getPageMarkdown: async (id) => markdown[id] ?? "Cuerpo de prueba.",
    getFileUrl: async (blockId) => (blockId === "3f41-aaaa" ? "https://s3/firmada.jpg" : undefined),
    getBookmarkUrl: async (blockId) => BOOKMARKS[blockId],
    getPageState: async () => null,
  };
  return {
    gateway,
    dataSourceId: "ds",
    publicDir: "/pub",
    fetchBytes: async (url) => new TextEncoder().encode(url),
    fetchJson: async (url) => (url.includes(encodeURIComponent("/video/123")) ? { title: "Ciencia real", author_name: "Sofi", thumbnail_url: "https://cdn/miniatura.jpg" } : {}),
    storeImage: async (bytes, out) => {
      stored.push(`${new TextDecoder().decode(bytes)} -> ${out.replace(/\\/g, "/")}`);
      return { width: 1200, height: 900 };
    },
    now: () => new Date("2026-10-09T10:00:00.000Z"),
    log: (m) => logs.push(m),
    stored,
    logs,
  };
}

// Protege: solo lo «Publicado» entra; cada fila va a su sitio (home, intro de sección o artículo); las imágenes se
// descargan a public/content y el cuerpo queda en Markdown estándar con rutas locales.
describe("pullContent", () => {
  it("separa home, intros de sección y artículos, y descarta lo no publicado o mal clasificado", async () => {
    const d = deps([
      row({ title: "Intro web", kind: "intro", section: "home", slug: "intro-web" }),
      row({ title: "Intro Pandora", kind: "intro", section: "pandora", slug: "intro-pandora" }),
      row({ title: "El mundo", slug: "el-mundo", createdAt: "2026-10-08T21:11:02.000Z" }),
      row({ title: "Borrador", slug: "borrador", status: "En proceso" }),
      row({ title: "Papelera", slug: "papelera", inTrash: true }),
      row({ title: "Sin sección", slug: "sin-seccion", section: null }),
      row({ title: "Artículo en home", slug: "en-home", section: "home" }),
      row({ title: "Repetido", slug: "el-mundo" }),
    ]);
    const c = await pullContent(d);
    expect(c.generatedAt).toBe("2026-10-09T10:00:00.000Z");
    expect(c.home?.id).toBe("id-intro-web");
    expect(c.intros.pandora?.id).toBe("id-intro-pandora");
    expect(c.articles.map((a) => a.slug)).toEqual(["el-mundo"]);
    expect(c.articles[0]).toMatchObject({ sectionSlug: "pandora", description: "Cuerpo de prueba.", createdAt: "2026-10-08T21:11:02.000Z" });
    expect(d.logs.filter((l) => l.startsWith("·"))).toHaveLength(3);
  });

  it("descarga las imágenes a public/content/<id>/<n>.webp y reescribe el Markdown", async () => {
    const d = deps([row({ title: "Ciencia", slug: "ciencia", description: "Desc propia" })], {
      "id-ciencia": `Intro.\n![Alpha](${REF})\n![](notion-file-block://nope/x?name=y.jpg)\n![Externa](https://ext/img.png)\n<callout icon="❗">\n\tOjo\n</callout>`,
    });
    const c = await pullContent(d);
    const a = c.articles[0];
    expect(a.description).toBe("Desc propia");
    expect(a.images).toEqual([
      { src: "/content/id-ciencia/1.webp", width: 1200, height: 900, alt: "Alpha" },
      { src: "/content/id-ciencia/2.webp", width: 1200, height: 900, alt: "Externa" },
    ]);
    expect(d.stored).toEqual(["https://s3/firmada.jpg -> /pub/content/id-ciencia/1.webp", "https://ext/img.png -> /pub/content/id-ciencia/2.webp"]);
    expect(a.body).toBe("Intro.\n\n![Alpha](/content/id-ciencia/1.webp)\n\n![Externa](/content/id-ciencia/2.webp)\n\n> ❗\n> Ojo");
    expect(d.logs.some((l) => l.includes("imagen no resuelta"))).toBe(true);
  });

  it("convierte los bookmarks en enlaces y guarda la vista previa de los vídeos de TikTok", async () => {
    const d = deps([row({ title: "Ciencia", slug: "ciencia" })], {
      "id-ciencia": `¡Mira mi vídeo!\n${bookmark(TIKTOK)}\n${bookmark(OTRO)}\n${bookmark(ROTO)}\n<empty-block/>`,
    });
    const a = (await pullContent(d)).articles[0];
    // URL de TikTok canónica (sin web_id); la de otra web, con su dominio y paréntesis escapados; el no resuelto, fuera.
    expect(a.body).toBe("¡Mira mi vídeo!\n\n[Ver el vídeo en TikTok](https://www.tiktok.com/@sophisnavi/video/123)\n\n[example.com](https://example.com/a%28b%29)");
    expect(a.videos).toEqual([
      {
        url: "https://www.tiktok.com/@sophisnavi/video/123",
        title: "Ciencia real",
        author: "Sofi",
        thumbnail: { src: "/content/id-ciencia/video-1.webp", width: 1200, height: 900, alt: "Ciencia real" },
      },
    ]);
    expect(d.stored).toEqual(["https://cdn/miniatura.jpg -> /pub/content/id-ciencia/video-1.webp"]);
    expect(d.logs.some((l) => l.includes("bookmark no resuelto"))).toBe(true);
  });

  it("si la vista previa de TikTok falla, queda el enlace y el build sigue", async () => {
    const d = deps([row({ title: "Ciencia", slug: "ciencia", kind: "intro" })], { "id-ciencia": bookmark(TIKTOK) });
    d.fetchJson = async () => {
      throw new Error("HTTP 503");
    };
    const intro = (await pullContent(d)).intros.pandora!;
    expect(intro.body).toBe("[Ver el vídeo en TikTok](https://www.tiktok.com/@sophisnavi/video/123)");
    expect(intro.videos).toBeUndefined();
    expect(d.logs.some((l) => l.includes("vista previa de TikTok no disponible") && l.includes("HTTP 503"))).toBe(true);
  });

  it("una respuesta de oEmbed sin miniatura válida también deja solo el enlace", async () => {
    const d = deps([row({ title: "Ciencia", slug: "ciencia" })], { "id-ciencia": bookmark(TIKTOK) });
    d.fetchJson = async () => ({ title: "x", thumbnail_url: "javascript:alert(1)" });
    const a = (await pullContent(d)).articles[0];
    expect(a.videos).toBeUndefined();
    expect(d.stored).toEqual([]);
  });

  it("propaga el error si Notion falla: el build no debe publicar una web a medias", async () => {
    const d = deps([row({})]);
    d.gateway.getPageMarkdown = async () => {
      throw new Error("notion caída");
    };
    await expect(pullContent(d)).rejects.toThrow("notion caída");
  });
});
