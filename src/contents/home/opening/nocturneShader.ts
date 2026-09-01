import * as THREE from "three";

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vSize;
  uniform float uPixelRatio;

  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = max(-mv.z, 1.0);
    vSize = aSize;
    gl_PointSize = aSize * uPixelRatio * (240.0 / dist);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vSize;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    if (d > 1.0) discard;
    float halo = smoothstep(1.0, 0.18, d);
    float core = exp(-d * d * (vSize > 1.5 ? 4.0 : 10.0));
    float alpha = halo * (vSize > 1.5 ? 0.12 : 0.34) + core * (vSize > 1.5 ? 0.08 : 0.52);
    vec3 col = vColor * (0.42 + core * 0.75);
    col = min(col, vec3(0.58, 0.72, 0.88));
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
    blending: THREE.AdditiveBlending,
  });
}

export function setNocturneDpr(mat: THREE.ShaderMaterial, dpr: number) {
  mat.uniforms.uPixelRatio!.value = dpr;
}
