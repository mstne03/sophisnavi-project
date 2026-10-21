import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./breadcrumbs";

// Protege: las migas enlazan a cada nivel superior y la última marca la página actual sin enlazar.
describe("Breadcrumbs", () => {
  const items = [
    { name: "Inicio", path: "/" },
    { name: "Pandora", path: "/pandora" },
    { name: "La flora de Pandora", path: "/pandora/la-flora-de-pandora" },
  ];

  it("enlaza los niveles superiores en orden", () => {
    render(<Breadcrumbs items={items} />);
    const nav = screen.getByRole("navigation", { name: "Migas de pan" });
    const links = screen.getAllByRole("link");
    expect(nav.contains(links[0])).toBe(true);
    expect(links.map((l) => [l.textContent, l.getAttribute("href")])).toEqual([
      ["Inicio", "/"],
      ["Pandora", "/pandora"],
    ]);
  });

  it("la última es la página actual y no es un enlace", () => {
    render(<Breadcrumbs items={items} />);
    const current = screen.getByText("La flora de Pandora");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.closest("a")).toBeNull();
  });
});
