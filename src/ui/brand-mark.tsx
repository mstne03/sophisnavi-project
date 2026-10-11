import Link from "next/link";

// Marca fija arriba a la izquierda en toda la web (portada incluida, también durante la intro): el árbol y el nombre,
// enlazando a la portada. Fija y no estática para que se vea durante toda la lectura de un artículo; con el mismo
// fondo translúcido que las pestañas de la portada (HomeNav, arriba a la derecha), que son su pareja visual.
export function BrandMark() {
  return (
    <Link
      href="/"
      scroll={false}
      aria-label="Sophisnavi, inicio"
      className="fixed top-5 left-5 z-20 flex items-center gap-2.5 rounded-full border border-white/10 bg-[rgba(2,4,10,0.45)] py-1.5 pr-4 pl-1.5 font-display text-base tracking-[0.15em] text-white/90 outline-none backdrop-blur-md transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300"
    >
      {/* PNG estático de 256 px para pantallas retina; next/image no aporta nada aquí. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={32} height={32} className="h-8 w-8" />
      <span>Sophisnavi</span>
    </Link>
  );
}
