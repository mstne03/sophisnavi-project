// Convierte el «Notion-flavored Markdown» de la API (GET /pages/{id}/markdown) en Markdown estándar
// que react-markdown + rehype-sanitize renderizan como HTML semántico. Pura.
//
// Diferencias que importan: en Notion cada línea es un bloque (sin líneas en blanco entre párrafos), los títulos
// empiezan donde Sofi quiera (suele usar ####) y hay etiquetas propias (<callout>, <br>, <empty-block/>, {color=…}).
//
// ponytail: cubre lo que Sofi usa (párrafos, títulos, listas, negrita, enlaces, imágenes, callouts, <br>).
// Tablas, columnas, toggles y menciones pierden su envoltorio pero conservan el texto; se amplía cuando aparezcan.

export type ImageRef = { ref: string; alt: string };

const IMAGE = /!\[([^\]]*)\]\(([^)\s]+)\)(?:\s*\{[^}]*\})?/g;

export function extractImageRefs(md: string): ImageRef[] {
  const seen = new Map<string, ImageRef>();
  for (const m of md.matchAll(IMAGE)) if (!seen.has(m[2])) seen.set(m[2], { ref: m[2], alt: m[1].trim() });
  return [...seen.values()];
}

// Sustituye cada referencia de imagen por su ruta local; las no resueltas se eliminan (nunca una imagen rota).
export function rewriteImages(md: string, local: ReadonlyMap<string, string>): string {
  return md.replace(IMAGE, (_, alt: string, ref: string) => {
    const src = local.get(ref);
    return src ? `![${alt.trim()}](${src})` : "";
  });
}

const HEADING = /^(\s*)(#{1,6})\s+(.*)$/;
const LIST_ITEM = /^\s*([-*]|\d+\.)\s+/;

export function normalizeNotionMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let inCallout = false;
  for (const raw of lines) {
    let line = raw;
    if (/^\s*<empty-block\s*\/>\s*$/.test(line)) continue;
    // Nota editorial de Sofi: la navegación anterior/siguiente la sustituye.
    if (/^\s*\\?\[\s*paso al siguiente blog/i.test(line)) continue;

    if (/^\s*<callout\b[^>]*>\s*$/.test(line)) {
      inCallout = true;
      const icon = /\bicon="([^"]*)"/.exec(line)?.[1]?.trim();
      if (icon) blocks.push(`> ${icon}`);
      continue;
    }
    if (/^\s*<\/callout>\s*$/.test(line)) {
      inCallout = false;
      continue;
    }

    line = line
      .replace(/\s*\{[^}]*=[^}]*\}\s*$/, "") // atributos {color="…"} / {toggle="true"}
      .replace(/<span\b[^>]*>(.*?)<\/span>/g, "$1")
      .replace(/<mention-[a-z-]+\b[^>]*>(.*?)<\/mention-[a-z-]+>/g, "$1")
      .replace(/<mention-[a-z-]+\b[^>]*\/>/g, "")
      .replace(/<\/?(details|summary|columns|column|tabs|tab|table|colgroup|col|tr|td|synced_block|synced_block_reference)\b[^>]*>/g, "")
      .replace(/<unknown\b[^>]*\/>/g, "")
      .replace(/[ \t]+$/, "");
    if (line.trim() === "") continue;

    // <br> es un salto dentro del mismo bloque: salto duro de Markdown (dos espacios + nueva línea).
    const parts = line.split(/<br\s*\/?>/);
    if (inCallout) {
      blocks.push(parts.map((p) => `> ${p.replace(/^\t/, "").trim()}`).join("  \n"));
      continue;
    }
    blocks.push(parts.join("  \n"));
  }

  // Los títulos del cuerpo empiezan en h2 (el h1 lo pone la plantilla) conservando la jerarquía relativa.
  const levels = blocks.map((b) => HEADING.exec(b)?.[2].length).filter((n): n is number => n !== undefined);
  const shift = levels.length > 0 ? 2 - Math.min(...levels) : 0;
  const shifted = blocks.map((b) => {
    const h = HEADING.exec(b);
    return h ? `${h[1]}${"#".repeat(Math.min(h[2].length + shift, 6))} ${h[3]}` : b;
  });

  // Cada bloque de Notion es un párrafo propio, salvo que ambos sean elementos de lista, citas o hijos indentados.
  let out = "";
  for (let i = 0; i < shifted.length; i++) {
    const cur = shifted[i];
    const prev = shifted[i - 1];
    const glue = prev !== undefined && ((LIST_ITEM.test(prev) && LIST_ITEM.test(cur)) || (prev.startsWith(">") && cur.startsWith(">")) || /^\s/.test(cur));
    out += (i === 0 ? "" : glue ? "\n" : "\n\n") + cur;
  }
  return out.trim();
}
