import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ContentPage, { dynamicParams, generateMetadata, generateStaticParams } from "./page";

const props = (section: string, page: string) => ({ params: Promise.resolve({ section, page }), searchParams: Promise.resolve({}) });

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Protege: cada página del seed se prerenderiza con su plantilla (article o gallery) y su cuerpo en Markdown.
describe("ContentPage", () => {
  it("genera un parámetro estático por página", async () => {
    expect(dynamicParams).toBe(false);
    const params = await generateStaticParams();
    expect(params).toHaveLength(9);
    expect(params).toContainEqual({ section: "coleccion", page: "mi-coleccion-de-avatar" });
  });

  it("renderiza un artículo con su cuerpo y el enlace a su sección", async () => {
    render(await ContentPage(props("personajes", "5-cosas-de-neytiri-que-probablemente-no-sabias")));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/Neytiri/);
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(5);
    expect(screen.getByRole("heading", { level: 3, name: "Fuentes" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /volver a personajes/i }).getAttribute("href")).toBe("/personajes");
    expect(screen.queryByRole("list", { name: "Galería" })).toBeNull();
  });

  it("renderiza una galería con huecos de ejemplo cuando aún no hay fotos", async () => {
    render(await ContentPage(props("coleccion", "mi-coleccion-de-avatar")));
    expect(screen.getByRole("list", { name: "Galería" }).children).toHaveLength(6);
  });

  it("avisa cuando la página no tiene texto todavía", async () => {
    render(await ContentPage(props("vida-fan", "agradecimiento-video-viral")));
    expect(screen.getByText(/todavía no tiene texto/)).toBeTruthy();
  });

  it("genera metadatos y llama a notFound con un slug desconocido", async () => {
    expect(await generateMetadata(props("pandora", "por-que-los-na-vi-son-azules"))).toMatchObject({ title: /azules/ });
    expect(await generateMetadata(props("pandora", "nope"))).toEqual({});
    await expect(ContentPage(props("pandora", "nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
