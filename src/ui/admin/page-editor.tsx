"use client";

import Link from "next/link";
import { useState } from "react";
import type { Page } from "@/domain/content";
import { Markdown } from "../markdown";

// Demo del editor (S2): estado local y vista previa en vivo. En la S4 "Guardar" llama a la Server Action con Supabase.
export function PageEditor({ page, sectionTitle }: { page: Page; sectionTitle: string }) {
  const [title, setTitle] = useState(page.title);
  const [description, setDescription] = useState(page.description);
  const [body, setBody] = useState(page.body);
  const [status, setStatus] = useState<Page["status"]>(page.status);
  const [notice, setNotice] = useState<string | null>(null);

  const field = "mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300";

  return (
    <form
      className="grid gap-8 lg:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setNotice("Demo: los cambios no se guardan todavía. El guardado real llega con Supabase (S3–S4).");
      }}
    >
      <div className="flex flex-col gap-4">
        <label className="block text-xs uppercase tracking-[0.3em] text-cyan-200">
          Título
          <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block text-xs uppercase tracking-[0.3em] text-cyan-200">
          Slug
          <input className={`${field} font-mono`} value={page.slug} readOnly />
        </label>
        <label className="block text-xs uppercase tracking-[0.3em] text-cyan-200">
          Descripción SEO <span className="text-white/40">({description.length}/155)</span>
          <textarea className={field} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="block text-xs uppercase tracking-[0.3em] text-cyan-200">
          Estado
          <select className={field} value={status} onChange={(e) => setStatus(e.target.value as Page["status"])}>
            <option value="draft">Borrador</option>
            <option value="published">Publicada</option>
          </select>
        </label>
        <label className="block text-xs uppercase tracking-[0.3em] text-cyan-200">
          Texto (Markdown)
          <textarea className={`${field} min-h-80 font-mono`} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="rounded-lg bg-fuchsia-500/80 px-4 py-2 text-sm font-medium hover:bg-fuchsia-500">
            Guardar
          </button>
          <Link href={`/${page.sectionSlug}/${page.slug}`} className="text-sm text-cyan-200 hover:underline">
            Ver en la web →
          </Link>
          {notice && (
            <p role="status" className="basis-full text-sm text-amber-200">
              {notice}
            </p>
          )}
        </div>
      </div>

      <aside aria-label="Vista previa" className="rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_100%,#1a0b2e,#02040a_70%)] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">{sectionTitle}</p>
        <p className="mt-3 font-display text-3xl">{title}</p>
        <p className="mt-2 text-sm text-white/60">{description}</p>
        <Markdown source={body} className="prose-sophis mt-6 text-sm" />
      </aside>
    </form>
  );
}
