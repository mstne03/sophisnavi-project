"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

export type TopNavItem = { key: string; href: string; label: string };

// Barra de enlaces de escritorio en el hueco derecho de la barra superior (TopBar): la usan las pestañas de la portada
// (Inicio / «Quién soy») y la navegación entre secciones, con el mismo aspecto y el mismo cambio de enlace activo. Sin
// fondo propio; cada enlace mide lo mismo que la píldora de la marca (h-11) y el activo se rellena con una píldora.
// `onSelect` avisa al pulsar, para que quien la usa cambie el activo en el acto sin esperar a que termine la navegación.
export function TopNav({
  label,
  items,
  active,
  activeCurrent = "page",
  onSelect,
  className = "",
}: {
  label: string;
  items: TopNavItem[];
  active?: string;
  activeCurrent?: "page" | "true";
  onSelect?: (key: string, e: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex h-11 items-center gap-1">
        {items.map((it) => {
          const on = it.key === active;
          return (
            <li key={it.key} className="h-full">
              <Link
                href={it.href}
                aria-current={on ? activeCurrent : undefined}
                onClick={onSelect && ((e) => onSelect(it.key, e))}
                className={`flex h-full items-center whitespace-nowrap rounded-full px-4 text-xs uppercase tracking-[0.2em] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                  on ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
