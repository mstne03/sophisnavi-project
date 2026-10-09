"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { ABOUT_ID } from "./home-anchors";
const SCROLLBAR_CLASS = "home-no-scrollbar";

// Pestañas de la portada (arriba a la izquierda): Inicio (menú de secciones) y Quién soy (bienvenida de Notion).
// La página no muestra barra de desplazamiento: se navega con las pestañas, que desplazan con transición
// y reflejan la posición en la URL (#quien-soy). El fondo 3D es fijo y sigue visible en las dos.
export function HomeNav() {
  const [active, setActive] = useState<"inicio" | "about">(() =>
    typeof window !== "undefined" && window.location.hash === `#${ABOUT_ID}` ? "about" : "inicio",
  );

  useEffect(() => {
    document.documentElement.classList.add(SCROLLBAR_CLASS);
    return () => document.documentElement.classList.remove(SCROLLBAR_CLASS);
  }, []);

  // La pestaña activa sigue al desplazamiento (rueda, teclado o pestaña), no solo al clic.
  useEffect(() => {
    const about = document.getElementById(ABOUT_ID);
    if (!about || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting ? "about" : "inicio"), { threshold: 0.4 });
    io.observe(about);
    return () => io.disconnect();
  }, []);

  const go = (tab: "inicio" | "about") => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = tab === "about" ? document.getElementById(ABOUT_ID) : null;
    if (tab === "about" && !target) return;
    (target ?? document.documentElement).scrollIntoView?.({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", tab === "about" ? `#${ABOUT_ID}` : window.location.pathname);
    setActive(tab);
  };

  const tab = (tab: "inicio" | "about", href: string, label: string) => {
    const on = active === tab;
    return (
      <a
        href={href}
        onClick={go(tab)}
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
    <nav aria-label="Portada" className="fixed top-5 left-5 z-20 flex gap-1 rounded-full border border-white/10 bg-[rgba(2,4,10,0.45)] p-1 backdrop-blur-md">
      {tab("inicio", "/", "Inicio")}
      {tab("about", `#${ABOUT_ID}`, "Quién soy")}
    </nav>
  );
}
