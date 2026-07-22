# MediaPipe assets (local only)

These files are loaded at runtime via `import.meta.env.BASE_URL`.
The site never fetches models or WASM from Google Storage or CDNs.

## Gesture model (committed)

| Field | Value |
|-------|--------|
| File | `models/gesture_recognizer.task` |
| Task | MediaPipe Gesture Recognizer |
| Variant | float16 bundle |
| Source (dev download only) | `https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task` |
| Size | 8,373,440 bytes (~7.98 MB) |
| SHA-256 | `97952348cf6a6a4915c2ea1496b4b37ebabc50cbbf80571435643c455f2b0482` |
| npm package | `@mediapipe/tasks-vision@0.10.35` |

## WASM (not committed)

Copied from `node_modules/@mediapipe/tasks-vision/wasm/` by:

```bash
npm run copy:mediapipe
```

Also runs automatically on `postinstall`, `predev`, and `prebuild`.

Required files:

- `vision_wasm_internal.js` / `.wasm`
- `vision_wasm_nosimd_internal.js` / `.wasm`
- `vision_wasm_module_internal.js` / `.wasm`
