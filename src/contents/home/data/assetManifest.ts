/** 实验室资源清单。第一里程碑全部为占位几何体，不引用不存在的 GLB。 */
export const LAB_ASSET_MANIFEST = {
  room: { kind: "placeholder" as const, note: "几何体灰模房间" },
  objects: {
    computer: { kind: "placeholder" as const },
    microscope: { kind: "placeholder" as const },
    researcher: { kind: "placeholder" as const },
    bookshelf: { kind: "placeholder" as const },
    device: { kind: "placeholder" as const },
  },
};

export function resolvePublicAsset(path: string) {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\//, "")}`;
}
