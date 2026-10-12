import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TopNav } from "./top-nav";

const ITEMS = [
  { key: "a", href: "/a", label: "Uno" },
  { key: "b", href: "/b", label: "Dos" },
];

// Protege: la barra de escritorio compartida por la portada y las secciones enlaza a cada destino, marca el activo con
// el aria-current pedido, avisa al pulsar y mide lo mismo que la marca (h-11).
describe("TopNav", () => {
  it("enlaza a cada destino y marca el activo", () => {
    const { rerender } = render(<TopNav label="Prueba" items={ITEMS} active="a" />);
    expect(screen.getByRole("navigation", { name: "Prueba" }).querySelector("ul")?.className).toContain("h-11");
    expect(screen.getByRole("link", { name: "Uno" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Dos" }).getAttribute("href")).toBe("/b");
    rerender(<TopNav label="Prueba" items={ITEMS} active="b" activeCurrent="true" />);
    expect(screen.getByRole("link", { name: "Uno" }).getAttribute("aria-current")).toBeNull();
    expect(screen.getByRole("link", { name: "Dos" }).getAttribute("aria-current")).toBe("true");
  });

  it("avisa con la clave del enlace pulsado", () => {
    const onSelect = vi.fn((_key: string, e: { preventDefault: () => void }) => e.preventDefault());
    render(<TopNav label="Prueba" items={ITEMS} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("link", { name: "Dos" }));
    expect(onSelect.mock.calls[0][0]).toBe("b");
  });
});
