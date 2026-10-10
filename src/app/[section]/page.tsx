import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { breadcrumbJsonLd, pageMetadata } from "@/application/seo/metadata";
import { ArticleCard } from "@/ui/article-card";
import { JsonLd } from "@/ui/json-ld";
import { Markdown } from "@/ui/markdown";
import { SiteHeader } from "@/ui/site-header";
import { content } from "../content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await content.listSections()).map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[section]">): Promise<Metadata> {
  const { section } = await params;
  const s = await content.getSection(section);
  return s ? pageMetadata({ title: s.title, description: s.description, path: `/${s.slug}`, updatedAt: s.intro?.updatedAt }) : {};
}

export default async function SectionPage({ params }: PageProps<"/[section]">) {
  const { section } = await params;
  const s = await content.getSection(section);
  if (!s) notFound();
  const articles = await content.listArticles(s.slug);

  return (
    <main className="min-h-dvh w-full bg-[radial-gradient(ellipse_at_50%_100%,#1a0b2e,#02040a_70%)] px-6 pb-24 text-white">
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: s.title, path: `/${s.slug}` }])} />
      <div className="mx-auto w-full max-w-3xl">
        <SiteHeader />
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">Sección</p>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl">{s.title}</h1>
        {s.intro ? (
          <Markdown source={s.intro.body} images={s.intro.images} videos={s.intro.videos} className="prose-sophis mt-8" />
        ) : (
          <p className="prose-sophis mt-8">{s.description}</p>
        )}

        <h2 className="mt-14 font-display text-2xl text-cyan-100">Artículos</h2>
        {articles.length === 0 ? (
          <p className="mt-4 text-white/70">Todavía no hay artículos publicados en esta sección.</p>
        ) : (
          // Carrusel con desplazamiento horizontal y ajuste en todos los tamaños; en pantallas anchas caben dos cards y
          // asoma la siguiente, así se ve que hay más.
          <ul aria-label="Artículos de la sección" className="thin-scrollbar mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {articles.map((a) => (
              <li key={a.slug} className="w-[80%] shrink-0 snap-start sm:w-[45%]">
                <ArticleCard article={a} />
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
