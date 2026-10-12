import { describe, expect, it } from "vitest";
import Home, { metadata } from "./page";

// Protege: la portada declara su canonical y Open Graph; el contenido lo pone el layout del grupo.
describe("Home", () => {
  it("declara canonical y Open Graph de la portada y no pinta nada propio", () => {
    expect(metadata.alternates?.canonical).toBe("https://www.sophisnavi.com");
    expect(metadata.openGraph?.url).toBe("https://www.sophisnavi.com");
    expect(Home()).toBeNull();
  });
});
