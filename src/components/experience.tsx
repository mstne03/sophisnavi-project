"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { TreeScene } from "@/lib/tree-scene";
import { MainMenu } from "./main-menu";

const SEEN_KEY = "sophisnavi:intro-seen";
const TITLE = "Sophisnavi";

// Estado de la visita: sobrevive a las navegaciones en cliente (se reinicia al recargar),
// así al volver desde una sección no se repite la intro ni se pierde el scroll.
const visit = { introDone: false, sceneTime: 0, scrollY: 0 };

export function Experience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<TreeScene | null>(null);
  // En la carga completa vale false igual que en el servidor: no hay desajuste de hidratación.
  const [returning] = useState(() => visit.introDone);
  const [phase, setPhase] = useState<"intro" | "menu">(returning ? "menu" : "intro");
  const [ready, setReady] = useState(returning);

  // Restaura antes del primer pintado (sin salto visible). La posición se lee al desmontar,
  // que ocurre antes de que Next suba al principio de la página nueva; no depende de eventos
  // `scroll`, que pueden no haber llegado aún si el usuario hace clic justo después de desplazarse.
  useLayoutEffect(() => {
    if (returning) window.scrollTo(0, visit.scrollY);
    return () => {
      visit.scrollY = window.scrollY;
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
    import("@/lib/tree-scene")
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

  useEffect(() => {
    if (phase !== "intro") return;
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", "Escape", " "].includes(e.key)) sceneRef.current?.skipIntro();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[#02040a] text-white">
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
          <MainMenu key="menu" animateIn={!returning} />
        )}
      </AnimatePresence>
    </main>
  );
}
