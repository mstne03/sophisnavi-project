import Link from "next/link";

export type Crumb = { name: string; path: string };

// Migas de pan visibles (SOPHIE-10): las mismas que el BreadcrumbList del JSON-LD. La última es la página actual y no
// enlaza; un título largo se recorta en una línea para no empujar el h1.
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Migas de pan" className={className}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-[0.3em] text-cyan-200">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.path} className={`flex min-w-0 items-center gap-2 ${last ? "flex-1" : ""}`}>
              {i > 0 && (
                <span aria-hidden className="text-white/30">
                  /
                </span>
              )}
              {last ? (
                <span aria-current="page" className="truncate text-white/60">
                  {it.name}
                </span>
              ) : (
                // scroll={false} al inicio: la portada restaura ella misma el scroll que tenía el usuario
                <Link href={it.path} scroll={it.path === "/" ? false : undefined} className="whitespace-nowrap hover:underline">
                  {it.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
