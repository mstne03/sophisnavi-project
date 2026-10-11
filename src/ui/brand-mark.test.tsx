import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "./brand-mark";

// Protege: la marca es un enlace fijo a la portada con el árbol como imagen decorativa y nombre accesible propio.
describe("BrandMark", () => {
  it("enlaza a la portada, es fija y lleva el logo decorativo", () => {
    const { container } = render(<BrandMark />);
    const link = screen.getByRole("link", { name: "Sophisnavi, inicio" });
    expect(link.getAttribute("href")).toBe("/");
    expect(link.className).toContain("fixed");
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/logo.png");
    expect(img.getAttribute("alt")).toBe("");
  });
});
