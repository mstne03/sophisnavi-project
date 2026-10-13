import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
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
const SECTIONS = [{ slug: "pandora", title: "Pandora", description: "Luna" }];
const track = () => document.querySelector("[data-home-track]")!;
const menuShown = () => vi.waitFor(() => expect(track().hasAttribute("inert")).toBe(false));

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

  // Protege (SEO): el HTML del servidor trae el menú con sus enlaces y las pestañas, y no trae la pista inert (sin JS se
  // puede usar). Primer test del fichero: la intro aún no se ha hecho en esta visita.
  it("en el HTML del servidor van el h1, los enlaces a las secciones y las pestañas, sin inert ni la bienvenida", () => {
    const html = renderToString(<Experience sections={SECTIONS} about={<p>Kaltxì</p>} />);
    expect(html).toMatch(/<h1[^>]*>Sophisnavi<\/h1>/);
    expect(html).toContain('href="/pandora"');
    expect(html).toContain('href="/quien-soy"'); // pestaña «Quién soy»: enlace rastreable desde la portada
    expect(html).not.toContain("Conoce mi historia"); // sin fragmento de bienvenida en Inicio
    expect(html).toContain("Saltar intro");
    expect(html).not.toMatch(/data-home-track[^>]*inert|inert[^>]*data-home-track/);
    expect(html).not.toContain("Kaltxì"); // en / la bienvenida completa no va
    expect(html).not.toMatch(/ hidden(=""|>| )/); // nada escondido con el atributo hidden
  });

  it("en /quien-soy el HTML del servidor trae la bienvenida visible en su panel", () => {
    nav.pathname = "/quien-soy";
    const html = renderToString(<Experience sections={SECTIONS} about={<p>Kaltxì</p>} />);
    expect(html).toMatch(/id="quien-soy"[^>]*><p>Kaltxì<\/p>/);
    expect(html).not.toMatch(/<h1/); // ahí el h1 es «Kaltxì!» (AboutHeading); «Sophisnavi» es un párrafo
  });

  it("durante la intro el menú ya está en el DOM pero inert; al pulsar Saltar intro se libera, recordándolo en la sesión", async () => {
    render(<Experience sections={SECTIONS} />);
    expect(screen.getByRole("navigation", { name: "Menú principal" })).toBeTruthy();
    expect(track().hasAttribute("inert")).toBe(true); // tras hidratar: ni foco ni clics bajo la intro
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1); // el título de la intro no es otro h1
    // Las pestañas ya están en el DOM pero transparentes e inert hasta que termina la intro
    const tabs = document.querySelector("[data-home-tabs]")!;
    expect(tabs.hasAttribute("inert")).toBe(true);
    expect(tabs.className).toContain("opacity-0");
    await vi.waitFor(() => expect(createTreeScene).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Saltar intro" }));
    await menuShown();
    expect(tabs.hasAttribute("inert")).toBe(false); // pestañas usables solo tras la intro
    expect(tabs.className).toContain("opacity-100");
    expect(sessionStorage.getItem("sophisnavi:intro-seen")).toBe("1");
  });

  it("salta la intro con Enter", async () => {
    render(<Experience sections={[]} />);
    await vi.waitFor(() => expect(createTreeScene).toHaveBeenCalled());
    fireEvent.keyDown(window, { key: "Enter" });
    await menuShown();
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
    await menuShown();
  });

  // Protege: «Quién soy» es la ruta /quien-soy; la pestaña desliza en el acto (sin esperar a la navegación) y la vista
  // sigue a la ruta, así «atrás» la cierra. La bienvenida completa no está en el DOM de / hasta que se abre.
  it("abre «Quién soy» desde la pestaña navegando a /quien-soy, y vuelve a Inicio cuando la ruta vuelve a /", async () => {
    const { rerender } = render(<Experience sections={[]} about={<p>Kaltxì, soy Sofi</p>} />);
    // Según el estado de la visita (módulo), la intro puede estar ya hecha; si no, se salta.
    screen.queryByRole("button", { name: "Saltar intro" })?.click();
    await menuShown();
    // Las dos vistas conviven en la pista: la que no se ve queda inert (ni foco ni clics)
    const panel = document.getElementById("quien-soy")!;
    expect(panel.hasAttribute("inert")).toBe(true);
    expect(panel.textContent).toBe(""); // en / no va la bienvenida: el texto no se duplica entre URL
    expect(screen.getByRole("navigation", { name: "Menú principal" }).closest("[inert]")).toBeNull();

    fireEvent.click(screen.getByRole("link", { name: "Quién soy" }));
    expect(nav.router.push).toHaveBeenCalledWith("/quien-soy", { scroll: false });
    expect(panel.hasAttribute("inert")).toBe(false); // antes de que la navegación termine
    expect(panel.textContent).toContain("Kaltxì, soy Sofi");
    expect(screen.getByRole("navigation", { name: "Menú principal" }).closest("[inert]")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Quién soy" }).getAttribute("aria-current")).toBe("page");

    nav.pathname = "/quien-soy"; // la navegación llega
    rerender(<Experience sections={[]} about={<p>Kaltxì, soy Sofi</p>} />);
    expect(panel.hasAttribute("inert")).toBe(false);

    nav.pathname = "/"; // botón atrás
    rerender(<Experience sections={[]} about={<p>Kaltxì, soy Sofi</p>} />);
    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("aria-current")).toBe("page");
    expect(panel.hasAttribute("inert")).toBe(true);
    expect(panel.textContent).toContain("Kaltxì, soy Sofi"); // se queda montada para el deslizamiento de vuelta
  });

  it("en /quien-soy llega con «Quién soy» abierta y la bienvenida en el HTML desde el primer render", async () => {
    nav.pathname = "/quien-soy";
    render(<Experience sections={[]} about={<p>Kaltxì</p>} />);
    expect(screen.getByText("Kaltxì")).toBeTruthy(); // en el panel o, durante la intro, oculta para los bots
    screen.queryByRole("button", { name: "Saltar intro" })?.click();
    await menuShown();
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
