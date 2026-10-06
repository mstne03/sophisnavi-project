import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/components/experience", () => ({
  Experience: ({ sections }: { sections: { slug: string }[] }) => <div data-testid="experience">{sections.map((s) => s.slug).join(",")}</div>,
}));

// Protege: la portada monta la experiencia (intro + menú) con las secciones reales del repositorio.
describe("Home", () => {
  it("renderiza Experience con las seis secciones", async () => {
    render(await Home());
    expect(screen.getByTestId("experience").textContent).toBe("pandora,personajes,clanes,saga,coleccion,vida-fan");
  });
});
