import Link from "next/link";
import type { Page } from "@/domain/content";

const TYPE_LABEL: Record<Page["type"], string> = { article: "Artículo", gallery: "Galería" };

export function PageCard({ page, category }: { page: Page; category?: string }) {
  return (
    <Link
      href={`/${page.sectionSlug}/${page.slug}`}
      className="group block h-full rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-fuchsia-300/40 hover:bg-white/[0.06]"
    >
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cyan-200">
        <span>{TYPE_LABEL[page.type]}</span>
        {category && <span className="text-white/50">· {category}</span>}
      </p>
      <h3 className="mt-2 font-display text-xl text-white group-hover:[text-shadow:0_0_18px_rgba(232,121,249,0.8)]">{page.title}</h3>
      {page.description && <p className="mt-2 line-clamp-3 text-sm text-white/75">{page.description}</p>}
      <p className="mt-3 text-xs text-white/50">Actualizado el {page.updatedAt}</p>
    </Link>
  );
}
