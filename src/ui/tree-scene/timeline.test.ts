import { describe, expect, it } from "vitest";
import { INTRO, timeline } from "./timeline";

// Caracterización (paso 0.5): la línea temporal de la intro (aparición y cámara) antes vivía dentro de render().
describe("timeline", () => {
  it("en t=0 nada está revelado y la cámara está lejos", () => {
    const f = timeline(0);
    expect(Object.values(f.reveal).every((v) => v === 0)).toBe(true);
    expect(f.glow).toBe(0);
    expect(f.introDone).toBe(false);
    const [x, y, z] = f.camera.position;
    expect(Math.hypot(x, z)).toBeCloseTo(15);
    expect(y).toBeCloseTo(0.8);
    expect(f.camera.look).toEqual([0, 2.2, 0]);
  });

  it("al acabar la intro todo está revelado y la cámara se ha acercado", () => {
    const f = timeline(INTRO);
    expect(Object.values(f.reveal).every((v) => v === 1)).toBe(true);
    expect(f.glow).toBeCloseTo(0.35);
    expect(f.introDone).toBe(true);
    const [x, y, z] = f.camera.position;
    expect(Math.hypot(x, z)).toBeCloseTo(10.5);
    expect(y).toBeCloseTo(3.2);
    expect(f.camera.look).toEqual([0, 3.6, 0]);
  });

  it("tras la intro la cámara sigue orbitando despacio", () => {
    const a = timeline(INTRO).camera.position[0];
    const b = timeline(INTRO + 10).camera.position[0];
    expect(a).not.toBeCloseTo(b);
  });

  it("el puntero desplaza la cámara", () => {
    expect(timeline(INTRO, { x: 1, y: 0 }).camera.position[0]).not.toBeCloseTo(timeline(INTRO).camera.position[0]);
    expect(timeline(INTRO, { x: 0, y: 1 }).camera.position[1]).toBeCloseTo(3.2 - 0.4);
  });
});
