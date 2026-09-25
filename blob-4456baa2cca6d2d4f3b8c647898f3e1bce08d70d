# Build and browser checks

Run commands from the repository root after `npm ci`. Playwright and esbuild are
fixed development dependencies in `package-lock.json`.

Start the preview expected by the browser checks:

```sh
npm run dev -- --port 5174
```

In another terminal, run the relevant check:

```sh
node scripts/check-literature-gallery.mjs
node scripts/check-lab-focus.mjs
node scripts/review-best-wiki.mjs
node scripts/check-refinements.mjs
```

On Windows, the launcher tries installed Microsoft Edge, then Playwright's
Chromium. On other systems it tries Chromium first, then installed Edge.
If neither is available, install Chromium once with:

```sh
npx playwright install chromium
```

`BROWSER_CHANNEL=chrome`, `msedge`, or `chromium` selects an installed browser
explicitly. Set this environment variable using your shell's syntax. Review
scripts do not install browsers or modify browser preferences; persistent test
profiles stay in their ignored `outputs/` subdirectories.

The DOI check intercepts DOI requests in its isolated browser to verify native
link navigation without requiring the publisher's website to be reachable.

## Asset regeneration

- `node scripts/build-globe-geometry.mjs` rebuilds the checked-in geometry from
  `public/assets/cosmic/ibd-regions.json`. Normal site builds use these existing
  assets and do not regenerate them.
- `prepare-story-data.py` downloads public geographic/GBD references;
  `build-story-globe.py` derives the geographic input above. Private project-book
  extraction is not needed by either script or by the site build.
- Blender scripts run inside Blender's bundled Python. Use your installed
  Blender executable with `--background --factory-startup --python` and the
  relevant script path. Metadata `views` paths are relative to this repository.
- `render-literature-previews.py` additionally needs Python packages `Pillow`
  and `pypdf`, Poppler's `pdftoppm` on PATH, and the source PDFs listed in that
  script placed in `outputs/literature/`. These local PDFs are not published;
  normal site builds use the existing WebP previews and source manifest.
