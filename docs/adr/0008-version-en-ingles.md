---
llm-load-when: "Al añadir la versión en inglés, tocar el idioma de las rutas, hreflang, el sitemap o la traducción del contenido de Notion."
---

# ADR-0008 · Versión en inglés: traducción automática en el build y rutas `/en`

- **Status:** proposed (SOPHIE-6, investigación; nada implementado)
- **Modifica:** la sección «i18n» de `docs/plan.md` (estructura de URLs; el resto se mantiene).
- **Date:** 2026-10-21

## Context

La web está solo en español. ADR-0007 dejó la versión EN fuera de alcance. Hoy:

- **Contenido de Notion** (bienvenida, intros de sección y artículos): se descarga en el build como Markdown
  (`GET /pages/{id}/markdown`) y se guarda en `data/content/content.json`. Todo se prerenderiza (HTML estático), que es lo
  que importa para el SEO.
- **Textos fijos de la interfaz**: repartidos por unos 25 componentes («Saltar intro», «Volver a…», «Personaje anterior»,
  migas de pan…), más los títulos y descripciones de las seis secciones en `src/domain/content.ts`.
- **SEO**: `LOCALE = "es"`, `<html lang="es">`, hreflang solo `es` + `x-default`, fechas con `Intl` en `es-ES`, `inLanguage`
  en el JSON-LD, tarjetas Open Graph con texto en español.
- **Slugs**: en español y derivados del título o de la columna `Slug` de Notion.

La tarea plantea dos preguntas: ¿hay que duplicar las páginas de Notion en inglés, o se puede poner un traductor entre la
API de Notion y el frontend? Y exige conservar el prerenderizado.

## Hallazgos

1. **Notion no traduce por API.** No hay endpoint de traducción. La traducción de Notion AI solo existe en la app, y los
   conectores de terceros (Crowdin, Phrase, `notion-translator` sobre DeepL) escriben páginas traducidas de vuelta en
   Notion, con límites conocidos: no sincronizan imágenes y se saltan tablas.
2. **El punto natural para traducir ya existe: `scripts/notion-pull.ts`.** Ya recibe cada página como Markdown limpio. Si
   traduce ahí, el resultado se guarda en el snapshot y la web sigue siendo HTML estático: **el SSR/SSG no se ve afectado**.
   Traducir en tiempo de ejecución (en cada visita) no tiene sentido: sería más lento, más caro y peor para el SEO.
3. **Motores de traducción:**
   - **DeepL API**: el plan Free da 500.000 caracteres al mes, pero solo entiende HTML/XML (`tag_handling`), no Markdown.
     Habría que pasar de Markdown a HTML y vuelta, y los bloques propios (vídeos, rejillas de imágenes, citas) corren
     riesgo.
   - **Claude (Messages API)**: traduce Markdown conservando la estructura, y se le puede dar un glosario: términos na'vi
     sin traducir («Kaltxì», «Eywa ngahu», «Irayo»), nombres propios y el tono de Sofi. Con `claude-opus-5-5`
     ($4 / $20 por millón de tokens de entrada / salida):
     - un artículo de unos 6.000 caracteres son unos 2.000 tokens de entrada y otros tantos de salida, menos de 0,10 $
       por artículo;
     - traducir todo el contenido actual (unas decenas de artículos) cuesta unos pocos dólares una sola vez;
     - cada build solo retraduce lo que haya cambiado (ver 4).
4. **Caché por contenido.** Hay que guardar la traducción junto a un hash del Markdown original
   (`data/content/content.en.json`). Así un build solo llama a la API para las páginas nuevas o editadas. Si la API falla,
   se conserva la traducción anterior: no puede romper el build, a diferencia de Notion (ADR-0007 §4).
5. **Rutas en Next 16** (guía `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`): el patrón oficial
   es `app/[lang]/…` con `generateStaticParams`, más `next/root-params` para leer el idioma en cualquier componente de
   servidor y diccionarios JSON para los textos fijos (solo en servidor, no pesan en el bundle). La guía redirige según
   `Accept-Language` desde `proxy.ts`, pero aquí no conviene: los buscadores rastrean sin esa cabecera y cada idioma
   necesita su URL estable.

## Decision (propuesta)

1. **Traducción automática en el build, con revisión opcional en Notion.**
   - `notion-pull` traduce al inglés cada página publicada con Claude, con glosario y caché por hash.
   - Las correcciones van por los tres niveles de la decisión 6.
   - Una columna **`Slug EN`** permite fijar la URL inglesa. Si está vacía, se genera una vez a partir del título traducido
     y se congela en el snapshot, para que una retraducción no cambie la URL.
   - Respuesta a las dos preguntas: **no hace falta duplicar las páginas de Notion**, y **sí se puede poner un traductor
     intermedio**. Va en el build, no entre la API y el navegador.
2. **URLs: el español se queda donde está y el inglés va bajo `/en`, con slugs traducidos.** Por ejemplo
   `/personajes/los-sully` y `/en/characters/the-sullys`.
   - **Esto cambia lo que decía `docs/plan.md`** (`/es` y `/en`, con `/` → 308 a `/es`). El plan descartaba el español
     sin prefijo porque el rewrite necesita una expresión que excluya `_next`, `api` y las rutas de metadatos. Pero el
     plan es anterior al lanzamiento.
   - Hoy las URLs sin prefijo están publicadas e indexadas. Pasarlas a `/es` exige un 308 general con **esa misma
     expresión de exclusiones**, así que la fragilidad no desaparece, y además hay una migración de SEO (todas las URLs
     cambian a la vez). Con el español sin prefijo, la expresión solo vive en un rewrite y ninguna URL cambia.
   - Implementación:
     - el árbol pasa a `app/[lang]/…` con `generateStaticParams` + `dynamicParams = false`, como en el plan;
     - un `rewrites` en `next.config.ts` sirve las rutas sin prefijo desde `es`. Es estático, sin `proxy.ts` y sin
       función por petición;
     - `/es/...` lleva 308 a la URL sin prefijo, para que no haya contenido duplicado;
     - un test recorre las rutas de metadatos (`/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/api/...`) para fijar
       las exclusiones.
   - Las páginas siguen siendo estáticas.
3. **Textos fijos** como ya preveía el plan:
   - diccionarios tipados `src/infrastructure/i18n/{es,en}.json` con `hasLocale` + `getDictionary` y
     `next/root-params`;
   - un test que falla si las claves no coinciden;
   - sin librería externa.

   Las secciones (`SECTIONS`) llevan título, descripción y slug por idioma.
4. **SEO por idioma**:
   - `<html lang>` según la ruta;
   - hreflang recíproco `es` / `en` / `x-default` (→ español) en metadatos y sitemap;
   - `og:locale` y `og:locale:alternate`;
   - `inLanguage` en el JSON-LD;
   - fechas con `Intl` del idioma;
   - tarjetas Open Graph con el texto traducido.
5. **Selector de idioma visible** en la barra superior (ES / EN), que enlaza a la misma página en el otro idioma.
   - **Sin redirección automática** por idioma del navegador, como en el plan. Sí el aviso discreto «This page is
     available in English».
   - Canonical de cada versión a sí misma.
   - **Nunca páginas EN a medias:** si una página no tiene traducción (todavía, o porque falló la API en su primer
     build), no se genera su ruta EN ni su hreflang.

6. **Corregir una traducción: tres niveles, de menos a más control.**
   1. **Glosario** (un término mal traducido en toda la web, p. ej. «tulkun» como «whale»).
      - Vive en una página «Glosario EN» de Notion y se pasa al traductor en cada llamada.
      - Su versión forma parte de la huella de cada traducción. Al cambiar una entrada, el siguiente build retraduce solo
        las páginas donde aparece el término.
   2. **`Notas EN`** (un matiz en una página concreta: un juego de palabras, el tono de un párrafo).
      - Columna corta de texto en la fila de Notion, con indicaciones para el traductor; también entra en la huella.
      - La página sigue siendo automática: si cambia el español, el inglés se actualiza solo. No garantiza una frase
        exacta.
   3. **Página hija «EN»** (texto exacto, palabra por palabra).
      - **Manda sobre el traductor:** si existe, el build usa su contenido tal cual y **no llama a la API para esa
        página** (cero tokens).
      - Es completa: el título de la página hija es el título en inglés y su primer párrafo, si empieza por
        «Descripción:», la descripción; si falta alguno, solo ese campo se traduce automáticamente (unas decenas de
        tokens).
      - Lleva solo texto: el build reutiliza las imágenes del artículo en español en el mismo orden (sin descargarlas
        otra vez) y toma sus textos alternativos de la página «EN» si los tiene; si no, se traducen.
      - **Si después cambia el español**, el inglés manual se mantiene: el build guarda la huella del español con la
        que se escribió la versión manual y, si ya no coincide, avisa en el log de que está desactualizada. No
        retraduce por su cuenta.
      - Si Sofi borra la página «EN», el artículo vuelve a la traducción automática en el siguiente build.
      - La integración de Notion sigue siendo de solo lectura (ADR-0007): el build no crea la página «EN». Sofi copia el
        texto desde la web en inglés y lo corrige.
   - Las correcciones se ven en el siguiente build (unos minutos), como cualquier cambio publicado.

## Consequences

- Sofi sigue escribiendo solo en español. El inglés aparece solo en el siguiente build, con calidad de traducción
  automática revisable.
- Nueva variable de servidor `ANTHROPIC_API_KEY` en Vercel (solo build). Sin ella, el build usa la traducción del snapshot
  versionado, igual que ahora con `NOTION_TOKEN`.
- El snapshot crece: `content.en.json`. Las imágenes no se duplican: son las mismas y solo cambia el `alt`.
- El webhook y el cron de ADR-0007 cubren ya las filas de la base de datos (artículos, `Notas EN`, `Slug EN`), pero no
  las páginas hijas «EN» ni el glosario, que no tienen columna `Estado`:
  - el webhook tiene que resolver la página padre de una página «EN» y decidir con su estado;
  - el glosario tiene que disparar siempre el despliegue;
  - la revisión diaria tiene que comparar también la última edición de esas páginas.
- Riesgos:
  - matices o juegos de palabras mal traducidos (lo mitigan los tres niveles de corrección);
  - una página «EN» manual que se queda atrás respecto al español (lo mitiga el aviso del build);
  - las URLs EN derivadas del título deben congelarse;
  - el cambio de rutas a `[lang]` toca todas las páginas y sus tests.

## Plan por fases

1. **Rutas e interfaz:**
   - `app/[lang]`, `rewrites` del español sin prefijo, diccionarios, `SECTIONS` por idioma;
   - hreflang, sitemap y selector de idioma;
   - EN solo para la portada y los índices de sección. Los textos fijos y las descripciones de sección los redacto yo y
     los revisa Sofi, como preveía el plan.
2. **Traducción en `notion-pull`:** Claude, glosario, caché por hash, `content.en.json`, `Slug EN`. Aparecen las rutas EN
   de bienvenida, intros y artículos.
3. **Correcciones:**
   - glosario y `Notas EN` en la huella;
   - páginas hijas «EN» con prioridad sobre el traductor y aviso de desactualización;
   - webhook y revisión diaria para páginas hijas y glosario;
   - un informe en el log del build con lo retraducido y lo desactualizado.

## Alternatives

- **Columna `Contenido EN` con el texto inglés completo:** era la primera idea de este ADR. Se descarta porque una
  propiedad de texto de Notion no admite títulos, imágenes ni bloques, y cada fragmento está limitado a 2.000 caracteres.
- **Duplicar cada página en Notion (columna `Idioma` + relación con la original):** control total, pero duplica el
  trabajo de Sofi y las dos versiones se desincronizan. Queda como posibilidad página a página (página hija «EN»).
- **Conector de traducción dentro de Notion (Crowdin, Phrase, `notion-translator`):** escribe páginas traducidas en
  Notion, que luego se descargarían como en la alternativa anterior. Añade otra herramienta de pago y tiene los límites
  citados con imágenes y tablas.
- **DeepL en lugar de Claude:** tiene cuota gratuita, pero obliga a convertir Markdown a HTML y vuelta, y no admite
  glosario de tono.
- **Traducir en tiempo de ejecución o en el navegador (widget tipo Weglot / Google Translate):** rápido de poner, pero
  sin HTML en inglés indexable, que es justo lo que pide la tarea.
- **Subdominio o dominio propio (`en.sophisnavi.com`):** separa el posicionamiento por idioma y exige otro dominio en
  Vercel. `/en` es más simple y comparte la autoridad del dominio.
