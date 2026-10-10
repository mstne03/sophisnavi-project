import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MAX_WIDTH, storeImage } from "./images";

let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "sophis-img-"));
});
afterAll(() => rm(dir, { recursive: true, force: true }));

// Protege: toda imagen de Notion acaba como WebP de ≤ 1200 px, sin EXIF, con dimensiones conocidas para evitar saltos de maquetación.
describe("storeImage", () => {
  it("convierte a WebP, reduce a 1200 px de ancho y elimina metadatos", async () => {
    const big = await sharp({ create: { width: 4000, height: 2500, channels: 3, background: "#123456" } })
      .jpeg()
      .withExif({ IFD0: { ImageDescription: "gps-aqui" } })
      .toBuffer();
    const out = join(dir, "a", "1.webp");
    const meta = await storeImage(big, out);
    expect(meta).toEqual({ width: MAX_WIDTH, height: 1000 });
    const stored = await sharp(await readFile(out)).metadata();
    expect(stored.format).toBe("webp");
    expect(stored.width).toBe(MAX_WIDTH);
    expect(stored.exif).toBeUndefined();
  });

  it("no agranda imágenes pequeñas", async () => {
    const small = await sharp({ create: { width: 300, height: 200, channels: 3, background: "#fff" } }).png().toBuffer();
    expect(await storeImage(small, join(dir, "b.webp"))).toEqual({ width: 300, height: 200 });
  });
});
