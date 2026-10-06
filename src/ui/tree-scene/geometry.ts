import * as THREE from "three";

import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// PRNG determinista: el árbol es idéntico en cada carga.
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

export function buildTree(rand: () => number) {
  const tubes: THREE.BufferGeometry[] = [];
  const anchors: THREE.Vector3[] = [];
  const v = new THREE.Vector3();

  // Rama = tubo curvo que se estrecha; con la profundidad cae más (silueta de sauce).
  function grow(start: THREE.Vector3, dir: THREE.Vector3, length: number, radius: number, depth: number, root = false) {
    const steps = 5;
    const p = start.clone();
    const d = dir.clone();
    const pts = [p.clone()];
    for (let i = 0; i < steps; i++) {
      d.x += (rand() - 0.5) * 0.3;
      d.z += (rand() - 0.5) * 0.3;
      d.y -= (root ? 0.22 : depth * 0.09);
      d.normalize();
      p.addScaledVector(d, length / steps);
      pts.push(p.clone());
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const seg = 20;
    const radial = depth < 2 ? 8 : 5;
    const geo = new THREE.TubeGeometry(curve, seg, radius, radial, false);
    const pos = geo.attributes.position;
    for (let i = 0; i <= seg; i++) {
      const c = curve.getPointAt(i / seg);
      const k = 1 - (i / seg) * 0.7;
      for (let j = 0; j <= radial; j++) {
        const idx = i * (radial + 1) + j;
        v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(k).add(c);
        pos.setXYZ(idx, v.x, v.y, v.z);
      }
    }
    tubes.push(geo);
    if (root) return;
    if (depth >= 2) for (let i = 0; i < 4; i++) anchors.push(curve.getPointAt(0.3 + rand() * 0.7));
    if (depth === 3) return;

    const children = depth === 0 ? 7 : 3;
    for (let i = 0; i < children; i++) {
      const u = depth === 0 ? 0.55 + (i / children) * 0.45 : 0.4 + rand() * 0.6;
      const angle = depth === 0 ? (i / children) * Math.PI * 2 + rand() * 0.5 : rand() * Math.PI * 2;
      const out = new THREE.Vector3(Math.cos(angle), depth === 0 ? 0.55 + rand() * 0.4 : 0.2 + rand() * 0.3, Math.sin(angle));
      const nd = curve.getTangentAt(u).multiplyScalar(0.3).add(out).normalize();
      const len = length * (depth === 0 ? 0.8 : 0.62) * (0.8 + rand() * 0.4);
      grow(curve.getPointAt(u), nd, len, radius * (1 - u * 0.7) * 0.75, depth + 1);
    }
  }

  grow(new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(0, 1, 0), 3.4, 0.6, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + rand() * 0.4;
    grow(new THREE.Vector3(0, 0.6, 0), new THREE.Vector3(Math.cos(a), 0.25, Math.sin(a)), 2 + rand(), 0.28, 3, true);
  }
  return { geometry: mergeGeometries(tubes), anchors };
}
