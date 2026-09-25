// Rebuild the local equirectangular texture from Natural Earth's public-domain land data.
// Usage: node scripts/build-earth-map.mjs outputs/earth-land.geojson
import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync(process.argv[2], "utf8"));
const ringPath = (ring) =>
  ring
    .map(
      ([lon, lat], index) =>
        `${index ? "L" : "M"}${(((lon + 180) / 360) * 2048).toFixed(2)},${(((90 - lat) / 180) * 1024).toFixed(2)}`,
    )
    .join(" ") + "Z";
const paths = data.features.flatMap(({ geometry }) => {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map(
    (rings) => `<path d="${rings.map(ringPath).join(" ")}"/>`,
  );
});
writeFileSync(
  "public/assets/cosmic/world-map.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024" viewBox="0 0 2048 1024">
<!-- Equirectangular: x=(longitude+180)/360; y=(90-latitude)/180. Natural Earth public-domain land, 1:110m. -->
<rect width="2048" height="1024" fill="#9bd3df"/>
<g fill="#8b98ba" stroke="#617f98" stroke-width="1.1" stroke-linejoin="round" fill-rule="evenodd">${paths.join("\n")}</g>
</svg>\n`,
);
