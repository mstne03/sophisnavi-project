import Link from "next/link";
import { content, locale } from "../content";

const TYPE: Record<string, string> = { article: "Artículo", gallery: "Galería" };
const STATUS: Record<string, string> = { draft: "Borrador", published: "Publicada" };

export default async function AdminHome() {
  const [sections, pages] = await Promise.all([content.listSections(locale), content.listPages(locale)]);
  const titleOf = (slug: string) => sections.find((s) => s.slug === slug)?.title ?? slug;
  const stats = [
    ["Secciones", sections.length],
    ["Páginas", pages.length],
    ["Borradores", pages.filter((p) => p.status === "draft").length],
    ["Sin texto", pages.filter((p) => p.body.trim() === "").length],
  ] as const;

  return (
    <>
      <h1 className="font-display text-3xl">Hola, Sofi</h1>
      <p className="mt-1 text-sm text-white/60">Resumen del contenido del sitio.</p>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <dt className="text-xs uppercase tracking-[0.3em] text-cyan-200">{label}</dt>
            <dd className="mt-2 font-display text-4xl">{value}</dd>
          </div>
        ))}
      </dl>

      <section id="paginas" className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Páginas</h2>
          <button type="button" className="rounded-lg bg-fuchsia-500/80 px-4 py-2 text-sm font-medium hover:bg-fuchsia-500" disabled title="Disponible en el panel real">
            + Nueva página
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/60">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Sección</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Actualizada</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.slug} className="border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/paginas/${p.slug}`} className="text-white hover:text-fuchsia-200 hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/70">{titleOf(p.sectionSlug)}</td>
                  <td className="px-4 py-3 text-white/70">{TYPE[p.type]}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-200">{STATUS[p.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-white/50">{p.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="secciones" className="mt-12">
        <h2 className="font-display text-2xl">Secciones</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <li key={s.slug} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-display text-lg">{s.title}</p>
              <p className="mt-1 text-xs text-white/50">
                /{s.slug} · {s.categories.length} categorías · {pages.filter((p) => p.sectionSlug === s.slug).length} páginas
              </p>
              <Link href={`/${s.slug}`} className="mt-3 inline-block text-xs text-cyan-200 hover:underline">
                Ver en la web →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
