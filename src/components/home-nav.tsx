"use client";

import { TopNav } from "@/ui/top-nav";
import { ABOUT_PATH } from "./home-anchors";

export type HomeView = "inicio" | "about";

const ITEMS = [
  { key: "inicio", href: "/", label: "Inicio" },
  { key: "about", href: ABOUT_PATH, label: "Quién soy" },
];

// Pestañas de la portada, en el hueco derecho de la barra superior (TopBar), con la misma barra (TopNav) que la
// navegación entre secciones. Pasan de Inicio (/) a «Quién soy» (/quien-soy) y vuelven sin desplazamiento de página:
// el estado y la navegación los lleva Experience. Sin JS son enlaces normales.
export function HomeNav({ view, onSelect }: { view: HomeView; onSelect: (view: HomeView) => void }) {
  return (
    <TopNav
      label="Portada"
      items={ITEMS}
      active={view}
      onSelect={(key, e) => {
        e.preventDefault();
        onSelect(key as HomeView);
      }}
    />
  );
}
