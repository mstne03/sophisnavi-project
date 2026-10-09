export const OG_SIZE = { width: 1200, height: 630 };

// Tarjeta 1200×630 para redes (docs/content/og-images.md). Solo CSS que entiende Satori (flex, sin grid).
// ponytail: fuente por defecto de Satori; cambiar por Marcellus TTF local cuando se decida el diseño final.
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
        fontFamily: "serif",
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: "#a5f3fc" }}>{kicker}</div>
      <div style={{ marginTop: 16, fontSize: 96, lineHeight: 1.05 }}>{headline}</div>
      <div style={{ marginTop: 28, width: 220, height: 4, background: "linear-gradient(90deg, #67e8f9, #e879f9)" }} />
      <div style={{ marginTop: 40, fontSize: 28, color: "rgba(255,255,255,0.7)" }}>sophisnavi.com</div>
    </div>
  );
}
