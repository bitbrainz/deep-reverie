# Deep Reverie

Deep Reverie is a React/Vite gallery with a camera-backed, motion-reactive dream field at `/ar`.

## Development

```bash
npm ci
npm run dev
```

Use `npm test`, `npm run lint`, and `npm run build` for the automated checks.

## Reverie Lens

The QR code on the installation opens `/ar`. The visitor taps **Enter the dream field**, which provides the user gesture required for camera and motion permission on mobile browsers. The direction the phone faces when orientation data first arrives becomes that session's forward horizon; no GPS position, image target, or physical-world anchor is used.

All canonical dreams are placed deterministically around a 360-degree field. Turning the phone reveals the seven nearest dream shards in the current direction. Tapping one opens the existing dream details and daylight/blacklight comparison. When device orientation is unavailable or denied, horizontal dragging rotates the same field.

The rear camera is a live visual backdrop only. Frames are not uploaded, stored, classified, or used to choose content, so the experience is unaffected by cloth movement, people in front of the artwork, viewing angle, or daylight versus UV illumination. If the camera is unavailable or denied, the full experience remains usable over the fallback environment. Leaving `/ar` stops every active camera track.

The overlay uses opaque labels, bright outlines, and a dark vignette so controls remain legible against both bright daytime and dark UV scenes. Motion is decorative rather than required and is disabled when the visitor requests reduced motion.
