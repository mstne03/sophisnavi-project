import { ImageResponse } from "next/og";
import { SECTIONS } from "@/domain/content";
import { ogImage, OG_SIZE } from "@/ui/og-image";

export const alt = "Tarjeta de una sección de Sophisnavi, portal en español sobre Avatar";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const s = SECTIONS.find((x) => x.slug === section);
  return new ImageResponse(ogImage({ kicker: "Sophisnavi · Avatar", headline: s?.title ?? "Sophisnavi" }), size);
}
