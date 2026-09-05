# Cosmic journey assets

- `world-map.svg`: generated from Natural Earth's public-domain 1:110m land polygons, in an equirectangular 2:1 projection. Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson . Only coastlines are used; there are no political borders. The colors and rendering are original to this project.
- To regenerate: download that GeoJSON, then run `node scripts/build-earth-map.mjs path/to/ne_110m_land.geojson`. The website uses the checked-in SVG, with no external runtime map requests.
- Planet patterns, orbit geometry, stars and paper grain are procedural artwork created for this page. The supplied screenshots inform the art direction; no third-party website code is included.
- `../school/school-building.jpg` is an unmodified copy of the user's `docs/references/school.jpg`. The school emblem is also shown from its supplied asset.
