import { SRGBColorSpace, Texture, TextureLoader } from "three";

export const SOLAR_ARTWORK = `${import.meta.env.BASE_URL}assets/story/solar/painted-planets.png`;
export const SOLAR_BACKDROP = `${import.meta.env.BASE_URL}assets/story/solar/paper-stardust.png`;
export type ArtRect = readonly [number, number, number, number];

// Pixel windows into the approved illustration. The source bitmap is unchanged.
export const SOLAR_ART = {
  sun: [783, 362, 183, 184],
  blue: [516, 500, 66, 65],
  lilac: [559, 604, 110, 108],
  // Its ring is live geometry, so use the unringed violet surface to avoid a baked second ring.
  ringed: [559, 604, 110, 108],
  teal: [105, 506, 74, 73],
  violet: [891, 186, 57, 57],
  campus: [1303, 162, 136, 138],
} satisfies Record<string, ArtRect>;

let texture: Texture | undefined;
// One shared illustration texture; procedural materials stay visible while it loads.
export function solarArtworkTexture() {
  if (!texture) {
    texture = new TextureLoader().load(SOLAR_ARTWORK);
    texture.colorSpace = SRGBColorSpace;
  }
  return texture;
}

export const paintedSurface = `
  uniform sampler2D artwork;
  uniform vec4 artRect;
  uniform float artReady;
  vec3 paintedColor(vec3 normal) {
    vec2 screenUV = normal.xy * .5 + .5;
    vec2 pixel = artRect.xy + vec2(screenUV.x, 1. - screenUV.y) * artRect.zw;
    return texture2D(artwork, vec2(pixel.x / 1731., 1. - pixel.y / 909.)).rgb;
  }
`;
