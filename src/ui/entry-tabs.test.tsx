import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EntryTabs } from "./entry-tabs";

const tabs = [
  { id: "jake-sully", label: "Jake Sully" },
  { id: "neytiri", label: "Neytiri" },
  { id: "kiri", label: "Kiri" },
];
const panels = tabs.map((t) => <p key={t.id}>Texto de {t.label}</p>);
const visible = () => screen.getAllByRole("tabpanel").map((p) => p.firstElementChild?.textContent); // el contenido, sin el enlace a la siguiente

// Simula la página: el selector está a `top` px de la parte de arriba de la ventana y window.scrollTo lo lleva a 0.
// Anota, en cada salto, la entrada visible y el scroll-behavior de html en ese momento.
function fakeScroll(top = 500) {
  const jumps: { shown: (string | null | undefined)[]; behavior: string }[] = [];
  let listTop = top;
  const rect = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    return { top: this.getAttribute("role") === "tablist" ? listTop : 0 } as DOMRect;
  });
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {
    jumps.push({ shown: visible(), behavior: document.documentElement.style.scrollBehavior });
    listTop = 0;
  });
  return {
    jumps,
    scrollTo,
    moveList: (t: number) => (listTop = t),
    restore: () => {
      rect.mockRestore();
      scrollTo.mockRestore();
    },
  };
}

// Protege: solo se ve la entrada elegida, el resto sigue en el HTML (oculto); la elección se refleja en el hash.
describe("EntryTabs", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("muestra la primera entrada y oculta las demás; al pulsar otra pestaña cambia y actualiza el hash", () => {
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} />);
    expect(screen.getByRole("tablist", { name: "Personajes" })).toBeTruthy();
    expect(visible()).toEqual(["Texto de Jake Sully"]);
    expect(screen.getAllByRole("tabpanel", { hidden: true })).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "Jake Sully" }).getAttribute("aria-selected")).toBe("true");

    fireEvent.click(screen.getByRole("tab", { name: "Neytiri" }));
    expect(visible()).toEqual(["Texto de Neytiri"]);
    expect(screen.getByRole("tab", { name: "Neytiri" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Jake Sully" }).getAttribute("aria-selected")).toBe("false");
    expect(window.location.hash).toBe("#neytiri");
  });

  it("abre la entrada que indica el hash de la URL", () => {
    window.history.replaceState(null, "", "#kiri");
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} />);
    expect(visible()).toEqual(["Texto de Kiri"]);
  });

  it("sigue los cambios de hash del navegador (atrás/adelante)", () => {
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} />);
    window.history.replaceState(null, "", "#neytiri");
    fireEvent(window, new Event("hashchange"));
    expect(visible()).toEqual(["Texto de Neytiri"]);
  });

  it("ignora un hash que no es una entrada", () => {
    window.history.replaceState(null, "", "#otra-cosa");
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} />);
    expect(visible()).toEqual(["Texto de Jake Sully"]);
  });

  it("las flechas recorren las pestañas en círculo y mueven el foco; otras teclas no hacen nada", () => {
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} />);
    const first = screen.getByRole("tab", { name: "Jake Sully" });
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(visible()).toEqual(["Texto de Kiri"]);
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Kiri" }));
    fireEvent.keyDown(screen.getByRole("tab", { name: "Kiri" }), { key: "ArrowRight" });
    expect(visible()).toEqual(["Texto de Jake Sully"]);
    fireEvent.keyDown(first, { key: "Enter" });
    expect(visible()).toEqual(["Texto de Jake Sully"]);
  });

  it("al final de cada entrada salvo la última enlaza a la siguiente: la elige, sube al selector y enfoca su pestaña", () => {
    // El salto se hace con la entrada nueva ya pintada (antes, Safari lo perdía en algunos clics) y sin animación.
    const page = fakeScroll();
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} nextLabel="Siguiente personaje" />);
    const next = screen.getByRole("link", { name: "Siguiente personaje: Neytiri" });
    expect(next.getAttribute("href")).toBe("#neytiri"); // sin JS sigue siendo un enlace a la entrada
    const ev = fireEvent.click(next);
    expect(ev).toBe(false); // preventDefault: el cambio lo hace el selector
    expect(visible()).toEqual(["Texto de Neytiri"]);
    expect(window.location.hash).toBe("#neytiri");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Neytiri" }));
    expect(page.jumps).toEqual([{ shown: ["Texto de Neytiri"], behavior: "auto" }]);
    expect(document.documentElement.style.scrollBehavior).toBe(""); // se devuelve el suave de globals.css

    fireEvent.click(screen.getByRole("link", { name: "Siguiente personaje: Kiri" }));
    expect(visible()).toEqual(["Texto de Kiri"]);
    expect(screen.queryByRole("link", { name: /^Siguiente personaje/ })).toBeNull(); // la última no tiene siguiente
    page.moveList(500);
    fireEvent.click(screen.getByRole("link", { name: "Anterior: Neytiri" }));
    expect(page.jumps).toHaveLength(2); // en cada clic, no uno de cada dos
    page.restore();
  });

  it("repasa la posición en el fotograma siguiente por si el navegador reajusta el scroll tras pintar", async () => {
    const page = fakeScroll();
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} nextLabel="Siguiente personaje" />);
    fireEvent.click(screen.getByRole("link", { name: "Siguiente personaje: Neytiri" }));
    expect(page.jumps).toHaveLength(1);
    page.moveList(300); // p. ej. Safari recoloca el scroll después de pintar
    await new Promise((r) => requestAnimationFrame(r));
    expect(page.jumps).toHaveLength(2);
    await new Promise((r) => requestAnimationFrame(r));
    expect(page.jumps).toHaveLength(2); // ya en su sitio: no vuelve a saltar
    page.restore();
  });

  it("cambiar de pestaña desde el selector no desplaza la página", () => {
    const page = fakeScroll();
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} />);
    fireEvent.click(screen.getByRole("tab", { name: "Kiri" }));
    expect(visible()).toEqual(["Texto de Kiri"]);
    expect(page.jumps).toHaveLength(0);
    page.restore();
  });

  it("al final de cada entrada salvo la primera enlaza a la anterior, con el mismo comportamiento", () => {
    const page = fakeScroll();
    window.history.replaceState(null, "", "#kiri");
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} prevLabel="Personaje anterior" nextLabel="Siguiente personaje" />);
    expect(screen.queryByRole("link", { name: /^Siguiente personaje/ })).toBeNull();
    const prev = screen.getByRole("link", { name: "Personaje anterior: Neytiri" });
    expect(prev.getAttribute("href")).toBe("#neytiri");
    expect(fireEvent.click(prev)).toBe(false);
    expect(visible()).toEqual(["Texto de Neytiri"]);
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Neytiri" }));
    // En medio, las dos: anterior a la izquierda (primero en el DOM) y siguiente a la derecha.
    expect(screen.getAllByRole("link").map((a) => a.getAttribute("aria-label"))).toEqual([
      "Personaje anterior: Jake Sully",
      "Siguiente personaje: Kiri",
    ]);
    page.moveList(500);
    fireEvent.click(screen.getByRole("link", { name: "Personaje anterior: Jake Sully" }));
    expect(screen.queryByRole("link", { name: /^Personaje anterior/ })).toBeNull(); // la primera no tiene anterior
    expect(page.jumps.map((j) => j.shown)).toEqual([["Texto de Neytiri"], ["Texto de Jake Sully"]]);
    page.restore();
  });
});
