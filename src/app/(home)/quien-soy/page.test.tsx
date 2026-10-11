import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AboutPage, { generateMetadata } from "./page";

// Protege: «Quién soy» es una página propia para Google: título, canonical, Open Graph y datos estructurados de autora.
describe("Quién soy", () => {
  it("declara título, canonical y Open Graph de /quien-soy", async () => {
    const m = await generateMetadata();
    expect(m.title).toBe("Quién soy");
    expect(m.description).toMatch(/^Soy Sofi \(@sophisnavi\)/);
    expect(m.alternates?.canonical).toBe("https://www.sophisnavi.com/quien-soy");
    expect(m.openGraph?.url).toBe("https://www.sophisnavi.com/quien-soy");
  });

  it("emite ProfilePage con la Person y la miga de pan Inicio › Quién soy", async () => {
    const html = renderToStaticMarkup(await AboutPage());
    expect(html).toContain('"@type":"ProfilePage"');
    expect(html).toContain('"mainEntity":{"@type":"Person"');
    expect(html).toMatch(/"dateModified":"\d{4}-\d{2}-\d{2}T/);
    expect(html).toContain('"item":"https://www.sophisnavi.com/quien-soy"');
  });
});
