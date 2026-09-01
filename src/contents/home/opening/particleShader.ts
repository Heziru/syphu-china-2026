import * as THREE from "three";

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 color;
  varying vec3 vColor;
  uniform float uPixelRatio;

  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = max(-mv.z, 1.0);
    gl_PointSize = aSize * uPixelRatio * (280.0 / dist);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    if (d > 1.0) discard;
    float halo = smoothstep(1.0, 0.2, d);
    float core = exp(-d * d * 12.0);
    float alpha = halo * 0.42 + core * 0.58;
    vec3 col = vColor * (0.5 + core * 0.8);
    col = min(col, vec3(0.72, 0.78, 0.92));
    gl_FragColor = vec4(col, alpha);
  }
`;

export function createParticleMaterial(dpr: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: dpr } },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function setParticleDpr(mat: THREE.ShaderMaterial, dpr: number) {
  mat.uniforms.uPixelRatio!.value = dpr;
}
