import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

  // Protege: la portada presenta a Sofi con el extracto y enlaza a /quien-soy (sin JS, enlace normal; con JS, desliza).
  it("muestra el extracto con un enlace a /quien-soy que avisa en vez de navegar", () => {
    const onAbout = vi.fn();
    render(<MainMenu sections={SECTIONS} excerpt="Soy Sofi, fan de Avatar" onAbout={onAbout} />);
    expect(screen.getByText(/Soy Sofi, fan de Avatar/)).toBeTruthy();
    const link = screen.getByRole("link", { name: "Conoce mi historia →" });
    expect(link.getAttribute("href")).toBe("/quien-soy");
    expect(fireEvent.click(link)).toBe(false); // preventDefault
    expect(onAbout).toHaveBeenCalledOnce();
  });

  it("sin onAbout el enlace del extracto navega normalmente, y sin extracto no hay enlace", () => {
    const { rerender } = render(<MainMenu sections={SECTIONS} excerpt="Soy Sofi" />);
    expect(fireEvent.click(screen.getByRole("link", { name: "Conoce mi historia →" }))).toBe(true);
    rerender(<MainMenu sections={SECTIONS} />);
    expect(screen.queryByRole("link", { name: "Conoce mi historia →" })).toBeNull();
  });
});
