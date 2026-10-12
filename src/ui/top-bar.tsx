import type { ReactNode } from "react";
import { BrandMark } from "./brand-mark";
import { PAGE_CONTAINER } from "./page-container";

// Barra superior fija de toda la web: la marca a la izquierda y, a la derecha, lo que cada página necesite (las pestañas
// de la portada, la navegación entre secciones en secciones y artículos). Una sola fila flex: los dos huecos nunca se
// pisan. Por dentro usa el mismo contenedor ancho en todas las páginas (PAGE_CONTAINER), así la marca y la navegación
// no se mueven al navegar entre ellas, aunque la columna de lectura vaya centrada. El degradado da una franja de
// lectura limpia al pasar texto por detrás; la barra no captura clics (pointer-events) salvo en sus dos huecos.
export function TopBar({ right }: { right?: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 bg-gradient-to-b from-[#02040a] via-[rgba(2,4,10,0.55)] to-transparent">
      <div className={`${PAGE_CONTAINER} flex items-center justify-between gap-3 pt-4 pb-8`}>
        <div className="pointer-events-auto">
          <BrandMark />
        </div>
        {right && <div className="pointer-events-auto flex items-center">{right}</div>}
      </div>
    </div>
  );
}
