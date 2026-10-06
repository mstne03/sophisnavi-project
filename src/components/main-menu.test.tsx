import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SECTIONS } from "@/lib/sections";
import { MainMenu } from "./main-menu";

// Protege: la portada debe exponer h1 y un <nav> con un enlace por sección (SEO y accesibilidad).
describe("MainMenu", () => {
  it("renderiza el h1 y un enlace por sección dentro de <nav>", () => {
    render(<MainMenu />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Sophisnavi");
    const nav = screen.getByRole("navigation", { name: "Menú principal" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(SECTIONS.map((s) => `/${s.slug}`));
  });
});
