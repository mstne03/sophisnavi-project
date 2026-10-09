import Link from "next/link";
import type { ArticleLink } from "@/application/content/ContentRepository";

// Anterior / siguiente dentro de la sección (orden de creación en Notion).
export function ArticleNav({ sectionSlug, prev, next }: { sectionSlug: string; prev?: ArticleLink; next?: ArticleLink }) {
  if (!prev && !next) return null;
  const cls = "group block rounded-xl border border-white/10 p-4 transition-colors hover:border-fuchsia-300/40";
  return (
    <nav aria-label="Más artículos" className="mt-16 grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link href={`/${sectionSlug}/${prev.slug}`} rel="prev" className={cls}>
          <span className="text-xs uppercase tracking-[0.3em] text-cyan-200">← Anterior</span>
          <span className="mt-1 block font-display text-lg text-white">{prev.title}</span>
        </Link>
      ) : (
        <span aria-hidden />
      )}
      {next && (
        <Link href={`/${sectionSlug}/${next.slug}`} rel="next" className={`${cls} sm:text-right`}>
          <span className="text-xs uppercase tracking-[0.3em] text-cyan-200">Siguiente →</span>
          <span className="mt-1 block font-display text-lg text-white">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
