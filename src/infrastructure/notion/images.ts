import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";

export const MAX_WIDTH = 1600;

// Guarda una imagen como WebP, redimensionada a MAX_WIDTH como máximo y sin metadatos (EXIF puede llevar GPS).
export async function storeImage(bytes: Uint8Array, outFile: string): Promise<{ width: number; height: number }> {
  const { data, info } = await sharp(bytes)
    .rotate() // aplica la orientación EXIF antes de descartarla
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, data);
  return { width: info.width, height: info.height };
}
