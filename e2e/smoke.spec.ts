import { readFileSync } from "node:fs";
import { hasEntryToggle, SECTIONS, splitEntries, type Article, type Content } from "../src/domain/content";
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

// Flujo crítico 1b: «Quién soy» es la ruta /quien-soy, pero se llega deslizando desde Inicio sin recargar: la escena 3D
// (el mismo <canvas>) sigue ahí, y «atrás» vuelve a Inicio.
test("portada → pestaña Quién soy → /quien-soy → atrás", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Saltar intro" }).click();
  const top = page.getByRole("navigation", { name: "Portada" });
  await expect(top).toBeVisible();
  await page.locator("canvas").evaluate((c) => c.setAttribute("data-e2e", "same"));
  await top.getByRole("link", { name: "Quién soy" }).click();
  await expect(page).toHaveURL(/\/quien-soy$/);
  await expect(page.getByRole("heading", { level: 2, name: "Kaltxì!" })).toBeInViewport();
  await expect(page.locator('canvas[data-e2e="same"]')).toHaveCount(1); // navegación en cliente: ni recarga ni remonte
  await expect(page).toHaveTitle("Quién soy · Sophisnavi");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(top.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("navigation", { name: "Menú principal" })).toBeInViewport();
});

// Flujo crítico 1c: cada URL trae su texto en el HTML del servidor; la bienvenida completa solo en /quien-soy.
test("el HTML de /quien-soy trae la bienvenida y sus datos estructurados; / solo el extracto", async ({ request }) => {
  const about = await (await request.get("/quien-soy")).text();
  expect(about).toContain('id="bienvenida"');
  expect(about).toContain('rel="canonical" href="https://www.sophisnavi.com/quien-soy"');
  expect(about).toContain('"@type":"ProfilePage"');
  const home = await (await request.get("/")).text();
  expect(home).not.toContain('id="bienvenida"');
  expect(home).toContain('href="/quien-soy"');
  for (const s of SECTIONS) expect(home).toContain(`href="/${s.slug}"`); // el menú va en el HTML, no solo tras la intro
  expect(home).toMatch(/<h1[^>]*>Sophisnavi<\/h1>/);
});

// Flujo crítico 1d: sin JS no hay intro que termine; la portada enseña el menú y se puede navegar.
test("sin JavaScript la portada muestra el menú y enlaza a las secciones", async ({ browser }) => {
  const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Saltar intro" })).toBeHidden();
  await page.getByRole("navigation", { name: "Menú principal" }).locator('a[href="/pandora"]').click();
  await expect(page).toHaveURL(/\/pandora$/);
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
  // Favicon e icono de Apple por convención de fichero: son los que enseñan las pestañas y los resultados de Google.
  expect(html).toMatch(/<link rel="icon" href="\/favicon\.ico[^"]*"/);
  expect(html).toMatch(/<link rel="icon" href="\/icon\.png[^"]*"[^>]*sizes="512x512"/);
  expect(html).toMatch(/<link rel="apple-touch-icon" href="\/apple-icon\.png[^"]*"/);
});

// Flujo 4b (SOPHIE-3): en un artículo por entradas solo se ve el personaje elegido y el selector cambia de uno a otro.
const toggled = content.articles.find((a) => hasEntryToggle(a.slug) && splitEntries(a.body).entries.length > 1);
test("artículo por entradas: selector de personajes", async ({ page }) => {
  test.skip(!toggled, "no hay ningún artículo por entradas publicado en el snapshot");
  const [first, second] = splitEntries(toggled!.body).entries;
  await page.goto(url(toggled!));
  const tabs = page.getByRole("tablist");
  await expect(tabs.getByRole("tab", { name: first.label })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveCount(1); // los ocultos no cuentan
  await tabs.getByRole("tab", { name: second.label }).click();
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
  await expect(page.getByRole("tabpanel").getByRole("heading", { level: 2 }).first()).toContainText(second.label, { ignoreCase: true });
  await expect(page).toHaveURL(new RegExp(`#${second.id}$`));
});

// Flujo crítico 5: sitemap y robots se generan desde el contenido.
test("sitemap.xml y robots.txt", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<loc>https://www.sophisnavi.com/quien-soy</loc>");
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

// Flujo crítico 7: la sincronización programada nunca lanza un build sin el secreto del cron.
test("la sincronización con Notion exige el secreto del cron", async ({ request }) => {
  const res = await request.get("/api/notion/sync", { headers: { authorization: "Bearer incorrecto" } });
  expect([401, 503]).toContain(res.status());
  expect(await res.json()).toMatchObject({ ok: false });
});
