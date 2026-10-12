"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import type { TreeScene } from "@/ui/tree-scene/renderer";
import { ABOUT_ID, ABOUT_PATH } from "./home-anchors";
import { TopBar } from "@/ui/top-bar";
import { HomeNav, type HomeView } from "./home-nav";
import { MainMenu, type MenuSection } from "./main-menu";

const SEEN_KEY = "sophisnavi:intro-seen";
const TITLE = "Sophisnavi";

const noSubscribe = () => () => {};

// Estado de la visita: sobrevive a las navegaciones en cliente (se reinicia al recargar),
// así al volver desde una sección no se repite la intro ni se pierde el scroll.
const visit = { introDone: false, sceneTime: 0, scrollY: 0 };

// Vive en el layout compartido de / y /quien-soy: al navegar entre las dos no se desmonta (ni la escena ni la pista),
// así el cambio de ruta es el mismo deslizamiento de siempre. `about` es la bienvenida de Notion renderizada en el
// servidor (panel a pantalla completa con scroll propio).
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
  // true solo en el cliente ya hidratado: el HTML del servidor no lleva la pista inert, así sin JS se puede usar.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);

  // Vista de la portada: sale de la ruta, que el servidor ya conoce (/quien-soy llega abierta desde el HTML) y el
  // historial mantiene (atrás/adelante son navegaciones del router). Al pulsar, la vista cambia en el acto y la ruta
  // la sigue: el deslizamiento no espera a que la navegación termine.
  const router = useRouter();
  const routeView: HomeView = usePathname() === ABOUT_PATH ? "about" : "inicio";
  const [pending, setPending] = useState<HomeView | null>(null);
  if (pending !== null && pending === routeView) setPending(null);
  const view = pending ?? routeView;
  const select = (next: HomeView) => {
    if (next === view) return;
    setPending(next);
    router.push(next === "about" ? ABOUT_PATH : "/", { scroll: false });
  };
  // Enlaces antiguos a /#quien-soy: el fragmento no llega al servidor, se pasa a la ruta en el cliente.
  useEffect(() => {
    if (window.location.hash === `#${ABOUT_ID}`) router.replace(ABOUT_PATH, { scroll: false });
  }, [router]);

  // La bienvenida completa solo entra en el DOM de /quien-soy o tras abrirla: en / no va y el
  // texto no se duplica entre las dos URL. Una vez abierta se queda, para que el deslizamiento de vuelta la muestre.
  const [aboutOpened, setAboutOpened] = useState(view === "about");
  if (view === "about" && !aboutOpened) setAboutOpened(true);

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

      {/* Pista horizontal: Inicio a la izquierda, «Quién soy» a la derecha. Siempre en el HTML del servidor (el menú con
          los enlaces a las secciones en /, la bienvenida en /quien-soy): la intro es solo una capa encima. Mientras dura,
          la pista queda transparente e inert; al terminar aparece cuando la intro ya se ha desvanecido y el menú entra
          con su animación. La pestaña desliza la pista (sin fundidos); cada vista tiene su propio scroll vertical y la
          que no se ve queda inert. Sin JS, el <noscript> del layout la muestra y quita la intro. */}
      <motion.div
        data-home-track
        className={`absolute inset-y-0 left-0 flex w-[200%] transition-opacity ${phase === "menu" ? "opacity-100 delay-700 duration-300" : "opacity-0 duration-0"}`}
        inert={(hydrated && phase === "intro") || undefined}
        initial={false}
        animate={{ x: view === "about" ? "-50%" : "0%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="home-no-scrollbar h-full w-1/2 overflow-x-hidden overflow-y-auto" inert={view === "about" || undefined}>
          <MainMenu sections={sections} animateIn={!returning} revealed={phase === "menu"} />
        </div>
        <div
          id={ABOUT_ID}
          className="home-no-scrollbar relative z-10 h-full w-1/2 overflow-x-hidden overflow-y-auto"
          inert={view === "inicio" || undefined}
        >
          {aboutOpened && about}
        </div>
      </motion.div>

      <AnimatePresence>
        {phase === "intro" && (
          <motion.div
            key="intro"
            data-home-intro
            className="fixed inset-0 z-10 flex cursor-pointer flex-col items-center justify-end pb-[18vh]"
            onClick={skip}
            exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.8 } }}
          >
            {/* El h1 de la página es el del menú (ya en el HTML); el título de la intro es decorativo y se lee una vez. */}
            <p className="font-display text-5xl tracking-[0.2em] text-white sm:text-7xl">
              <span className="sr-only">{TITLE}</span>
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
            </p>
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
        )}
      </AnimatePresence>
      {/* Barra superior: la marca siempre (también durante la intro); las pestañas solo tras la intro. */}
      <TopBar
        right={
          // Las pestañas van siempre en el HTML (el enlace a /quien-soy es rastreable desde la portada), pero se ven y
          // se pueden usar solo tras la intro; sin JS el <noscript> del layout las muestra.
          <div
            data-home-tabs
            className={`transition-opacity ${phase === "menu" ? "opacity-100 delay-700 duration-300" : "opacity-0 duration-0"}`}
            inert={(hydrated && phase === "intro") || undefined}
          >
            <HomeNav view={view} onSelect={select} />
          </div>
        }
      />
    </main>
  );
}
