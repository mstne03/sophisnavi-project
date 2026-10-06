import type { Metadata } from "next";
import Link from "next/link";

// Demo del panel (S2): sin autenticación ni escritura. Nunca se indexa. En la S4 llega el login TOTP y el CRUD real.
export const metadata: Metadata = {
  title: "Panel · Sophisnavi (demo)",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin#paginas", label: "Páginas" },
  { href: "/admin#secciones", label: "Secciones" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#05070f] text-white">
      <p role="status" className="bg-fuchsia-500/20 px-4 py-2 text-center text-xs tracking-wide text-fuchsia-100">
        Demo del panel: los cambios no se guardan. El panel real llega con Supabase y login.
      </p>
      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-white/10 p-6 sm:block">
          <Link href="/admin" className="font-display text-lg tracking-[0.15em]">
            Sophisnavi
          </Link>
          <p className="mt-1 text-xs text-white/50">Panel de Sofi</p>
          <nav aria-label="Panel" className="mt-8 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white">
                {n.label}
              </Link>
            ))}
            <Link href="/" className="mt-6 rounded-lg px-3 py-2 text-sm text-cyan-200 hover:bg-white/5">
              Ver la web →
            </Link>
          </nav>
        </aside>
        <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
