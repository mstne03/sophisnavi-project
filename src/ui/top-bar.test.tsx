import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PAGE_CONTAINER } from "./page-container";
import { TopBar } from "./top-bar";

// Protege: la barra es fija, lleva la marca a la izquierda y el hueco derecho opcional, y usa el mismo contenedor ancho
// en todas las páginas (así no se mueve al navegar).
describe("TopBar", () => {
  it("es fija, con la marca y el contenido derecho en la misma fila", () => {
    const { container } = render(<TopBar right={<span>derecha</span>} />);
    expect(container.firstElementChild?.className).toContain("fixed");
    const row = container.querySelector(".max-w-6xl")!;
    expect(row.className).toContain(PAGE_CONTAINER);
    expect(row.children).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Sophisnavi, inicio" })).toBeTruthy();
    expect(screen.getByText("derecha")).toBeTruthy();
  });

  it("sin contenido derecho solo pinta la marca", () => {
    const { container } = render(<TopBar />);
    expect(container.querySelector(".max-w-6xl")!.children).toHaveLength(1);
  });
});
