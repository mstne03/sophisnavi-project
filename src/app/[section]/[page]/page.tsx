import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/ui/gallery";
import { Markdown } from "@/ui/markdown";
import { SiteHeader } from "@/ui/site-header";
import { content, locale } from "../../content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await content.listPages(locale)).map((p) => ({ section: p.sectionSlug, page: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[section]/[page]">): Promise<Metadata> {
  const { section, page } = await params;
  const p = await content.getPage(locale, section, page);
  return p ? { title: `${p.title} · Sophisnavi`, description: p.description } : {};
}

export default async function ContentPage({ params }: PageProps<"/[section]/[page]">) {
  const { section, page } = await params;
  const [s, p] = await Promise.all([content.getSection(locale, section), content.getPage(locale, section, page)]);
  if (!s || !p) notFound();
  const category = s.categories.find((c) => c.slug === p.categorySlug)?.name;

  return (
    <main className="min-h-dvh w-full bg-[radial-gradient(ellipse_at_50%_100%,#1a0b2e,#02040a_70%)] px-6 pb-24 text-white">
      <article className="mx-auto w-full max-w-3xl">
        <SiteHeader />
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">
          <Link href={`/${s.slug}`} className="hover:underline">
            {s.title}
          </Link>
          {category && <span className="text-white/50"> · {category}</span>}
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl">{p.title}</h1>
        <p className="mt-3 text-xs text-white/50">Actualizado el {p.updatedAt}</p>

        {p.type === "gallery" && <Gallery media={p.media} />}

        {p.body.trim() === "" ? (
          <p className="mt-10 rounded-xl border border-dashed border-white/20 p-6 text-white/60">
            Esta página todavía no tiene texto. Sofi lo añadirá desde el panel.
          </p>
        ) : (
          <Markdown source={p.body} className="prose-sophis mt-10" />
        )}

        <Link href={`/${s.slug}`} className="mt-16 inline-block text-fuchsia-200 underline-offset-4 hover:underline">
          ← Volver a {s.title}
        </Link>
      </article>
    </main>
  );
}
