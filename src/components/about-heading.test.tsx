import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

import { AboutHeading } from "./about-heading";

// Protege (SEO): «Kaltxì!» es el h1 de /quien-soy y un h2 en /, donde el h1 es «Sophisnavi».
describe("AboutHeading", () => {
  it("es h1 en /quien-soy y h2 en /", () => {
    nav.pathname = "/quien-soy";
    const { rerender } = render(<AboutHeading id="bienvenida">Kaltxì!</AboutHeading>);
    expect(screen.getByRole("heading", { level: 1, name: "Kaltxì!" }).id).toBe("bienvenida");
    nav.pathname = "/";
    rerender(<AboutHeading id="bienvenida">Kaltxì!</AboutHeading>);
    expect(screen.getByRole("heading", { level: 2, name: "Kaltxì!" })).toBeTruthy();
  });
});
