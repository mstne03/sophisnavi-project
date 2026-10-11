import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TreeScene } from "@/ui/tree-scene/renderer";

type Opts = { reducedMotion: boolean; skipIntro: boolean; onIntroDone: () => void };
const createTreeScene = vi.fn<(canvas: HTMLCanvasElement, opts: Opts) => TreeScene>();
vi.mock("@/ui/tree-scene/renderer", () => ({ createTreeScene: (c: HTMLCanvasElement, o: Opts) => createTreeScene(c, o) }));
// Router de Next simulado: la ruta la fija cada test y push/replace solo se registran (el test decide cuándo «llega»).
const nav = vi.hoisted(() => ({ pathname: "/", router: { push: vi.fn(), replace: vi.fn() } }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname, useRouter: () => nav.router }));

import { Experience } from "./experience";

const fakeScene = (opts: Opts): TreeScene => ({ skipIntro: () => opts.onIntroDone(), time: () => 0, dispose: vi.fn() });

// Protege: la intro se puede saltar (clic, teclado o sesión ya vista) y sin WebGL se va directo al menú.
describe("Experience", () => {
  beforeEach(() => {
    sessionStorage.clear();
    history.replaceState(null, "", "/");
    nav.pathname = "/";
    nav.router.push.mockReset();
    nav.router.replace.mockReset();
    createTreeScene.mockReset().mockImplementation((_c, o) => fakeScene(o));
  });

  it("durante la intro, en / deja en el HTML oculto el extracto con su enlace y no la bienvenida", () => {
    render(<Experience sections={[]} about={<p>Kaltxì</p>} excerpt="Soy Sofi" />);
    const hidden = document.querySelector("[hidden]")!; // primer test del fichero: la intro aún no se ha hecho
    expect(hidden.textContent).toContain("Soy Sofi");
    expect(hidden.querySelector('a[href="/quien-soy"]')).not.toBeNull();
    expect(screen.queryByText("Kaltxì")).toBeNull();
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

  // Protege: «Quién soy» es la ruta /quien-soy; la pestaña desliza en el acto (sin esperar a la navegación) y la vista
  // sigue a la ruta, así «atrás» la cierra. La bienvenida completa no está en el DOM de / hasta que se abre.
  it("abre «Quién soy» desde la pestaña navegando a /quien-soy, y vuelve a Inicio cuando la ruta vuelve a /", async () => {
    const { rerender } = render(<Experience sections={[]} about={<p>Kaltxì, soy Sofi</p>} excerpt="Soy Sofi" />);
    // Según el estado de la visita (módulo), la intro puede estar ya hecha; si no, se salta.
    screen.queryByRole("button", { name: "Saltar intro" })?.click();
    await screen.findByRole("navigation", { name: "Menú principal" });
    // Las dos vistas conviven en la pista: la que no se ve queda inert (ni foco ni clics)
    const panel = document.getElementById("quien-soy")!;
    expect(panel.hasAttribute("inert")).toBe(true);
    expect(panel.textContent).toBe(""); // en / solo va el extracto: el texto no se duplica entre URL
    expect(screen.getByText(/Soy Sofi/)).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Menú principal" }).closest("[inert]")).toBeNull();

    fireEvent.click(screen.getByRole("link", { name: "Quién soy" }));
    expect(nav.router.push).toHaveBeenCalledWith("/quien-soy", { scroll: false });
    expect(panel.hasAttribute("inert")).toBe(false); // antes de que la navegación termine
    expect(panel.textContent).toContain("Kaltxì, soy Sofi");
    expect(screen.getByRole("navigation", { name: "Menú principal" }).closest("[inert]")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Quién soy" }).getAttribute("aria-current")).toBe("page");

    nav.pathname = "/quien-soy"; // la navegación llega
    rerender(<Experience sections={[]} about={<p>Kaltxì, soy Sofi</p>} excerpt="Soy Sofi" />);
    expect(panel.hasAttribute("inert")).toBe(false);

    nav.pathname = "/"; // botón atrás
    rerender(<Experience sections={[]} about={<p>Kaltxì, soy Sofi</p>} excerpt="Soy Sofi" />);
    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("aria-current")).toBe("page");
    expect(panel.hasAttribute("inert")).toBe(true);
    expect(panel.textContent).toContain("Kaltxì, soy Sofi"); // se queda montada para el deslizamiento de vuelta

    fireEvent.click(screen.getByRole("link", { name: "Conoce mi historia →" })); // el extracto también la abre
    expect(nav.router.push).toHaveBeenLastCalledWith("/quien-soy", { scroll: false });
    expect(panel.hasAttribute("inert")).toBe(false);
  });

  it("en /quien-soy llega con «Quién soy» abierta y la bienvenida en el HTML desde el primer render", async () => {
    nav.pathname = "/quien-soy";
    render(<Experience sections={[]} about={<p>Kaltxì</p>} />);
    expect(screen.getByText("Kaltxì")).toBeTruthy(); // en el panel o, durante la intro, oculta para los bots
    screen.queryByRole("button", { name: "Saltar intro" })?.click();
    await screen.findByRole("navigation", { name: "Menú principal" });
    expect(document.getElementById("quien-soy")!.hasAttribute("inert")).toBe(false);
    expect(nav.router.push).not.toHaveBeenCalled();
  });

  it("redirige los enlaces antiguos /#quien-soy a /quien-soy", () => {
    history.replaceState(null, "", "/#quien-soy");
    render(<Experience sections={[]} about={<p>Kaltxì</p>} />);
    expect(nav.router.replace).toHaveBeenCalledWith("/quien-soy", { scroll: false });
    expect(nav.router.push).not.toHaveBeenCalled(); // replace: el enlace viejo no queda en el historial
  });
});
