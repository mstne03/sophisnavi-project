// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Content } from "@/domain/content";

// Protege: el snapshot versionado de Notion es coherente consigo mismo. Sin NOTION_TOKEN (CI, forks) el build usa este JSON
// tal cual, así que toda imagen que referencie tiene que estar commiteada en public/. No comprueba contenido concreto.
const content = JSON.parse(readFileSync("data/content/content.json", "utf8")) as Content;
const pages = [content.home, ...Object.values(content.intros), ...content.articles].filter((p) => p !== undefined);

describe("snapshot de contenido", () => {
  it("toda imagen referenciada existe en public/", () => {
    const srcs = pages.flatMap((p) => [...p.images.map((i) => i.src), ...(p.videos ?? []).map((v) => v.thumbnail.src)]);
    const missing = srcs.filter((src) => !existsSync(join("public", src)));
    expect(missing, "imágenes sin commitear: ejecuta `pnpm content:pull` con NOTION_TOKEN y commitea public/content").toEqual([]);
  });

  it("toda imagen del Markdown tiene sus dimensiones en images", () => {
    for (const p of pages) {
      const inBody = [...p.body.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]);
      expect(p.images.map((i) => i.src)).toEqual(expect.arrayContaining(inBody));
    }
  });
});
