import { join } from "node:path";
import { PUBLISHED } from "@/application/content/publishDecision";
import { excerpt, type Article, type Content, type ImageMeta, type Intro } from "@/domain/content";
import type { NotionGateway } from "./gateway";
import { extractImageRefs, normalizeNotionMarkdown, rewriteImages } from "./markdown";
import type { NotionPage } from "./mapPage";

export type PullDeps = {
  gateway: NotionGateway;
  dataSourceId: string;
  publicDir: string; // carpeta `public/`; las imágenes van a public/content/<pageId>/<n>.webp
  fetchBytes: (url: string) => Promise<Uint8Array>;
  storeImage: (bytes: Uint8Array, outFile: string) => Promise<{ width: number; height: number }>;
  now?: () => Date;
  log?: (msg: string) => void;
};

const FILE_BLOCK = /^notion-file-block:\/\/([^/?]+)\//i;

// Lee la base de datos de Notion y devuelve el contenido publicado listo para el build. Falla (lanza) si Notion falla:
// un build roto conserva el despliegue anterior; un build "a medias" publicaría una web incompleta.
export async function pullContent(deps: PullDeps): Promise<Content> {
  const log = deps.log ?? (() => {});
  const all = await deps.gateway.listPages(deps.dataSourceId);
  const published = all.filter((p) => p.status === PUBLISHED && !p.inTrash);
  log(`Notion: ${all.length} filas, ${published.length} publicadas`);

  const content: Content = { generatedAt: (deps.now ?? (() => new Date()))().toISOString(), intros: {}, articles: [] };
  const slugs = new Set<string>();

  for (const page of published) {
    if (!page.kind || !page.section) {
      log(`· «${page.title}» sin Tipo o Sección válidos: se omite`);
      continue;
    }
    const { body, images } = await pageBody(deps, page);
    if (page.kind === "intro") {
      const intro: Intro = { id: page.id, body, updatedAt: page.updatedAt, images };
      if (page.section === "home") content.home = intro;
      else content.intros[page.section] = intro;
      continue;
    }
    if (page.section === "home") {
      log(`· «${page.title}» es un artículo en Home: se omite (los artículos van en una sección)`);
      continue;
    }
    const key = `${page.section}/${page.slug}`;
    if (page.slug === "" || slugs.has(key)) {
      log(`· «${page.title}» con slug vacío o repetido (${key}): se omite`);
      continue;
    }
    slugs.add(key);
    const article: Article = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      description: page.description || excerpt(body),
      body,
      sectionSlug: page.section,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      images,
    };
    content.articles.push(article);
  }
  return content;
}

async function pageBody(deps: PullDeps, page: NotionPage): Promise<{ body: string; images: ImageMeta[] }> {
  const raw = await deps.gateway.getPageMarkdown(page.id);
  const local = new Map<string, string>();
  const images: ImageMeta[] = [];
  let n = 0;
  for (const { ref, alt } of extractImageRefs(raw)) {
    const url = FILE_BLOCK.test(ref) ? await deps.gateway.getFileUrl(FILE_BLOCK.exec(ref)![1]) : ref;
    if (!url) {
      deps.log?.(`· imagen no resuelta en «${page.title}»: ${ref}`);
      continue;
    }
    n += 1;
    const src = `/content/${page.id}/${n}.webp`;
    const { width, height } = await deps.storeImage(await deps.fetchBytes(url), join(deps.publicDir, src));
    local.set(ref, src);
    images.push({ src, width, height, alt: alt || page.title });
  }
  return { body: normalizeNotionMarkdown(rewriteImages(raw, local)), images };
}
