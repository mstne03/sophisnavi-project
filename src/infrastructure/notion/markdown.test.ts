import { describe, expect, it } from "vitest";
import { extractImageRefs, normalizeNotionMarkdown, rewriteImages } from "./markdown";

const REF = "notion-file-block://3f41/e0a1?space_id=9171&name=foto.jpg";

// Protege: el Markdown de Notion (una línea = un bloque; callouts, <br>, <empty-block/>, atributos, h4) se convierte en
// Markdown estándar con párrafos separados y títulos desde h2, y las imágenes se resuelven a rutas locales o desaparecen.
describe("normalizeNotionMarkdown", () => {
  it("separa cada línea de Notion en su propio párrafo y mantiene juntas las listas", () => {
    const md = "Kaltxì!\nSoy Sofi.\n- Una\n- Dos\nFin.";
    expect(normalizeNotionMarkdown(md)).toBe("Kaltxì!\n\nSoy Sofi.\n\n- Una\n- Dos\n\nFin.");
  });

  it("convierte callouts en citas con su icono y respeta los saltos <br>", () => {
    const md = '<callout icon="❗" color="gray_bg">\n\tPrimera.<br>Segunda.\n\tTercera.\n</callout>\nDespués.';
    expect(normalizeNotionMarkdown(md)).toBe("> ❗\n> Primera.  \n> Segunda.\n> Tercera.\n\nDespués.");
  });

  it("lleva el título más alto a h2 conservando la jerarquía y quita atributos, spans y bloques vacíos", () => {
    const md = '#### ALPHA {color="blue"}\n<empty-block/>\nTexto <span color="red">rojo</span>.<br>Más.\n##### Sub {toggle="true"}';
    expect(normalizeNotionMarkdown(md)).toBe("## ALPHA\n\nTexto rojo.  \nMás.\n\n### Sub");
    expect(normalizeNotionMarkdown("# Grande\n###### Hondo")).toBe("## Grande\n\n###### Hondo");
  });

  it("elimina la nota «paso al siguiente blog» y conserva otros escapes", () => {
    const md = "Fin.\n\\[ paso al siguiente blog: “X” \\]\n\\* no es lista";
    expect(normalizeNotionMarkdown(md)).toBe("Fin.\n\n\\* no es lista");
  });

  it("deja el texto de tablas, columnas y menciones aunque pierda el envoltorio", () => {
    const md = '<columns>\n\t<column ratio="50">\n\t\tIzquierda\n\t</column>\n</columns>\n<mention-page url="x">Página</mention-page> y <mention-date start="2026-01-01"/>';
    expect(normalizeNotionMarkdown(md).replace(/\s+/g, " ")).toBe("Izquierda Página y");
  });

  it("ignora líneas en blanco y limpia el final", () => {
    expect(normalizeNotionMarkdown("A\n\n\n\nB\n\n")).toBe("A\n\nB");
    expect(normalizeNotionMarkdown("")).toBe("");
  });
});

describe("imágenes", () => {
  it("extrae referencias únicas con su texto alternativo", () => {
    const md = `![Planeta](${REF})\n![](${REF})\n![Otra](https://x/y.png) {color="gray"}`;
    expect(extractImageRefs(md)).toEqual([
      { ref: REF, alt: "Planeta" },
      { ref: "https://x/y.png", alt: "Otra" },
    ]);
  });

  it("reescribe a rutas locales y elimina las que no se resolvieron", () => {
    const md = `Antes\n![Planeta](${REF})\nMedio\n![Rota](https://x/y.png)\nFin`;
    expect(rewriteImages(md, new Map([[REF, "/content/p1/1.webp"]]))).toBe("Antes\n![Planeta](/content/p1/1.webp)\nMedio\n\nFin");
  });
});
