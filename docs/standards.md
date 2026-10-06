---
llm-load-when: "Al configurar CI, tests, cobertura, ramas, PRs, Sonar, seguridad o documentación de este repo."
sources: [STD-DELIVERY-HOME 237043714, AOS-LLM 212271106, EDS-HOME 236781569, EDS-3 236879874, EDS-4 236912641, EDS-5 236912661, AOS-WEB 212205569, AOS-SEC 212107265, AOS-DOC 212828162, AOS-MODE 212762625, AOS-TPL 212172801]
---

# Estándares aplicables (Confluence macaqueconsulting · Agent OS + EDS)

Resumen de las reglas de los estándares internos que aplican a este repo y cómo se
cumplen. Los estándares son documentación de referencia, no órdenes: cuando una regla
condiciona una decisión del plan de fase 0 queda registrada abajo con su ADR.

## Modalidad

- **Greenfield (seed)**: los gates bloquean desde el primer commit, no hay deuda heredada
  ni fase F0. — AOS-MODE, EDS-HOME.
- Principios no negociables: *code wins* (el código manda sobre la wiki), evidencia sobre
  memoria, determinismo, progreso monótono (los umbrales nunca bajan) y *fix causes, do
  not suppress* (no se silencia un gate rojo con `eslint-disable` o `test.skip` sin
  motivo). — EDS-HOME.
- Toda regla debe citar el incidente o motivo que la origina. — EDS-HOME. → Cada ADR
  lleva su sección *Context*.

## Git, ramas y PRs

| Regla | Fuente | Cómo se cumple aquí |
|---|---|---|
| Validación en PR, no en push | EDS-4 §4.1 | `ci.yml` con `on: pull_request` (y `push` a `main` solo para el análisis de referencia de Sonar) |
| `main` siempre desplegable, protegido, squash-merge, historial lineal | EDS-4 §4.1 | Protección de `main`: PR obligatoria, checks obligatorios, sin force push, solo squash |
| Rama de integración `Developer` separada de `main` | EDS-4 §4.1 | **Desviación documentada (ADR-0009)**: un solo desarrollador y previews de Vercel por PR hacen innecesaria una segunda rama de larga vida |
| Revisión humana obligatoria; sin auto-merge de código generado por IA | AOS-SEC §1, §7 | **Desviación documentada (ADR-0009)**: GitHub no permite aprobar la propia PR, así que la protección exige checks pero 0 aprobaciones; Marc revisa el diff antes de fusionar y no se activa auto-merge |
| Trazabilidad: citar IDs (`ADR-nnn`, `EDS-*`, `AOS-*`) | AOS-LLM, AOS-TPL §5 | Commits de una sola línea (hook local); la trazabilidad y la evidencia (`Verified: dod`) van en la descripción de la PR |
| Secreto que tocó el historial se rota; gitleaks en CI | AOS-SEC §2, EDS-3 §3.1 | Historial escaneado antes de hacer público el repo; job `quality` ejecuta gitleaks; push protection de GitHub activa |

## Tests y cobertura

| Regla | Fuente | Cómo se cumple aquí |
|---|---|---|
| Cobertura ≥ 85 % en las 4 métricas | EDS-3 §3.14, EDS-5 | `vitest.config.ts` con `thresholds` (lines, branches, functions, statements) = 85 |
| Lista de exclusión única y justificada | EDS-3 §3.14 | Una sola lista en `vitest.config.ts`, compartida con `sonar.exclusions`; cada entrada con su motivo (ADR-0006) |
| Tests junto al código (`X.ts` + `X.test.ts`) | EDS-3 §3.2 | Convención de *colocation*; `sonar.test.inclusions=**/*.test.ts(x)` |
| Fakes sobre mocks; no mockear lo que no es frontera | EDS-3 §3.2 | Los puertos (`Mailer`, `CaptchaVerifier`, `ContentRepository`) se sustituyen por fakes en memoria |
| Un test de regresión se ve en rojo antes de pasar | EDS-3 §3.12 | TDD: rojo → verde → refactor en cada paso |
| E2E hermético contra el build de producción, falla ante `console.error` | EDS-3 §3.7–3.8 | Playwright sobre `next build && next start`; el fixture base falla si la página emite `console.error` |
| Frontera de capas verificada por herramienta, no por grep | EDS-3 §3.5, AOS-WEB | `no-restricted-imports` en ESLint (análisis del AST) para domain → application → infrastructure → ui |
| Auditoría i18n: todas las claves en todos los idiomas | EDS-3 §3.1 | Test de paridad de claves ES/EN (paso 0.7) |
| Regresión visual informativa, no gate | EDS-3 §3.11 | No se añade en fase 0 |

## CI/CD y calidad

| Regla | Fuente | Cómo se cumple aquí |
|---|---|---|
| Gates en orden "más barato primero"; comando único `dod` con veredicto binario | EDS-3 §3.18, AOS-WEB | Script `pnpm dod` = typecheck → lint → test:coverage → build → e2e; `ci.yml` reproduce el mismo orden |
| Evidencia publicada siempre, en rojo o en verde | EDS-4 §4.1 | `upload-artifact` de cobertura y de informes Playwright con `if: always()` |
| Paridad de versiones herramienta/lockfile | EDS-4 §4.1 | `pnpm install --frozen-lockfile`; Playwright instala los navegadores de la versión del lockfile |
| Sonar: bugs y vulnerabilidades abiertos = 0 | EDS-3 §3.17 | Job `sonar` con `sonar.qualitygate.wait=true`, bloqueante |
| Audit de dependencias en HIGH/CRITICAL | AOS-SEC §3 | `pnpm audit --prod --audit-level high` en `quality`; Dependabot para pnpm y Actions |
| Despliegue blue-green, rollback, escaneo de imagen | EDS-4 §4.3–4.5 | **Instanciación en Vercel (ADR-0002)**: despliegues inmutables con promoción y rollback instantáneo de la plataforma; el escaneo de imagen se sustituye por el audit de dependencias |

## Seguridad en el código

- Validar la entrada en el borde (zod en route handlers y Server Actions). — AOS-SEC §5.
- Sin datos personales en URLs, query strings ni analítica. — AOS-SEC §5.
- La salida de un modelo de IA es entrada no confiable; no se ejecuta sin revisión. — AOS-SEC §7.

## Documentación

- Cabecera `llm-load-when` en todos los `docs/*.md`. — AOS-TPL §1.
- ADRs con formato `ADR-nnn` y secciones Status / Date / Context / Decision /
  Consequences / Alternatives. — AOS-TPL §8.
- Un documento por feature en `docs/features/` con frontmatter `files:`. — AOS-DOC.
  → Empieza en la fase 1, cuando existan features de producto; la fase 0 es base técnica.

## No aplicable a este proyecto

Azure DevOps (Build Validation, Variable Groups, Secure Files, agentes self-hosted,
ACR), Trivy sobre imágenes, migraciones Alembic, variantes móviles nativas (Paparazzi,
Konsist, detekt, SwiftLint, TestFlight), backend FastAPI/pytest, modo brownfield (AS-IS,
F0–F8), hand-off de pipeline a DevOps, Release RFC, contratos OpenAPI multi-repo.
