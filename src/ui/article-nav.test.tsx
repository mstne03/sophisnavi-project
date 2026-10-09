import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleNav } from "./article-nav";

// Protege: anterior/siguiente solo aparecen cuando existen y llevan rel prev/next para los buscadores.
describe("ArticleNav", () => {
  it("no pinta nada sin vecinos", () => {
    const { container } = render(<ArticleNav sectionSlug="pandora" />);
    expect(container.firstChild).toBeNull();
  });

  it("pinta solo el siguiente con rel=next", () => {
    render(<ArticleNav sectionSlug="pandora" next={{ slug: "b", title: "B" }} />);
    const next = screen.getByRole("link", { name: /siguiente/i });
    expect(next.getAttribute("href")).toBe("/pandora/b");
    expect(next.getAttribute("rel")).toBe("next");
    expect(screen.queryByRole("link", { name: /anterior/i })).toBeNull();
  });

  it("pinta ambos", () => {
    render(<ArticleNav sectionSlug="pandora" prev={{ slug: "a", title: "A" }} next={{ slug: "b", title: "B" }} />);
    expect(screen.getByRole("link", { name: /anterior/i }).getAttribute("rel")).toBe("prev");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
