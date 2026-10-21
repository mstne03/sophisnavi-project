import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata, SITE_NAME, SITE_URL } from "@/application/seo/metadata";
import { hasEntryToggle, SECTIONS, splitEntries } from "@/domain/content";
import { ArticleNav } from "@/ui/article-nav";
import { Breadcrumbs } from "@/ui/breadcrumbs";
import { EntryTabs } from "@/ui/entry-tabs";
import { formatDate } from "@/ui/format";
import { JsonLd } from "@/ui/json-ld";
import { Markdown } from "@/ui/markdown";
import { PAGE_CONTAINER, READING } from "@/ui/page-container";
import { ReadingProgress } from "@/ui/reading-progress";
import { content } from "../../../content";

export const dynamicParams = false;

// Tarjeta OG de la sección (/[section]/opengraph-image): imagen de respaldo de los artículos sin portada.
const sectionCard = (slug: string) => {
  const section = SECTIONS.find((x) => x.slug === slug);
  const path = `/${slug}/opengraph-image`;
  return { path, url: `${SITE_URL}${path}`, alt: `${section?.title ?? SITE_NAME} · ${SITE_NAME}` };
};

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
    // Portada del artículo con sus medidas reales; sin portada, la tarjeta de su sección (no hay tarjeta por artículo).
    image: cover ? { url: `${SITE_URL}${cover.src}`, alt: cover.alt, width: cover.width, height: cover.height } : sectionCard(a.sectionSlug),
  });
}

export default async function ArticlePage({ params }: PageProps<"/[section]/[article]">) {
  const { section, article } = await params;
  const [s, v] = await Promise.all([content.getSection(section), content.getArticle(section, article)]);
  if (!s || !v) notFound();
  const a = v.article;
  const path = `/${s.slug}/${a.slug}`;
  const crumbs = [{ name: "Inicio", path: "/" }, { name: s.title, path: `/${s.slug}` }, { name: a.title, path }];
  // Artículo por entradas (SOPHIE-3, todos los de Personajes): intro común y un selector con una entrada por título. Con
  // menos de dos, se lee seguido.
  const split = hasEntryToggle(s.slug) ? splitEntries(a.body) : undefined;
  const entries = split && split.entries.length > 1 ? split.entries : undefined;

  return (
    <main className="min-h-dvh w-full bg-[radial-gradient(ellipse_at_50%_100%,#1a0b2e,#02040a_70%)] pb-24 text-white">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={articleJsonLd({ title: a.title, description: a.description, path, publishedAt: a.createdAt, updatedAt: a.updatedAt, section: s.title, image: a.images[0]?.src ?? sectionCard(s.slug).path })} />
      <ReadingProgress />
      <div className={`${PAGE_CONTAINER} pt-28`}>
        <article className={READING}>
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-3 font-display text-4xl sm:text-6xl">{a.title}</h1>
          <p className="mt-3 text-xs text-white/50">
            Publicado el <time dateTime={a.createdAt}>{formatDate(a.createdAt)}</time>
            {a.updatedAt.slice(0, 10) !== a.createdAt.slice(0, 10) && (
              <>
                {" · "}actualizado el <time dateTime={a.updatedAt}>{formatDate(a.updatedAt)}</time>
              </>
            )}
          </p>

          {entries ? (
            <>
              <Markdown source={split!.intro} images={a.images} videos={a.videos} className="prose-sophis mt-10" />
              <EntryTabs
                label={s.title}
              prevLabel="Personaje anterior"
              nextLabel="Siguiente personaje"
                tabs={entries.map(({ id, label }) => ({ id, label }))}
                panels={entries.map((e) => (
                  <Markdown key={e.id} source={e.body} images={a.images} videos={a.videos} className="prose-sophis" />
                ))}
              />
            </>
          ) : (
            <Markdown source={a.body} images={a.images} videos={a.videos} className="prose-sophis mt-10" />
          )}

          <ArticleNav sectionSlug={s.slug} prev={v.prev} next={v.next} />

          <Link href={`/${s.slug}`} className="mt-16 inline-block text-fuchsia-200 underline-offset-4 hover:underline">
            ← Volver a {s.title}
          </Link>
        </article>
      </div>
    </main>
  );
}
