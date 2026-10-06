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

// Flujo crítico 3: la sección muestra el contenido real del seed y enlaza a una página con su plantilla.
test("sección → artículo del seed", async ({ page }) => {
  await page.goto("/personajes");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Personajes");
  await expect(page.getByText(/Los personajes son el motivo/)).toBeVisible();
  await page.locator('a[href^="/personajes/"]').first().click();
  await expect(page).toHaveURL(/\/personajes\/.+/);
  await expect(page.getByRole("heading", { level: 3, name: "Fuentes" })).toBeVisible();
});

// Flujo crítico 4: la demo del panel carga, no se indexa y el editor precarga una página.
test("panel de demo → editor", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hola, Sofi");
  await page.getByRole("table").getByRole("link").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Editar página");
  await expect(page.getByLabel("Título")).not.toHaveValue("");
});
