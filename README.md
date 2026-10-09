# sophisnavi.com

Portal en español sobre Avatar de Sofi (@sophisnavi). Next 16, HTML estático, contenido gestionado desde Notion.

## Cómo funciona el contenido (ADR-0007)

1. Sofi escribe en la base de datos de Notion «Web Sophisnavi» y pone `Estado = Publicado`.
2. Notion avisa a `POST /api/notion/webhook`; si el cambio afecta a lo publicado, se dispara un build en Vercel.
3. El build ejecuta `scripts/notion-pull.ts` (descarga páginas e imágenes a `data/content/` y `public/content/`) y después `next build`.
4. Páginas, `sitemap.xml`, `robots.txt` y las imágenes Open Graph se generan desde ese contenido.

Columnas de Notion que manda el servicio: `Vlog` (título), `Estado`, `Tipo` (Artículo / Introducción), `Sección`
(Pandora, Personajes, Clanes y culturas, La saga, Colección, Vida fan, Teorías, Detrás de cámaras, Home), `Slug`, `Descripción`.

## Desarrollo

```bash
pnpm install
cp .env.example .env.local   # rellena NOTION_TOKEN para descargar contenido real; sin él se usa el JSON versionado
pnpm dev
```

Comandos: `pnpm content:pull` (descarga de Notion), `pnpm build`, `pnpm test`, `pnpm e2e`, `pnpm lhci`, `pnpm dod` (todo).

Documentación: `docs/plan.md`, `docs/progress.md`, `docs/standards.md`, `docs/adr/`.
