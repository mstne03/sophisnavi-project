import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SectionPage, { dynamicParams, generateMetadata, generateStaticParams } from "./page";

const props = (section: string) => ({ params: Promise.resolve({ section }), searchParams: Promise.resolve({}) });

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Protege: cada sección se prerenderiza con su intro real, sus categorías y sus páginas; un slug desconocido da 404.
describe("SectionPage", () => {
  it("genera un parámetro estático por sección y no admite otros", async () => {
    expect(dynamicParams).toBe(false);
    expect((await generateStaticParams()).map((p) => p.section)).toEqual(["pandora", "personajes", "clanes", "saga", "coleccion", "vida-fan"]);
  });

  it("renderiza título, intro, categorías y páginas de la sección", async () => {
    render(await SectionPage(props("personajes")));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Personajes");
    expect(screen.getByText(/Los personajes son el motivo/)).toBeTruthy();
    expect(screen.getByText("Personajes y arcos")).toBeTruthy();
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links.filter((h) => h?.startsWith("/personajes/"))).toHaveLength(3);
    expect(screen.getByRole("link", { name: /volver/i }).getAttribute("href")).toBe("/");
  });

  it("indica cuando una sección aún no tiene páginas", async () => {
    render(await SectionPage(props("saga")));
    expect(screen.getByText(/Todavía no hay páginas/)).toBeTruthy();
    expect(within(screen.getByRole("main")).queryAllByRole("link").filter((a) => a.getAttribute("href")?.startsWith("/saga/"))).toHaveLength(0);
  });

  it("genera metadatos con título y descripción", async () => {
    expect(await generateMetadata(props("pandora"))).toMatchObject({ title: "Pandora · Sophisnavi" });
    expect(await generateMetadata(props("nope"))).toEqual({});
  });

  it("llama a notFound con un slug desconocido", async () => {
    await expect(SectionPage(props("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
