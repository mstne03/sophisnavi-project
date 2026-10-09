import type { ContentRepository } from "@/application/content/ContentRepository";
import type { Content } from "@/domain/content";
import { createContentRepository } from "@/infrastructure/content/staticContent";
import data from "../../data/content/content.json";

// Raíz de composición. El JSON lo regenera `scripts/notion-pull.ts` antes de cada build (ADR-0007).
export const content: ContentRepository = createContentRepository(data as Content);
