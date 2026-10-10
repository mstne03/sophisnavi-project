import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TreeScene } from "@/ui/tree-scene/renderer";

type Opts = { reducedMotion: boolean; skipIntro: boolean; onIntroDone: () => void };
const createTreeScene = vi.fn<(canvas: HTMLCanvasElement, opts: Opts) => TreeScene>();
vi.mock("@/ui/tree-scene/renderer", () => ({ createTreeScene: (c: HTMLCanvasElement, o: Opts) => createTreeScene(c, o) }));

import { Experience } from "./experience";

const fakeScene = (opts: Opts): TreeScene => ({ skipIntro: () => opts.onIntroDone(), time: () => 0, dispose: vi.fn() });

// Protege: la intro se puede saltar (clic, teclado o sesión ya vista) y sin WebGL se va directo al menú.
describe("Experience", () => {
  beforeEach(() => {
    sessionStorage.clear();
    history.replaceState(null, "", "/");
    createTreeScene.mockReset().mockImplementation((_c, o) => fakeScene(o));
  });

  it("muestra la intro y pasa al menú al pulsar Saltar intro, recordándolo en la sesión", async () => {
    render(<Experience sections={[]} />);
    expect(screen.getByRole("heading", { level: 1, name: "Sophisnavi" })).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Portada" })).toBeNull();
    await vi.waitFor(() => expect(createTreeScene).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Saltar intro" }));
    expect(await screen.findByRole("navigation", { name: "Menú principal" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Portada" })).toBeTruthy(); // pestañas solo tras la intro
    expect(sessionStorage.getItem("sophisnavi:intro-seen")).toBe("1");
  });

  it("salta la intro con Enter", async () => {
    render(<Experience sections={[]} />);
    await vi.waitFor(() => expect(createTreeScene).toHaveBeenCalled());
    fireEvent.keyDown(window, { key: "Enter" });
    expect(await screen.findByRole("navigation", { name: "Menú principal" })).toBeTruthy();
  });

  it("pide saltar la intro si ya se vio en esta sesión", async () => {
    sessionStorage.setItem("sophisnavi:intro-seen", "1");
    render(<Experience sections={[]} />);
    await vi.waitFor(() => expect(createTreeScene).toHaveBeenCalled());
    expect(createTreeScene.mock.calls[0][1].skipIntro).toBe(true);
  });

  it("va directo al menú si la escena no se puede crear (sin WebGL)", async () => {
    createTreeScene.mockImplementation(() => {
      throw new Error("no webgl");
    });
    render(<Experience sections={[]} />);
    expect(await screen.findByRole("navigation", { name: "Menú principal" })).toBeTruthy();
  });

  // Protege: «Quién soy» solo se abre desde las pestañas, queda en el historial (#quien-soy) y «atrás» lo cierra.
  it("muestra «Quién soy» solo desde la pestaña, con #quien-soy en el historial, y el botón atrás vuelve a Inicio", async () => {
    render(<Experience sections={[]} about={<p>Kaltxì, soy Sofi</p>} />);
    // Según el estado de la visita (módulo), la intro puede estar ya hecha; si no, se salta.
    screen.queryByRole("button", { name: "Saltar intro" })?.click();
    await screen.findByRole("navigation", { name: "Menú principal" });
    // Las dos vistas conviven en la pista: la que no se ve queda inert (ni foco ni clics)
    const panel = document.getElementById("quien-soy")!;
    expect(panel.textContent).toContain("Kaltxì, soy Sofi");
    expect(panel.hasAttribute("inert")).toBe(true);
    const menuPane = screen.getByRole("navigation", { name: "Menú principal" }).closest("[inert]");
    expect(menuPane).toBeNull();

    fireEvent.click(screen.getByRole("link", { name: "Quién soy" }));
    expect(window.location.hash).toBe("#quien-soy");
    expect(panel.hasAttribute("inert")).toBe(false);
    expect(screen.getByRole("navigation", { name: "Menú principal" }).closest("[inert]")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Quién soy" }).getAttribute("aria-current")).toBe("page");

    history.back(); // jsdom no dispara popstate por sí solo
    history.replaceState(null, "", "/");
    fireEvent(window, new PopStateEvent("popstate"));
    await vi.waitFor(() => expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("aria-current")).toBe("page"));
  });

  it("abre «Quién soy» directamente si la URL ya trae #quien-soy", async () => {
    history.replaceState(null, "", "/#quien-soy");
    render(<Experience sections={[]} about={<p>Kaltxì</p>} />);
    screen.queryByRole("button", { name: "Saltar intro" })?.click();
    await vi.waitFor(() => expect(document.getElementById("quien-soy")!.hasAttribute("inert")).toBe(false));
  });
});
