import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export type TreeScene = { skipIntro(): void; time(): number; dispose(): void };

type Options = {
  reducedMotion: boolean;
  skipIntro: boolean;
  startTime?: number; // segundos; para continuar la escena donde iba al volver a la portada
  onIntroDone: () => void;
};

const INTRO = 6; // duración de la intro en segundos

// PRNG determinista: el árbol es idéntico en cada carga.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

function buildTree(rand: () => number) {
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

const treeShader = {
  vertex: /* glsl */ `
    varying vec2 vUv; varying vec3 vPos; varying vec3 vN; varying vec3 vView;
    void main() {
      vUv = uv; vPos = position;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragment: /* glsl */ `
    uniform float uTime; uniform float uReveal;
    varying vec2 vUv; varying vec3 vPos; varying vec3 vN; varying vec3 vView;
    void main() {
      float fres = pow(1.0 - max(dot(vN, vView), 0.0), 2.5);
      float flow = vPos.y * 0.35 + length(vPos.xz) * 0.25;
      float mask = smoothstep(flow - 0.4, flow, uReveal * 4.0);
      float vein = pow(abs(sin(vUv.y * 18.85 + vUv.x * 6.0 + sin(vUv.x * 20.0) * 0.6)), 24.0);
      float pulse = pow(0.5 + 0.5 * sin((flow - uTime * 0.6) * 5.0), 6.0);
      vec3 veinCol = mix(vec3(0.3, 0.85, 1.0), vec3(1.0, 0.35, 0.85), smoothstep(0.5, 2.5, flow));
      vec3 bark = vec3(0.03, 0.025, 0.07) + vec3(0.22, 0.1, 0.5) * fres;
      vec3 col = bark + veinCol * mask * (vein * (0.25 + 1.3 * pulse) + fres * 0.15);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

const tendrilShader = {
  vertex: /* glsl */ `
    attribute float aT; attribute float aLen; attribute float aSeed;
    uniform float uTime; uniform float uReveal; uniform float uPixel;
    varying float vAlpha; varying vec3 vCol;
    void main() {
      vec3 p = position;
      float t = aT;
      p.y -= t * aLen;
      float sway = t * t;
      p.x += sin(uTime * 0.7 + aSeed * 6.28 + t * 2.5) * 0.22 * sway;
      p.z += cos(uTime * 0.55 + aSeed * 4.0 + t * 2.0) * 0.18 * sway;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float grow = smoothstep(t, t + 0.08, uReveal * 1.25 - aSeed * 0.25);
      float travel = pow(0.5 + 0.5 * sin(t * 9.0 - uTime * 2.2 + aSeed * 6.28), 8.0);
      vAlpha = grow * (0.35 + 0.65 * travel) * (1.0 - smoothstep(0.85, 1.0, t) * 0.7);
      vCol = mix(vec3(1.0, 0.45, 0.95), vec3(0.5, 0.7, 1.0), t);
      gl_PointSize = max(uPixel * (0.7 + travel) * (18.0 / -mv.z), 1.0);
    }`,
  fragment: /* glsl */ `
    varying float vAlpha; varying vec3 vCol;
    void main() {
      float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
      gl_FragColor = vec4(vCol, a * a * vAlpha);
    }`,
};

// Atokirina' (semillas del árbol sagrado): núcleo, filamentos radiales y halo.
const spriteShader = {
  vertex: /* glsl */ `
    attribute float aSeed;
    uniform float uTime; uniform float uReveal; uniform float uPixel;
    varying float vAlpha;
    void main() {
      float h = mod(uTime * 0.12 * (0.5 + aSeed) + aSeed * 8.0, 8.0);
      vec3 p = position + vec3(sin(uTime * 0.2 + aSeed * 10.0) * 0.8, h, cos(uTime * 0.17 + aSeed * 7.0) * 0.8);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      vAlpha = uReveal * smoothstep(0.0, 1.0, h) * smoothstep(8.0, 6.5, h) * (0.7 + 0.3 * sin(uTime * 2.0 + aSeed * 20.0));
      gl_PointSize = uPixel * (110.0 + aSeed * 60.0) / -mv.z;
    }`,
  fragment: /* glsl */ `
    uniform float uTime; varying float vAlpha;
    void main() {
      vec2 c = gl_PointCoord - 0.5; c.y = -c.y;
      vec2 k = c - vec2(0.0, 0.08);
      float r = length(k);
      float core = smoothstep(0.1, 0.0, r);
      float fil = pow(abs(cos(atan(k.y, k.x) * 8.0 + uTime * 0.5)), 30.0) * smoothstep(0.42, 0.08, r);
      float halo = smoothstep(0.5, 0.0, length(c)) * 0.25;
      gl_FragColor = vec4(vec3(0.85, 0.95, 1.0), (core + fil * 0.6 + halo) * vAlpha);
    }`,
};

const sporeShader = {
  vertex: /* glsl */ `
    attribute float aSeed;
    uniform float uTime; uniform float uReveal; uniform float uPixel;
    varying float vAlpha;
    void main() {
      vec3 p = position + vec3(sin(uTime * 0.1 + aSeed * 9.0), sin(uTime * 0.15 + aSeed * 5.0) * 0.5, 0.0);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      vAlpha = uReveal * pow(0.5 + 0.5 * sin(uTime * (0.5 + aSeed) + aSeed * 30.0), 3.0);
      gl_PointSize = max(uPixel * 14.0 / -mv.z, 1.0);
    }`,
  fragment: /* glsl */ `
    varying float vAlpha;
    void main() {
      float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
      gl_FragColor = vec4(0.45, 1.0, 0.85, a * vAlpha);
    }`,
};

const groundShader = {
  vertex: /* glsl */ `
    varying vec2 vXZ;
    void main() { vXZ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragment: /* glsl */ `
    uniform float uTime; uniform float uReveal; varying vec2 vXZ;
    void main() {
      float r = length(vXZ);
      float vein = pow(abs(sin(atan(vXZ.y, vXZ.x) * 11.0 + sin(r * 1.7) * 1.5)), 40.0) * exp(-r * 0.25);
      float pulse = 0.4 + 0.6 * pow(0.5 + 0.5 * sin(r * 2.0 - uTime * 1.5), 4.0);
      float glow = exp(-r * 0.45) * 0.35;
      vec3 col = vec3(0.6, 0.3, 1.0) * glow + vec3(0.3, 0.8, 1.0) * vein * pulse;
      float reveal = smoothstep(r - 1.0, r, uReveal * 14.0);
      gl_FragColor = vec4(vec3(0.01, 0.02, 0.04) + col * reveal, smoothstep(14.0, 5.0, r));
    }`,
};

const skyShader = {
  vertex: /* glsl */ `
    varying float vY;
    void main() { vY = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragment: /* glsl */ `
    varying float vY;
    void main() {
      vec3 col = mix(vec3(0.008, 0.016, 0.04), vec3(0.03, 0.09, 0.14), smoothstep(-0.2, 0.05, vY));
      col = mix(col, vec3(0.04, 0.02, 0.1), smoothstep(0.05, 0.6, vY));
      gl_FragColor = vec4(col, 1.0);
    }`,
};

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(220,110,255,0.9)");
  grad.addColorStop(0.4, "rgba(120,60,220,0.3)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function createTreeScene(canvas: HTMLCanvasElement, opts: Options): TreeScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  // ponytail: DPR limitado a 1.5; subir si en pantallas 4K se ve blando y el rendimiento lo permite.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const small = window.innerWidth < 768;
  const rand = rng(7);

  const uniforms = {
    uTime: { value: 0 },
    uPixel: { value: 1 },
  };
  const reveal = (v = 0) => ({ value: v });
  const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;

  const tree = buildTree(rand);
  const treeU = { ...uniforms, uReveal: reveal() };
  scene.add(new THREE.Mesh(tree.geometry, new THREE.ShaderMaterial({ uniforms: treeU, vertexShader: treeShader.vertex, fragmentShader: treeShader.fragment })));

  // Lianas luminosas: cada una es una columna de puntos que el shader descuelga y mece.
  const anchors = small ? tree.anchors.filter((_, i) => i % 2 === 0) : tree.anchors;
  const perStrand = small ? 36 : 48;
  const n = anchors.length * perStrand;
  const tPos = new Float32Array(n * 3), tT = new Float32Array(n), tLen = new Float32Array(n), tSeed = new Float32Array(n);
  anchors.forEach((a, s) => {
    const len = Math.max(a.y - (0.1 + rand() * 0.6), 0.5);
    const seed = rand();
    for (let i = 0; i < perStrand; i++) {
      const k = s * perStrand + i;
      tPos.set([a.x, a.y, a.z], k * 3);
      tT[k] = i / (perStrand - 1);
      tLen[k] = len;
      tSeed[k] = seed;
    }
  });
  const tendrilGeo = new THREE.BufferGeometry();
  tendrilGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3));
  tendrilGeo.setAttribute("aT", new THREE.BufferAttribute(tT, 1));
  tendrilGeo.setAttribute("aLen", new THREE.BufferAttribute(tLen, 1));
  tendrilGeo.setAttribute("aSeed", new THREE.BufferAttribute(tSeed, 1));
  const tendrilU = { ...uniforms, uReveal: reveal() };
  const tendrils = new THREE.Points(tendrilGeo, new THREE.ShaderMaterial({ uniforms: tendrilU, vertexShader: tendrilShader.vertex, fragmentShader: tendrilShader.fragment, ...additive }));
  tendrils.frustumCulled = false; // el shader desplaza los vértices fuera de la caja original
  scene.add(tendrils);

  function particles(count: number, place: (i: number) => [number, number, number], shader: { vertex: string; fragment: string }) {
    const pos = new Float32Array(count * 3), seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set(place(i), i * 3);
      seed[i] = rand();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const u = { ...uniforms, uReveal: reveal() };
    const pts = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: shader.vertex, fragmentShader: shader.fragment, ...additive }));
    pts.frustumCulled = false;
    scene.add(pts);
    return u;
  }
  const spritesU = particles(small ? 45 : 90, () => {
    const a = rand() * Math.PI * 2, r = 1 + rand() * 6;
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  }, spriteShader);
  const sporesU = particles(small ? 350 : 700, () => [(rand() - 0.5) * 24, rand() * 10, -12 + rand() * 16], sporeShader);

  const groundU = { ...uniforms, uReveal: reveal() };
  const ground = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.ShaderMaterial({ uniforms: groundU, vertexShader: groundShader.vertex, fragmentShader: groundShader.fragment, transparent: true, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  scene.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.ShaderMaterial({ vertexShader: skyShader.vertex, fragmentShader: skyShader.fragment, side: THREE.BackSide, depthWrite: false })));

  const glowMap = glowTexture();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  glow.position.set(0, 4.5, -1);
  glow.scale.set(16, 12, 1);
  scene.add(glow);

  // Parallax suave con el puntero.
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // En vertical el árbol no cabe: alejamos la cámara con el FOV.
    camera.fov = w < h ? 62 : 45;
    camera.updateProjectionMatrix();
    uniforms.uPixel.value = renderer.getPixelRatio() * (h / 500);
    if (opts.reducedMotion) render();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const startTime = Math.max(opts.startTime ?? 0, opts.skipIntro || opts.reducedMotion ? INTRO : 0);
  let start = performance.now() - startTime * 1000;
  let introDone = false;
  const look = new THREE.Vector3();

  function render() {
    const t = opts.reducedMotion ? INTRO + 2 : (performance.now() - start) / 1000;
    uniforms.uTime.value = t;
    treeU.uReveal.value = smooth(0.2, 3.5, t);
    tendrilU.uReveal.value = smooth(0.8, 5.0, t);
    groundU.uReveal.value = smooth(0.0, 4.0, t);
    spritesU.uReveal.value = smooth(2.5, 5.5, t);
    sporesU.uReveal.value = smooth(1.0, 4.0, t);
    glow.material.opacity = 0.35 * smooth(1.5, 5.0, t);

    pointer.x += (pointer.tx - pointer.x) * 0.03;
    pointer.y += (pointer.ty - pointer.y) * 0.03;
    const e = smooth(0, INTRO, t);
    const angle = -0.5 + 0.65 * e + Math.max(0, t - INTRO) * 0.025 + pointer.x * 0.08;
    const radius = 15 - 4.5 * e;
    camera.position.set(Math.sin(angle) * radius, 0.8 + 2.4 * e - pointer.y * 0.4, Math.cos(angle) * radius);
    camera.lookAt(look.set(0, 2.2 + 1.4 * e, 0));
    renderer.render(scene, camera);

    if (!introDone && t >= INTRO) {
      introDone = true;
      opts.onIntroDone();
    }
  }

  resize();
  if (opts.reducedMotion) render();
  else renderer.setAnimationLoop(render); // rAF: se pausa solo con la pestaña oculta

  return {
    skipIntro() {
      if (!introDone) start = performance.now() - INTRO * 1000;
    },
    time() {
      return (performance.now() - start) / 1000;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.Sprite) {
          o.geometry.dispose();
          o.material.dispose();
        }
      });
      glowMap.dispose();
      renderer.dispose();
    },
  };
}
