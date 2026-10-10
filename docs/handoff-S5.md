# Handoff · sesión S5 (prompt para pegar al abrir la siguiente sesión)

Trabajo sobre el repo `mstne03/sophisnavi-project` (web de Sofi, @sophisnavi). Lee primero `docs/progress.md` (sección S4),
`docs/adr/0007-notion-como-cms.md` y `README.md`. Memoria de Claude: `sophisnavi-project` y `notion-cms-taxonomy`.

## Estado al cerrar la S4 (2026-10-10)

- `main` en `7f8b1ef`. Ocho PR fusionadas con squash en la S4 (#14 a #21); no queda ninguna rama de trabajo en el remoto
  (GitHub borra la rama al fusionar). La siguiente rama se crea desde `main`.
- **Notion es el CMS en producción y funciona de punta a punta**: Sofi marca `Publicado` → webhook → Deploy Hook → build con
  `scripts/notion-pull.ts` → web estática. Publicar y despublicar artículos e introducciones está probado en producción.
- Configuración manual hecha (ver «Infraestructura»). No hay pasos manuales pendientes.
- Gates: `quality`, `unit`, `e2e` y `sonar` **vuelven a ser obligatorios en `main`** (`strict: true`) desde el 2026-10-09.
  `lighthouse` sigue informativo: la portada da 0,44–0,69 en rendimiento por la intro three.js (paso 0.12 pendiente).
- Portada: pestañas **Inicio / Quién soy** arriba a la derecha; las dos vistas conviven en una pista horizontal y la pestaña
  la desliza (sin fundidos); sin scroll de página entre ellas; `#quien-soy` en el historial (atrás/adelante funcionan).
  Título de «Quién soy»: `Kaltxì!`. Copy bajo el h1: «Un viaje al corazón de AVATAR: descubre las historias que se esconden
  tras los detalles». Frases de las seis secciones: las que facilitó Sofi (en `src/domain/content.ts`; también son la meta
  description de cada sección, todas ≤ 155 caracteres).
- Imágenes de Notion: anchura contenida (36 rem, centradas); varias seguidas se agrupan en cuadrícula 4:3 (`remarkGroupImages`).

## Infraestructura (quién tiene qué)

| Pieza | Dónde | Notas |
|---|---|---|
| Conexión interna de Notion `Web Sophisnavi` | Workspace de Sofi, `app.notion.com/developers` → Connections | Tipo **API Token**, solo *Read content*, acceso dado desde la pestaña **Access** de la conexión a la base «Web Sophisnavi». **No** es un personal access token (ese actúa como Sofi y no admite webhooks; se creó uno por error y debe estar borrado) |
| `NOTION_TOKEN` | Vercel `sophisnavi-eywa` (equipo `marcs-projects-a20035cd`), Production + Preview, Sensitive | Token de la conexión. En local va en `.env.local`; `pnpm content:pull` lo lee desde la PR #16 |
| Deploy Hook `notion-publish` (rama `main`) | Vercel → Settings → Git → Deploy Hooks | URL en `VERCEL_DEPLOY_HOOK_URL`, solo Production, Sensitive. Límite 60/hora; builds seguidos se cancelan y queda el último |
| Suscripción de webhook | Conexión de Notion → pestaña Webhooks | URL `https://www.sophisnavi.com/api/notion/webhook`; eventos `page.created/properties_updated/content_updated/deleted/undeleted/moved`; estado *active* |
| `NOTION_WEBHOOK_SECRET` | Vercel, solo Production, Sensitive | El `verification_token` de la suscripción; firma HMAC-SHA256 de cada evento. No se puede volver a consultar: si se pierde, borrar y recrear la suscripción |

Comprobación rápida del endpoint desde PowerShell (esperado `401 bad signature`; `503 webhook not configured` significa que
falta el secreto en el runtime):

```powershell
try { $r = Invoke-WebRequest -Method POST -Uri https://www.sophisnavi.com/api/notion/webhook -ContentType "application/json" -Body '{}' -UseBasicParsing; "$($r.StatusCode) $($r.Content)" }
catch { $resp = $_.Exception.Response; "$([int]$resp.StatusCode) $((New-Object IO.StreamReader($resp.GetResponseStream())).ReadToEnd())" }
```

Limitaciones del entorno de Claude Code en la nube vistas en la S4: la red bloquea `sonarcloud.io`, `vercel.app` y
`sophisnavi.com` (los issues de Sonar hay que pegarlos en el chat); el conector de Vercel lista el proyecto pero da 403/404 en
detalles, variables y logs (dar acceso al proyecto en la integración de Claude en Vercel si se quiere usar).

## Bugs corregidos en la S4 que conviene conocer

- `scripts/notion-pull.ts` borraba `public/content` **después** de descargar las imágenes, con lo que producción servía el
  `alt` en vez de la imagen. Ahora descarga a `.notion-pull/` (ignorada) y solo al final sustituye `public/content`.
- `pnpm content:pull` no leía `.env.local` (lo hace Next, no `tsx`); ahora usa `process.loadEnvFile`.
- `.env.example` no estaba versionado: lo tapaba el patrón `.env*` de `.gitignore` (añadida excepción).
- Sonar en código nuevo: `sort()` sin comparador, `reduce()` sin valor inicial y tres regex super-lineales.

## Tareas candidatas para la S5 (ninguna empezada; pedir prioridad a Marc)

1. **Rendimiento de la portada (0.12)**: hoy 0,44–0,69; objetivo ≥ 0,85 para que `lighthouse` pueda pasar a obligatorio.
2. **Borrado de restos de la fase 0**: `/admin`, `src/ui/admin`, `[page]`, gallery, page-card, `data/seed`. Pendiente de
   aprobación explícita de Marc.
3. **Contenido en Notion**: la fila Home empieza por «Kaltxì!», que ahora se repite con el título. Lo quita Sofi en Notion;
   no filtrar en código.
4. Pendientes de ADR-0007: versión EN, redirección al cambiar un `Slug` publicado, vista previa de borradores, fuente
   Marcellus en las imágenes OG.
5. Docs: `docs/content/sections.md` conserva las descripciones SEO antiguas; decidir si se alinean con las frases nuevas.

## Reglas que ya conoces y conviene no olvidar

- Protocolo de contexto: pedir a Marc `/context` antes de dimensionar un paso.
- Commits de una sola línea, sin coautoría del agente. Una PR por cambio; squash con el título de la PR; leer `ci.yml`
  (los cuatro obligatorios) antes de fusionar. Nunca ramas `claude/...`.
- No tocar el esquema de la base de datos de Notion sin un sí explícito de Marc.
- `Sección` de Notion es toda la taxonomía: seis secciones fijas en `src/domain/content.ts` (+ `Home`); `Teorías` y
  `Detrás de cámaras` caen en La saga. Sin categorías.
- Modo didáctico en backend, Vercel, webhooks y seguridad; ritmo normal en frontend. Responder en español. Comandos para
  Marc en PowerShell, no en bash.
