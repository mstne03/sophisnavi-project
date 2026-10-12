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
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView; // jsdom no lo implementa
    render(<EntryTabs label="Personajes" tabs={tabs} panels={panels} nextLabel="Siguiente personaje" />);
    const next = screen.getByRole("link", { name: "Siguiente personaje: Neytiri" });
    expect(next.getAttribute("href")).toBe("#neytiri"); // sin JS sigue siendo un enlace a la entrada
    const ev = fireEvent.click(next);
    expect(ev).toBe(false); // preventDefault: el cambio lo hace el selector
    expect(visible()).toEqual(["Texto de Neytiri"]);
    expect(window.location.hash).toBe("#neytiri");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Neytiri" }));
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    expect(scrollIntoView.mock.contexts[0]).toBe(screen.getByRole("tablist"));

    fireEvent.click(screen.getByRole("link", { name: "Siguiente personaje: Kiri" }));
    expect(visible()).toEqual(["Texto de Kiri"]);
    expect(screen.getAllByRole("tabpanel")[0].querySelector("a")).toBeNull(); // la última no tiene siguiente
    expect(screen.getAllByRole("link", { hidden: true })).toHaveLength(2);
  });
});
