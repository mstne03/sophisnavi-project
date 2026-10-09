import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeNav } from "./home-nav";

// Protege: la portada se recorre con dos pestañas; «Quién soy» desplaza a la bienvenida y lo refleja en la URL,
// «Inicio» vuelve arriba y la quita. Mientras está montada, la página oculta la barra de desplazamiento.
describe("HomeNav", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    history.replaceState(null, "", "/");
  });

  it("marca Inicio por defecto y oculta la barra de desplazamiento solo mientras existe", () => {
    const { unmount } = render(<HomeNav />);
    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Quién soy" }).getAttribute("aria-current")).toBeNull();
    expect(document.documentElement.classList.contains("home-no-scrollbar")).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains("home-no-scrollbar")).toBe(false);
  });

  it("«Quién soy» desplaza a #quien-soy con transición y lo pone en la URL; «Inicio» lo deshace", () => {
    const about = document.createElement("section");
    about.id = "quien-soy";
    about.scrollIntoView = vi.fn();
    document.body.appendChild(about);
    document.documentElement.scrollIntoView = vi.fn();
    render(<HomeNav />);

    fireEvent.click(screen.getByRole("link", { name: "Quién soy" }));
    expect(about.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(window.location.hash).toBe("#quien-soy");
    expect(screen.getByRole("link", { name: "Quién soy" }).getAttribute("aria-current")).toBe("page");

    fireEvent.click(screen.getByRole("link", { name: "Inicio" }));
    expect(document.documentElement.scrollIntoView).toHaveBeenCalled();
    expect(window.location.hash).toBe("");
    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("aria-current")).toBe("page");
  });

  it("arranca en «Quién soy» si la URL ya lleva el ancla", () => {
    history.replaceState(null, "", "/#quien-soy");
    render(<HomeNav />);
    expect(screen.getByRole("link", { name: "Quién soy" }).getAttribute("aria-current")).toBe("page");
  });
});
