---
llm-load-when: "Al retomar el trabajo de la fase 0 o 1 en una sesión nueva. Leer junto al plan."
---

# Progreso · fase 0

Plan: `C:\Users\Marc\.claude\plans\resilient-seeking-squirrel.md`. Estándares: `docs/standards.md`.

## Estado

| Paso | Estado | Notas |
|---|---|---|
| 0.0 Estándares | ✅ | `docs/standards.md`. Sin conflictos con decisiones cerradas; 5 desviaciones aprobadas por Marc (ver abajo) |
| 0.1 Repo público + pnpm | 🔄 en curso | gitleaks limpio (3 commits). Hecho: alertas Dependabot, dependabot.yml, Node 22, limpieza. Pendiente de Marc: visibilidad pública y migración pnpm (bloqueadas por permisos del agente); después: secret scanning, push protection, protección de main |
| 0.2 TDD y lint | pendiente | |
| 0.3 ci.yml | pendiente | |
| 0.4 Sonar | pendiente | |

## Decisiones tomadas en la S1 (aprobadas 2026-10-06)

- Protección de `main` con checks obligatorios y 0 aprobaciones (no se puede aprobar la propia PR); sin auto-merge. → ADR-0009.
- Solo `main` + ramas de funcionalidad; sin rama `Developer`. → ADR-0009.
- Trazabilidad (ADRs, evidencia `dod`) en el cuerpo de la PR; los commits siguen siendo de una línea.
- E2E con fixture que falla ante `console.error`; sin WebKit en fase 0.
- Sin husky/pre-commit: gitleaks en CI + push protection de GitHub. Se añade script `pnpm dod`.

## Coordinación con la sesión de contenido

Otra sesión trabaja en el worktree `SOPHISNAVI-content`, rama `content/seed-drafts`, solo crea
archivos en `docs/content/` y `data/seed/`, sin push hasta que Sofi apruebe. Reglas: no tocar
esas rutas ni esa rama; push solo de la propia rama (nunca `--all`/`--mirror`); excluir
`data/seed/**` de cobertura y de Sonar; el CI no debe fallar en una PR solo de docs y JSON.

## Pendientes

- Confirmar política de bots de IA en robots.txt con Sofi (paso 0.9).
- Formulario 0.11 en pausa hasta confirmación de Marc.

## CI

Sin workflow todavía.
