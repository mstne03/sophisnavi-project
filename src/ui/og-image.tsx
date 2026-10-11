import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

// Marcellus, la misma tipografía de los títulos de la web (layout.tsx la carga de Google Fonts). Satori no lee WOFF2 ni
// usa las fuentes del sistema, así que el TTF va en el repo (SIL OFL 1.1, src/ui/fonts/OFL.txt). Ruta desde la raíz
// del proyecto: así el trazado de ficheros de Next la incluye y vale tanto en el build como en un render bajo demanda.
export async function ogOptions() {
  const data = await readFile(join(process.cwd(), "src/ui/fonts/Marcellus-Regular.ttf"));
  return { ...OG_SIZE, fonts: [{ name: "Marcellus", data, weight: 400 as const, style: "normal" as const }] };
}

// El árbol de la marca sin fondo (src/ui/og-tree.png, 640 px de alto) como data URL: Satori no resuelve rutas públicas.
export async function ogMark(): Promise<string> {
  const png = await readFile(join(process.cwd(), "src/ui/og-tree.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

// Tarjeta 1200×630 para redes (docs/content/og-images.md). Solo CSS que entiende Satori (flex, sin grid).
// Texto a la izquierda y, si se pasa, el árbol a la derecha (en la zona que las redes no recortan al centrar).
export function ogImage({ kicker, headline, mark }: { kicker: string; headline: string; mark?: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "stretch",
        padding: 72,
        background: "radial-gradient(ellipse at 50% 100%, #1a0b2e, #02040a 70%)",
        color: "#fff",
        fontFamily: "Marcellus",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 0 }}>
        <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: "#a5f3fc" }}>{kicker}</div>
        <div style={{ marginTop: 16, fontSize: 88, lineHeight: 1.1 }}>{headline}</div>
        <div style={{ marginTop: 28, width: 220, height: 4, background: "linear-gradient(90deg, #67e8f9, #e879f9)" }} />
        <div style={{ marginTop: 40, fontSize: 28, color: "rgba(255,255,255,0.7)" }}>sophisnavi.com</div>
      </div>
      {mark && (
        <div style={{ display: "flex", alignItems: "center", marginLeft: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori: solo <img> */}
          <img src={mark} alt="" width={352} height={400} style={{ width: 352, height: 400 }} />
        </div>
      )}
    </div>
  );
}
