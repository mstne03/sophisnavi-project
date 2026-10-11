import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import RootLayout, { metadata, viewport } from "./layout";

vi.mock("next/font/google", () => {
  const font = (o: { variable: string }) => ({ variable: o.variable, className: o.variable });
  return { Geist: font, Geist_Mono: font, Marcellus: font };
});
vi.mock("./globals.css", () => ({}));

// Protege: <html lang="es"> y los metadatos PWA básicos; el idioma lo leen Google y los lectores de pantalla.
describe("RootLayout", () => {
  it("declara lang=es y pinta los hijos dentro de <body>", () => {
    const html = renderToStaticMarkup(
      <RootLayout params={Promise.resolve({})}>
        <p>hola</p>
      </RootLayout>,
    );
    expect(html).toMatch(/<html lang="es"/);
    expect(html).toContain("<p>hola</p>");
  });

  it("exporta plantilla de título, metadataBase y color de tema; los iconos van por convención de fichero", () => {
    expect(metadata.title).toEqual({ default: "Sophisnavi", template: "%s · Sophisnavi" });
    expect(String(metadata.metadataBase)).toBe("https://www.sophisnavi.com/");
    expect(metadata.icons).toBeUndefined(); // favicon.ico, icon.png y apple-icon.png en src/app/
    expect(viewport.themeColor).toBe("#02040a");
  });

  it("el logo de la marca y los iconos existen junto al layout y en public/", async () => {
    const { existsSync } = await import("node:fs");
    for (const f of ["src/app/favicon.ico", "src/app/icon.png", "src/app/apple-icon.png", "public/logo.png", "public/icon-192x192.png", "public/icon-512x512.png"]) {
      expect(existsSync(f), f).toBe(true);
    }
  });

  it("inserta el JSON-LD de WebSite en el body", () => {
    const html = renderToStaticMarkup(
      <RootLayout params={Promise.resolve({})}>
        <p>x</p>
      </RootLayout>,
    );
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('"@type":"WebSite"');
  });
});
