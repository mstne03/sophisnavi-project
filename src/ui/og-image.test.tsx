import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ogImage, OG_SIZE } from "./og-image";

// Protege: la tarjeta OG lleva kicker, titular y marca, y mide 1200×630.
describe("ogImage", () => {
  it("pinta kicker, titular y marca", () => {
    render(ogImage({ kicker: "Sophisnavi · Avatar", headline: "Pandora" }));
    expect(screen.getByText("Sophisnavi · Avatar")).toBeTruthy();
    expect(screen.getByText("Pandora")).toBeTruthy();
    expect(screen.getByText("sophisnavi.com")).toBeTruthy();
    expect(OG_SIZE).toEqual({ width: 1200, height: 630 });
  });
});
