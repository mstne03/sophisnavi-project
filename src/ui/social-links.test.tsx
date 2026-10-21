import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SOCIAL } from "@/application/seo/metadata";
import { SocialLinks } from "./social-links";

// Protege: un enlace con logo por cada perfil de SOCIAL (los mismos del sameAs), con nombre accesible y en otra pestaña.
describe("SocialLinks", () => {
  it("enlaza cada red con su nombre y se abre en otra pestaña", () => {
    render(<SocialLinks />);
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(SOCIAL.map((s) => s.url));
    for (const s of SOCIAL) {
      const a = screen.getByRole("link", { name: new RegExp(`^${s.name}`) });
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.getAttribute("rel")).toContain("noopener");
      expect(a.querySelector("svg")).not.toBeNull();
    }
  });
});
