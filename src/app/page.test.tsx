import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home, { metadata } from "./page";

vi.mock("@/components/experience", () => ({
  Experience: ({ sections }: { sections: { slug: string }[] }) => <div data-testid="experience">{sections.map((s) => s.slug).join(",")}</div>,
}));

// Protege: la portada monta la experiencia con las seis secciones y, debajo, el texto de bienvenida de Notion en HTML del servidor.
describe("Home", () => {
  it("renderiza Experience con las seis secciones y la bienvenida", async () => {
    render(await Home());
    expect(screen.getByTestId("experience").textContent).toBe("pandora,personajes,clanes,saga,coleccion,vida-fan");
    expect(screen.getByRole("heading", { level: 2, name: /Bienvenida/ })).toBeTruthy();
    expect(screen.getByText(/Kaltxì/)).toBeTruthy();
  });

  it("declara canonical y Open Graph de la portada", () => {
    expect(metadata.alternates?.canonical).toBe("https://www.sophisnavi.com");
    expect(metadata.openGraph?.url).toBe("https://www.sophisnavi.com");
  });
});
