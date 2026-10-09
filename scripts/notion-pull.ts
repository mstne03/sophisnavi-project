// Descarga el contenido publicado de Notion antes de `next build` (ADR-0007).
// Sin NOTION_TOKEN (CI de forks, clones sin credenciales) se conserva el data/content/content.json versionado.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createNotionGateway, DEFAULT_DATA_SOURCE_ID } from "@/infrastructure/notion/gateway";
import { storeImage } from "@/infrastructure/notion/images";
import { pullContent } from "@/infrastructure/notion/pull";

const root = process.cwd();
const OUT = join(root, "data", "content", "content.json");
const PUBLIC = join(root, "public");

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
  const content = await pullContent({
    gateway: createNotionGateway(token),
    dataSourceId,
    publicDir: PUBLIC,
    fetchBytes: async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Descarga fallida (${res.status}): ${url.split("?")[0]}`);
      return new Uint8Array(await res.arrayBuffer());
    },
    storeImage,
    log: (m) => console.log(`notion-pull: ${m}`),
  });
  // Solo se limpia lo viejo cuando lo nuevo ya está completo en memoria.
  await rm(join(PUBLIC, "content"), { recursive: true, force: true });
  await mkdir(join(root, "data", "content"), { recursive: true });
  await writeFile(OUT, JSON.stringify(content, null, 2) + "\n");
  console.log(`notion-pull: ${content.articles.length} artículos, ${Object.keys(content.intros).length} intros, home ${content.home ? "sí" : "no"}`);
}

main().catch((e) => {
  console.error("notion-pull: error, el build se detiene para no publicar una web incompleta");
  console.error(e);
  process.exit(1);
});
