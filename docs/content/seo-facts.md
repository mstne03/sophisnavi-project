# Verificaciones para el SEO técnico (paso 0.9)

Fecha de verificación: **2026-10-06**. Todo lo marcado como verificado se comprobó ese día contra la fuente indicada.

---

## 1. Perfiles de Sofi (para `Person.sameAs` del JSON-LD y la página `/links`)

Fuente: https://linktr.ee/sophisnavi, leído en el navegador en modo solo lectura. Título de la página: "sophisnavi Official: TikTok, Instagram | Linktree". Bio literal: "💙 Avatar collector 💙 Spanish Avatar fan since 2009".

| Red | URL tal cual en Linktree | URL canónica propuesta (sin parámetros) | Comprobación |
|---|---|---|---|
| TikTok | `https://www.tiktok.com/@sophisnavi?_r=1&_t=zn-96sko7oouqc` | `https://www.tiktok.com/@sophisnavi` | HTTP 200 |
| Instagram | `https://www.instagram.com/sophisnavi` | `https://www.instagram.com/sophisnavi` | HTTP 200 |
| YouTube | `https://youtube.com/@sophisnavi?si=hwKVmbn9-Lef0A3l` | `https://www.youtube.com/@sophisnavi` | HTTP 200 |
| Pinterest | `https://pin.it/4t8NTHn0s` (acortador) | `https://es.pinterest.com/sophisnavi/` | El acortador resuelve a `es.pinterest.com/sophisnavi/avatar/` (tablero "avatar", con `invite_code`); el perfil raíz responde 200 |

Notas:
- Los parámetros `_r`, `_t` y `si` son de seguimiento de cada plataforma; en `sameAs` deben ir las URL limpias.
- El handle es el mismo en las cuatro redes: `sophisnavi`. En TikTok y YouTube lleva `@`.
- Pinterest no estaba en el plan. **Decisión (Marc, 2026-10-06): entra** en `sameAs` y en `/links`, con el perfil raíz y no el tablero con código de invitación. Sofi puede revertirlo.
- La comprobación HTTP se hizo con `curl -L` y user-agent de navegador; TikTok e Instagram pueden devolver 200 incluso para páginas de "contenido no disponible", así que la verificación visual la hace Sofi al revisar `/links`.

Propuesta de JSON-LD `Person` (valores a confirmar por Sofi):

```json
{
  "@type": "Person",
  "name": "Sofi",
  "alternateName": "sophisnavi",
  "description": "Avatar collector. Spanish Avatar fan since 2009.",
  "sameAs": [
    "https://www.tiktok.com/@sophisnavi",
    "https://www.instagram.com/sophisnavi",
    "https://www.youtube.com/@sophisnavi",
    "https://es.pinterest.com/sophisnavi/"
  ]
}
```

---

## 2. Dominio y URL canónica (hallazgo colateral)

| URL | Resultado el 2026-10-06 |
|---|---|
| `https://sophisnavi-eywa.vercel.app/` | **404 `DEPLOYMENT_NOT_FOUND`** (cabecera `X-Vercel-Error`) |
| `https://sophisnavi.com/` | 308 → `https://www.sophisnavi.com/` |
| `https://www.sophisnavi.com/` | 200, `text/html` |

Conclusión: la producción ya sirve en `www.sophisnavi.com` y la raíz redirige al `www`. El alias `.vercel.app` que menciona el plan ya no responde. **La URL canónica, el `sitemap`, `robots.txt` y `metadataBase` deben usar `https://www.sophisnavi.com`.** Si la S1 ha cambiado el nombre del proyecto en Vercel, actualizar la memoria del proyecto.

---

## 3. User-agents de bots de IA (para `robots.ts`)

Investigación delegada en un subagente que leyó cada página oficial el 2026-10-06. "Verificado" = token y propósito leídos en la documentación del propio proveedor ese día.

### 3.1 Tabla completa

| Token robots.txt | Proveedor | Propósito | Respeta robots.txt (según el proveedor) | Fuente oficial | Verificación |
|---|---|---|---|---|---|
| `GPTBot` | OpenAI | Entrenamiento | Sí | https://developers.openai.com/api/docs/bots | Verificado |
| `OAI-SearchBot` | OpenAI | Búsqueda / indexación (ChatGPT search) | Sí | misma | Verificado |
| `ChatGPT-User` | OpenAI | Acción iniciada por el usuario | No garantizado | misma | Verificado |
| `OAI-AdsBot` | OpenAI | Validación de páginas de anuncios | Sí | misma | Verificado |
| `ClaudeBot` | Anthropic | Entrenamiento | Sí | https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler | Verificado |
| `Claude-SearchBot` | Anthropic | Búsqueda / indexación | Sí | misma | Verificado |
| `Claude-User` | Anthropic | Acción iniciada por el usuario | Sí (honra `Disallow`) | misma | Verificado |
| `Claude-Web` | Anthropic | Token heredado | — | No figura en la doc vigente | No verificado |
| `Google-Extended` | Google | Token de control (no crawler): entrenamiento de Gemini y grounding | Sí | https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers | Verificado |
| `Google-CloudVertexBot` | Google | Crawl pedido por el dueño del sitio para Vertex AI | Sí | misma | Verificado |
| `Google-Agent` | Google | Fetch iniciado por usuario/agente | No (lo ignora en general) | https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers | Verificado |
| `Google-GeminiNotebook` (antes `Google-NotebookLM`) | Google | Fetch de fuentes aportadas por el usuario | No | misma | Verificado |
| `PerplexityBot` | Perplexity | Búsqueda / indexación | Sí | https://docs.perplexity.ai/guides/bots | Verificado |
| `Perplexity-User` | Perplexity | Acción iniciada por el usuario | No (lo ignora en general) | misma | Verificado |
| `CCBot` | Common Crawl | Corpus abierto (usado para entrenamiento por terceros) | Sí | https://commoncrawl.org/ccbot | Verificado |
| `Applebot` | Apple | Búsqueda (Spotlight, Siri, Safari) | Sí | https://support.apple.com/en-us/119829 | Verificado |
| `Applebot-Extended` | Apple | Token de control: entrenamiento de modelos de Apple | Sí | misma | Verificado |
| `meta-externalagent` | Meta | Entrenamiento + indexación | Sí | https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/ | Verificado |
| `meta-externalfetcher` | Meta | Acción iniciada por el usuario | No (puede saltárselo) | misma | Verificado |
| `meta-webindexer` | Meta | Indexación para Meta AI | Sí | misma | Verificado |
| `FacebookBot` | Meta | Token antiguo de entrenamiento | — | Ya no figura en la doc | No verificado |
| `Amazonbot` | Amazon | Mejora de productos; puede entrenar modelos de Amazon | Sí | https://developer.amazon.com/support/amazonbot | Verificado |
| `Amzn-SearchBot` | Amazon | Búsqueda (Alexa); no entrena IA generativa | Sí | misma | Verificado |
| `Amzn-User` | Amazon | Acción iniciada por el usuario (Alexa) | Parcial | misma | Verificado |
| `Bytespider` | ByteDance | Entrenamiento + búsqueda | Declarado sí; análisis de terceros reportan incumplimiento | Doc solo accesible desde China | No verificado |
| `MistralAI-Training` | Mistral | Entrenamiento | Sí | https://docs.mistral.ai/robots | Verificado |
| `MistralAI-Index` | Mistral | Búsqueda / indexación | No declarado | misma | Verificado (token) |
| `MistralAI-User` | Mistral | Acción iniciada por el usuario | No declarado | misma | Verificado (token) |
| `DuckAssistBot` | DuckDuckGo | Respuestas IA con cita; no entrena | Sí | https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot/ | Verificado |
| `bingbot` | Microsoft | Búsqueda + Copilot (mismo token) | Sí | https://blogs.bing.com/webmaster/september-2023/Announcing-new-options-for-webmasters-to-control-usage-of-their-content-in-Bing-Chat | Verificado (blog oficial) |
| `cohere-ai` | Cohere | Fetch por prompts (según terceros) | Desconocido | Sin doc oficial | No verificado |
| `xAI-Grok` / `GrokBot` | xAI | Desconocido | Desconocido | Sin doc oficial | No verificado |

### 3.2 Matices que afectan a la decisión

1. **`robots.txt` es una convención voluntaria.** No bloquea nada técnicamente. Si se quiere un bloqueo real, hay que hacerlo en el edge (reglas de bots del Vercel Firewall) o por verificación de IP. En la fase 0 basta con `robots.txt`; el Firewall queda como mejora opcional.
2. **Los fetchers "iniciados por el usuario"** (`ChatGPT-User`, `Perplexity-User`, `meta-externalfetcher`, `Google-Agent`, `Google-GeminiNotebook`, `Amzn-User`) declaran que pueden ignorar `robots.txt`. Bloquearlos no sirve de mucho; además son tráfico de personas que preguntan por la web, que es justo lo que queremos. `Claude-User` es la excepción: Anthropic dice que sí honra `Disallow`.
3. **`Google-Extended` y `Applebot-Extended` no son crawlers**, son tokens de control sobre contenido que ya traen `Googlebot` y `Applebot`. No aparecerán en los logs. `Google-Extended` **no afecta** a la indexación ni al ranking en Búsqueda, ni controla AI Overviews / AI Mode (eso se controla con `max-snippet`, `nosnippet` o `noindex`).
4. **Bing / Copilot no tiene token separado.** El control de uso en Copilot se hace con `<meta name="robots" content="nocache">` (solo URL, título y snippet) o `noarchive` (fuera de Copilot y del entrenamiento). Bloquear `bingbot` quitaría la web de Bing, así que no.
5. **Cambios de 2025-2026:** Anthropic eliminó `Claude-Web` de su lista y movió la doc a `support.claude.com`; OpenAI movió la suya a `developers.openai.com`; Google renombró `Google-NotebookLM` a `Google-GeminiNotebook` en agosto de 2026 y movió la doc a `developers.google.com/crawling/`; Meta añadió `meta-webindexer` y retiró `FacebookBot`.
6. **Los cambios en `robots.txt` tardan ~24 h** en aplicarse en OpenAI y Amazon, y ~72 h en DuckDuckGo.

### 3.3 Decisión para `robots.ts` (confirmada por Marc el 2026-10-06; Sofi puede revertirla)

Criterio: permitir todo lo que **busca y cita** (trae visitas y atribución) y bloquear lo que **entrena** sin devolver nada. Es la misma regla del plan 0.9, con los tokens actualizados a 2026-10-06.

| Decisión | Tokens |
|---|---|
| **Permitir** (buscadores clásicos) | `Googlebot`, `bingbot`, `Applebot`, `DuckDuckBot` y el resto (regla `*` = allow) |
| **Permitir** (búsqueda IA con cita) | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `DuckAssistBot`, `meta-webindexer`, `Amzn-SearchBot`, `MistralAI-Index` |
| **Permitir** (acción del usuario; bloquearlos no sirve) | `ChatGPT-User`, `Claude-User`, `Perplexity-User`, `Google-Agent`, `MistralAI-User` |
| **Bloquear** (entrenamiento) | `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `meta-externalagent`, `Amazonbot`, `Bytespider`, `MistralAI-Training` |

Pregunta para Sofi, en una frase: *"¿Quieres que las IA puedan entrenarse con los textos de tu web? Por defecto decimos que no, pero sí dejamos que te busquen y te citen."* Si ella prefiere permitir el entrenamiento (más alcance potencial), se vacía la lista de bloqueo; si prefiere bloquear también la búsqueda IA, se mueven `OAI-SearchBot`, `Claude-SearchBot` y `PerplexityBot` a la lista de bloqueo, sabiendo que perderá esas citas.

Tokens que **no** se incluyen en `robots.ts` por no estar verificados: `Claude-Web`, `FacebookBot`, `cohere-ai`, `xAI-*`. Si en los logs aparece alguno, se añade entonces.

---

## 4. Checklist de revisión para Sofi

- [ ] Confirmar que las cuatro URL canónicas de la sección 1 son las tuyas (en especial Pinterest).
- [x] Pinterest entra en `/links` y en el JSON-LD (2026-10-06).
- [ ] Confirmar el texto de `Person.description` o dar uno mejor.
- [x] Entrenamiento de IA: NO; búsqueda con cita: SÍ (2026-10-06).
