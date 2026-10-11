// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(
      public element: React.ReactElement,
      public options: { fonts: { name: string }[] },
    ) {}
  },
}));

import Image, { generateStaticParams } from "./opengraph-image";

type Captured = { element: React.ReactElement; options: { fonts: { name: string }[] } };
const render = async (section: string) => (await Image({ params: Promise.resolve({ section }) })) as unknown as Captured;

// Protege: una tarjeta por sección con su título, el árbol y Marcellus; una sección desconocida cae al nombre del sitio.
describe("opengraph-image (sección)", () => {
  it("genera un parámetro por sección y pinta el título de cada una", async () => {
    expect(generateStaticParams()).toContainEqual({ section: "personajes" });
    const res = await render("personajes");
    const html = renderToStaticMarkup(res.element);
    expect(html).toContain("Personajes");
    expect(html).toContain("Sophisnavi · Avatar");
    expect(html).toContain('src="data:image/png;base64,');
    expect(res.options.fonts[0].name).toBe("Marcellus");
  });

  it("con un slug desconocido usa el nombre del sitio como titular", async () => {
    expect(renderToStaticMarkup((await render("nope")).element)).toContain("Sophisnavi");
  });
});
