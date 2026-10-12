import { ImageResponse } from "next/og";
import { SECTIONS } from "@/domain/content";
import { ogImage, ogMark, ogOptions } from "@/ui/og-image";

// Tarjeta de cada sección como ruta y no como opengraph-image.tsx: con un segmento dinámico Next sirve ese fichero en una
// URL con sufijo aleatorio (/pandora/opengraph-image-1362my), y pageMetadata declara /pandora/opengraph-image, que daba
// 404. Igual que /quien-soy/opengraph-image. Una por sección en el build; otra ruta, 404.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const s = SECTIONS.find((x) => x.slug === section);
  return new ImageResponse(ogImage({ kicker: "Sophisnavi · Avatar", headline: s?.title ?? "Sophisnavi", mark: await ogMark() }), await ogOptions());
}
