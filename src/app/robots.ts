import type { MetadataRoute } from "next";
import { SITE_URL } from "@/application/seo/metadata";

// Política confirmada por Marc el 2026-10-06 (docs/content/seo-facts.md §3.3): buscadores y búsqueda IA con cita, sí;
// entrenamiento, no. Sofi puede revertirla. robots.txt no es una medida de seguridad: /api solo se excluye para no gastar rastreo.
export const AI_TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent", "Amazonbot", "Bytespider", "MistralAI-Training"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: AI_TRAINING_BOTS, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
