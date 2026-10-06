// Conecta con WebGL: excluido de cobertura, lo cubre el E2E (ADR-0006).
import * as THREE from "three";
import { buildTree, rng } from "./geometry";
import { groundShader, skyShader, sporeShader, spriteShader, tendrilShader, treeShader } from "./shaders";
import { INTRO, timeline } from "./timeline";

export type TreeScene = { skipIntro(): void; time(): number; dispose(): void };

type Options = {
  reducedMotion: boolean;
  skipIntro: boolean;
  startTime?: number; // segundos; para continuar la escena donde iba al volver a la portada
  onIntroDone: () => void;
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
    pointer.x += (pointer.tx - pointer.x) * 0.03;
    pointer.y += (pointer.ty - pointer.y) * 0.03;
    const f = timeline(t, pointer);
    uniforms.uTime.value = t;
    treeU.uReveal.value = f.reveal.tree;
    tendrilU.uReveal.value = f.reveal.tendrils;
    groundU.uReveal.value = f.reveal.ground;
    spritesU.uReveal.value = f.reveal.sprites;
    sporesU.uReveal.value = f.reveal.spores;
    glow.material.opacity = f.glow;
    camera.position.set(...f.camera.position);
    camera.lookAt(look.set(...f.camera.look));
    renderer.render(scene, camera);

    if (!introDone && f.introDone) {
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
