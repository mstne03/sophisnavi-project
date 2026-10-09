import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SectionPage, { dynamicParams, generateMetadata, generateStaticParams } from "./page";

const props = (section: string) => ({ params: Promise.resolve({ section }), searchParams: Promise.resolve({}) });

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Protege: cada sección se prerenderiza siempre (con la intro de Notion si existe) y lista sus artículos; un slug desconocido da 404.
describe("SectionPage", () => {
  it("genera un parámetro estático por sección y no admite otros", async () => {
    expect(dynamicParams).toBe(false);
    expect((await generateStaticParams()).map((p) => p.section)).toEqual(["pandora", "personajes", "clanes", "saga", "coleccion", "vida-fan"]);
  });

  it("renderiza título, intro de Notion y el carrusel de artículos con enlaces", async () => {
    render(await SectionPage(props("pandora")));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Pandora");
    const list = screen.getByRole("list", { name: "Artículos de la sección" });
    const links = within(list).getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).toEqual(["/pandora/el-mundo-de-avatar", "/pandora/la-ciencia-real-detras-de-avatar"]);
    expect(screen.getByRole("link", { name: /volver/i }).getAttribute("href")).toBe("/");
  });

  it("sin intro de Notion muestra la descripción corta; sin artículos lo indica", async () => {
    render(await SectionPage(props("saga")));
    expect(screen.getByText(/Detrás de cámaras de Avatar/)).toBeTruthy();
    expect(screen.getByText(/Todavía no hay artículos/)).toBeTruthy();
    expect(within(screen.getByRole("main")).queryAllByRole("link").filter((a) => a.getAttribute("href")?.startsWith("/saga/"))).toHaveLength(0);
  });

  it("genera metadatos con título, canonical y descripción", async () => {
    expect(await generateMetadata(props("pandora"))).toMatchObject({ title: "Pandora", alternates: { canonical: "https://www.sophisnavi.com/pandora" } });
    expect(await generateMetadata(props("nope"))).toEqual({});
  });

  it("llama a notFound con un slug desconocido", async () => {
    await expect(SectionPage(props("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
