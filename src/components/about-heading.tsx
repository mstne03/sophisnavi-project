"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ABOUT_PATH } from "./home-anchors";

// Título de «Quién soy». Es el h1 en /quien-soy (su propia página); en /, donde el h1 es «Sophisnavi», baja a h2 al
// abrir el panel. Lo decide la ruta, que el servidor ya conoce: el HTML de cada URL lleva un único h1.
export function AboutHeading({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const Heading = usePathname() === ABOUT_PATH ? "h1" : "h2";
  return (
    <Heading id={id} className={className}>
      {children}
    </Heading>
  );
}
