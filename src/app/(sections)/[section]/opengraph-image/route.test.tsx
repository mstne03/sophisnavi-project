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

import { dynamic, dynamicParams, GET, generateStaticParams } from "./route";

type Captured = { element: React.ReactElement; options: { fonts: { name: string }[] } };
const render = async (section: string) => (await GET(new Request("http://x"), { params: Promise.resolve({ section }) })) as unknown as Captured;

// Protege: /<sección>/opengraph-image (la URL que declara pageMetadata) existe y es estática, una por sección, con su
// título, el árbol y Marcellus; una sección desconocida cae al nombre del sitio.
describe("/[section]/opengraph-image", () => {
  it("es estática y solo existe para las secciones del build", () => {
    expect(dynamic).toBe("force-static");
    expect(dynamicParams).toBe(false);
  });

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
