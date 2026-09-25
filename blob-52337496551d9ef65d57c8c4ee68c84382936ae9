import * as THREE from "three";

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 color;
  attribute float aAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSize;
  uniform float uPixelRatio;

  void main() {
    vColor = color;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = max(-mv.z, 1.0);
    vSize = aSize;
    gl_PointSize = aSize * uPixelRatio * (130.0 / dist);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSize;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    if (d > 1.0) discard;
    float halo = smoothstep(1.0, 0.15, d);
    float core = exp(-d * d * 14.0);
    float alpha = (halo * 0.62 + core * 0.55) * vAlpha;
    vec3 col = vColor * (1.05 + core * 0.35);
    col.b = min(col.b * 1.08, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function createNocturneMaterial(dpr: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: dpr } },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
}

export function setNocturneDpr(mat: THREE.ShaderMaterial, dpr: number) {
  mat.uniforms.uPixelRatio!.value = dpr;
}
