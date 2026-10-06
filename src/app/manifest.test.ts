import { describe, expect, it } from "vitest";
import manifest from "./manifest";

// Protege: la PWA necesita icono maskable y start_url en la raíz para ser instalable.
describe("manifest", () => {
  it("declara start_url raíz, display standalone e icono maskable de 512px", () => {
    const m = manifest();
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.icons?.some((i) => i.purpose === "maskable" && i.sizes === "512x512")).toBe(true);
  });
});
