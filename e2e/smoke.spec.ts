import { readFileSync } from "node:fs";
import { SECTIONS, type Article, type Content } from "../src/domain/content";
import { expect, test } from "./fixtures";

// Flujo crítico 1: la portada carga, la intro se puede saltar y el menú enlaza a una sección.
test("portada → saltar intro → sección", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Sophisnavi" })).toBeVisible();
  await page.getByRole("button", { name: "Saltar intro" }).click();
  const nav = page.getByRole("navigation", { name: "Menú principal" });
  await expect(nav).toBeVisible();
  await nav.locator('a[href="/pandora"]').click();
  await expect(page).toHaveURL(/\/pandora$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pandora");
});

// Flujo crítico 2: una ruta desconocida devuelve 404.
test("ruta desconocida devuelve 404", async ({ page }) => {
  const res = await page.goto("/no-existe");
  expect(res?.status()).toBe(404);
});

// Flujos 3–5: el E2E corre contra el build real, así que los artículos salen del mismo snapshot de Notion que el build.
// Nada de slugs a mano: Sofi publica y retira artículos sin tocar el código, y la suite no debe enterarse.
const content = JSON.parse(readFileSync("data/content/content.json", "utf8")) as Content;
const url = (a: Article) => `/${a.sectionSlug}/${a.slug}`;
const inSection = (slug: string) => content.articles.filter((a) => a.sectionSlug === slug).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
const pair = SECTIONS.map((s) => inSection(s.slug)).find((list) => list.length >= 2);
const withImage = content.articles.find((a) => a.images.length > 0);
const anyArticle = content.articles[0];

// Flujo crítico 3: sección → primer artículo → siguiente/anterior.
test("sección → artículo → siguiente", async ({ page }) => {
  test.skip(!pair, "ninguna sección tiene dos artículos publicados");
  const [first, second] = pair!;
  await page.goto(`/${first.sectionSlug}`);
  await page.getByRole("list", { name: "Artículos de la sección" }).getByRole("link").first().click();
  await expect(page).toHaveURL(new RegExp(`${url(first)}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(first.title);
  await page.getByRole("link", { name: /siguiente/i }).click();
  await expect(page).toHaveURL(new RegExp(`${url(second)}$`));
  await expect(page.getByRole("link", { name: /anterior/i })).toHaveAttribute("href", url(first));
});

// Flujo crítico 3b: las imágenes propias de un artículo se sirven y cargan.
test("las imágenes de un artículo cargan", async ({ page }) => {
  test.skip(!withImage, "ningún artículo publicado tiene imágenes");
  await page.goto(url(withImage!));
  const img = page.locator("figure img").first();
  // loading="lazy": la imagen no se descarga hasta acercarse al viewport, así que se lleva a pantalla y se espera a que cargue.
  await img.scrollIntoViewIfNeeded();
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => (el.complete ? el.naturalWidth : 0))).toBeGreaterThan(0);
});

// Flujo crítico 4: el HTML crudo (sin JS) trae el contenido, los metadatos y los datos estructurados.
test("el HTML del servidor trae artículo, canonical, Open Graph y JSON-LD", async ({ request }) => {
  test.skip(!anyArticle, "no hay artículos publicados");
  const html = await (await request.get(url(anyArticle))).text();
  expect(html).toContain("<h1");
  expect(html).toContain(`rel="canonical" href="https://www.sophisnavi.com${url(anyArticle)}"`);
  expect(html).toContain('property="og:type" content="article"');
  expect(html).toMatch(/hreflang="x-default"/i); // Next emite el atributo como hrefLang; HTML no distingue mayúsculas
  expect(html).toContain('"@type":"Article"');
});

// Flujo crítico 5: sitemap y robots se generan desde el contenido.
test("sitemap.xml y robots.txt", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const s of SECTIONS) expect(sitemap).toContain(`<loc>https://www.sophisnavi.com/${s.slug}</loc>`);
  for (const a of content.articles) expect(sitemap).toContain(`<loc>https://www.sophisnavi.com${url(a)}</loc>`);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://www.sophisnavi.com/sitemap.xml");
  expect(robots).toMatch(/User-Agent: GPTBot[\s\S]*Disallow: \//);
});

// Flujo crítico 6: el webhook público rechaza llamadas sin firma válida y nunca despliega.
test("el webhook de Notion rechaza peticiones sin firma", async ({ request }) => {
  const res = await request.post("/api/notion/webhook", { data: { type: "page.content_updated", entity: { id: "x", type: "page" } } });
  expect([401, 503]).toContain(res.status());
  expect(await res.json()).toMatchObject({ ok: false });
});
