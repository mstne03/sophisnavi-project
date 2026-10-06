---
llm-load-when: "Al tocar vitest.config.ts, sonar-project.properties o al decidir si un archivo entra en la cobertura."
---

# ADR-0006 · Exclusiones de cobertura

- **Status:** accepted
- **Date:** 2026-10-06

## Context

El gate de cobertura exige ≥ 85 % en líneas, ramas, funciones y sentencias (EDS-3 §3.14).
El código que habla con WebGL no se puede ejecutar en jsdom: medirlo en unidad daría 0 % y
obligaría a tests sin valor o a bajar el umbral. El estándar exige que la lista de exclusión
sea **única** y que cada entrada lleve su motivo.

## Decision

La lista vive en `vitest.config.ts` (`coverageExclusions`) y `sonar-project.properties`
replica las mismas rutas en `sonar.coverage.exclusions` y añade las de fuera de `src/` (ver tabla), porque SonarCloud ignora `sonar.sources` y analiza el repo completo.

| Ruta | Motivo | Quién lo cubre |
|---|---|---|
| `src/ui/tree-scene/renderer.ts` | Conecta con WebGL (three.js); no se ejecuta en jsdom | E2E (Playwright contra el build) |
| `src/ui/tree-scene/shaders.ts` | Cadenas GLSL, sin lógica | E2E |
| `data/seed/**` | Datos JSON del seed de la fase 1, no código | — |
| `e2e/**`, `*.config.{ts,mjs,cjs}`, `vitest.setup.ts`, `lighthouserc.cjs` (solo en Sonar) | Fuera de `src/`: Vitest no los mide porque su `include` es `src/**`; SonarCloud analiza todo el repo y los contaría como código nuevo al 0 % | E2E y el propio CI |

## Consequences

- El umbral del 85 % se aplica al código realmente testeable en unidad.
- Desde el paso 0.5 (S2), `geometry.ts` y `timeline.ts` (puros) **entran** en la cobertura.
- Añadir una exclusión exige actualizar esta tabla y las dos configuraciones.

## Alternatives

- Bajar el umbral global: viola el principio de progreso monótono.
- Mockear WebGL en jsdom: tests frágiles que no prueban nada real.
