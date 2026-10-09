# Handoff · sesión S4 (prompt para pegar al abrir la siguiente sesión)

Trabajo sobre el repo `mstne03/sophisnavi-project` (web de Sofi, @sophisnavi). Lee primero `docs/progress.md` (sección S3),
`docs/adr/0007-notion-como-cms.md` y `README.md`. Memoria de Claude: `sophisnavi-project` y `notion-cms-taxonomy`.

## Estado al cerrar la S3 (2026-10-09)

- Rama `feat/notion-cms`, commit `d80ca3b`, worktree `.claude/worktrees/sophisnavi-web-content-546249`. **Sin push y sin PR: la PR a `main` queda pendiente.**
- Notion es el CMS (sustituye la fase 1 de Supabase): webhook `/api/notion/webhook` → Deploy Hook de Vercel → build con
  `scripts/notion-pull.ts` → `data/content/content.json` + `public/content/**` → HTML estático, sitemap, robots, OG, JSON-LD.
- Gates en local: typecheck, lint, 104 tests unitarios (cobertura 96/92/91/97), build, 12 E2E en verde. Lighthouse: secciones y
  artículo ≥ 0,94 en todo; portada 0,69 en rendimiento (intro three.js, pendiente del paso 0.12 de la fase 0).
- El JSON versionado se generó desde el MCP con tres páginas que hoy están en «Escrito» como si estuvieran publicadas
  (bienvenida de Home, «El mundo de AVATAR» y «La ciencia real detrás de AVATAR»). En Notion no hay nada en `Publicado`.

## Tareas de la S4, en orden

1. **Abrir la PR `feat/notion-cms` → `main`** (nunca desde una rama `claude/...`): cuerpo con ADR-0007, evidencia `dod` y el aviso de
   que `main` no tiene checks obligatorios (leer `ci.yml` en GitHub antes de fusionar). Fusionar con squash.
2. **Configuración manual con Marc** (no la puede hacer el agente): integración interna de Notion de solo lectura compartida solo con
   «Web Sophisnavi» → `NOTION_TOKEN` en Vercel (Production + Preview) y `.env.local`; Deploy Hook de Vercel (rama `main`) →
   `VERCEL_DEPLOY_HOOK_URL`; tras el despliegue, suscripción de webhook en Notion hacia
   `https://www.sophisnavi.com/api/notion/webhook` (eventos de página), copiar el `verification_token` de los logs de Vercel a
   `NOTION_WEBHOOK_SECRET`, redesplegar y pulsar «Verify».
3. **Primera extracción real**: `pnpm content:pull` con el token y revisar el diff de `data/content/` y `public/content/`.
   Comprobar que la API devuelve las imágenes como `notion-file-block://` o como URL http (el código admite ambas) y que el Markdown
   de la API coincide con el formato que vimos por MCP. Antes, Sofi debe poner `Publicado` en lo que quiera publicar; si no, la
   web saldrá con las secciones vacías.
4. **Prueba de punta a punta del webhook**: cambiar un `Estado` en Notion y verificar en Vercel que llega el evento, que
   `publishDecision` decide bien (logs `notion-webhook: …`) y que el build publica el cambio.
5. Pendientes documentados en ADR-0007 (no empezar sin que Marc lo pida): versión EN, redirección al cambiar un `Slug` publicado,
   vista previa de borradores, fuente Marcellus en las imágenes OG, rendimiento de la portada (0.12).

## Reglas que ya conoces y conviene no olvidar

- Protocolo de contexto: pedir a Marc `/context` antes de dimensionar un paso.
- Commits de una sola línea (hook local), sin coautoría del agente.
- No tocar el esquema de la base de datos de Notion sin un sí explícito de Marc.
- `Sección` de Notion es toda la taxonomía: seis secciones fijas en `src/domain/content.ts` (+ `Home`); `Teorías` y
  `Detrás de cámaras` caen en La saga. Sin categorías.
- Modo didáctico en backend, Vercel, webhooks y seguridad; ritmo normal en frontend. Responder en español.
