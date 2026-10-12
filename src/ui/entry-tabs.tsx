"use client";

import { useRef, useSyncExternalStore, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

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

// Al final de cada entrada (salvo la última) un enlace discreto lleva a la siguiente: la elige, sube al selector y le da
// el foco a su pestaña, así el lector de pantalla anuncia el cambio y el teclado sigue en el sitio esperado. Es un enlace
// al hash de la entrada: sin JS o con clic secundario sigue apuntando a ella.
export function EntryTabs({
  label,
  tabs,
  panels,
  nextLabel = "Siguiente",
}: {
  label: string;
  tabs: EntryTab[];
  panels: ReactNode[];
  nextLabel?: string;
}) {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const listRef = useRef<HTMLDivElement>(null);
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

  const goTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    select(id);
    document.getElementById(`tab-${id}`)?.focus({ preventScroll: true });
    // scroll-behavior de html decide si es suave (y lo quita con prefers-reduced-motion).
    listRef.current?.scrollIntoView({ block: "start" });
  };

  return (
    <>
      <div ref={listRef} role="tablist" aria-label={label} className="mt-10 flex scroll-mt-28 flex-wrap gap-2">
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
      {tabs.map((t, i) => {
        const next = tabs[i + 1];
        return (
          <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={t.id !== selected}>
            {panels[i]}
            {next && (
              <div className="mt-12 flex justify-end border-t border-white/10 pt-6">
                <a
                  href={`#${next.id}`}
                  aria-label={`${nextLabel}: ${next.label}`}
                  onClick={(e) => goTo(e, next.id)}
                  className="group flex flex-col items-end rounded-lg text-right outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#02040a]"
                >
                  <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">{nextLabel}</span>
                  <span className="mt-1 font-display text-xl text-white/85 transition-colors group-hover:text-white">
                    {next.label}{" "}
                    <span aria-hidden className="inline-block text-fuchsia-200 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </a>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
