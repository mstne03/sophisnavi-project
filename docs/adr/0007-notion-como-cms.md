---
llm-load-when: "Al tocar scripts/notion-pull.ts, src/infrastructure/notion/**, el webhook, el sitemap o cualquier cosa que lea contenido."
---

# ADR-0007 · Notion como CMS: build estático disparado por webhook

- **Status:** accepted
- **Date:** 2026-10-09
- **Supersedes:** la fase 1 del plan (panel propio sobre Supabase).

## Context

Sofi ya escribe en Notion. La base de datos «Web Sophisnavi» (data source `3f111aad-5e58-808b-8698-000b3e72fdae`) tiene las
columnas que fijan dónde va cada texto: `Estado` (Sin empezar / En proceso / Publicado), `Tipo` (Artículo / Introducción),
`Sección` (las seis secciones de la web más `Home`; `Teorías` y `Detrás de cámaras` caen en La saga), `Slug` y `Descripción`.
Marc pidió que Sofi gestione sus publicaciones desde Notion, con webhook, sin pasos manuales, y que la web siga siendo HTML
estático con SEO completo (canonical, Open Graph, JSON-LD, hreflang, sitemap).

## Decision

1. **Notion es la única fuente de contenido y el panel de Sofi.** Las seis secciones y sus descripciones cortas viven en
   `src/domain/content.ts`; todo lo demás (bienvenida, intro de cada sección, artículos, imágenes) viene de Notion.
2. **El contenido se descarga en el build, no en tiempo de ejecución.** `scripts/notion-pull.ts` corre antes de `next build`:
   lee las filas `Publicado`, pide cada página como Markdown (`GET /pages/{id}/markdown`, versión `2026-03-11`), lo normaliza
   a Markdown estándar, descarga las imágenes a `public/content/<pageId>/<n>.webp` (≤ 1600 px, sin EXIF) y escribe
   `data/content/content.json`. Sin `NOTION_TOKEN` el build usa el JSON versionado: el CI de forks y los clones sin
   credenciales siguen funcionando.
3. **Publicar = disparar un build.** `POST /api/notion/webhook` recibe los eventos de Notion, verifica la firma HMAC-SHA256
   con el `verification_token`, consulta el estado de la página y, solo si el cambio afecta a lo publicado
   (`src/application/content/publishDecision.ts`), llama al Deploy Hook de Vercel. Vercel cancela builds repetidos del mismo
   hook; el límite es de 60 disparos por hora.
4. **Si Notion falla, el build falla** y Vercel conserva el despliegue anterior. Nunca se publica una web a medias.

Variables (solo servidor): `NOTION_TOKEN` (integración interna de solo lectura, compartida únicamente con la base de datos; en el portal de Notion se llama «conexión» de tipo API Token, no un *personal access token*),
`NOTION_WEBHOOK_SECRET`, `VERCEL_DEPLOY_HOOK_URL`. Ver `.env.example`.

## Consequences

- Entre que Sofi marca `Publicado` y la web cambia pasan unos minutos (el build), no segundos.
- El contenido de Notion es entrada no confiable: se renderiza con `react-markdown` + `rehype-sanitize`, sin HTML crudo,
  con enlaces externos `rel="noopener noreferrer"`. Las imágenes se sirven desde el dominio propio (las URL de Notion caducan).
- `data/content/content.json` y `public/content/**` se versionan como instantánea; cada build con token los regenera.
- Renombrar el `Slug` de una página publicada cambia su URL (la antigua da 404). Se avisa en la descripción de la columna.
- El panel de demo (`/admin`), el seed de la fase 0 y el modelo de categorías desaparecen.
- Quedan fuera (pendiente): versión EN, redirecciones al renombrar, vista previa de borradores.

## Alternatives

- **Panel propio sobre Supabase (plan fase 1):** más control, pero duplica una herramienta que Sofi ya usa y añade auth,
  RLS y almacenamiento que hay que mantener.
- **Leer Notion en tiempo de ejecución (ISR + `revalidateTag`):** inmediato, pero la web dependería de la API de Notion en
  producción (3 peticiones/s, caídas) y las imágenes firmadas caducan a la hora.
- **Commit automático desde GitHub Actions:** choca con la protección de `main` (PR obligatoria) y mete un token de GitHub en Vercel.
