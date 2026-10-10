import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "./markdown";

// Protege: el Markdown de Notion se convierte en HTML semántico y seguro: sin HTML crudo, enlaces externos
// con noopener, imágenes como <figure> con dimensiones y pie.
describe("Markdown", () => {
  it("convierte párrafos, títulos, listas, citas y énfasis", () => {
    const { container } = render(<Markdown source={"Hola **mundo** y *tú*.\n\n## Fuentes\n\n- Una\n- *Dos*\n\n> ❗\n> Ojo"} />);
    expect(container.querySelectorAll("p")).toHaveLength(2);
    expect(screen.getByText("mundo").tagName).toBe("STRONG");
    expect(screen.getByText("tú").tagName).toBe("EM");
    expect(screen.getByRole("heading", { level: 2, name: "Fuentes" })).toBeTruthy();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Una", "Dos"]);
    expect(container.querySelector("blockquote")?.textContent).toContain("Ojo");
  });

  it("elimina HTML crudo y scripts", () => {
    const { container } = render(<Markdown source={'Texto <script>alert(1)</script> <img src=x onerror="alert(1)"> fin'} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("Texto");
  });

  it("los enlaces externos abren en pestaña nueva con noopener; los internos no", () => {
    render(<Markdown source={"[fuera](https://example.com) y [dentro](/pandora)"} />);
    expect(screen.getByRole("link", { name: "fuera" }).getAttribute("rel")).toBe("noopener noreferrer");
    expect(screen.getByRole("link", { name: "dentro" }).getAttribute("rel")).toBeNull();
  });

  it("una imagen sola se convierte en <figure> con dimensiones, carga diferida y pie", () => {
    const images = [{ src: "/content/p/1.webp", width: 1200, height: 1000, alt: "Alpha" }];
    const { container } = render(<Markdown source={"Antes\n\n![Alpha](/content/p/1.webp)\n\nTexto ![icono](/content/p/2.webp) inline"} images={images} />);
    const fig = container.querySelector("figure")!;
    const img = fig.querySelector("img")!;
    expect(img.getAttribute("width")).toBe("1200");
    expect(img.getAttribute("height")).toBe("1000");
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(fig.querySelector("figcaption")?.textContent).toBe("Alpha");
    expect(container.querySelectorAll("figure")).toHaveLength(1);
    expect(container.querySelectorAll("p img")).toHaveLength(1);
  });

  it("sin pie, el alt cae al de la imagen y no hay figcaption; sin metadatos, sin dimensiones", () => {
    const images = [{ src: "/content/p/1.webp", width: 800, height: 600, alt: "Título de la página" }];
    const { container } = render(<Markdown source={"![](/content/p/1.webp)\n\n![](/content/p/9.webp)"} images={images} />);
    const [a, b] = [...container.querySelectorAll("figure img")];
    expect(a.getAttribute("alt")).toBe("Título de la página");
    expect(container.querySelector("figcaption")).toBeNull();
    expect(b.getAttribute("alt")).toBe("");
    expect(b.getAttribute("width")).toBeNull();
  });

  it("varias imágenes seguidas se agrupan en una cuadrícula de <figure>; una sola, no", () => {
    const { container } = render(<Markdown source={"Intro\n\n![a](/content/p/1.webp)\n\n![b](/content/p/2.webp)\n\n![c](/content/p/3.webp)\n\nTexto\n\n![d](/content/p/4.webp)"} />);
    const grids = container.querySelectorAll(".img-grid");
    expect(grids).toHaveLength(1);
    expect(grids[0].querySelectorAll("figure img")).toHaveLength(3);
    expect(container.querySelectorAll("figure")).toHaveLength(4);
    expect(container.querySelectorAll("p")).toHaveLength(2); // nunca <figure> dentro de <p>
  });

  it("un enlace sin destino no lleva atributos externos", () => {
    const { container } = render(<Markdown source={"[sin destino]()"} />);
    expect(container.querySelector("a")?.getAttribute("target")).toBeNull();
  });

  it("no renderiza nada con una cadena vacía", () => {
    const { container } = render(<Markdown source="   " />);
    expect(container.firstElementChild?.childElementCount).toBe(0);
  });
});
