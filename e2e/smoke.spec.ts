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

// Flujo crítico 3: sección → artículo de Notion con imágenes propias → siguiente/anterior.
test("sección → artículo → siguiente", async ({ page }) => {
  await page.goto("/pandora");
  await page.getByRole("list", { name: "Artículos de la sección" }).getByRole("link").first().click();
  await expect(page).toHaveURL(/\/pandora\/el-mundo-de-avatar$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("El mundo de AVATAR");
  await page.getByRole("link", { name: /siguiente/i }).click();
  await expect(page).toHaveURL(/\/pandora\/la-ciencia-real-detras-de-avatar$/);
  const img = page.locator("figure img").first();
  await expect(img).toBeVisible();
  expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole("link", { name: /anterior/i })).toHaveAttribute("href", "/pandora/el-mundo-de-avatar");
});

// Flujo crítico 4: el HTML crudo (sin JS) trae el contenido, los metadatos y los datos estructurados.
test("el HTML del servidor trae artículo, canonical, Open Graph y JSON-LD", async ({ request }) => {
  const html = await (await request.get("/pandora/la-ciencia-real-detras-de-avatar")).text();
  expect(html).toContain("<h1");
  expect(html).toContain("ALPHA CENTAURI");
  expect(html).toContain('rel="canonical" href="https://www.sophisnavi.com/pandora/la-ciencia-real-detras-de-avatar"');
  expect(html).toContain('property="og:type" content="article"');
  expect(html).toMatch(/hreflang="x-default"/i); // Next emite el atributo como hrefLang; HTML no distingue mayúsculas
  expect(html).toContain('"@type":"Article"');
});

// Flujo crítico 5: sitemap y robots se generan desde el contenido.
test("sitemap.xml y robots.txt", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<loc>https://www.sophisnavi.com/pandora/la-ciencia-real-detras-de-avatar</loc>");
  expect(sitemap).toContain("<loc>https://www.sophisnavi.com/vida-fan</loc>");
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
