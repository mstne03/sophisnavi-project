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
