import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SectionNav } from "./section-nav";

let pathname = "/clanes";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const SECTIONS = [
  { slug: "pandora", title: "Pandora" },
  { slug: "clanes", title: "Clanes y culturas" },
];
const details = () => document.querySelector("details")!;
const toggle = () => fireEvent(details(), new Event("toggle"));

// Protege: la barra (escritorio) y el desplegable (móvil) enlazan a todas las secciones y marcan la actual, sacada de la
// ruta; al pulsar en la barra el activo cambia en el acto; el desplegable se abre con su botón y se cierra al elegir,
// con Escape o al pulsar fuera.
describe("SectionNav", () => {
  beforeEach(() => {
    pathname = "/pandora";
  });

  it("enlaza a cada sección en la barra y en el desplegable, con la actual marcada como página", () => {
    pathname = "/clanes";
    render(<SectionNav sections={SECTIONS} />);
    const [bar, menu] = screen.getAllByRole("navigation", { name: "Secciones", hidden: true });
    for (const nav of [bar, menu]) {
      const links = within(nav).getAllByRole("link", { hidden: true });
      expect(links.map((a) => a.getAttribute("href"))).toEqual(["/pandora", "/clanes"]);
      expect(links.map((a) => a.getAttribute("aria-current"))).toEqual([null, "page"]);
    }
  });

  it("dentro de un artículo marca su sección con aria-current=true", () => {
    pathname = "/pandora/el-mundo-de-avatar";
    render(<SectionNav sections={SECTIONS} />);
    expect(screen.getAllByRole("link", { name: "Pandora", hidden: true }).map((a) => a.getAttribute("aria-current"))).toEqual(["true", "true"]);
  });

  it("al pulsar otra sección en la barra la marca como actual sin esperar a la navegación", () => {
    render(<SectionNav sections={SECTIONS} />);
    const bar = screen.getAllByRole("navigation", { name: "Secciones", hidden: true })[0];
    const link = within(bar).getByRole("link", { name: "Clanes y culturas", hidden: true });
    link.addEventListener("click", (e) => e.preventDefault(), { once: true }); // jsdom no navega
    fireEvent.click(link);
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(within(bar).getByRole("link", { name: "Pandora", hidden: true }).getAttribute("aria-current")).toBeNull();
  });

  it("el botón hamburguesa abre el desplegable; elegir una sección lo cierra", () => {
    render(<SectionNav sections={SECTIONS} />);
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
        <SectionNav sections={SECTIONS} />
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
