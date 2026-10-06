import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/components/experience", () => ({ Experience: () => <div data-testid="experience" /> }));

// Protege: la portada monta la experiencia (intro + menú).
describe("Home", () => {
  it("renderiza Experience", () => {
    render(<Home />);
    expect(screen.getByTestId("experience")).toBeTruthy();
  });
});
