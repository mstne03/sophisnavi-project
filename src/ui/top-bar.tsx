import type { ReactNode } from "react";
import { BrandMark } from "./brand-mark";

// Barra superior fija de toda la web: la marca a la izquierda y, a la derecha, lo que cada página necesite (las pestañas
// de la portada, el lema en secciones y artículos). Una sola fila flex: los dos huecos nunca se pisan. Por dentro usa el
// mismo contenedor centrado que el contenido de la página, así la marca cae sobre el margen izquierdo del texto en
// escritorio y no colgada del borde de la ventana. El degradado da una franja de lectura limpia al pasar texto por
// detrás; la barra no captura clics (pointer-events) salvo en sus dos huecos.
const WIDTHS = {
  narrow: "max-w-3xl px-6", // columna de lectura (secciones, artículos, «Quién soy»)
  wide: "max-w-6xl px-6 sm:px-10", // portada
} as const;

export function TopBar({ width = "narrow", right }: { width?: keyof typeof WIDTHS; right?: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 bg-gradient-to-b from-[#02040a] via-[rgba(2,4,10,0.55)] to-transparent">
      <div className={`mx-auto flex w-full items-center justify-between gap-3 pt-4 pb-8 ${WIDTHS[width]}`}>
        <div className="pointer-events-auto">
          <BrandMark />
        </div>
        {right && <div className="pointer-events-auto flex items-center">{right}</div>}
      </div>
    </div>
  );
}

// Lema de la barra en secciones y artículos: misma píldora translúcida que la marca, para que el texto que pasa por
// detrás al hacer scroll no se mezcle con él.
export function Tagline() {
  return (
    <span className="flex h-11 items-center rounded-full border border-white/10 bg-[rgba(2,4,10,0.45)] px-4 text-xs uppercase tracking-[0.4em] text-cyan-200 backdrop-blur-md">
      Eywa ngahu
    </span>
  );
}
