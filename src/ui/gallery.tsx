// Galería mínima: cuadrícula de imágenes; sin fotos aún, huecos de ejemplo para que se vea la plantilla.
export function Gallery({ media }: { media: string[] }) {
  const items = media.length > 0 ? media : Array.from({ length: 6 }, () => "");
  return (
    <ul aria-label="Galería" className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((src, i) => (
        <li key={i} className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element -- las fotos vendrán de Supabase Storage (fase 1); sin dominio fijo aún
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">Foto {i + 1}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
