import Link from "next/link";
import { notFound } from "next/navigation";
import { SECTIONS } from "@/lib/sections";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.slug }));
}

export default async function SectionPage({ params }: PageProps<"/[section]">) {
  const { section } = await params;
  const s = SECTIONS.find((x) => x.slug === section);
  if (!s) notFound();

  return (
    <main className="flex min-h-dvh w-full bg-[radial-gradient(ellipse_at_50%_100%,#1a0b2e,#02040a_70%)] px-6 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">Próximamente</p>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl">{s.title}</h1>
        <p className="mt-4 text-white/85">{s.description}</p>
        {/* scroll={false}: la portada restaura ella misma el scroll que tenía el usuario */}
        <Link href="/" scroll={false} className="mt-10 self-start text-fuchsia-200 underline-offset-4 hover:underline">
          ← Volver al menú
        </Link>
      </div>
    </main>
  );
}
