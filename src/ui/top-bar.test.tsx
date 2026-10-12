import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TopBar } from "./top-bar";

// Protege: la barra es fija, lleva la marca a la izquierda y el hueco derecho opcional, y sigue la columna de la página.
describe("TopBar", () => {
  it("es fija, con la marca y el contenido derecho en la misma fila", () => {
    const { container } = render(<TopBar right={<span>derecha</span>} />);
    expect(container.firstElementChild?.className).toContain("fixed");
    const row = container.querySelector(".max-w-3xl")!;
    expect(row).toBeTruthy();
    expect(row.children).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Sophisnavi, inicio" })).toBeTruthy();
    expect(screen.getByText("derecha")).toBeTruthy();
  });

  it("sin contenido derecho solo pinta la marca; la portada usa la columna ancha", () => {
    const { container } = render(<TopBar width="wide" />);
    const row = container.querySelector(".max-w-6xl")!;
    expect(row.children).toHaveLength(1);
    expect(container.querySelector(".max-w-3xl")).toBeNull();
  });
});
