// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// ImageResponse rasteriza con Satori: aquí basta con capturar qué elemento y qué opciones recibe.
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(
      public element: React.ReactElement,
      public options: { width: number; height: number; fonts: { name: string }[] },
    ) {}
  },
}));

import Image, { alt, contentType, size } from "./opengraph-image";

// Protege: la tarjeta de la portada lleva su texto, el árbol de la marca y Marcellus, a 1200×630.
describe("opengraph-image (portada)", () => {
  it("compone la tarjeta con kicker, titular, marca y fuente", async () => {
    const res = (await Image()) as unknown as { element: React.ReactElement; options: { width: number; height: number; fonts: { name: string }[] } };
    const html = renderToStaticMarkup(res.element);
    expect(html).toContain("Fan de Avatar desde 2009");
    expect(html).toContain("sophisnavi");
    expect(html).toContain('src="data:image/png;base64,');
    expect(res.options).toMatchObject({ width: 1200, height: 630 });
    expect(res.options.fonts[0].name).toBe("Marcellus");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    expect(alt).toContain("Sophisnavi");
  });
});
