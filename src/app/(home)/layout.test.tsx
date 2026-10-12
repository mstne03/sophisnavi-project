import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import HomeLayout from "./layout";

vi.mock("@/components/experience", () => ({
  Experience: ({ sections, about }: { sections: { slug: string }[]; about?: React.ReactNode }) => (
    <>
      <div data-testid="experience">{sections.map((s) => s.slug).join(",")}</div>
      {about}
    </>
  ),
}));

// Protege: / y /quien-soy comparten Experience desde el layout (así navegar entre ellas no la desmonta y se conserva el
// deslizamiento), con las seis secciones, la bienvenida de Notion como HTML del servidor.
describe("HomeLayout", () => {
  it("renderiza Experience con las secciones y la bienvenida, y después la página", async () => {
    render(await HomeLayout({ children: <p>página</p>, params: Promise.resolve({}) }));
    expect(screen.getByTestId("experience").textContent).toBe("pandora,personajes,clanes,saga,coleccion,vida-fan");
    const heading = screen.getByRole("heading", { level: 2, name: "Kaltxì!" });
    expect(heading.closest("section")?.className).not.toMatch(/bg-/); // sin fondo propio: el árbol 3D sigue detrás
    expect(screen.getByText(/Soy Sofi/, { selector: "section p" })).toBeTruthy(); // cuerpo de Notion
    expect(screen.getByText("página")).toBeTruthy();
  });

  // Protege: sin JS la intro nunca termina; el <noscript> la quita y muestra la pista que ya viene en el HTML.
  it("sin JS quita la intro y muestra la pista", async () => {
    // En el cliente React no pinta el contenido de <noscript>: se mira el HTML del servidor.
    const css = renderToStaticMarkup(await HomeLayout({ children: null, params: Promise.resolve({}) }));
    expect(css).toContain("[data-home-intro]{display:none}");
    expect(css).toContain("[data-home-track],[data-home-tabs]{opacity:1!important}");
  });
});
