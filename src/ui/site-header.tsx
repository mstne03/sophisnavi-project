import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-8">
      <Link href="/" scroll={false} className="flex items-center gap-3 font-display text-xl tracking-[0.15em] text-white/90 hover:text-white">
        {/* Logo de la marca: el árbol de las almas en morado. PNG estático de 256 px para pantallas retina; next/image no aporta nada aquí. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9" />
        Sophisnavi
      </Link>
      <span className="text-xs uppercase tracking-[0.4em] text-cyan-200">Eywa ngahu</span>
    </header>
  );
}
