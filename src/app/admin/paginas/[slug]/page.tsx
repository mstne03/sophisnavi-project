import Link from "next/link";
import { notFound } from "next/navigation";
import { PageEditor } from "@/ui/admin/page-editor";
import { content, locale } from "../../../content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await content.listPages(locale)).map((p) => ({ slug: p.slug }));
}

export default async function EditPage({ params }: PageProps<"/admin/paginas/[slug]">) {
  const { slug } = await params;
  const page = (await content.listPages(locale)).find((p) => p.slug === slug);
  if (!page) notFound();
  const section = await content.getSection(locale, page.sectionSlug);

  return (
    <>
      <Link href="/admin" className="text-sm text-white/60 hover:text-white">
        ← Páginas
      </Link>
      <h1 className="mt-2 font-display text-3xl">Editar página</h1>
      <div className="mt-8">
        <PageEditor page={page} sectionTitle={section?.title ?? page.sectionSlug} />
      </div>
    </>
  );
}
