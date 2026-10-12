"use client";

import { motion, useScroll } from "motion/react";

// Progreso de lectura de un artículo: una línea fina en el borde superior de la ventana, encima de la barra superior,
// que se llena con el scroll de la página. Va ligada al scroll (no es una animación), así que no depende de
// prefers-reduced-motion. Es decorativa: la posición ya la da la barra de desplazamiento.
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      data-reading-progress
      className="pointer-events-none fixed inset-x-0 top-0 z-30 h-0.5 origin-left bg-linear-to-r from-cyan-300 to-fuchsia-400"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
