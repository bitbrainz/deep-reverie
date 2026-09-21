# Deep Reverie

Deep Reverie is a React/Vite gallery with an on-device MindAR image-tracking pilot at `/ar`.

## Development

```bash
npm ci
npm run dev
```

Use `npm test`, `npm run lint`, and `npm run build` for the automated checks.

## MindAR pilot targets

The pilot is pinned to `mind-ar@1.2.5` and contains exactly the first 10 artworks in the canonical `DREAMS` array. World Peace is already canonical item 6 (MindAR target index 5), so no substitution is necessary. `config/ar-pilot-targets.json` is the source of truth for the version, ordered target-index mapping, image sources, and preprocessing settings.

The committed runtime asset is `public/ar/deep-reverie-pilot-v1.mind`. Rebuild it deterministically with:

```bash
npm ci
npm run ar:targets
```

The build script reads each listed source from `public/images/saturated`, scales it down from 2048×2048 to a maximum of 640×640 without enlargement, writes an intermediate JPEG at quality 82 with 4:4:4 chroma subsampling under the ignored `.cache/ar-targets/v1` directory, and compiles the ordered images into the versioned `.mind` bundle. The source file is never modified.

| Target index | Dream ID | Artwork |
| ---: | ---: | --- |
| 0 | 1 | Virtual Reality |
| 1 | 2 | Work-Life Balance |
| 2 | 3 | Empathy Everywhere |
| 3 | 4 | Worldwide Internet Access |
| 4 | 5 | Asteroid Mining |
| 5 | 6 | World Peace |
| 6 | 7 | AI in Medicine |
| 7 | 8 | Cryptocurrencies |
| 8 | 9 | Musical Expression |
| 9 | 10 | Borderless World |

Target detection, video frames, and feature processing stay in the browser. The app does not upload or persist camera frames. Unknown images produce no target event and therefore never select a dream. When a known target is briefly lost, the selected details remain stable for 1.2 seconds before closing; reacquisition cancels that pending close.

The `/ar` session asks for the environment-facing camera where the browser supports it. Leaving the route disposes MindAR processing, terminates its worker, stops every media track, and detaches the stream before a later visit can start a new session.

## Pilot verification record

On 2026-09-21, the pilot was exercised in Chromium 152 on Linux x86_64 with a 390×844 mobile viewport and a deterministic 640×640, 10 fps virtual rear-camera feed. With a warm local development server, elapsed time from tapping **Start camera** through target-bundle fetch, MindAR warm-up, and recognition was 2.102 seconds. The versioned target bundle is 5.1 MiB (SHA-256 `f5155eca6e4220874387beff4c9c51bd5c3f3c5c6b387481d2a67288a7a30c0e`). Rebuilding it from the documented sources and settings produced the same hash.

That run also verified a real compiled Virtual Reality target, an unknown feed that remained in scanning state with no drawer, a 500 ms target loss with no drawer flicker, and SPA route exit/re-entry with the old track `ended` before one new live track was created. Permission-denied, unsupported-browser, and failed-bundle-load states were separately exercised. The recognized AR state produced no browser errors or console warnings and no automated WCAG A/AA violations.

No physical mobile device is connected to this development environment, so the Chromium mobile-profile result is not a substitute for final physical-device timing. Record the device model, OS, browser version, cold-cache start-to-scanning time, and start-to-recognition time during independent review before accepting the pilot.
