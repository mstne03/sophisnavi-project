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

// Tarjeta 1200×630 para redes (docs/content/og-images.md). Solo CSS que entiende Satori (flex, sin grid).
export function ogImage({ kicker, headline }: { kicker: string; headline: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 72,
        background: "radial-gradient(ellipse at 50% 100%, #1a0b2e, #02040a 70%)",
        color: "#fff",
        fontFamily: "Marcellus",
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: "#a5f3fc" }}>{kicker}</div>
      <div style={{ marginTop: 16, fontSize: 88, lineHeight: 1.1 }}>{headline}</div>
      <div style={{ marginTop: 28, width: 220, height: 4, background: "linear-gradient(90deg, #67e8f9, #e879f9)" }} />
      <div style={{ marginTop: 40, fontSize: 28, color: "rgba(255,255,255,0.7)" }}>sophisnavi.com</div>
    </div>
  );
}
