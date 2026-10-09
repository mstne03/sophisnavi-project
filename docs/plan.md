# Plan · Fase 0 de sophisnavi.com — base técnica, calidad, i18n y SEO

## Contexto

La PWA (Next 16.3.8 + three.js + motion, en Vercel como `sophisnavi-eywa`) es un borrador funcional, pero:
- **no tiene tests, ni CI, ni análisis de calidad**, y usa npm;
- **la portada no se puede rastrear**: el menú solo se renderiza en el cliente tras la intro (`src/components/experience.tsx`, `phase === "menu"`), así que el HTML del servidor no contiene `<nav>` ni enlaces;
- **faltan robots, sitemap, Open Graph, datos estructurados, metadatos por página e i18n**.

El dominio `sophisnavi.com` ya está comprado en el equipo de Vercel, con DNS en Vercel y renovación automática, pero **aún no está asociado al proyecto**.

**Objetivo de la fase 0:** dejar una base que cumpla los estándares pedidos antes de añadir contenido en la fase 1:
- **pnpm** como gestor de paquetes;
- **TDD**;
- **arquitectura limpia**;
- **CI/CD con gates:** cobertura ≥ 85 %, lint y SonarQube;
- **formularios** con Resend + Turnstile (el formulario de propuestas queda **pendiente de confirmación**, ver 0.11);
- **sitio bilingüe ES/EN** con SEO técnico completo;
- **Lighthouse ≥ 85** en todas las rutas.

**Decisión ya tomada:** el repo pasa a ser **público**. GitHub Free no permite proteger ramas en repos privados (comprobado: HTTP 403), y sin protección los gates de CI no bloquearían nada.

---

## Protocolo de ventana de contexto (lo aplica el agente que ejecute el plan)

Cada paso lleva una **estimación de los tokens de contexto que consume** en la sesión principal: archivos leídos, código escrito y salidas de comandos.

**Norma obligatoria: medir antes de empezar.** Siempre que el agente evalúe el tamaño de un paso o de una tarea, lo contrasta con la ventana de contexto **real**, nunca con una suposición:
1. **Obtener el dato real con `/context`.**
   - Si en la sesión puede ejecutarlo él mismo (como skill o herramienta disponible), lo hace.
   - Si no puede (`/context` es un comando de la terminal de Claude Code y normalmente el agente no tiene acceso), **para y le pide a Marc que lo ejecute y le pegue el resultado**: tokens usados, tokens libres y tamaño de la ventana.
   - No sigue hasta tenerlo.
2. **Solo empieza el paso si `estimación × 1,3` cabe en lo que queda.** El 30 % extra cubre los imprevistos (tests que fallan, CI en rojo). Comunica el cálculo en una línea: «Paso 0.7: ~60k × 1,3 = 78k; libres: 112k → cabe».
3. **Si no cabe:** cierra la sesión limpiamente (ver más abajo) y lo dice así: hay trabajo pendiente que pasa a la siguiente sesión, no una incapacidad. No empieza nada a medias.
4. **Volver a medir** al terminar cada paso y siempre que una tarea haya consumido mucho más de lo estimado. Si las estimaciones se desvían de forma sistemática, se corrigen en este plan para las sesiones siguientes.

**Reglas para gastar poco contexto:**
- La investigación amplia (Confluence, documentación) se delega en **subagentes**, que devuelven solo un resumen.
- **Nunca se vuelcan informes completos** de Lighthouse, logs de CI ni salidas de instalación. Se filtra con `jq`, `Select-Object -Last N` o `--reporter=dot`, y solo se leen los fallos.
- Los archivos se leen por rangos (`offset`/`limit`) cuando solo hace falta una parte.

**Cierre de cada paso:**
1. Commit (en una línea; el hook lo exige).
2. Actualizar `docs/progress.md` con: paso terminado, siguiente paso, decisiones pendientes y estado del CI.
3. Así una sesión nueva puede retomar el trabajo leyendo solo ese archivo y este plan.

**Agrupación orientativa por sesiones**, suponiendo una ventana de ~200k tokens y el contexto inicial (system prompt + plan) en ~35k. Es solo un punto de partida: **lo que manda es la medición real con `/context`**. Si la ventana real es mayor, el agente encadena más pasos aplicando la misma regla.

| Sesión | Pasos | Estimación |
|---|---|---|
| S1 | 0.0 · 0.1 · 0.2 · 0.3 · 0.4 | ~110k |
| S2 | 0.5 · 0.6 · 0.7 | ~120k |
| S3 | 0.8 · 0.9 · 0.10 | ~115k |
| S4 | 0.12 · 0.13 (0.11 solo si se confirma: +40k) | ~85k |
| S5 | 1.0 · 1.1 · 1.2 | ~115k |
| S6 | 1.3 · 1.4 | ~120k |
| S7 | 1.5 · 1.6 | ~120k |
| S8 | 1.7 · 1.8 | ~100k |

---

## Repriorización (2026-10-06, tras la S1)

**Decisión de Marc:** entregar y demostrar valor rápido. Dos cambios:

1. **Gates de CI informativos hasta el MVP.** ~~La protección de `main` conserva PR obligatoria, historial lineal, solo squash, sin force push y `enforce_admins`, pero **sin checks obligatorios**.~~ **Cerrado el 2026-10-09:** `quality`, `unit`, `e2e` y `sonar` vuelven a ser obligatorios (`strict: true`) antes de fusionar la PR #14; `lighthouse` sigue informativo hasta el 0.12. Registrado en `docs/progress.md`.
2. **El orden de los pasos cambia: primero lo visible.** El MVP es que la web refleje lo nuevo: secciones reales con contenido de ejemplo visible (seed de `data/seed/content-seed.json` y textos de `docs/content/`), y el panel de administración para Sofi. Orden nuevo:

| Sesión | Pasos | Qué entrega |
|---|---|---|
| S2 | 0.5 (refactor a capas + `ContentRepository`) · 0.8 (contenido real de las secciones desde el seed) · 0.7 **reducido** (portada rastreable con el menú en el HTML; i18n solo ES, EN se pospone) | Web con secciones reales y ejemplos visibles |
| S3 | 1.0 · 1.1 · 1.2 (Supabase, esquema + RLS, repositorio y seed) | Datos en Supabase; la web lee de ahí |
| S4 | 1.3 · 1.4 · 1.5 (login con TOTP, CRUD de páginas, editor Markdown) | Panel mínimo usable por Sofi = **MVP** |
| S5 | Restaurar gates · 0.6 dominio · 0.9 SEO · 0.12 cabeceras y rendimiento · 0.13 docs | Endurecimiento sobre el MVP |
| S6+ | 0.7 EN completo · 1.6 · 1.7 · 1.8 · 0.10 | Resto de la fase 0 y 1 |

Lo que **no** cambia: TDD en cada paso (el umbral del 85 % sigue en `vitest.config.ts` y el job `unit` sigue fallando si baja, aunque no bloquee la fusión), arquitectura por capas, pnpm, decisiones de los ADR, y la norma de ramas (`feat/`, `fix/`, `docs/`…; nunca `claude/`).

---

## Decisiones de arquitectura (cada una con su ADR en `docs/adr/`)

### Microservicios → **monolito modular con arquitectura limpia (hexagonal)**
La web es un sitio de contenido, prerenderizado, con un único endpoint (el formulario). Partirla en microservicios añadiría fallos de red entre servicios (**robustez ↓**), contratos y despliegues sincronizados (**mantenibilidad ↓**) y coste, sin ninguna carga que lo justifique.

**Lo que se sacrifica:** desplegar y escalar cada pieza por separado. En Vercel apenas importa: cada *route handler* ya se ejecuta como una función serverless que escala sola.

**Lo que se conserva:** las mismas fronteras que tendrían los microservicios, en forma de capas con dependencias en un solo sentido.

```
src/domain/          entidades puras (Section, Locale, SiteConfig, ContactMessage). No importa nada.
src/application/     casos de uso puros + puertos: seo/*, i18n/*, contact/submitContact. Solo importa domain.
src/infrastructure/  adaptadores: content/staticSections, i18n/dictionaries, mail/resendMailer,
                     captcha/turnstileVerifier, config/env (zod).
src/ui/              componentes React + tree-scene/{geometry, timeline, shaders, renderer}.
src/app/[lang]/      rutas Next = raíz de composición (aquí se conectan los adaptadores con los casos de uso).
```

La regla de dependencias **se comprueba de forma automática** con `no-restricted-imports` en `eslint.config.mjs`: si alguien la rompe, el lint falla.

### Docker → **no, por ahora**
Vercel compila Next de forma nativa; un contenedor no aportaría nada al despliegue y sería una pieza más que mantener.

La paridad entre entornos se consigue sin Docker:
- `engines.node: "22.x"` + `.nvmrc`;
- `packageManager: "pnpm@10.x"` con Corepack, que garantiza la misma versión de pnpm en tu máquina, en el CI y en Vercel;
- `pnpm install --frozen-lockfile` (instala exactamente lo del lockfile y falla si no coincide).

**Cuándo reconsiderarlo:** si se aloja algo en el VPS de Hetzner.

**Revisión por la fase 1:** el CLI de Supabase levanta la base de datos local **en Docker**. Docker pasa a usarse **para el desarrollo local y para los tests de integración en el CI** (base de datos real con las políticas RLS), pero **no para desplegar**, que sigue siendo nativo en Vercel. El ADR 0002 se actualiza en ese punto.

### pnpm
- **Migración:** borrar `package-lock.json` y `node_modules`, ejecutar `pnpm import` (convierte el lockfile de npm conservando las versiones exactas) y añadir el campo `packageManager`. Vercel detecta pnpm por el `pnpm-lock.yaml`. En el CI se usa `pnpm/action-setup`.
- **Ventajas de seguridad:**
  - pnpm 10 **no ejecuta los scripts de instalación de las dependencias** salvo los que se autoricen en `onlyBuiltDependencies`. Esos scripts son un vector clásico de ataques a la cadena de suministro: un paquete comprometido ejecuta código en tu máquina al instalarse.
  - El `node_modules` estricto impide usar paquetes que no estén declarados en `package.json` (las llamadas dependencias fantasma).
- **Auditoría:** `pnpm audit --prod`.

### i18n: **ES + EN, con prefijo en las dos lenguas**
**Estructura de URLs:**
- `/es/...` y `/en/...`, con slugs traducidos: `/es/personajes` ↔ `/en/characters`.
- `/` → **308 a `/es`**, como redirección estática en `next.config.ts`.

**Sin redirección por idioma del navegador.** La documentación de Next propone detectar el idioma en `proxy.ts`; aquí no se hace porque:
- Googlebot rastrea sin cabecera de idioma, así que la redirección le escondería una de las versiones;
- `proxy.ts` ejecutaría una función en cada petición.

En su lugar, un aviso discreto en el cliente: «*This page is available in English*» si el navegador está en inglés.

**Por qué prefijo en las dos y no español sin prefijo:**
- Servir el español sin prefijo exigiría *rewrites* con expresiones regulares que excluyan `_next`, `api` y las rutas de metadatos (imágenes OG, sitemap). Eso es frágil (**robustez ↓**).
- **Lo que se sacrifica:** la portada en español no vive en `/` sino en `/es`.

**Implementación:**
- `app/[lang]/layout.tsx` como layout raíz (así `<html lang>` es correcto en cada idioma).
- `generateStaticParams` + `dynamicParams = false` para limitar los idiomas a `es` y `en`.
- `hasLocale` + `getDictionary` siguiendo la guía de i18n de Next 16 (`next/root-params` para no pasar `lang` por todos los componentes).
- Diccionarios tipados en `src/infrastructure/i18n/{es,en}.json`, con un **test que falla si las claves de ES y EN no coinciden**.
- Sin librería externa (`next-intl` añadiría pluralización y formato ICU que hoy no hacen falta).

**Implicaciones SEO, que se testean en `application/seo`:**
- **Canonical:** cada versión apunta a sí misma (EN → EN), nunca a la española.
- **hreflang** recíproco en todas las páginas (cada versión enlaza a todas las demás): `es`, `en` y **`x-default` → versión `/es`** (el idioma principal). También dentro de `sitemap.xml`, con `alternates.languages`.
- **Open Graph:** `og:locale` (`es_ES` / `en_US`) y `og:locale:alternate`, e imágenes OG con el texto en cada idioma.
- **JSON-LD** con `inLanguage`.
- **Sin páginas traducidas a medias:** si un contenido no tiene versión EN, **no se genera** ni su ruta EN ni su hreflang. Nada de copias en español servidas bajo `/en` (contenido duplicado).
- **Traducción:** en la fase 0, la interfaz y las páginas índice de las secciones en los dos idiomas. Los textos EN los redacto yo y los revisa Sofi. En la fase 1, Sofi añade o no la versión EN de cada página desde el panel.

### CSP estática, **sin nonces**
- **Por qué sin nonces:** según la documentación de Next 16, usar nonces obliga a renderizar todas las páginas en el servidor en cada visita. Eso es incompatible con el prerenderizado de todas las rutas.
- **Lo que se sacrifica:** `script-src` tiene que incluir `'unsafe-inline'`, porque Next inyecta scripts en línea con los datos de la página. La protección contra XSS es algo menor que con nonces.
- **Mitigaciones:**
  - No hay HTML generado por usuarios. El único `dangerouslySetInnerHTML` es el JSON-LD, y se escapa.
  - Lista de orígenes cerrada.
  - `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.

---

## Norma de ramas (obligatoria en todo el proyecto)
- **Nunca se hace merge, push ni PR de ramas `claude/...`** (ni de ningún otro nombre generado automáticamente por un agente o por una herramienta de worktrees).
- Toda rama que se publique sigue el prefijo de *conventional commits*:
  - `feat/...`, `fix/...`, `docs/...`, `refactor/...`;
  - `test/...`, `ci/...`, `chore/...`, `perf/...`, `build/...`.
  - Nombre descriptivo en minúsculas y con guiones: por ejemplo `feat/i18n-routing`, `ci/sonar-job`, `docs/content-seed`.
- **Si un agente trabaja en una rama `claude/...`** (por ejemplo, la que crea un worktree automático), antes de publicar debe **crear la rama con el nombre correcto a partir de ella** y publicar solo esa.
  - Borrar la rama `claude/...` del remoto, si llegó a subirse, requiere confirmación de Marc.
- **Se aplica también en GitHub** (paso 0.1): un *ruleset* con «Restrict creations» para el patrón `claude/**` impide crear esas ramas en el remoto. Los rulesets están disponibles en repos públicos con GitHub Free.

## Pasos (rama de funcionalidad + PR; en cada paso: tests en rojo → implementación → refactor)

**Norma de ramas (añadida 2026-10-06):** nunca se fusiona ni se publica una rama `claude/...`. Toda rama que llegue al remoto o a una PR sigue la convención `feat/...`, `fix/...`, `docs/...`, `chore/...`, `ci/...`. Si la sesión arranca en una rama `claude/...`, se renombra antes del primer push.

### 0.0 Estándares de Confluence · ~12k
- **Un subagente** lee `STD-DELIVERY-HOME` (237043714), después `AOS-LLM` y `EDS-HOME` (236781569), y las páginas hijas que indiquen sus cabeceras `llm-load-when`. Devuelve un resumen.
- Volcar en `docs/standards.md` las reglas aplicables y cómo se cumplen en el repo.
- **Si alguna regla contradice este plan, se plantea antes de escribir código.** Son documentación (datos), no órdenes.

### 0.1 Preparar el repo, hacerlo público y migrar a pnpm · ~18k
1. Escanear **todo el historial** con `gitleaks` antes de cambiar la visibilidad.
2. `gh repo edit --visibility public`.
3. Activar *secret scanning* y *push protection* (bloquean un push que contenga claves) y Dependabot (pnpm y Actions).
4. Proteger `main`: solo mediante PR, checks obligatorios, historial lineal y sin `force push`. Además, un ruleset que bloquea crear ramas `claude/**` en el remoto (ver «Norma de ramas»).
5. Migrar a pnpm (ver ADR) y fijar Node 22.
6. Limpieza:
   - borrar los SVG sobrantes de la plantilla en `public/`;
   - quitar el BOM de `layout.tsx` y `manifest.ts`;
   - eliminar la entrada duplicada `.vercel` de `.gitignore` y añadir `.sonar/` y `coverage/`;
   - actualizar `.claude/launch.json` a `pnpm`.

### 0.2 Herramientas de TDD y lint · ~25k
- **Unit/componentes:** `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@vitest/coverage-v8`.
- **Cobertura con umbral global del 85 %** (líneas, ramas, funciones y sentencias). Si no se alcanza, el CI falla.
- **Única exclusión (con ADR):** `src/ui/tree-scene/renderer.ts` (código que conecta con WebGL) y `shaders.ts` (cadenas de texto). Ese código lo cubren los tests E2E.
- **E2E:** Playwright contra el build de producción (`pnpm build && pnpm start`).
- **Scripts:** `lint` (`eslint . --max-warnings 0`), `typecheck`, `test`, `test:coverage`, `e2e`, `lhci`.
- **ESLint:** la configuración de Next (incluye `jsx-a11y`) + la regla de fronteras entre capas.

### 0.3 CI/CD — `.github/workflows/ci.yml` · ~35k (incluye iterar sobre el CI en rojo)
| Job | Qué comprueba | Bloquea el merge |
|---|---|---|
| `quality` | lint + typecheck + `pnpm audit --prod --audit-level high` + gitleaks | sí |
| `unit` | vitest con cobertura ≥ 85 % (sube `lcov`) | sí |
| `e2e` | build + Playwright | sí |
| `lighthouse` | LHCI sobre **todas las URL de los dos idiomas** (las saca del sitemap), móvil, 3 ejecuciones (mediana), mínimo 0,85 en las 4 categorías | informativo hasta el paso 0.12, después sí |
| `sonar` | `sonarqube-scan-action` con lcov, esperando el resultado del *quality gate* | sí |

**Endurecimiento del propio CI:**
- acciones fijadas por SHA (no por etiqueta, que se puede mover);
- `permissions: contents: read` (permisos mínimos);
- `concurrency` con cancelación de ejecuciones anteriores de la misma rama;
- caché del almacén de pnpm.

**Vercel:** previews por PR, producción solo desde `main`, y **Deployment Checks** activados para que no se promocione a producción sin los checks de GitHub en verde.

### 0.4 SonarQube Cloud (organización `mstne03`) · ~15k
**Ya hecho por Marc:**
- proyecto importado con *Project Key* `mstne03_sophisnavi-project` y *Organization* `mstne03`;
- secreto `SONAR_TOKEN` guardado.

**Ajustes al workflow que propone SonarQube** (su `build.yml`):
1. **No crear un `build.yml` aparte.** Su contenido se integra como el job `sonar` de `ci.yml`, con `needs: unit`, de modo que **descarga el `coverage/lcov.info` que genera el job `unit`**. En el workflow de ejemplo, el paso de tests viene comentado: sin él, Sonar analizaría sin cobertura y su quality gate fallaría o daría datos engañosos. Un único workflow es también el único check que se configura como obligatorio en la protección de ramas.
2. **`runs-on: ubuntu-latest` en vez de `windows-latest`.** Todos los demás jobs corren en Linux. Los runners de Linux arrancan más rápido. Y mezclar sistemas operativos en el mismo pipeline introduce diferencias de rutas y de fines de línea que dan falsos positivos.
3. **La configuración va en `sonar-project.properties`, no en `args`**, para tenerla versionada y legible:
   - `sonar.organization` y `sonar.projectKey`;
   - `sonar.sources=src` y `sonar.tests=src`;
   - `sonar.test.inclusions=**/*.test.ts(x)`;
   - `sonar.javascript.lcov.reportPaths=coverage/lcov.info`;
   - `sonar.exclusions` con las mismas exclusiones de cobertura del ADR 0006;
   - `sonar.qualitygate.wait=true` (el job falla si el quality gate falla).
- **Se conservan** sus acciones fijadas por SHA (`actions/checkout@34e1148…` v4.3.1, `actions/cache@0057852…` v4.3.0, `SonarSource/sonarqube-scan-action@7006c44…` v8.1.0), `fetch-depth: 0` (historial completo, para que Sonar sepa qué código es nuevo) y la caché de `~/.sonar/cache`.
- **Comprobar** que el *Automatic Analysis* está desactivado. Si estuviera activo a la vez que el análisis del CI, Sonar rechaza el análisis del CI.
- Quality gate "Sonar way". El 85 % de cobertura lo impone Vitest.
- **Verificación:** el primer PR muestra el resultado de Sonar con la cobertura importada (distinta de 0 %).

### 0.5 Refactor a capas, protegido por tests · ~45k
- **Primero, tests de caracterización** (fijan el comportamiento actual antes de mover nada):
  - `rng` es determinista;
  - `buildTree(rng(7))` devuelve siempre el mismo número de vértices y anclajes;
  - `smooth`.
- Dividir `src/lib/tree-scene.ts` en:
  - `geometry.ts`;
  - `timeline.ts`, nuevo y puro: dado `t`, devuelve los valores de aparición y la pose de la cámara, que hoy se calculan dentro de `render()`;
  - `shaders.ts`;
  - `renderer.ts`.
- `SECTIONS` → `infrastructure/content/staticSections.ts`, con id, slug y textos **por idioma**, detrás del puerto `ContentRepository`. Es el mismo puerto que en la fase 1 implementará `SupabaseContentRepository`.

### 0.6 Dominio y URL canónica · ~12k
- Asociar `sophisnavi.com` al proyecto (CLI de Vercel); `www` → dominio sin `www` con redirección permanente.
- `*.vercel.app` → `https://sophisnavi.com/:path*` mediante `redirects()` con `has: [{type:'host'}]` y `statusCode: 301`. Así no hace falta Proxy y las páginas siguen siendo estáticas.
- `/` → `/es` (308).
- `metadataBase`.
- Comprobar en E2E que los despliegues de preview devuelven `X-Robots-Tag: noindex`. Si Vercel no lo pone, añadirlo para los entornos que no sean producción.

### 0.7 i18n, prerenderizado completo y portada rastreable · ~60k
- Mover las rutas a `app/[lang]/` (layout raíz, portada, `[section]`, `links`, `colabora`, `privacidad`, `not-found`) y añadir los diccionarios y el test de paridad de claves.
- `export const dynamic = "error"` en **todas** las rutas (Cache Components queda desactivado). Si algo se vuelve dinámico por accidente, **el build falla**.
- **Portada:** el menú se renderiza en el HTML del servidor. La intro pasa a ser una capa cliente *encima*.
  - Un script en línea mínimo en `<head>` marca `data-intro` solo si hay JS y la intro no se ha visto en la sesión. Su hash sha256 va en la CSP.
  - Sin JS (o para un bot), el menú se ve directamente.
- **LCP** (el momento en que se pinta el elemento principal): el `h1` debe ser visible desde el primer pintado.
  - **Lo que se sacrifica:** la aparición letra a letra desde opacidad 0. El efecto se conserva con brillo (`text-shadow`) y `letter-spacing`, que no retrasan el LCP.
- **Selector de idioma** que enlaza a la página equivalente (con su slug traducido) y el aviso en el cliente para navegadores en inglés.
- **Test E2E:** descargar el HTML crudo de **cada URL del sitemap** sin JS y comprobar que contiene:
  - `<html lang>` correcto, `h1`, `<nav>` completo, `title` y meta description;
  - canonical apuntando a sí misma y hreflang `es`/`en`/`x-default` recíprocos;
  - las `og:*` y el JSON-LD.

### 0.8 Contenido de rutas, ES y EN · ~40k (sobre todo texto generado)
- **Secciones** con slugs traducidos:

  | ES | EN |
  |---|---|
  | `pandora` | `pandora` |
  | `personajes` | `characters` |
  | `clanes` | `clans` |
  | `saga` | `saga` |
  | `coleccion` | `collection` |
  | `vida-fan` | `fan-life` |

- Cada una es una página índice con un texto introductorio real (150–300 palabras por idioma), para no publicar páginas vacías que perjudiquen el SEO.
- **Rutas nuevas:** `/links`. (`/colabora` y `/privacidad` dependen de 0.11, que está pendiente de confirmación.)
- **Estos textos son el *seed* (datos iniciales) de la fase 1:** viven en `staticSections.ts` detrás de `ContentRepository` y en la fase 1 se migran a Supabase sin tocar las rutas.
- **Los textos los redacto yo y los aprueba Sofi.**

### 0.9 SEO técnico (TDD sobre `src/application/seo/*`) · ~50k
- **`buildMetadata(page, lang)`**, función pura y testeada. Evita el problema de la *fusión superficial* de Next (si una página define `openGraph`, sustituye entero el del layout en vez de combinarse). Genera:
  - plantilla de título, description y canonical apuntando a sí misma;
  - `alternates.languages` con `es`, `en` y `x-default`;
  - `openGraph` completo: `type`, `locale` + `alternateLocale`, `siteName`, `url`, imágenes de 1200×630 con `alt`;
  - `twitter: summary_large_image`;
  - `robots.googleBot`: `max-image-preview:large`, `max-snippet:-1`, `max-video-preview:-1`;
  - `icons`, `manifest` y `formatDetection`.
- **Imágenes de vista previa:** `opengraph-image.tsx` por idioma y sección (estáticas gracias a `generateStaticParams`), con `ImageResponse` de `next/og` y la fuente Marcellus en TTF local.
- **JSON-LD:**
  - `WebSite` (con `inLanguage`) + `Person` (Sofi) con `sameAs` apuntando a sus redes **verificadas en su Linktree**;
  - `BreadcrumbList` en las secciones;
  - se inserta con `<script type="application/ld+json">`, escapando `<`.
- **`robots.ts`:**
  - todo permitido para los buscadores;
  - **no se bloquean `/_next/`** (Google necesita el JS y el CSS para renderizar la página);
  - `Disallow: /api/` y `Disallow: /admin/` (el panel además lleva `noindex` y exige autenticación; robots.txt es público, así que **no se usa como medida de seguridad**, solo para no gastar rastreo);
  - `sitemap` con URL absoluta;
  - **IA:** se permiten los bots que buscan y responden (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`) y se bloquean los de entrenamiento (`GPTBot`, `Google-Extended`, `CCBot`, `ClaudeBot`). **Valor por defecto, a confirmar con Sofi.**
- **`sitemap.ts`:**
  - todas las URL de los dos idiomas con `alternates.languages`;
  - `lastModified` tomado de cada entrada de contenido, **no** de la fecha del build (una fecha que cambia en cada build le dice a Google que todo cambió siempre);
  - con las imágenes de vista previa.
- **`manifest.ts`:** `lang: "es"` y descripción real.

### 0.10 Google: propiedad de Sofi · ~8k
- Crear una **propiedad de dominio** en Search Console **con la cuenta de Google de Sofi**. Ella me pasa el valor TXT y yo añado el registro con `vercel dns add sophisnavi.com @ TXT ...`.
- Ella te da acceso como usuario "Completo"; la propiedad sigue siendo suya. Envío del sitemap e importación opcional en Bing Webmaster Tools.
- **SEM, fuera de la fase 0:** cuando se invierta en anuncios, Google Ads irá en la cuenta de Sofi, con Consent Mode v2 y un gestor de consentimiento (necesario por las cookies publicitarias).
- **Riesgo residual:** el dominio sigue registrado en tu equipo de Vercel. Conviene transferírselo a Sofi más adelante.

### 0.11 Formulario de colaboraciones (Resend + Turnstile) · ~40k — ⏸ **PENDIENTE DE CONFIRMACIÓN**
> **No se implementa hasta que Marc lo confirme expresamente.** Mientras tanto no se crean `/colabora` ni `/privacidad`, ni se añaden a la navegación ni al sitemap.
> Resend y Turnstile se configuran igualmente en la fase 1:
> - Resend, como servidor de correo (SMTP) de Supabase Auth;
> - Turnstile, como CAPTCHA del inicio de sesión del panel.
>
> El diseño de abajo se conserva para cuando se confirme.
**Caso de uso** `submitContact`, con dos puertos (`CaptchaVerifier`, `Mailer`), testeado con dobles. Hace lo siguiente:
1. Valida los datos con zod (longitudes máximas y email).
2. Verifica el token de Turnstile en el servidor (`siteverify`), comprobando `hostname` y `action`.
3. Envía el mensaje con Resend:
   - `reply_to` = el email del remitente;
   - cuerpo en texto plano, sin HTML que se pueda inyectar;
   - **no se guarda nada en ninguna base de datos**.

**Detalles de implementación:**
- Mensajes de error y de confirmación traducidos.
- `POST /api/contact`. Las páginas `/es/colabora` y `/en/collaborate` siguen siendo estáticas y el widget de Turnstile se carga en el cliente.
- **Correo del dominio:** dominio verificado en Resend, con SPF, DKIM y DMARC (de `p=none` para observar a `quarantine`) en el DNS de Vercel. DMARC además impide que otros envíen correo falso en nombre de la marca.
- **Variables de entorno, validadas al arrancar** (si falta una, falla de inmediato):
  - `RESEND_API_KEY`: clave limitada a solo enviar y solo desde este dominio;
  - `TURNSTILE_SECRET_KEY`, solo en el servidor;
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- **Preview y CI** usan las claves de prueba de Turnstile y el destinatario `delivered@resend.dev`, para no enviar correos reales.
- **Las claves las creas e introduces tú.** Yo no introduzco claves de API.
- **Límite conocido:** no hay límite de envíos por IP. Turnstile es la barrera principal. Añadir un límite con Upstash si aparece spam.
- **Página de privacidad en los dos idiomas:** texto RGPD (responsable, finalidad, base legal, Resend como encargado del tratamiento en EE. UU. y derechos). **Borrador para que Sofi lo valide; no es asesoría legal.**

### 0.12 Cabeceras de seguridad y rendimiento · ~60k
- **Cabeceras:** CSP completa (ADR), `Permissions-Policy` (cámara, micrófono y geolocalización desactivados), `Cross-Origin-Opener-Policy: same-origin` y comprobación de HSTS. Se comprueban en E2E.
- **Rendimiento:** medir primero la línea base con LHCI (**solo las puntuaciones, extraídas con `jq`**) y después optimizar:
  - cargar la escena después de `load` y cuando el navegador esté desocupado (`requestIdleCallback`);
  - menos partículas en dispositivos modestos (`hardwareConcurrency` / `deviceMemory`);
  - revisar el tamaño de three.js con el analizador de bundles;
  - precargar solo la fuente de títulos.
- **Al terminar este paso, el gate de Lighthouse pasa a ser obligatorio.**
- **Analítica:** Vercel Web Analytics + Speed Insights. No usan cookies, así que no hace falta banner, y se sirven desde el mismo origen (compatible con la CSP).

### 0.13 Documentación · ~20k
- `README.md`: instalación con pnpm, scripts y arquitectura.
- `docs/adr/`:
  - 0001 monolito modular;
  - 0002 sin Docker;
  - 0003 repo público;
  - 0004 CSP sin nonces;
  - 0005 robots e IA;
  - 0006 exclusiones de cobertura;
  - 0007 pnpm;
  - 0008 estrategia de i18n.
- `docs/standards.md` y `docs/progress.md`.
- Una sección del proyecto en `AGENTS.md`, fuera de los marcadores que regenera Next.

**PRs previstas:** 0.0–0.5 · 0.6–0.7 · 0.8–0.10 · 0.12–0.13 (alineadas con las sesiones S1–S4). 0.11 solo si se confirma.

---

# Fase 1 · Panel de administración (CMS propio) — Sofi como única superadmin

> **SUSTITUIDA el 2026-10-09 por ADR-0007 (`docs/adr/0007-notion-como-cms.md`):** Notion es el CMS y el panel de Sofi; un webhook dispara el build en Vercel. No se implementa Supabase ni el panel propio. Esta sección se conserva como historial.

## Qué resuelve
Sofi gestiona las páginas sin depender de un desarrollador:
- crear, editar, publicar, despublicar y borrar páginas;
- **tipos de página fijos**, cada uno con su plantilla (un componente reutilizable) y su estructura de datos;
- textos en **Markdown**, para que pueda generarlos ya formateados con IA;
- la versión EN es **opcional por página**;
- **categorías gestionables:** parte de sus temas de vídeo actuales y puede crear, renombrar, reordenar y borrar los suyos.

**Sin integración con Notion en tiempo de ejecución.** La app no depende de Notion ni de ningún token suyo.

Durante el desarrollo, **yo extraigo una sola vez** la estructura actual de su Notion (con el MCP, desde un subagente) y la convierto en el ***seed*** de la base de datos (los datos iniciales). Desde ahí, **Supabase es la única fuente de verdad** y Sofi decide todo desde el panel.

## Arquitectura (encaja en la hexagonal de la fase 0)
- **Puerto existente** `ContentRepository` → nuevo adaptador `SupabaseContentRepository`. Las rutas públicas **no cambian**: ese es el beneficio de haber creado el puerto en el paso 0.5.
- **Puerto nuevo:** `MediaStorage` → Supabase Storage.
- **Base de datos** (migraciones versionadas en `supabase/migrations/`, tipos generados con `supabase gen types`):
  - `sections` + `section_translations`: las tarjetas del menú (`position`; `slug`, `title`, `intro_md` por idioma). Se pueden editar y reordenar. Se pueden crear nuevas: **el menú pinta las que existan**, así que la UI de tarjetas se adapta sola.
  - `categories` + `category_translations`: los temas de sus vídeos.
    - Cada categoría pertenece a una sección (`section_id`) y tiene `position`, `slug` y `name` por idioma.
    - **CRUD completo para Sofi.**
  - `pages`: `id`, `type` (`article | gallery | hub`), `category_id`, `status` (`draft | published`), `published_at`, `updated_at`.
    - La sección se deduce de la categoría, así que no puede quedar incoherente.
  - **Integridad, para que borrar no rompa nada:** las claves foráneas usan `ON DELETE RESTRICT`.
    - No se puede borrar una categoría con páginas, ni una sección con categorías.
    - El panel lo explica y ofrece mover antes el contenido a otra categoría o sección, en lugar de borrarlo en cascada.
  - `slug_history`: guarda los slugs anteriores de páginas, categorías y secciones.
    - Si Sofi renombra algo ya publicado, la URL antigua redirige con 308 a la nueva (`permanentRedirect()` en la propia ruta, sin Proxy).
    - Así **no se pierde lo ganado en Google ni se rompen enlaces compartidos** en sus redes.
  - `page_translations`: `page_id`, `locale` (`es | en`), `slug`, `title`, `seo_description`, `body_md`, con `UNIQUE (locale, slug)` y comprobaciones de longitud.
    - **Sin fila EN significa que la página no existe en inglés**: no se genera su ruta EN ni su hreflang, lo que encaja con la regla de i18n de la fase 0.
  - `media`: `page_id`, `storage_path`, `width`, `height`, `alt_es`, `alt_en?`, `position`. El texto alternativo es **obligatorio**, por accesibilidad y por SEO de imágenes.
- **Validación única:** los esquemas zod de `src/domain` se usan en el formulario, en la Server Action y en la lectura. Además, la base de datos tiene sus propias restricciones, que son la última barrera.

## Seguridad (la superficie de ataque crece mucho: es lo más importante de esta fase)
- **Autenticación con Supabase Auth:**
  - **registro público desactivado**; la cuenta de Sofi se crea a mano;
  - **segundo factor TOTP obligatorio** (una app de códigos tipo Google Authenticator);
  - **Turnstile en el login** (Supabase lo soporta de forma nativa);
  - SMTP propio con **Resend**, porque el SMTP por defecto de Supabase permite muy pocos correos por hora.
- **Autorización en la base de datos con RLS** (*Row Level Security*: reglas que Postgres aplica a cada fila, también si alguien llama a la API saltándose la web):
  - el rol anónimo **solo puede leer** las páginas `published` y sus traducciones y medios;
  - escribir solo puede `auth.uid()` = el id de Sofi, guardado en una tabla `admins`;
  - lo mismo en `storage.objects`: lectura pública del bucket de medios y escritura solo para la admin.
  - **Tests de integración específicos** comprueban que un usuario anónimo **no** puede escribir ni leer borradores.
- **La clave `service_role` nunca llega al navegador.**
  - El panel usa la sesión de Sofi + RLS.
  - Esa clave solo la usa el CI para las migraciones.
- **Markdown → HTML en el servidor** con `react-markdown` + `rehype-sanitize`:
  - **sin HTML crudo**;
  - enlaces externos con `rel="noopener noreferrer"`;
  - los encabezados del Markdown empiezan en `h2`, porque el `h1` es el título de la plantilla.
  - **Motivo:** si alguien robara la cuenta de Sofi, sin sanear podría inyectar scripts en la web pública (XSS almacenado), y la CSP con `'unsafe-inline'` no lo pararía.
- **Subida de imágenes:**
  - lista de tipos MIME permitidos (jpeg, png, webp, avif) comprobada también en el servidor;
  - tamaño máximo;
  - **conversión a WebP y redimensionado en el navegador antes de subir**, que ahorra almacenamiento y tráfico de salida;
  - eliminación de los datos EXIF, porque **las fotos de móvil pueden incluir la ubicación GPS de su casa**.
- **Sesión:** `@supabase/ssr` necesita refrescar las cookies en `proxy.ts`. El `matcher` se limita a `/admin/:path*` para que **el Proxy no se ejecute en las páginas públicas**.

## Renderizado (cómo cambia el requisito de «prerenderizar todo»)
Hoy todo se genera en el build. Con un panel, el contenido cambia sin hacer un build nuevo, así que:
- **Las páginas públicas siguen sirviéndose como HTML estático completo.**
  - Se generan en el build a partir de la base de datos (`generateStaticParams`).
  - Las nuevas se generan en su primera visita y quedan guardadas (`dynamicParams = true` en las rutas de contenido).
- **Al publicar**, la Server Action llama a `updateTag('page:<id>')`, `updateTag('sitemap')` y a la etiqueta de la sección: Sofi ve el cambio al momento.
  - Desde fuera de una Server Action se usaría `revalidateTag(tag, 'max')`, que es la firma de Next 16.
- **Sigue cumpliendo el requisito de SEO:** los bots reciben siempre el HTML completo, nunca un esqueleto vacío.
  - **Lo que cambia respecto a la fase 0:** `dynamic = "error"` se mantiene en las páginas fijas, pero las de contenido pasan a revalidación bajo demanda.
- **`/admin` es dinámico por naturaleza:** usa autenticación y cookies. Queda **fuera** del gate de Lighthouse ≥ 85 (que pasa a ser «todas las rutas **públicas**»), aunque sí se le aplican los tests de accesibilidad.
- **Robustez extra:** si Supabase cae, las páginas públicas ya generadas se siguen sirviendo desde la caché. Solo fallan el panel y las páginas nuevas sin visitar.

## Plantillas (componentes reutilizables en `src/ui/templates/`)
| Tipo | Uso | Contenido |
|---|---|---|
| `article` | Lore, personajes, clanes, saga | Markdown + vídeo de TikTok/Instagram (miniatura que carga el reproductor al hacer clic) + fuentes + relacionados |
| `gallery` | Colección, vida fan | Introducción en Markdown (obligatoria, para que la página no quede sin texto) + galería con texto alternativo, orden manual y visor ampliado accesible |
| `hub` | Índice de cada sección | Introducción + listado automático de sus páginas |

## Pasos
| Paso | Contenido | Est. |
|---|---|---|
| 1.0 | Proyecto de Supabase (**coste a confirmar contigo** antes de crearlo), CLI local con Docker, primera migración y tipos generados | ~30k |
| 1.1 | Esquema + RLS + bucket + **tests de integración de RLS** en el CI (Supabase local) | ~45k |
| 1.2 | `SupabaseContentRepository` + revalidación por etiquetas + ***seed* inicial** (abajo) | ~45k |
| 1.3 | Auth: login con TOTP + Turnstile, SMTP con Resend, `proxy.ts` limitado a `/admin` | ~55k |
| 1.4 | CRUD de páginas: listado, crear, editar y publicar/despublicar, con borradores y vista previa (`draftMode`) | ~65k |
| 1.5 | Editor Markdown con vista previa (el mismo renderizador que la web pública, sin editor pesado) + ES/EN opcional | ~45k |
| 1.6 | CRUD de secciones y categorías: crear, renombrar con redirección automática, reordenar y borrado protegido con opción de mover el contenido | ~45k |
| 1.7 | Galería: subida con redimensionado y sin EXIF, orden, texto alternativo ES/EN y borrado (también del archivo en Storage) | ~55k |
| 1.8 | E2E del flujo completo de Sofi + ADR + guía de uso del panel para ella | ~45k |

### *Seed* inicial (extraído una sola vez de Notion en el paso 1.2)
Archivo versionado en `supabase/seed.sql`, generado a partir de un JSON intermedio y revisado en el PR. **Contenido:**
- **6 secciones** (Pandora, Personajes, Clanes y culturas, La saga, Colección, Vida fan), con los textos de la fase 0 en ES y EN.
- **Sus 11 temas de vídeo como categorías**, cada uno asignado a su sección:

  | Sección | Categorías |
  |---|---|
  | Pandora | Lore de Pandora · Naturaleza y Pandora · Datos duros |
  | Personajes | Personajes y arcos |
  | Clanes y culturas | Clanes y culturas |
  | La saga | Detrás de cámaras · Teorías Avatar 4 y 5 · Reacción a noticias |
  | Colección | Merchandising |
  | Vida fan | Mi historia con Avatar · Avatar fan |

  Los nombres EN los redacto yo y los revisa Sofi.
- **Artículos en borrador**, uno por cada vídeo **ya publicado** ("Colgado"/"Publicado" en Notion). Por ejemplo: 5 cosas de Neytiri, Lo'ak, Varang y Tsireya; ¿Por qué los Na'vi son azules?; ¿Eywa está basada en el budismo?; La ciencia real de Avatar…
  - Llevan el texto del cuerpo de la página de Notion convertido a Markdown, con sus **fuentes**.
  - Las fichas sin texto llevan solo el título.
- **Una galería en borrador** en Colección, con una introducción basada en su lista de colección. Las fotos las sube ella.

**Qué NO entra en el *seed*:**
- las **ideas sin publicar** ("Sin empezar"): son su planificación privada y no deben salir de Notion;
- sus metas de seguidores;
- las fotos de Notion: sus URLs firmadas caducan y no son nuestras.

**Todo entra como `draft`.** Nada se publica sin que Sofi lo revise.

---

## Viabilidad del panel (valoración honesta)
**Es viable:** Next + Supabase es una combinación muy probada, y la fase 0 ya deja los puertos donde encaja.

**Riesgos y costes reales:**
1. **Superficie de ataque:** pasamos de un sitio estático a una aplicación con login, base de datos y subida de archivos. Es manejable con lo descrito arriba, pero es el principal coste en mantenimiento.
2. **Supabase Free:**
   - **pausa los proyectos tras una semana sin actividad**;
   - **no incluye copias de seguridad automáticas**;
   - el tráfico de salida (que incluye servir las imágenes) es limitado.

   **Lo que recomiendo, porque la robustez va primero:** plan Pro (~25 $/mes) cuando haya contenido real. Mientras tanto, una copia semanal con `pg_dump` desde GitHub Actions a un almacenamiento privado.
3. **Imágenes y Lighthouse:** se sirven optimizadas con `next/image`. El plan Hobby de Vercel tiene un cupo de optimizaciones; si se supera, se sirven ya pregeneradas desde la subida.
4. **Esfuerzo:** son unas 4 sesiones más (S5–S8). La parte que más iteraciones va a necesitar es la experiencia del editor para Sofi, y eso solo se valida con ella usándolo.
5. **El *seed* es una foto fija:** lo que Sofi cambie después en Notion no llega a la web. Es lo que se ha decidido: a partir de ahí, el panel es su herramienta de publicación.

---

## Acciones manuales (no las puedo hacer yo)
- **Tú:**
  - generar y guardar como secretos: `SONAR_TOKEN` (fase 0) y, en la fase 1, las claves de Supabase, Resend y Turnstile;
  - crear las cuentas de Resend y Turnstile (fase 1);
  - activar los Deployment Checks en Vercel;
  - aprobar el coste de Supabase antes de que cree el proyecto.
- **Sofi (fase 1):**
  - configurar el segundo factor (TOTP) en su primer inicio de sesión;
  - revisar y publicar los borradores del *seed*.
- **Sofi:**
  - verificar Search Console con su cuenta y darte acceso;
  - aprobar los textos en ES y EN, la privacidad (con sus datos de responsable) y la política de bots de IA;
  - confirmar sus perfiles exactos y cuánta identidad real aparece en el JSON-LD.

## Verificación de punta a punta
1. **En local:** `pnpm lint && pnpm typecheck && pnpm test:coverage` (≥ 85 %) `&& pnpm e2e && pnpm lhci`.
2. **En el PR:** todos los checks en verde, quality gate de Sonar aprobado y preview en Vercel.
3. **En producción** (`sophisnavi.com`):
   - `curl -I` para comprobar las cabeceras y las redirecciones (`/` → `/es`, desde `vercel.app` y desde `www`);
   - el HTML crudo de cada ruta en los dos idiomas contiene el menú, el canonical, los hreflang recíprocos y el `x-default`;
   - `/robots.txt` y `/sitemap.xml` son válidos (con las alternativas de idioma);
   - pruebas manuales: Rich Results Test de Google, depurador de Open Graph (ES y EN) e informe de hreflang/sitemap en Search Console;
   - el formulario funciona con las claves de prueba en preview y con un envío real en producción.
4. **Lighthouse móvil ≥ 85** en las cuatro categorías para **todas** las rutas de los dos idiomas, revisado en el informe del CI y en Chromium.
