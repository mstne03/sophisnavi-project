"use client";

import { useLayoutEffect, useRef, useSyncExternalStore, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

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

// Al final de cada entrada, enlaces discretos a la anterior (a la izquierda, salvo en la primera) y a la siguiente (a la
// derecha, salvo en la última). Cada uno elige su entrada, sube al selector y le da el foco a su pestaña, así el lector
// de pantalla anuncia el cambio y el teclado sigue en el sitio esperado. Son enlaces al hash de la entrada: sin JS o con
// clic secundario siguen apuntando a ella.
export function EntryTabs({
  label,
  tabs,
  panels,
  prevLabel = "Anterior",
  nextLabel = "Siguiente",
}: {
  label: string;
  tabs: EntryTab[];
  panels: ReactNode[];
  prevLabel?: string;
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

  // Los enlaces de pie piden subir al selector, pero el salto se hace después de pintar la entrada nueva. Lanzado antes
  // (y suave), el cambio de entrada llegaba con el desplazamiento en curso y Safari lo cancelaba en algunos clics: al
  // pasar a una entrada más corta recorta el scroll al nuevo final de página y la página se quedaba abajo. Ya con la
  // entrada nueva en el DOM, se calcula la posición exacta y se salta sin animación; el contenido cambia de golpe
  // igualmente. Se repasa en el fotograma siguiente por si el navegador aún reajusta el scroll tras pintar.
  const jumpToList = useRef(false);
  const goTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    jumpToList.current = true;
    select(id);
  };
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!jumpToList.current || !list) return;
    jumpToList.current = false;
    document.getElementById(`tab-${selected}`)?.focus({ preventScroll: true });
    jumpTo(list);
    const frame = requestAnimationFrame(() => jumpTo(list));
    return () => cancelAnimationFrame(frame);
  }, [selected]);

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
        const prev = tabs[i - 1];
        const next = tabs[i + 1];
        return (
          <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={t.id !== selected}>
            {panels[i]}
            {(prev || next) && (
              <div className="mt-12 flex items-start justify-between gap-6 border-t border-white/10 pt-6">
                {prev && <EntryStep entry={prev} label={prevLabel} direction="prev" onClick={(e) => goTo(e, prev.id)} />}
                {next && <EntryStep entry={next} label={nextLabel} direction="next" onClick={(e) => goTo(e, next.id)} />}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// Coloca `el` arriba de la ventana, bajo la barra superior (su scroll-margin-top), sin animación. No usa
// behavior: "instant", que Safari no reconoce en todas sus versiones (lanza TypeError): quita un momento el
// scroll-behavior: smooth de html y usa la forma de dos números, que entienden todos. Si ya está ahí no hace nada.
function jumpTo(el: HTMLElement) {
  const offset = el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
  if (Math.abs(offset) < 1) return;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(window.scrollX, window.scrollY + offset);
  root.style.scrollBehavior = previous;
}

// Enlace de paso a otra entrada: etiqueta pequeña («Personaje anterior») y el nombre con su flecha, alineado hacia
// donde lleva. aria-label con el texto visible completo («Personaje anterior: Jake Sully»).
function EntryStep({
  entry,
  label,
  direction,
  onClick,
}: {
  entry: EntryTab;
  label: string;
  direction: "prev" | "next";
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const isNext = direction === "next";
  return (
    <a
      href={`#${entry.id}`}
      aria-label={`${label}: ${entry.label}`}
      onClick={onClick}
      className={`group flex flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#02040a] ${
        isNext ? "ml-auto items-end text-right" : "items-start"
      }`}
    >
      <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">{label}</span>
      <span className="mt-1 font-display text-xl text-white/85 transition-colors group-hover:text-white">
        {!isNext && (
          <span aria-hidden className="mr-1 inline-block text-fuchsia-200 transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
        )}
        {entry.label}
        {isNext && (
          <span aria-hidden className="ml-1 inline-block text-fuchsia-200 transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        )}
      </span>
    </a>
  );
}
