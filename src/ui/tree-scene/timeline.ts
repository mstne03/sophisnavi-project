import { smooth } from "./geometry";

export const INTRO = 6; // duración de la intro en segundos

export type Pointer = { x: number; y: number };

// Línea temporal pura de la intro: dado el tiempo t (segundos), qué se ha revelado y dónde está la cámara.
export function timeline(t: number, pointer: Pointer = { x: 0, y: 0 }) {
  const e = smooth(0, INTRO, t);
  const angle = -0.5 + 0.65 * e + Math.max(0, t - INTRO) * 0.025 + pointer.x * 0.08;
  const radius = 15 - 4.5 * e;
  return {
    reveal: {
      tree: smooth(0.2, 3.5, t),
      tendrils: smooth(0.8, 5.0, t),
      ground: smooth(0.0, 4.0, t),
      sprites: smooth(2.5, 5.5, t),
      spores: smooth(1.0, 4.0, t),
    },
    glow: 0.35 * smooth(1.5, 5.0, t),
    camera: {
      position: [Math.sin(angle) * radius, 0.8 + 2.4 * e - pointer.y * 0.4, Math.cos(angle) * radius] as const,
      look: [0, 2.2 + 1.4 * e, 0] as const,
    },
    introDone: t >= INTRO,
  };
}
