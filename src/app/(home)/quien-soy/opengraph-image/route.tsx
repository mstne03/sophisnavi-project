import { ImageResponse } from "next/og";
import { ogImage, ogMark, ogOptions } from "@/ui/og-image";

// Tarjeta de /quien-soy como ruta y no como opengraph-image.tsx: dentro del grupo (home) Next sirve ese fichero en una
// URL con sufijo aleatorio, y pageMetadata declara /quien-soy/opengraph-image como en el resto de páginas.
export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(ogImage({ kicker: "Sophisnavi · Avatar", headline: "Quién soy", mark: await ogMark() }), await ogOptions());
}
