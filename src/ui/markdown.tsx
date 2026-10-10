import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import type { ImageMeta } from "@/domain/content";

// Subconjunto estructural de mdast: basta para agrupar párrafos que solo contienen una imagen.
type MdNode = { type: string; children?: MdNode[] };
const isImageOnlyParagraph = (n: MdNode) => n.type === "paragraph" && n.children?.length === 1 && n.children[0].type === "image";

// Varias imágenes seguidas (cada una en su párrafo, como las exporta Notion) pasan a un único párrafo:
// así el renderizador puede pintarlas en cuadrícula en vez de apiladas a toda anchura.
export function remarkGroupImages() {
  return (tree: MdNode) => {
    const out: MdNode[] = [];
    for (const node of tree.children ?? []) {
      const prev = out.at(-1);
      if (isImageOnlyParagraph(node) && prev && prev.type === "paragraph" && prev.children?.every((c) => c.type === "image")) {
        prev.children.push(node.children![0]);
      } else {
        out.push(node);
      }
    }
    tree.children = out;
  };
}

// Markdown → HTML semántico, en el servidor, sanitizado: el contenido de Notion es entrada no confiable
// (sin HTML crudo; un enlace externo nunca abre con acceso al opener).
export function Markdown({ source, images = [], className }: { source: string; images?: ImageMeta[]; className?: string }) {
  if (source.trim() === "") return <div className={className} />;
  const bydSrc = new Map(images.map((i) => [i.src, i]));
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGroupImages]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children }) => {
            const external = /^https?:\/\//.test(href ?? "");
            return (
              <a href={href} {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}>
                {children}
              </a>
            );
          },
          // Un párrafo que solo contiene imágenes no puede ser <p> (HTML válido: <figure> no cabe en <p>):
          // una imagen → <figure>; varias seguidas → cuadrícula de <figure>.
          p: ({ node, children, ...rest }) => {
            const imgs = (node?.children ?? []).filter((c) => c.type === "element" && c.tagName === "img");
            const onlyImages = imgs.length > 0 && (node?.children ?? []).every((c) => (c.type === "element" && c.tagName === "img") || (c.type === "text" && c.value.trim() === ""));
            if (!onlyImages) return <p {...rest}>{children}</p>;
            const figures = imgs.map((img, i) => {
              const src = String((img as { properties: Record<string, unknown> }).properties.src ?? "");
              const alt = String((img as { properties: Record<string, unknown> }).properties.alt ?? "");
              return <Figure key={`${src}-${i}`} src={src} alt={alt} meta={bydSrc.get(src)} />;
            });
            return figures.length === 1 ? figures[0] : <div className="img-grid">{figures}</div>;
          },
          img: ({ src, alt }) => <Figure src={String(src ?? "")} alt={alt ?? ""} meta={bydSrc.get(String(src ?? ""))} inline />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

function Figure({ src, alt, meta, inline }: { src: string; alt: string; meta?: ImageMeta; inline?: boolean }) {
  // Sin pie escrito por Sofi, el alt cae al de la imagen (su título de página); el pie solo se pinta si lo escribió ella.
  const attrs: ComponentProps<"img"> = { src, loading: "lazy", decoding: "async", width: meta?.width, height: meta?.height };
  // eslint-disable-next-line @next/next/no-img-element -- ya son WebP ≤ 1200 px generados en el build; next/image no aporta nada aquí
  const img = <img {...attrs} alt={alt || meta?.alt || ""} />;
  if (inline) return img;
  return (
    <figure>
      {img}
      {alt && <figcaption>{alt}</figcaption>}
    </figure>
  );
}
