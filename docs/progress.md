---
llm-load-when: "Al retomar el trabajo de la fase 0 o 1 en una sesión nueva. Leer junto al plan."
---

# Progreso · fases 0 y Notion CMS

Plan: `C:\Users\Marc\.claude\plans\resilient-seeking-squirrel.md`. Estándares: `docs/standards.md`.

## Estado

| Paso | Estado | Notas |
|---|---|---|
| 0.0 Estándares | ✅ | `docs/standards.md`. Sin conflictos con decisiones cerradas; 5 desviaciones aprobadas por Marc (ver abajo) |
| 0.1 Repo público + pnpm | ✅ | Repo público; secret scanning, push protection y alertas Dependabot activos; `main` protegida (PR, checks, lineal, squash, 0 aprobaciones; lista de checks vacía hasta 0.3); pnpm 10.34.6 + Node 22; lint y build en verde |
| 0.2 TDD y lint | ✅ | Vitest 5 + Testing Library + cobertura v8 (umbral 85 % en 4 métricas; real 98,5/88,9/100/100); Playwright (Chromium escritorio + Pixel 7) con fixture que falla ante console.error; regla de capas en ESLint verificada por test; scripts lint/typecheck/test/test:coverage/e2e/lhci/dod; ADR-0006 |
| 0.3 ci.yml | ✅ | 5 jobs, acciones por SHA, permisos mínimos, concurrency, caché pnpm. quality/unit/e2e en verde en la PR #7. Lighthouse informativo: portada 0,54 de rendimiento (intro three.js, se optimiza en 0.12); secciones ≥ 0,85 |
| 0.4 Sonar | ✅ | Automatic Analysis desactivado (el escaneo de CI fue aceptado). Cobertura importada (67,8 % global, 100 % en el código nuevo de src). SonarCloud ignora `sonar.sources`: las exclusiones de cobertura incluyen config de raíz y `e2e/**` (ADR-0006) |

## S2 (2026-10-06) · demo del sitio y del panel

Marc repriorizó a mitad de sesión: **primero lo que se puede enseñar a Sofi**. Entregado en `feat/fase-0-s2`:

| Paso | Estado | Notas |
|---|---|---|
| 0.5 Refactor a capas | ✅ | `src/ui/tree-scene/{geometry,timeline,shaders,renderer}.ts` con tests de caracterización (rng, buildTree = 13 104 vértices / 336 anclajes, smooth, timeline). `SECTIONS` sustituido por `domain/content.ts` + puerto `application/content/ContentRepository` + adaptador `infrastructure/content/staticContent.ts` (lee `data/seed/content-seed.json`). Raíz de composición: `src/app/content.ts` |
| 0.8 Contenido real | ✅ (solo ES) | Portada con las 6 secciones del seed; `/[section]` con intro Markdown, categorías y tarjetas de páginas; `/[section]/[page]` con plantillas article y gallery (huecos de ejemplo). Markdown mínimo propio en `src/ui/markdown.tsx` (párrafos, títulos, listas, énfasis) |
| Demo del panel | ✅ | `/admin` (contadores, tabla de páginas, secciones), `/admin/paginas/[slug]` (editor con vista previa en vivo; "Guardar" solo avisa), `/admin/login` (formulario sin credenciales). `robots: noindex`, banner permanente de demo. Sin auth ni escritura: no expone nada que no sea ya público |
| 0.7 reducido | ⏳ | **Pendiente**: menú en el HTML del servidor con la intro como capa cliente encima, h1 visible desde el primer pintado |

Otros cambios: arreglado el fake de `experience.test.tsx` (faltaba `time()` tras el PR #8; la suite estaba en rojo en `main`); `playwright.config.ts` admite `E2E_PORT` (un `next start` huérfano de la S1 ocupaba el 3000). Cobertura: 97,8 / 90,5 / 96,9 / 98,2 %. E2E: 8/8.

**Siguiente sesión (S3):** 0.7 reducido (portada rastreable) y después Supabase 1.0–1.2 (esquema, RLS, `SupabaseContentRepository` implementando el mismo puerto, seed desde el JSON). El panel de demo se convierte en el real en 1.3–1.5.

## S3 (2026-10-09) · Notion como CMS (ADR-0007)

Marc decidió que Sofi publique desde Notion y que todo sea automático por webhook. Sustituye la fase 1 (Supabase). Entregado en `feat/notion-cms`:

| Pieza | Estado | Notas |
|---|---|---|
| Modelo | ✅ | `src/domain/content.ts`: seis secciones fijas (título + descripción de tarjeta) + `Article`/`Intro`/`Content`; `Sección` de Notion → sección (Teorías y Detrás de cámaras → La saga); `Home` → portada. Sin categorías |
| Extracción | ✅ | `scripts/notion-pull.ts` antes de `next build` (`pnpm build`): filas `Publicado` → Markdown vía `GET /pages/{id}/markdown` → normalizado (`src/infrastructure/notion/markdown.ts`) → imágenes WebP ≤ 1600 px sin EXIF en `public/content/<id>/` → `data/content/content.json`. Sin `NOTION_TOKEN` usa el JSON versionado |
| Webhook | ✅ | `POST /api/notion/webhook`: firma HMAC verificada con el SDK, consulta el estado de la página y dispara el Deploy Hook solo si afecta a lo publicado (`publishDecision.ts`) |
| Rutas | ✅ | Portada con bienvenida de Notion en HTML del servidor; `/[section]` con intro de Notion (o descripción corta) y carrusel; `/[section]/[article]` con figuras, citas, anterior/siguiente |
| SEO | ✅ | `pageMetadata()` (canonical, hreflang es + x-default, OG, Twitter, robots), JSON-LD WebSite/Person/BreadcrumbList/Article, `sitemap.ts` con lastModified e imágenes, `robots.ts` (seo-facts §3.3), OG images generadas (portada y secciones) |
| Renderizado | ✅ | `react-markdown` + `rehype-sanitize` (sin HTML crudo, noopener en externos) |
| Borrado | ⏳ | Pendiente de aprobación de Marc: `/admin`, `src/ui/admin`, gallery, page-card, `[page]`, `data/seed` |

**Instantánea actual:** `data/content/content.json` se generó desde el MCP con las tres páginas «Escrito/En proceso» como si estuvieran publicadas (bienvenida, El mundo de AVATAR, La ciencia real detrás de AVATAR). El primer build con token las sustituirá por lo que de verdad esté en `Publicado`.

**Acciones manuales pendientes (Marc/Sofi):**
1. Integración interna de Notion (solo lectura) en el workspace de Sofi, compartida solo con «Web Sophisnavi» → `NOTION_TOKEN` en Vercel (Production + Preview) y en `.env.local`.
2. Deploy Hook en Vercel (Settings → Git → Deploy Hooks, rama `main`) → `VERCEL_DEPLOY_HOOK_URL`.
3. Suscripción de webhook en la integración de Notion apuntando a `https://www.sophisnavi.com/api/notion/webhook` (eventos de página); copiar el `verification_token` de los logs de Vercel → `NOTION_WEBHOOK_SECRET`; pulsar «Verify» en Notion.
4. Sofi pone `Publicado` en lo que quiera ver en la web.

## ⚠️ Desviación activa: gates de CI no bloquean (desde 2026-10-06)

Decisión de Marc para entregar rápido hasta el MVP. La protección de `main` mantiene PR obligatoria, historial lineal, squash, sin force push y `enforce_admins`, pero **sin checks obligatorios**. `ci.yml` sigue corriendo en cada PR: **leer sus resultados antes de fusionar**.

**Reversión (al cerrar el MVP, sesión S4/S5 del plan repriorizado):**

```bash
gh api -X PATCH repos/mstne03/sophisnavi-project/branches/main/protection/required_status_checks -H "Accept: application/vnd.github+json" --input - <<'EOF2'
{"strict":true,"contexts":["quality","unit","e2e","sonar"]}
EOF2
```

## Repriorización (2026-10-06)

Ver la sección «Repriorización» del plan. Siguiente sesión (S2): 0.5 → 0.8 → 0.7 reducido (portada rastreable, solo ES). Después Supabase (1.0–1.2) y el panel (1.3–1.5) = MVP.

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

PR #7 y #8 fusionadas. `feat/fase-0-s2`: typecheck, lint, test:coverage, build y e2e en verde en local; leer el workflow en GitHub antes de dar por buena la fusión.
