# Textos de las imágenes de vista previa (`opengraph-image`, paso 0.9)

> **Estado: BORRADOR pendiente de la aprobación de Sofi.**
> Una imagen de 1200×630 por ruta e idioma, generada en el build con `ImageResponse` de `next/og` y la fuente Marcellus local. Este documento fija **solo el texto** que va dentro de cada imagen y su texto alternativo; el diseño visual se decide en el paso 0.9.

## Reglas de redacción

| Campo | Uso | Límite | Motivo |
|---|---|---|---|
| `headline` | Texto grande de la imagen | ≤ 32 caracteres, 1 línea | A 1200×630 cabe en una línea con Marcellus a ~88 px; dos líneas obligan a reducir el cuerpo y pierde legibilidad en la miniatura de WhatsApp/X |
| `kicker` | Línea pequeña sobre el titular | ≤ 40 caracteres | Da contexto sin competir con el titular |
| `brand` | Pie fijo | `sophisnavi.com` | Igual en todas las imágenes; sin `www` para que se lea como marca |
| `alt` | `openGraph.images[].alt` y `twitter.images[].alt` | ≤ 125 caracteres, describe lo que se ve, no repite el título de la página | Lectores de pantalla y accesibilidad de Twitter/X |

El `alt` describe la imagen como objeto ("Tarjeta con el texto…") porque la imagen **es** texto sobre fondo; no describe la página. Si en el diseño final se añade una ilustración (por ejemplo, el Árbol de las Almas de la intro), se añade al `alt` al final: "…sobre una silueta del Árbol de las Almas".

---

## Portada · `/es` · `/en`

| | ES | EN |
|---|---|---|
| kicker | Fan de Avatar desde 2009 | Avatar fan since 2009 |
| headline | sophisnavi | sophisnavi |
| brand | sophisnavi.com | sophisnavi.com |
| alt | Tarjeta de sophisnavi, portal en español sobre Avatar: fan desde 2009, coleccionista | Card for sophisnavi, a Spanish Avatar fan site: fan since 2009, collector |

## Pandora · `/es/pandora` · `/en/pandora`

| | ES | EN |
|---|---|---|
| kicker | Lore, naturaleza y datos duros | Lore, nature and hard facts |
| headline | Pandora | Pandora |
| alt | Tarjeta de la sección Pandora de sophisnavi: lore, naturaleza y datos duros de la luna de Avatar | Card for the Pandora section of sophisnavi: lore, nature and hard facts about Avatar's moon |

## Personajes · `/es/personajes` · `/en/characters`

| | ES | EN |
|---|---|---|
| kicker | Arcos, decisiones y detalles | Arcs, choices and details |
| headline | Personajes | Characters |
| alt | Tarjeta de la sección Personajes de sophisnavi: arcos y detalles de los protagonistas de Avatar | Card for the Characters section of sophisnavi: arcs and details of Avatar's characters |

## Clanes y culturas · `/es/clanes` · `/en/clans`

| | ES | EN |
|---|---|---|
| kicker | Omatikaya, Metkayina, Mangkwan… | Omatikaya, Metkayina, Mangkwan… |
| headline | Clanes y culturas | Clans & Cultures |
| alt | Tarjeta de la sección Clanes y culturas de sophisnavi: los pueblos na'vi y su forma de vivir | Card for the Clans & Cultures section of sophisnavi: the Na'vi peoples and how they live |

## La saga · `/es/saga` · `/en/saga`

| | ES | EN |
|---|---|---|
| kicker | Detrás de cámaras, noticias y teorías | Behind the scenes, news and theories |
| headline | La saga | The Saga |
| alt | Tarjeta de la sección La saga de sophisnavi: rodaje, noticias comentadas y teorías sobre Avatar 4 y 5 | Card for The Saga section of sophisnavi: production, news with context and Avatar 4 and 5 theories |

## Colección · `/es/coleccion` · `/en/collection`

| | ES | EN |
|---|---|---|
| kicker | Figuras, libros, ediciones y más | Figures, books, editions and more |
| headline | Colección | Collection |
| alt | Tarjeta de la sección Colección de sophisnavi: figuras, libros de arte y ediciones de Avatar | Card for the Collection section of sophisnavi: Avatar figures, art books and physical editions |

## Vida fan · `/es/vida-fan` · `/en/fan-life`

| | ES | EN |
|---|---|---|
| kicker | Mi historia con Avatar y la comunidad | My Avatar story and the community |
| headline | Vida fan | Fan Life |
| alt | Tarjeta de la sección Vida fan de sophisnavi: la historia de Sofi con Avatar y la comunidad | Card for the Fan Life section of sophisnavi: Sofi's story with Avatar and the fan community |

## Enlaces · `/es/links` · `/en/links`

| | ES | EN |
|---|---|---|
| kicker | TikTok · Instagram · YouTube · Pinterest | TikTok · Instagram · YouTube · Pinterest |
| headline | Mis redes | My links |
| alt | Tarjeta de enlaces de sophisnavi con sus perfiles de TikTok, Instagram, YouTube y Pinterest | Links card for sophisnavi with her TikTok, Instagram, YouTube and Pinterest profiles |

---

## Longitudes (comprobadas)

| Ruta | headline ES | headline EN | alt ES | alt EN |
|---|---|---|---|---|
| portada | 10 | 10 | 84 | 73 |
| pandora | 7 | 7 | 96 | 91 |
| personajes | 10 | 10 | 95 | 86 |
| clanes | 17 | 16 | 92 | 88 |
| saga | 7 | 8 | 101 | 98 |
| coleccion | 9 | 10 | 92 | 94 |
| vida-fan | 8 | 8 | 91 | 91 |
| links | 9 | 8 | 91 | 84 |

Todos los `headline` ≤ 32 y todos los `alt` ≤ 125.

## Datos para `buildMetadata` (JSON listo para `src/application/seo/`)

```json
{
  "es": {
    "home":       { "kicker": "Fan de Avatar desde 2009", "headline": "sophisnavi", "alt": "Tarjeta de sophisnavi, portal en español sobre Avatar: fan desde 2009, coleccionista" },
    "pandora":    { "kicker": "Lore, naturaleza y datos duros", "headline": "Pandora", "alt": "Tarjeta de la sección Pandora de sophisnavi: lore, naturaleza y datos duros de la luna de Avatar" },
    "personajes": { "kicker": "Arcos, decisiones y detalles", "headline": "Personajes", "alt": "Tarjeta de la sección Personajes de sophisnavi: arcos y detalles de los protagonistas de Avatar" },
    "clanes":     { "kicker": "Omatikaya, Metkayina, Mangkwan…", "headline": "Clanes y culturas", "alt": "Tarjeta de la sección Clanes y culturas de sophisnavi: los pueblos na'vi y su forma de vivir" },
    "saga":       { "kicker": "Detrás de cámaras, noticias y teorías", "headline": "La saga", "alt": "Tarjeta de la sección La saga de sophisnavi: rodaje, noticias comentadas y teorías sobre Avatar 4 y 5" },
    "coleccion":  { "kicker": "Figuras, libros, ediciones y más", "headline": "Colección", "alt": "Tarjeta de la sección Colección de sophisnavi: figuras, libros de arte y ediciones de Avatar" },
    "vida-fan":   { "kicker": "Mi historia con Avatar y la comunidad", "headline": "Vida fan", "alt": "Tarjeta de la sección Vida fan de sophisnavi: la historia de Sofi con Avatar y la comunidad" },
    "links":      { "kicker": "TikTok · Instagram · YouTube · Pinterest", "headline": "Mis redes", "alt": "Tarjeta de enlaces de sophisnavi con sus perfiles de TikTok, Instagram, YouTube y Pinterest" }
  },
  "en": {
    "home":       { "kicker": "Avatar fan since 2009", "headline": "sophisnavi", "alt": "Card for sophisnavi, a Spanish Avatar fan site: fan since 2009, collector" },
    "pandora":    { "kicker": "Lore, nature and hard facts", "headline": "Pandora", "alt": "Card for the Pandora section of sophisnavi: lore, nature and hard facts about Avatar's moon" },
    "characters": { "kicker": "Arcs, choices and details", "headline": "Characters", "alt": "Card for the Characters section of sophisnavi: arcs and details of Avatar's characters" },
    "clans":      { "kicker": "Omatikaya, Metkayina, Mangkwan…", "headline": "Clans & Cultures", "alt": "Card for the Clans & Cultures section of sophisnavi: the Na'vi peoples and how they live" },
    "saga":       { "kicker": "Behind the scenes, news and theories", "headline": "The Saga", "alt": "Card for The Saga section of sophisnavi: production, news with context and Avatar 4 and 5 theories" },
    "collection": { "kicker": "Figures, books, editions and more", "headline": "Collection", "alt": "Card for the Collection section of sophisnavi: Avatar figures, art books and physical editions" },
    "fan-life":   { "kicker": "My Avatar story and the community", "headline": "Fan Life", "alt": "Card for the Fan Life section of sophisnavi: Sofi's story with Avatar and the fan community" },
    "links":      { "kicker": "TikTok · Instagram · YouTube · Pinterest", "headline": "My links", "alt": "Links card for sophisnavi with her TikTok, Instagram, YouTube and Pinterest profiles" }
  },
  "brand": "sophisnavi.com"
}
```

## Checklist para Sofi

- [ ] ¿El titular de la portada debe ser `sophisnavi` o prefieres tu nombre, "Sofi"?
- [ ] "Mis redes" / "My links" para la tarjeta de enlaces, ¿o "Sígueme" / "Follow me"?
- [ ] Si quieres una ilustración de fondo en las tarjetas (p. ej. el Árbol de las Almas), dilo y se añade al `alt`.
