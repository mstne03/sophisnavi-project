import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ogImage, ogOptions, OG_SIZE } from "./og-image";

// Protege: la tarjeta OG lleva kicker, titular y marca, y mide 1200×630.
describe("ogImage", () => {
  it("pinta kicker, titular y marca", () => {
    render(ogImage({ kicker: "Sophisnavi · Avatar", headline: "Pandora" }));
    expect(screen.getByText("Sophisnavi · Avatar")).toBeTruthy();
    expect(screen.getByText("Pandora")).toBeTruthy();
    expect(screen.getByText("sophisnavi.com")).toBeTruthy();
    expect(OG_SIZE).toEqual({ width: 1200, height: 630 });
  });

  it("carga Marcellus local para Satori, la misma tipografía que los títulos de la web", async () => {
    const o = await ogOptions();
    expect(o).toMatchObject({ width: 1200, height: 630 });
    expect(o.fonts[0]).toMatchObject({ name: "Marcellus", weight: 400, style: "normal" });
    expect(o.fonts[0].data.byteLength).toBeGreaterThan(10_000);
    expect(o.fonts[0].data.subarray(0, 4).toString("latin1")).toBe("\0\x01\0\0"); // cabecera TrueType
  });
});
