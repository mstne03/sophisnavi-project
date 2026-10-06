// Shaders GLSL de la escena. Sin lógica: excluidos de cobertura (ADR-0006).
export const treeShader = {
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

export const tendrilShader = {
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
export const spriteShader = {
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

export const sporeShader = {
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

export const groundShader = {
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

export const skyShader = {
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
