import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "./markdown";

// Protege: el Markdown del seed (párrafos, ## Fuentes, listas, negrita/cursiva) se convierte en HTML semántico.
describe("Markdown", () => {
  it("convierte párrafos, títulos, listas y énfasis", () => {
    const { container } = render(
      <Markdown source={"Hola **mundo** y *tú*.\nSegunda línea.\n\n## Fuentes\n\n- Una\n- *Dos*\n\n# Grande"} />,
    );
    expect(container.querySelectorAll("p")).toHaveLength(1);
    expect(screen.getByText("mundo").tagName).toBe("STRONG");
    expect(screen.getByText("tú").tagName).toBe("EM");
    expect(screen.getByRole("heading", { level: 3, name: "Fuentes" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Grande" })).toBeTruthy();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Una", "Dos"]);
  });

  it("separa un título de la lista que le sigue sin línea en blanco (formato del seed)", () => {
    render(<Markdown source={"Texto.\n\n## Fuentes\n- Una\n- Dos"} />);
    expect(screen.getByRole("heading", { level: 3, name: "Fuentes" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("no renderiza nada con una cadena vacía", () => {
    const { container } = render(<Markdown source="   " />);
    expect(container.firstElementChild?.childElementCount).toBe(0);
  });
});
