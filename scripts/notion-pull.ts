// Descarga el contenido publicado de Notion antes de `next build` (ADR-0007).
// Sin NOTION_TOKEN (CI de forks, clones sin credenciales) se conserva el data/content/content.json versionado.
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createNotionGateway, DEFAULT_DATA_SOURCE_ID } from "@/infrastructure/notion/gateway";
import { storeImage } from "@/infrastructure/notion/images";
import { pullContent } from "@/infrastructure/notion/pull";

const root = process.cwd();
const OUT = join(root, "data", "content", "content.json");
const PUBLIC = join(root, "public");
// Las imágenes se descargan aquí y solo pasan a public/content/ cuando la extracción entera ha ido bien.
const STAGING = join(root, ".notion-pull");

// En local el token vive en .env.local (lo lee Next, no tsx); en Vercel ya está en el entorno y el archivo no existe.
// Las variables ya definidas en el proceso tienen prioridad: loadEnvFile no las sobrescribe.
try {
  process.loadEnvFile(join(root, ".env.local"));
} catch {}

async function main() {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.warn("notion-pull: sin NOTION_TOKEN, se usa el contenido versionado en data/content/content.json");
    return;
  }
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID ?? DEFAULT_DATA_SOURCE_ID;
  await rm(STAGING, { recursive: true, force: true });
  const content = await pullContent({
    gateway: createNotionGateway(token),
    dataSourceId,
    publicDir: STAGING,
    fetchBytes: async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Descarga fallida (${res.status}): ${url.split("?")[0]}`);
      return new Uint8Array(await res.arrayBuffer());
    },
    storeImage,
    log: (m) => console.log(`notion-pull: ${m}`),
  });
  // Lo viejo se sustituye solo ahora, con lo nuevo completo: JSON e imágenes a la vez.
  await rm(join(PUBLIC, "content"), { recursive: true, force: true });
  await rename(join(STAGING, "content"), join(PUBLIC, "content")).catch((e: NodeJS.ErrnoException) => {
    if (e.code !== "ENOENT") throw e; // sin imágenes no hay carpeta que mover
  });
  await rm(STAGING, { recursive: true, force: true });
  await mkdir(join(root, "data", "content"), { recursive: true });
  await writeFile(OUT, JSON.stringify(content, null, 2) + "\n");
  console.log(`notion-pull: ${content.articles.length} artículos, ${Object.keys(content.intros).length} intros, home ${content.home ? "sí" : "no"}`);
}

main().catch((e) => {
  console.error("notion-pull: error, el build se detiene para no publicar una web incompleta");
  console.error(e);
  process.exit(1);
});
