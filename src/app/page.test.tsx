import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home, { metadata } from "./page";

vi.mock("@/components/experience", () => ({
  Experience: ({ sections, about }: { sections: { slug: string }[]; about?: React.ReactNode }) => (
    <>
      <div data-testid="experience">{sections.map((s) => s.slug).join(",")}</div>
      {about}
    </>
  ),
}));

// Protege: la portada monta la experiencia con las seis secciones y le pasa la bienvenida de Notion como HTML del servidor.
describe("Home", () => {
  it("renderiza Experience con las seis secciones y la bienvenida", async () => {
    render(await Home());
    expect(screen.getByTestId("experience").textContent).toBe("pandora,personajes,clanes,saga,coleccion,vida-fan");
    expect(screen.getByRole("heading", { level: 2, name: /Bienvenida/ })).toBeTruthy();
    expect(screen.getByText(/Kaltxì/)).toBeTruthy();
    expect(screen.getByText(/Kaltxì/).closest("section")?.className).not.toMatch(/bg-/); // sin fondo propio: el árbol 3D sigue detrás
  });

  it("declara canonical y Open Graph de la portada", () => {
    expect(metadata.alternates?.canonical).toBe("https://www.sophisnavi.com");
    expect(metadata.openGraph?.url).toBe("https://www.sophisnavi.com");
  });
});
