import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EntryTabs } from "./entry-tabs";

const tabs = [
  { id: "jake-sully", label: "Jake Sully" },
  { id: "neytiri", label: "Neytiri" },
  { id: "kiri", label: "Kiri" },
];
const panels = tabs.map((t) => <p key={t.id}>Texto de {t.label}</p>);
const visible = () => screen.getAllByRole("tabpanel").map((p) => p.textContent);

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
});
