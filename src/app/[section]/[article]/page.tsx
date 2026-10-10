import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata, SITE_URL } from "@/application/seo/metadata";
import { ArticleNav } from "@/ui/article-nav";
import { formatDate } from "@/ui/format";
import { JsonLd } from "@/ui/json-ld";
import { Markdown } from "@/ui/markdown";
import { SiteHeader } from "@/ui/site-header";
import { content } from "../../content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await content.listArticles()).map((a) => ({ section: a.sectionSlug, article: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[section]/[article]">): Promise<Metadata> {
  const { section, article } = await params;
  const v = await content.getArticle(section, article);
  if (!v) return {};
  const a = v.article;
  const cover = a.images[0];
  return pageMetadata({
    title: a.title,
    description: a.description,
    path: `/${a.sectionSlug}/${a.slug}`,
    type: "article",
    publishedAt: a.createdAt,
    updatedAt: a.updatedAt,
    image: cover ? { url: `${SITE_URL}${cover.src}`, alt: cover.alt } : undefined,
  });
}

export default async function ArticlePage({ params }: PageProps<"/[section]/[article]">) {
  const { section, article } = await params;
  const [s, v] = await Promise.all([content.getSection(section), content.getArticle(section, article)]);
  if (!s || !v) notFound();
  const a = v.article;
  const path = `/${s.slug}/${a.slug}`;

  return (
    <main className="min-h-dvh w-full bg-[radial-gradient(ellipse_at_50%_100%,#1a0b2e,#02040a_70%)] px-6 pb-24 text-white">
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: s.title, path: `/${s.slug}` }, { name: a.title, path }])} />
      <JsonLd data={articleJsonLd({ title: a.title, description: a.description, path, publishedAt: a.createdAt, updatedAt: a.updatedAt, section: s.title, image: a.images[0]?.src })} />
      <article className="mx-auto w-full max-w-3xl">
        <SiteHeader />
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">
          <Link href={`/${s.slug}`} className="hover:underline">
            {s.title}
          </Link>
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl">{a.title}</h1>
        <p className="mt-3 text-xs text-white/50">
          Publicado el <time dateTime={a.createdAt}>{formatDate(a.createdAt)}</time>
          {a.updatedAt.slice(0, 10) !== a.createdAt.slice(0, 10) && (
            <>
              {" · "}actualizado el <time dateTime={a.updatedAt}>{formatDate(a.updatedAt)}</time>
            </>
          )}
        </p>

        <Markdown source={a.body} images={a.images} videos={a.videos} className="prose-sophis mt-10" />

        <ArticleNav sectionSlug={s.slug} prev={v.prev} next={v.next} />

        <Link href={`/${s.slug}`} className="mt-16 inline-block text-fuchsia-200 underline-offset-4 hover:underline">
          ← Volver a {s.title}
        </Link>
      </article>
    </main>
  );
}
