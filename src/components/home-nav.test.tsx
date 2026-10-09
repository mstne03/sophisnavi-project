import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeNav } from "./home-nav";

// Protege: las pestañas marcan la vista activa y delegan el cambio (sin navegar ni desplazar por su cuenta).
describe("HomeNav", () => {
  it("marca la vista activa con aria-current", () => {
    const { rerender } = render(<HomeNav view="inicio" onSelect={() => {}} />);
    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Quién soy" }).getAttribute("aria-current")).toBeNull();
    rerender(<HomeNav view="about" onSelect={() => {}} />);
    expect(screen.getByRole("link", { name: "Quién soy" }).getAttribute("aria-current")).toBe("page");
  });

  it("al pulsar una pestaña avisa con la vista elegida y no sigue el enlace", () => {
    const onSelect = vi.fn();
    render(<HomeNav view="inicio" onSelect={onSelect} />);
    const link = screen.getByRole("link", { name: "Quién soy" });
    expect(link.getAttribute("href")).toBe("#quien-soy"); // sin JS sigue siendo un ancla válida
    const ev = fireEvent.click(link);
    expect(ev).toBe(false); // preventDefault
    expect(onSelect).toHaveBeenCalledWith("about");
  });
});
