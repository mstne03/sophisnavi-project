import { describe, expect, it } from "vitest";
import { entryLabel, excerpt, hasEntryToggle, HOME_NOTION_NAME, isSlug, SECTIONS, sectionForNotionName, slugify, splitEntries } from "./content";

// Protege: las seis secciones son fijas y cada valor de la columna «Sección» de Notion cae en una sola.
describe("SECTIONS", () => {
  it("tiene seis secciones con slugs válidos y descripciones de tarjeta ≤ 155", () => {
    expect(SECTIONS.map((s) => s.slug)).toEqual(["pandora", "personajes", "clanes", "saga", "coleccion", "vida-fan"]);
    for (const s of SECTIONS) {
      expect(isSlug(s.slug)).toBe(true);
      expect(s.description.length).toBeLessThanOrEqual(155);
    }
  });

  it("mapea cada opción de Notion a una sección; Teorías y Detrás de cámaras van a La saga", () => {
    expect(sectionForNotionName("Pandora")?.slug).toBe("pandora");
    expect(sectionForNotionName("Teorías")?.slug).toBe("saga");
    expect(sectionForNotionName("Detrás de cámaras")?.slug).toBe("saga");
    expect(sectionForNotionName(HOME_NOTION_NAME)).toBeUndefined();
    expect(sectionForNotionName(null)).toBeUndefined();
  });
});

describe("slugify", () => {
  it("quita acentos, apóstrofos y signos; deja kebab-case", () => {
    expect(slugify("¿Por qué los Na’vi son azules?")).toBe("por-que-los-navi-son-azules");
    expect(slugify("La ciencia real detrás de AVATAR")).toBe("la-ciencia-real-detras-de-avatar");
    expect(isSlug(slugify("  ¡Hola!  "))).toBe(true);
  });
});

describe("excerpt", () => {
  it("toma el primer párrafo de texto, sin marcas, y recorta sin partir palabras", () => {
    const md = "# Título\n\n![foto](/a.webp)\n\nTodos **sabemos** que *AVATAR* es [ficción](https://x), ¿pero y si te digo que una parte de esa ciencia existe de verdad, se puede comprobar en la Tierra hoy mismo y además la usan los científicos a diario en sus laboratorios?\n\nOtro párrafo.";
    const out = excerpt(md);
    expect(out.startsWith("Todos sabemos que AVATAR es ficción, ¿pero")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(155);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });

  it("devuelve el párrafo entero si cabe y cadena vacía si no hay texto", () => {
    expect(excerpt("Corto.")).toBe("Corto.");
    expect(excerpt("# Solo título\n\n- lista")).toBe("");
  });
});

describe("splitEntries", () => {
  const md = "Intro **común**.\n\n> Cita\n\n## JAKE SULLY: DE PROTAGONISTA A MCGUFFIN\n\nTexto de Jake.\n\n### Detalle\n\nMás.\n\n## LO’AK: EL GENERADOR DE PROBLEMAS\n\nTexto de Lo’ak.\n\n## Spider\n\nTexto de Spider.";

  it("separa la intro y una entrada por título de nivel 2, con nombre e id para el selector", () => {
    const { intro, entries } = splitEntries(md);
    expect(intro).toBe("Intro **común**.\n\n> Cita");
    expect(entries.map((e) => e.label)).toEqual(["Jake Sully", "Lo’ak", "Spider"]);
    expect(entries.map((e) => e.id)).toEqual(["jake-sully", "loak", "spider"]);
    expect(entries[0].body).toBe("## JAKE SULLY: DE PROTAGONISTA A MCGUFFIN\n\nTexto de Jake.\n\n### Detalle\n\nMás."); // el h3 no corta
    expect(entries[2].body).toBe("## Spider\n\nTexto de Spider.");
  });

  it("sin títulos de nivel 2 todo es intro; si empieza por título no hay intro", () => {
    expect(splitEntries("Solo texto.\n\n### h3")).toEqual({ intro: "Solo texto.\n\n### h3", entries: [] });
    const { intro, entries } = splitEntries("## Kiri\n\nTexto.");
    expect(intro).toBe("");
    expect(entries).toHaveLength(1);
  });

  it("entryLabel pasa a mayúscula inicial solo los nombres escritos todo en mayúsculas y quita énfasis", () => {
    expect(entryLabel("NEYTIRI: EL SIGNIFICADO DE LA VIDA")).toBe("Neytiri");
    expect(entryLabel("**Miles Quaritch**: el villano")).toBe("Miles Quaritch");
    expect(entryLabel("Tuk")).toBe("Tuk");
  });

  it("hasEntryToggle solo acepta los artículos de la lista", () => {
    expect(hasEntryToggle("los-sully")).toBe(true);
    expect(hasEntryToggle("la-flora-de-pandora")).toBe(false);
  });
});
