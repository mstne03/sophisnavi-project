"use client";

import { useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";

export type EntryTab = { id: string; label: string };

// Selector de entradas de un artículo (SOPHIE-3): una pestaña por personaje y solo el panel elegido a la vista. Todo el
// contenido va en el HTML (buscadores y lectores de pantalla lo tienen entero); el cambio es solo mostrar/ocultar.
// La elegida vive en el hash de la URL (#neytiri): así se puede enlazar a un personaje concreto y atrás/adelante la
// respetan. En el servidor no hay hash y se pinta la primera; el cliente la corrige al hidratar si la URL trae otra.
const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

export function EntryTabs({ label, tabs, panels }: { label: string; tabs: EntryTab[]; panels: ReactNode[] }) {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const selected = tabs.some((t) => t.id === hash) ? hash : tabs[0]?.id;

  const select = (id: string) => {
    // replaceState no dispara hashchange: se avisa a mano. Sin entrada nueva en el historial, como en la portada.
    window.history.replaceState(window.history.state, "", `#${id}`);
    window.dispatchEvent(new Event("hashchange"));
  };

  // Flechas para moverse entre pestañas (patrón tabs de WAI-ARIA): el foco sigue a la pestaña activa.
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (delta === 0) return;
    e.preventDefault();
    const next = tabs[(i + delta + tabs.length) % tabs.length];
    select(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <>
      <div role="tablist" aria-label={label} className="mt-10 flex flex-wrap gap-2">
        {tabs.map((t, i) => {
          const on = t.id === selected;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`rounded-full border px-4 py-1.5 font-display text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                on ? "border-cyan-300/60 bg-white/15 text-white" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={t.id !== selected}>
          {panels[i]}
        </div>
      ))}
    </>
  );
}
