// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// ImageResponse rasteriza con Satori: aquí basta con capturar qué elemento y qué opciones recibe.
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(
      public element: React.ReactElement,
      public options: { width: number; height: number },
    ) {}
  },
}));

import { dynamic, GET } from "./route";

// Protege: /quien-soy/opengraph-image (la URL que declara pageMetadata) existe, es estática y lleva «Quién soy».
describe("/quien-soy/opengraph-image", () => {
  it("compone la tarjeta con el titular de la página a 1200×630", async () => {
    const res = (await GET()) as unknown as { element: React.ReactElement; options: { width: number; height: number } };
    expect(renderToStaticMarkup(res.element)).toContain("Quién soy");
    expect(res.options).toMatchObject({ width: 1200, height: 630 });
    expect(dynamic).toBe("force-static");
  });
});
