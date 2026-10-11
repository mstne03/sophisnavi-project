import type { Metadata } from "next";
import { pageMetadata, SITE_NAME } from "@/application/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: SITE_NAME,
  description: "Todo sobre Avatar en español: Pandora, personajes, clanes, la saga, colección y vida fan, por Sofi (@sophisnavi).",
  path: "/",
});

// El contenido de la portada lo pinta el layout del grupo (home): esta ruta solo fija sus metadatos.
export default function Home() {
  return null;
}
