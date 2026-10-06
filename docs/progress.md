---
llm-load-when: "Al retomar el trabajo de la fase 0 o 1 en una sesión nueva. Leer junto al plan."
---

# Progreso · fase 0

Plan: `C:\Users\Marc\.claude\plans\resilient-seeking-squirrel.md`. Estándares: `docs/standards.md`.

## Estado

| Paso | Estado | Notas |
|---|---|---|
| 0.0 Estándares | ✅ | `docs/standards.md`. Sin conflictos con decisiones cerradas; 5 desviaciones aprobadas por Marc (ver abajo) |
| 0.1 Repo público + pnpm | ✅ | Repo público; secret scanning, push protection y alertas Dependabot activos; `main` protegida (PR, checks, lineal, squash, 0 aprobaciones; lista de checks vacía hasta 0.3); pnpm 10.34.6 + Node 22; lint y build en verde |
| 0.2 TDD y lint | ✅ | Vitest 5 + Testing Library + cobertura v8 (umbral 85 % en 4 métricas; real 98,5/88,9/100/100); Playwright (Chromium escritorio + Pixel 7) con fixture que falla ante console.error; regla de capas en ESLint verificada por test; scripts lint/typecheck/test/test:coverage/e2e/lhci/dod; ADR-0006 |
| 0.3 ci.yml | ⏳ siguiente | Falta instalar @lhci/cli y lighthouserc; añadir checks obligatorios a la protección de main al terminar |
| 0.4 Sonar | pendiente | |

## Decisiones tomadas en la S1 (aprobadas 2026-10-06)

- Protección de `main` con checks obligatorios y 0 aprobaciones (no se puede aprobar la propia PR); sin auto-merge. → ADR-0009.
- Solo `main` + ramas de funcionalidad; sin rama `Developer`. → ADR-0009.
- Trazabilidad (ADRs, evidencia `dod`) en el cuerpo de la PR; los commits siguen siendo de una línea.
- E2E con fixture que falla ante `console.error`; sin WebKit en fase 0.
- Sin husky/pre-commit: gitleaks en CI + push protection de GitHub. Se añade script `pnpm dod`.

## Norma de ramas

Nunca se fusiona ni publica una rama `claude/...`; las ramas remotas y de PR usan `feat/`, `fix/`, `docs/`, `chore/`, `ci/`. La rama de la S1 pasa a ser `feat/fase-0-s1`.

## Coordinación con la sesión de contenido

Otra sesión trabaja en el worktree `SOPHISNAVI-content`, rama `content/seed-drafts`, solo crea
archivos en `docs/content/` y `data/seed/`, sin push hasta que Sofi apruebe. Reglas: no tocar
esas rutas ni esa rama; push solo de la propia rama (nunca `--all`/`--mirror`); excluir
`data/seed/**` de cobertura y de Sonar; el CI no debe fallar en una PR solo de docs y JSON.

## Desviaciones de estimación

- 0.0 + 0.1: ~90k reales frente a 30k estimados. Causa principal: cada volcado de `/context` ocupa ~30k en el chat. Mitigación: pegar solo el resumen (tokens usados/libres/ventana), no la tabla completa de herramientas.

## Pendientes

- Confirmar política de bots de IA en robots.txt con Sofi (paso 0.9).
- Formulario 0.11 en pausa hasta confirmación de Marc.

## CI

Sin workflow todavía.
