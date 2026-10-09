"use client";

import type { MouseEvent } from "react";
import { ABOUT_ID } from "./home-anchors";

export type HomeView = "inicio" | "about";

// Pestañas de la portada (arriba a la derecha). Son la única forma de pasar de Inicio a «Quién soy» y volver:
// no hay desplazamiento de página entre las dos vistas. El estado y el historial los lleva Experience.
export function HomeNav({ view, onSelect }: { view: HomeView; onSelect: (view: HomeView) => void }) {
  const tab = (target: HomeView, href: string, label: string) => {
    const on = view === target;
    const click = (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onSelect(target);
    };
    return (
      <a
        href={href}
        onClick={click}
        aria-current={on ? "page" : undefined}
        className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.3em] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-cyan-300 ${
          on ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
        }`}
      >
        {label}
      </a>
    );
  };

  return (
    <nav aria-label="Portada" className="fixed top-5 right-5 z-20 flex gap-1 rounded-full border border-white/10 bg-[rgba(2,4,10,0.45)] p-1 backdrop-blur-md">
      {tab("inicio", "/", "Inicio")}
      {tab("about", `#${ABOUT_ID}`, "Quién soy")}
    </nav>
  );
}
