"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type NavSection = { slug: string; title: string };

// Navegación entre secciones, en el hueco derecho de la barra superior (TopBar) de secciones y artículos. En escritorio
// es una barra de enlaces con la misma píldora translúcida que la marca; en móvil, un botón hamburguesa que despliega la
// lista. La sección actual va marcada: aria-current="page" en su propia página y "true" dentro de uno de sus artículos.
// Las dos variantes van en el HTML del servidor (enlaces rastreables); el desplegable es un <details>, así que también
// se abre sin JS. Con JS además se cierra al elegir, con Escape o al pulsar fuera.
export function SectionNav({ sections, current, onSectionPage = true }: { sections: NavSection[]; current?: string; onSectionPage?: boolean }) {
  const ariaCurrent = (slug: string) => (slug === current ? (onSectionPage ? "page" : "true") : undefined);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuRef.current?.querySelector("summary")?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <>
      <nav aria-label="Secciones" className="hidden rounded-full border border-white/10 bg-[rgba(2,4,10,0.45)] p-1 backdrop-blur-md lg:block">
        <ul className="flex gap-0.5">
          {sections.map((s) => {
            const on = s.slug === current;
            return (
              <li key={s.slug}>
                <Link
                  href={`/${s.slug}`}
                  aria-current={ariaCurrent(s.slug)}
                  className={`block whitespace-nowrap rounded-full px-3 py-1.5 text-xs outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                    on ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {s.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <details
        ref={menuRef}
        open={open}
        onToggle={(e) => setOpen(e.currentTarget.open)}
        className="group relative lg:hidden"
      >
        <summary
          aria-label="Menú de secciones"
          className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 bg-[rgba(2,4,10,0.45)] text-white/90 outline-none backdrop-blur-md transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300 [&::-webkit-details-marker]:hidden"
        >
          {/* Tres rayas que se cruzan en una X al abrir */}
          <span aria-hidden className="relative block h-3.5 w-5">
            <span className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-current transition-transform duration-300 group-open:translate-y-1.5 group-open:rotate-45" />
            <span className="absolute inset-x-0 top-1.5 h-0.5 rounded-full bg-current transition-opacity duration-300 group-open:opacity-0" />
            <span className="absolute inset-x-0 top-3 h-0.5 rounded-full bg-current transition-transform duration-300 group-open:-translate-y-1.5 group-open:-rotate-45" />
          </span>
        </summary>
        <nav
          aria-label="Secciones"
          className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[rgba(2,4,10,0.85)] p-2 shadow-xl backdrop-blur-md"
        >
          <ul>
            {sections.map((s) => {
              const on = s.slug === current;
              return (
                <li key={s.slug}>
                  <Link
                    href={`/${s.slug}`}
                    aria-current={ariaCurrent(s.slug)}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 font-display text-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                      on ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {s.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </details>
    </>
  );
}
