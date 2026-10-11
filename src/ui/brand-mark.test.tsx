import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "./brand-mark";

// Protege: la marca es un enlace a la portada con el árbol decorativo y nombre accesible propio; el nombre escrito
// solo se muestra a partir de tablet (en móvil no cabe junto a las pestañas).
describe("BrandMark", () => {
  it("enlaza a la portada con el logo decorativo y el nombre oculto en móvil", () => {
    const { container } = render(<BrandMark />);
    const link = screen.getByRole("link", { name: "Sophisnavi, inicio" });
    expect(link.getAttribute("href")).toBe("/");
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/logo.png");
    expect(img.getAttribute("alt")).toBe("");
    expect(screen.getByText("Sophisnavi").className).toContain("hidden sm:inline");
  });
});
