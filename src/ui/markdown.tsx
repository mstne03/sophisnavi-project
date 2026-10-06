import type { ReactNode } from "react";

// ponytail: Markdown mínimo para el seed (párrafos, ## títulos, listas, **negrita**, *cursiva*).
// Cambiar por react-markdown si el panel de Sofi necesita tablas, enlaces o imágenes.
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
      return part;
    });
}

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

export function Markdown({ source, className }: { source: string; className?: string }) {
  // Un título siempre forma su propio bloque, aunque el autor no deje línea en blanco tras él.
  const blocks = source
    .replace(/^(#{1,6}\s.*)$/gm, "\n$1\n")
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const heading = /^(#{1,6})\s+(.*)$/.exec(block);
        if (heading) {
          // El h1 lo pone la página: los títulos del cuerpo empiezan en h2.
          const Tag = `h${Math.min(heading[1].length + 1, 6)}` as HeadingTag;
          return <Tag key={i}>{inline(heading[2])}</Tag>;
        }
        const lines = block.split("\n");
        if (lines.every((l) => /^[-*]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
