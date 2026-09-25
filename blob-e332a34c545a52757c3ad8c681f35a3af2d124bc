import * as THREE from "three";

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uPixelRatio;

  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = max(-mv.z, 1.0);
    gl_PointSize = aSize * uPixelRatio * (420.0 / dist);
    gl_Position = projectionMatrix * mv;
    vAlpha = smoothstep(120.0, 8.0, dist);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uBrightness;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    if (d > 1.0) discard;

    float halo = smoothstep(1.0, 0.15, d);
    float core = exp(-d * d * 14.0);
    float alpha = (halo * 0.55 + core * 0.95) * vAlpha;
    vec3 col = vColor * uBrightness * (0.65 + core * 1.8);

    gl_FragColor = vec4(col, alpha);
  }
`;

export function createGlowPointsMaterial(
  pixelRatio: number,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: pixelRatio },
      uBrightness: { value: 1.35 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function updateGlowPixelRatio(
  mat: THREE.ShaderMaterial,
  pixelRatio: number,
) {
  mat.uniforms.uPixelRatio!.value = pixelRatio;
}

export function setGlowBrightness(mat: THREE.ShaderMaterial, v: number) {
  mat.uniforms.uBrightness!.value = v;
}
