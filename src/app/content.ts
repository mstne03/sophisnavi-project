import type { ContentRepository } from "@/application/content/ContentRepository";
import type { Locale } from "@/domain/content";
import { staticContent } from "@/infrastructure/content/staticContent";

// Raíz de composición: aquí se elige el adaptador. Fase 1: SupabaseContentRepository.
export const content: ContentRepository = staticContent;
// Solo ES hasta que llegue el paso 0.7 completo (EN pospuesto).
export const locale: Locale = "es";
