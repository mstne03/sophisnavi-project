import { cleanup } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach } from "vitest";

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
