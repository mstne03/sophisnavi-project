import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionNav } from "./section-nav";

const SECTIONS = [
  { slug: "pandora", title: "Pandora" },
  { slug: "clanes", title: "Clanes y culturas" },
];
const details = () => document.querySelector("details")!;
const toggle = () => fireEvent(details(), new Event("toggle"));

// Protege: la barra (escritorio) y el desplegable (móvil) enlazan a todas las secciones y marcan la actual; el
// desplegable se abre con su botón y se cierra al elegir, con Escape o al pulsar fuera.
describe("SectionNav", () => {
  it("enlaza a cada sección en la barra y en el desplegable, con la actual marcada como página", () => {
    render(<SectionNav sections={SECTIONS} current="clanes" />);
    const [bar, menu] = screen.getAllByRole("navigation", { name: "Secciones", hidden: true });
    for (const nav of [bar, menu]) {
      const links = within(nav).getAllByRole("link", { hidden: true });
      expect(links.map((a) => a.getAttribute("href"))).toEqual(["/pandora", "/clanes"]);
      expect(links.map((a) => a.getAttribute("aria-current"))).toEqual([null, "page"]);
    }
  });

  it("dentro de un artículo marca su sección con aria-current=true", () => {
    render(<SectionNav sections={SECTIONS} current="pandora" onSectionPage={false} />);
    expect(screen.getAllByRole("link", { name: "Pandora", hidden: true }).map((a) => a.getAttribute("aria-current"))).toEqual(["true", "true"]);
  });

  it("el botón hamburguesa abre el desplegable; elegir una sección lo cierra", () => {
    render(<SectionNav sections={SECTIONS} current="pandora" />);
    expect(details().open).toBe(false);
    details().open = true; // lo que hace el navegador al pulsar el <summary>
    toggle();
    expect(details().open).toBe(true);
    fireEvent.click(within(details()).getByRole("link", { name: "Clanes y culturas" }));
    expect(details().open).toBe(false);
  });

  it("Escape cierra el desplegable y devuelve el foco al botón; pulsar fuera también lo cierra", () => {
    render(
      <>
        <SectionNav sections={SECTIONS} current="pandora" />
        <p>fuera</p>
      </>,
    );
    details().open = true;
    toggle();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(details().open).toBe(false);
    expect(document.activeElement).toBe(screen.getByLabelText("Menú de secciones"));

    details().open = true;
    toggle();
    fireEvent.pointerDown(within(details()).getByRole("link", { name: "Pandora" })); // dentro: sigue abierto
    expect(details().open).toBe(true);
    fireEvent.pointerDown(screen.getByText("fuera"));
    expect(details().open).toBe(false);
  });
});
