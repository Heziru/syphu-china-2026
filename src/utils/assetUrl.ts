import igemAssets from "../data/igem-assets.json";

const uploadedAssets: Record<string, string> = igemAssets;

/** Official iGEM builds use verified uploads; local and GitHub builds stay self-contained. */
export function assetUrl(path: string) {
  const key = path.replace(/^\/+/, "");
  if (import.meta.env.VITE_IGEM_CDN === "true" && uploadedAssets[key]) {
    return uploadedAssets[key];
  }
  return `${import.meta.env.BASE_URL}${key}`;
}
