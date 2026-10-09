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

  it("exporta plantilla de título, metadataBase, icono de Apple y color de tema", () => {
    expect(metadata.title).toEqual({ default: "Sophisnavi", template: "%s · Sophisnavi" });
    expect(String(metadata.metadataBase)).toBe("https://www.sophisnavi.com/");
    expect(metadata.icons).toEqual({ apple: "/icon-192x192.png" });
    expect(viewport.themeColor).toBe("#02040a");
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
