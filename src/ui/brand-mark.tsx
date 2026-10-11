import Link from "next/link";

// Marca: el árbol y el nombre, enlazando a la portada. Vive en la barra superior (TopBar). En móvil solo el árbol: el
// nombre no cabe junto a las pestañas de la portada, y el h1 o el enlace accesible ya lo dicen.
export function BrandMark() {
  return (
    <Link
      href="/"
      scroll={false}
      aria-label="Sophisnavi, inicio"
      className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[rgba(2,4,10,0.45)] p-1.5 font-display text-base tracking-[0.15em] text-white/90 outline-none backdrop-blur-md transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300 sm:pr-4"
    >
      {/* PNG estático de 256 px para pantallas retina; next/image no aporta nada aquí. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={32} height={32} className="h-8 w-8" />
      <span className="hidden sm:inline">Sophisnavi</span>
    </Link>
  );
}
