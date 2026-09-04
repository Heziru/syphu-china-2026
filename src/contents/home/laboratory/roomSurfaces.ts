import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
/** Small deterministic stone tile. No external textures or image downloads. */
export function createStoneTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const data = ctx.createImageData(256, 256);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const grain = (n - Math.floor(n) - 0.5) * 5;
      const vein =
        Math.sin(x * 0.028 + y * 0.043 + Math.sin(y * 0.04) * 2) * 1.8;
      const grout = x < 2 || y < 2 ? -17 : 0,
        index = (y * 256 + x) * 4;
      data.data[index] = 218 + grain + vein + grout;
      data.data[index + 1] = 208 + grain + vein + grout;
      data.data[index + 2] = 191 + grain + vein + grout;
      data.data[index + 3] = 255;
    }
  ctx.putImageData(data, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
