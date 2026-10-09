import Link from "next/link";
import type { Article } from "@/domain/content";
import { formatDate } from "./format";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/${article.sectionSlug}/${article.slug}`}
      className="group block h-full rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-fuchsia-300/40 hover:bg-white/[0.06]"
    >
      <h3 className="font-display text-xl text-white group-hover:[text-shadow:0_0_18px_rgba(232,121,249,0.8)]">{article.title}</h3>
      {article.description && <p className="mt-2 line-clamp-3 text-sm text-white/75">{article.description}</p>}
      <p className="mt-3 text-xs text-white/50">
        <time dateTime={article.createdAt}>{formatDate(article.createdAt)}</time>
      </p>
    </Link>
  );
}
