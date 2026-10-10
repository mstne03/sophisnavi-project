import { cleanup } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, vi } from "vitest";

// La raíz de composición sirve el contenido de prueba en vez del snapshot de Notion (ver src/test/content.fixture.ts).
vi.mock("@/app/content", async () => {
  const { createContentRepository } = await import("@/infrastructure/content/staticContent");
  const { contentFixture } = await import("@/test/content.fixture");
  return { content: createContentRepository(contentFixture) };
});

// Animaciones instantáneas: los tests comprueban estados, no transiciones.
MotionGlobalConfig.skipAnimations = true;

afterEach(cleanup);

// jsdom no implementa matchMedia. Los tests con `@vitest-environment node` (SDK de Notion) no tienen window.
if (typeof window !== "undefined")
  window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
