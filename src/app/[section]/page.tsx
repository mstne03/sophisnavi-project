import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/ui/markdown";
import { PageCard } from "@/ui/page-card";
import { SiteHeader } from "@/ui/site-header";
import { content, locale } from "../content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await content.listSections(locale)).map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[section]">): Promise<Metadata> {
  const { section } = await params;
  const s = await content.getSection(locale, section);
  return s ? { title: `${s.title} · Sophisnavi`, description: s.description } : {};
}

export default async function SectionPage({ params }: PageProps<"/[section]">) {
  const { section } = await params;
  const s = await content.getSection(locale, section);
  if (!s) notFound();
  const pages = await content.listPages(locale, s.slug);

  return (
    <main className="min-h-dvh w-full bg-[radial-gradient(ellipse_at_50%_100%,#1a0b2e,#02040a_70%)] px-6 pb-24 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <SiteHeader />
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">Sección</p>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl">{s.title}</h1>
        <Markdown source={s.intro} className="prose-sophis mt-8" />

        <h2 className="mt-14 font-display text-2xl text-cyan-100">Categorías</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {s.categories.map((c) => (
            <li key={c.slug} className="rounded-full border border-cyan-300/30 px-3 py-1 text-sm text-cyan-100">
              {c.name}
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-display text-2xl text-cyan-100">Páginas</h2>
        {pages.length === 0 ? (
          <p className="mt-4 text-white/70">Todavía no hay páginas publicadas en esta sección.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {pages.map((p) => (
              <li key={p.slug}>
                <PageCard page={p} category={s.categories.find((c) => c.slug === p.categorySlug)?.name} />
              </li>
            ))}
          </ul>
        )}

        {/* scroll={false}: la portada restaura ella misma el scroll que tenía el usuario */}
        <Link href="/" scroll={false} className="mt-16 inline-block text-fuchsia-200 underline-offset-4 hover:underline">
          ← Volver al menú
        </Link>
      </div>
    </main>
  );
}
