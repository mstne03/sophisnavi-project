"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { TreeScene } from "@/ui/tree-scene/renderer";
import { ABOUT_ID } from "./home-anchors";
import { HomeNav, type HomeView } from "./home-nav";
import { MainMenu, type MenuSection } from "./main-menu";

const SEEN_KEY = "sophisnavi:intro-seen";
const TITLE = "Sophisnavi";

// Estado de la visita: sobrevive a las navegaciones en cliente (se reinicia al recargar),
// así al volver desde una sección no se repite la intro ni se pierde el scroll.
const visit = { introDone: false, sceneTime: 0, scrollY: 0 };

// `about` es la bienvenida de Notion renderizada en el servidor: panel a pantalla completa con scroll propio.
export function Experience({ sections, about }: { sections: MenuSection[]; about?: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<TreeScene | null>(null);
  // En la carga completa vale false igual que en el servidor: no hay desajuste de hidratación.
  const [returning] = useState(() => visit.introDone);
  const [phase, setPhase] = useState<"intro" | "menu">(returning ? "menu" : "intro");
  const [ready, setReady] = useState(returning);

  // Restaura antes del primer pintado (sin salto visible). La posición se lee al desmontar,
  // que ocurre antes de que Next suba al principio de la página nueva; no depende de eventos
  // `scroll`, que pueden no haber llegado aún si el usuario hace clic justo después de desplazarse.
  useLayoutEffect(() => {
    const main = mainRef.current;
    if (returning && main) main.scrollTop = visit.scrollY;
    return () => {
      visit.scrollY = main?.scrollTop ?? 0;
    };
  }, [returning]);

  useEffect(() => {
    let disposed = false;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const done = () => {
      visit.introDone = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setPhase("menu");
    };

    // three.js se carga aparte: no bloquea el primer render de la página.
    import("@/ui/tree-scene/renderer")
      .then(({ createTreeScene }) => {
        if (disposed || !canvasRef.current) return;
        sceneRef.current = createTreeScene(canvasRef.current, {
          reducedMotion,
          skipIntro: seen,
          startTime: returning ? visit.sceneTime : 0,
          onIntroDone: done,
        });
        setReady(true);
      })
      .catch(done); // sin WebGL: directo al menú sobre el fondo oscuro

    return () => {
      disposed = true;
      if (sceneRef.current) visit.sceneTime = sceneRef.current.time();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [returning]);

  const skip = () => sceneRef.current?.skipIntro();

  // Vista de la portada. Se lee del hash tras montar (no en el render inicial: el servidor no lo conoce)
  // y se sincroniza con el historial: la pestaña hace pushState, el botón «atrás» dispara popstate.
  const [view, setView] = useState<HomeView>("inicio");
  useEffect(() => {
    const fromHash = () => setView(window.location.hash === `#${ABOUT_ID}` ? "about" : "inicio");
    fromHash();
    window.addEventListener("popstate", fromHash);
    return () => window.removeEventListener("popstate", fromHash);
  }, []);
  const select = (next: HomeView) => {
    if (next === view) return;
    history.pushState(null, "", next === "about" ? `#${ABOUT_ID}` : window.location.pathname);
    setView(next);
  };

  useEffect(() => {
    if (phase !== "intro") return;
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", "Escape", " "].includes(e.key)) sceneRef.current?.skipIntro();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  return (
    <main ref={mainRef} className="home-no-scrollbar relative h-dvh overflow-x-hidden overflow-y-auto bg-[#02040a] text-white">
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`fixed inset-0 h-full w-full transition-opacity duration-[2000ms] ${ready ? "opacity-100" : "opacity-0"}`}
      />
      {/* Velo oscuro tras el menú para garantizar contraste del texto sobre el árbol */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(2,4,10,0.45),rgba(2,4,10,0.85))] transition-opacity duration-[1500ms] ${phase === "menu" ? "opacity-100" : "opacity-0"}`}
      />

      <AnimatePresence mode="wait">
        {phase === "intro" ? (
          <motion.div
            key="intro"
            className="fixed inset-0 z-10 flex cursor-pointer flex-col items-center justify-end pb-[18vh]"
            onClick={skip}
            exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.8 } }}
          >
            <h1 aria-label={TITLE} className="font-display text-5xl tracking-[0.2em] text-white sm:text-7xl">
              {TITLE.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="inline-block [text-shadow:0_0_30px_rgba(232,121,249,0.7)]"
                  initial={{ opacity: 0, y: 12, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 1.8 + i * 0.09, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {ch}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="mt-4 text-xs uppercase tracking-[0.5em] text-cyan-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.4, duration: 1.2 }}
            >
              Eywa ngahu
            </motion.p>
            <motion.button
              type="button"
              onClick={skip}
              className="absolute right-6 bottom-6 rounded-full px-4 py-2 text-sm text-white/80 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Saltar intro
            </motion.button>
          </motion.div>
        ) : (
          // inert: con «Quién soy» abierto el menú no recibe foco ni clics
          <div key="menu" inert={view === "about" || undefined}>
            <MainMenu sections={sections} animateIn={!returning} />
          </div>
        )}
      </AnimatePresence>
      {phase === "menu" && <HomeNav view={view} onSelect={select} />}

      {/* «Quién soy»: encima del menú, con su propio scroll; el fondo 3D (fijo) sigue detrás. */}
      <AnimatePresence>
        {about && phase === "menu" && view === "about" && (
          <motion.div
            key="about"
            id={ABOUT_ID}
            className="home-no-scrollbar fixed inset-0 z-10 overflow-y-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {about}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sin JS (y para los bots) la bienvenida sigue en el HTML, pero no ocupa sitio ni se alcanza por scroll. */}
      {about && !(phase === "menu" && view === "about") && <div hidden>{about}</div>}
    </main>
  );
}
