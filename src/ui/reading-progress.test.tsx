import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadingProgress } from "./reading-progress";

// Protege: la línea de progreso es fija arriba, decorativa (fuera del árbol accesible) y crece desde la izquierda.
describe("ReadingProgress", () => {
  it("pinta una línea fija y decorativa que escala desde la izquierda", () => {
    const { container } = render(<ReadingProgress />);
    const bar = container.querySelector("[data-reading-progress]")!;
    expect(bar.getAttribute("aria-hidden")).toBe("true");
    expect(bar.className).toContain("fixed");
    expect(bar.className).toContain("origin-left");
  });
});
