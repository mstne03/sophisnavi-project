import { describe, expect, it } from "vitest";
import { buildTree, rng, smooth } from "./geometry";

// Caracterización (paso 0.5): fija el comportamiento del árbol antes y después de dividir tree-scene.ts.
describe("rng", () => {
  it("es determinista y devuelve valores en [0, 1)", () => {
    const a = rng(7), b = rng(7);
    const xs = Array.from({ length: 50 }, () => a());
    expect(xs).toEqual(Array.from({ length: 50 }, () => b()));
    for (const x of xs) expect(x >= 0 && x < 1).toBe(true);
  });

  it("cambia con la semilla", () => {
    expect(rng(7)()).not.toBe(rng(8)());
  });
});

describe("smooth", () => {
  it("es 0 antes de a, 1 después de b y 0,5 en el centro", () => {
    expect(smooth(2, 4, 1)).toBe(0);
    expect(smooth(2, 4, 5)).toBe(1);
    expect(smooth(2, 4, 3)).toBe(0.5);
  });
});

describe("buildTree", () => {
  const tree = buildTree(rng(7));

  it("con la semilla 7 produce siempre la misma geometría", () => {
    const again = buildTree(rng(7));
    expect(tree.geometry.attributes.position.count).toBe(again.geometry.attributes.position.count);
    expect(tree.anchors.map((a) => a.toArray())).toEqual(again.anchors.map((a) => a.toArray()));
  });

  it("tiene el número de vértices y anclajes de la versión original", () => {
    expect(tree.geometry.attributes.position.count).toBe(13104);
    expect(tree.anchors).toHaveLength(336);
  });
});
