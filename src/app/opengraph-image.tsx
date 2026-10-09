import { ImageResponse } from "next/og";
import { ogImage, OG_SIZE } from "@/ui/og-image";

export const alt = "Tarjeta de Sophisnavi, portal en español sobre Avatar por Sofi";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(ogImage({ kicker: "Fan de Avatar desde 2009", headline: "sophisnavi" }), size);
}
