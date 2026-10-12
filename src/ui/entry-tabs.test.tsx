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
    // El salto se hace con la entrada nueva ya pintada (si no, al pasar a una más corta se perdía uno de cada dos).
    const shownWhenScrolling: (string | null | undefined)[] = [];
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => shownWhenScrolling.push(...visible()));
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} nextLabel="Siguiente personaje" />);
    const next = screen.getByRole("link", { name: "Siguiente personaje: Neytiri" });
    expect(next.getAttribute("href")).toBe("#neytiri"); // sin JS sigue siendo un enlace a la entrada
    const ev = fireEvent.click(next);
    expect(ev).toBe(false); // preventDefault: el cambio lo hace el selector
    expect(visible()).toEqual(["Texto de Neytiri"]);
    expect(window.location.hash).toBe("#neytiri");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Neytiri" }));
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: expect.any(Number), behavior: "instant" });
    expect(shownWhenScrolling).toEqual(["Texto de Neytiri"]);

    fireEvent.click(screen.getByRole("link", { name: "Siguiente personaje: Kiri" }));
    expect(visible()).toEqual(["Texto de Kiri"]);
    expect(screen.queryByRole("link", { name: /^Siguiente personaje/ })).toBeNull(); // la última no tiene siguiente
    expect(scrollTo).toHaveBeenCalledTimes(2); // en cada clic, no uno de cada dos
    scrollTo.mockRestore();
  });

  it("cambiar de pestaña desde el selector no desplaza la página", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} />);
    fireEvent.click(screen.getByRole("tab", { name: "Kiri" }));
    expect(visible()).toEqual(["Texto de Kiri"]);
    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  it("al final de cada entrada salvo la primera enlaza a la anterior, con el mismo comportamiento", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
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
    fireEvent.click(screen.getByRole("link", { name: "Personaje anterior: Jake Sully" }));
    expect(screen.queryByRole("link", { name: /^Personaje anterior/ })).toBeNull(); // la primera no tiene anterior
    expect(scrollTo).toHaveBeenCalledTimes(2);
    scrollTo.mockRestore();
  });
});
