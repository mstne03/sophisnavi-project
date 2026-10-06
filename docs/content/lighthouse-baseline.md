# Línea base de Lighthouse (móvil) · portada

- **Fecha:** 2026-10-06 01:26 UTC
- **URL medida:** `https://www.sophisnavi.com/` (la URL del plan, `sophisnavi-eywa.vercel.app`, devuelve 404 `DEPLOYMENT_NOT_FOUND`; ver `seo-facts.md`, sección 2)
- **Herramienta:** Lighthouse 12.8.2 por CLI (`npx lighthouse@12`), Chrome headless local, perfil móvil por defecto (Moto G Power emulado, red 4G lenta). PageSpeed Insights no se pudo usar: la API sin clave devuelve cuota 0.
- **Una sola ejecución**, sin repetición: la variabilidad típica de rendimiento es de ±5 puntos. Sirve como referencia, no como medida fina.

## Puntuaciones

| Categoría | Puntuación | Umbral del plan (≥ 85) |
|---|---|---|
| Rendimiento | **53** | ✗ |
| Accesibilidad | 100 | ✓ |
| Buenas prácticas | 100 | ✓ |
| SEO | 100 | ✓ |

Métricas de rendimiento: FCP 1,1 s · LCP 4,8 s · TBT 1 020 ms · CLS 0 · Speed Index 7,1 s · TTI 5,2 s.

## Cinco oportunidades principales

| # | Oportunidad | Ahorro estimado | Comentario |
|---|---|---|---|
| 1 | Usar HTTP/2 (17 peticiones sin HTTP/2) | 1 050 ms | Vercel sirve HTTP/2 en producción; es probable que sea un artefacto del Chrome headless local. **Comprobar con PageSpeed Insights (con clave) antes de actuar.** |
| 2 | Reducir JavaScript no usado | 131 KiB · 600 ms | Coherente con three.js + motion cargados en la portada. Candidato real para el paso 0.12. |
| 3 | Activar compresión de texto | 25 KiB · 30 ms | Raro en Vercel; identificar qué recurso llega sin `content-encoding`. |
| 4 | Eliminar recursos que bloquean el renderizado | 0 ms | Sin impacto medido. |
| 5 | Evitar JavaScript heredado en navegadores modernos | 14 KiB | Polyfills innecesarios; revisar `browserslist` en 0.12. |

Diagnósticos adicionales en rojo: TBT y TTI altos (hilo principal ocupado por la intro 3D), faltan source maps para el JS propio.

## Lectura

El problema es uno solo: la intro 3D del Árbol de las Almas carga y ejecuta mucho JavaScript en el primer pintado. Accesibilidad, buenas prácticas y SEO ya cumplen. Esto confirma la prioridad del paso 0.12 (rendimiento) y da la cifra de partida para medir la mejora.
