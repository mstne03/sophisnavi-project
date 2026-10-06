import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SECTIONS } from "@/lib/sections";
import SectionPage, { dynamicParams, generateStaticParams } from "./page";

const props = (section: string) => ({ params: Promise.resolve({ section }), searchParams: Promise.resolve({}) });

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Protege: cada sección se prerenderiza y un slug desconocido devuelve 404, no una página vacía.
describe("SectionPage", () => {
  it("genera un parámetro estático por sección y no admite otros", () => {
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toEqual(SECTIONS.map((s) => ({ section: s.slug })));
  });

  it("renderiza título y descripción de la sección", async () => {
    const ui = await SectionPage(props("pandora"));
    render(ui);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Pandora");
    expect(screen.getByRole("link", { name: /volver/i }).getAttribute("href")).toBe("/");
  });

  it("llama a notFound con un slug desconocido", async () => {
    await expect(SectionPage(props("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
