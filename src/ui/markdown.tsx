import type { ComponentProps, CSSProperties } from "react";
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

// Subconjunto estructural de hast. Un párrafo «solo imágenes» (más espacios) es el que se pinta como <figure>.
type HNode = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: HNode[] };
const isImg = (c: HNode) => c.type === "element" && c.tagName === "img";
const onlyImages = (n: HNode) => {
  const kids = n.children ?? [];
  const imgs = kids.filter(isImg);
  return imgs.length > 0 && kids.every((c) => isImg(c) || (c.type === "text" && !c.value?.trim())) ? imgs : [];
};
const isText = (n?: HNode) => !!n && (["ul", "ol", "blockquote"].includes(n.tagName ?? "") || (n.tagName === "p" && onlyImages(n).length === 0));

// Una imagen vertical sola, con texto justo debajo, se coloca en una fila junto al bloque de texto que la rodea (párrafos,
// listas y citas seguidos, antes y después, hasta un título, imagen o separador) con los centros alineados: la primera a
// la derecha y cada una al lado contrario de la vertical anterior. Agrupar también el texto de antes evita que quede
// suelto encima con un hueco. Se decide aquí, recorriendo el documento en orden, y no en el render.
const el = (tagName: string, properties: Record<string, unknown>, children: HNode[]): HNode => ({ type: "element", tagName, properties, children });
export function rehypeVerticalRows(bySrc: Map<string, ImageMeta>) {
  return (tree: HNode) => {
    const blocks = (tree.children ?? []).filter((c) => c.type === "element");
    const out: HNode[] = [];
    let side = "left";
    for (let i = 0; i < blocks.length; i++) {
      const n = blocks[i];
      const imgs = n.tagName === "p" ? onlyImages(n) : [];
      const meta = imgs.length === 1 ? bySrc.get(String(imgs[0].properties?.src ?? "")) : undefined;
      let end = i + 1;
      while (isText(blocks[end])) end++;
      if (!meta || meta.height <= meta.width || end === i + 1) {
        out.push(n);
        continue;
      }
      side = side === "right" ? "left" : "right";
      let start = out.length; // texto anterior aún suelto (el de una fila previa ya está dentro de esa fila)
      while (start > 0 && isText(out[start - 1])) start--;
      const before = out.splice(start);
      const after = el("div", { className: ["media-after"] }, blocks.slice(i + 1, end));
      // Orden del documento intacto (texto anterior, imagen, texto posterior): en móvil se apila tal cual y un lector de
      // pantalla lo lee como en Notion. La fila la monta el CSS con áreas de grid.
      const row = before.length ? [el("div", { className: ["media-before"] }, before), n, after] : [n, after];
      out.push(el("div", { className: ["media-row"], dataSide: side }, row));
      i = end - 1;
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
        rehypePlugins={[rehypeSanitize, [rehypeVerticalRows, bydSrc]]} // tras sanitizar: las filas son nuestras
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
            const imgs = node ? onlyImages(node as HNode) : [];
            if (imgs.length === 0) return <p {...rest}>{children}</p>;
            const figures = imgs.map((img, i) => {
              const src = String(img.properties?.src ?? "");
              const alt = String(img.properties?.alt ?? "");
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
  // Proporción para el CSS: fija el ancho de imagen y pie antes de descargarla, y así limita su altura sin colapsar la caja.
  const style = meta && ({ "--ar": meta.width / meta.height } as CSSProperties);
  return (
    <figure style={style}>
      {img}
      {alt && <figcaption>{alt}</figcaption>}
    </figure>
  );
}
