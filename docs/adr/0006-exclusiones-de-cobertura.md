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
replica exactamente las mismas rutas en `sonar.coverage.exclusions`.

| Ruta | Motivo | Quién lo cubre |
|---|---|---|
| `src/lib/tree-scene.ts` | Escena three.js/WebGL; en el paso 0.5 se divide y solo quedan excluidos `renderer.ts` y `shaders.ts` | E2E (Playwright contra el build) |
| `data/seed/**` | Datos JSON del seed de la fase 1, no código | — |

## Consequences

- El umbral del 85 % se aplica al código realmente testeable en unidad.
- Cuando el paso 0.5 extraiga `geometry.ts` y `timeline.ts` (puros), **entran** en la cobertura.
- Añadir una exclusión exige actualizar esta tabla y las dos configuraciones.

## Alternatives

- Bajar el umbral global: viola el principio de progreso monótono.
- Mockear WebGL en jsdom: tests frágiles que no prueban nada real.
