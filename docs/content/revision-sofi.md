# Guía de revisión para Sofi

Hola, Sofi. Esta página reúne en un solo sitio todo lo que necesitamos que mires antes de que la web salga con contenido. Está pensada para leerse en diez minutos. Cada punto dice **qué hay que decidir**, **qué hemos puesto de momento** y **dónde está** el texto completo si quieres leerlo entero.

Regla general: **nada se publica sin tu visto bueno.** Todo lo que hay ahora son borradores. Si una frase no la dirías tú, márcala y la cambiamos; no hace falta que propongas la alternativa.

Cómo responder: con una lista de puntos numerados como los de abajo (por ejemplo, "1: ok · 2: cambiar 'Datos duros' por…"). Vale un mensaje de WhatsApp o un correo.

---

## 1. Los textos de las seis secciones (lo más importante)

Cada sección de la web (Pandora, Personajes, Clanes y culturas, La saga, Colección, Vida fan) abre con un texto de unas 200 palabras, en español y en inglés. Están escritos en primera persona, como si los dijeras tú.

- **Qué decidir:** si el tono te representa y si hay algún dato que no quieras que aparezca.
- **Qué hemos puesto:** fan desde 2009, coleccionista, citas a las películas, a los libros oficiales y a la Pandorapedia; separación clara entre lo que es canon y lo que es teoría.
- **Dónde:** `docs/content/sections.md`, apartados 1 a 6.

Dos datos salen de tu bio de Linktree y conviene confirmarlos:
- [ ] "Fan de Avatar desde 2009".
- [ ] "Coleccionista".

Y una frase que compromete:
- [ ] En Colección decimos "aquí no hay enlaces de afiliado escondidos". Si algún día usas enlaces de afiliado, se cambia antes.

## 2. Los nombres en inglés de tus once temas

Tus temas de vídeo de Notion pasan a ser las categorías de la web. El nombre en español es el tuyo; el inglés es propuesta nuestra.

| Tu tema (Notion) | Propuesta EN |
|---|---|
| Lore de Pandora | Pandora Lore |
| Naturaleza y Pandora | Nature & Wildlife |
| Datos duros | Hard Facts |
| Personajes y arcos | Characters & Arcs |
| Clanes y culturas | Clans & Cultures |
| Detrás de cámaras | Behind the Scenes |
| Teorías Avatar 4 y 5 | Avatar 4 & 5 Theories |
| Reacción a noticias | News Reactions |
| Merchandising | Merchandise |
| Mi historia con Avatar | My Avatar Story |
| Avatar fan | Avatar Fan |

- [ ] ¿Alguno te chirría? Los dos menos literales son "Hard Facts" y "Nature & Wildlife".

## 3. Tus vídeos ya publicados, como borradores de artículo

Hemos sacado de tu Notion **solo los vídeos marcados como colgados o publicados** (ocho). Cada uno será un artículo en borrador con el texto de tu ficha. Cuatro fichas estaban en blanco, así que esos artículos solo tienen el título.

| Artículo | Tiene texto |
|---|---|
| 5 cosas de Neytiri que probablemente no sabías | Sí, con fuentes |
| 5 cosas de Lo'ak que probablemente no sabías | Sí, con fuentes |
| ¿Eywa está basada en el budismo? | Sí, con fuentes |
| 5 cosas de Varang que probablemente no sabías | Sí |
| Por qué los Na'vi son azules? | Solo el gancho |
| POV: la obsesión de tu infancia nunca ha desaparecido | No |
| Cosas que todo fan de Avatar debería tener | No |
| Agradecimiento vídeo viral | No |

Lo que **no** hemos tocado, a propósito: tus ideas sin publicar, tus metas de seguidores y las fotos de Notion.

- [ ] ¿Falta o sobra alguno?
- [ ] Los tres últimos son más de red social que de web. ¿Quieres que existan como artículos o los quitamos del arranque?
- [ ] Cuando la web esté lista, podrás editar o borrar cualquiera desde tu panel; no hace falta que decidas ahora el texto.

## 4. La galería de tu colección

Hemos escrito un párrafo de introducción a partir de tu lista de colección, sin copiar objetos ni cantidades: ediciones físicas de las películas, videojuegos, libros de arte, cómics, bandas sonoras, figuras (Mattel, McFarlane, Funko, Lego), objetos de cine y ropa de marcas de fans. Las fotos las subirás tú.

- [ ] ¿Hay algo que prefieras no mencionar?
- **Dónde:** `data/seed/notion-snapshot.json`, campo `collection_intro_notes`.

## 5. Tus redes

Las hemos sacado de tu Linktree. Son las que aparecerán en la página "Mis redes" y las que le diremos a Google que son tuyas.

| Red | Enlace |
|---|---|
| TikTok | https://www.tiktok.com/@sophisnavi |
| Instagram | https://www.instagram.com/sophisnavi |
| YouTube | https://www.youtube.com/@sophisnavi |
| Pinterest | https://es.pinterest.com/sophisnavi/ |

- [ ] ¿Son correctas las cuatro? Pinterest la hemos incluido; si prefieres dejarla fuera, dilo.
- [ ] El texto de la página "Mis redes" (en `docs/content/sections.md`, apartado `/links`) remite a mensaje directo de Instagram o TikTok para colaboraciones. ¿Te vale así de momento?

## 6. Inteligencias artificiales y tus textos

Cuando una IA (ChatGPT, Claude, Perplexity, Gemini…) lee una web, puede hacerlo por dos motivos: para **buscar y citarte** cuando alguien le pregunta por Avatar, o para **entrenarse** con tus textos sin devolverte nada.

- **Qué hemos puesto:** permitir que te busquen y te citen; **no** permitir que se entrenen con tus textos.
- [ ] ¿De acuerdo? Si prefieres permitir también el entrenamiento, o bloquearlo todo, se cambia en un minuto.
- Importante saberlo: esto es una petición educada que los bots serios respetan, no un muro. Si algún día hace falta un bloqueo real, se hace por otra vía.

## 7. Las tarjetas que salen al compartir un enlace

Cuando alguien comparte una página tuya en WhatsApp, X o Instagram aparece una tarjeta con una imagen. Hemos preparado el texto que irá dentro de esas imágenes.

- [ ] En la portada pone **sophisnavi**. ¿O prefieres "Sofi"?
- [ ] La de tus redes pone **Mis redes / My links**. ¿O "Sígueme / Follow me"?
- [ ] ¿Quieres una ilustración de fondo (por ejemplo, el Árbol de las Almas) o solo texto?
- **Dónde:** `docs/content/og-images.md`.

## 8. Un dato que nos faltaba

- [ ] Tu nombre tal como quieres que aparezca cuando la web diga quién la hace: "Sofi", "Sofía", nombre y apellido, o solo "sophisnavi".

---

Gracias. Cuando contestes, aplicamos los cambios, los subimos y te avisamos para que lo veas ya en la web.
