import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SectionsLayout from "./layout";

vi.mock("next/navigation", () => ({ usePathname: () => "/pandora/el-mundo-de-avatar" }));

// Protege: la barra superior de secciones y artículos vive en el layout del grupo (no se desmonta al navegar entre
// ellos), con la navegación entre las seis secciones y la actual sacada de la ruta.
describe("SectionsLayout", () => {
  it("pinta la barra superior con las seis secciones y después la página", async () => {
    render(await SectionsLayout({ children: <p>página</p>, params: Promise.resolve({}) }));
    expect(screen.getByRole("link", { name: "Sophisnavi, inicio" })).toBeTruthy();
    const nav = screen.getAllByRole("navigation", { name: "Secciones", hidden: true })[0];
    expect(within(nav).getAllByRole("link", { hidden: true })).toHaveLength(6);
    expect(within(nav).getByRole("link", { name: "Pandora", hidden: true }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByText("página")).toBeTruthy();
  });
});
