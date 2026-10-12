import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MainMenu } from "./main-menu";

// Protege: la portada debe exponer h1 y un <nav> con un enlace por sección (SEO y accesibilidad).
const SECTIONS = [
  { slug: "pandora", title: "Pandora", description: "Luna" },
  { slug: "clanes", title: "Clanes", description: "Pueblos" },
];

describe("MainMenu", () => {
  it("renderiza el h1 y un enlace por sección dentro de <nav>", () => {
    render(<MainMenu sections={SECTIONS} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Sophisnavi");
    const nav = screen.getByRole("navigation", { name: "Menú principal" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(SECTIONS.map((s) => `/${s.slug}`));
  });
});
