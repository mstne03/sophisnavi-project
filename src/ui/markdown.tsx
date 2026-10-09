import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import type { ImageMeta } from "@/domain/content";

// Markdown → HTML semántico, en el servidor, sanitizado: el contenido de Notion es entrada no confiable
// (sin HTML crudo; un enlace externo nunca abre con acceso al opener).
export function Markdown({ source, images = [], className }: { source: string; images?: ImageMeta[]; className?: string }) {
  if (source.trim() === "") return <div className={className} />;
  const bydSrc = new Map(images.map((i) => [i.src, i]));
  return (
    <div className={className}>
      <ReactMarkdown
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
          // Un párrafo que solo contiene una imagen se convierte en <figure> (HTML válido: <figure> no cabe en <p>).
          p: ({ node, children, ...rest }) => {
            const only = node?.children.length === 1 ? node.children[0] : undefined;
            if (only?.type === "element" && only.tagName === "img") {
              const src = String(only.properties.src ?? "");
              const alt = String(only.properties.alt ?? "");
              return <Figure src={src} alt={alt} meta={bydSrc.get(src)} />;
            }
            return <p {...rest}>{children}</p>;
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
  // eslint-disable-next-line @next/next/no-img-element -- ya son WebP ≤ 1600 px generados en el build; next/image no aporta nada aquí
  const img = <img {...attrs} alt={alt || meta?.alt || ""} />;
  if (inline) return img;
  return (
    <figure>
      {img}
      {alt && <figcaption>{alt}</figcaption>}
    </figure>
  );
}
