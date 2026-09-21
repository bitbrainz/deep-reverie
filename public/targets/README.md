# Deep Reverie image targets

The six `deep-reverie-v1-N.mind` bundles are generated from the 54 canonical PNG files in
`public/images/saturated`. Target indexes are deterministic: files are sorted by
their numeric filename prefix, so target index `0` maps to Dream ID `1`, index
`1` maps to Dream ID `2`, and so on through target index `53` / Dream ID `54`.

The issue brief referred to 55 images, but the repository contains 54 canonical
saturated artworks and 54 Dream records. QR-derived thumbnail variants are not
Dream artworks and are intentionally excluded.

Regenerate after artwork changes with:

```sh
npm run targets:compile
```

Each bundle holds nine consecutive Dream IDs. The AR screen asks the visitor to
select the printed artwork's number range before starting, keeping target load
and low-end mobile memory bounded without dropping any artwork.

The compiler resizes each square source to 256×256 before deterministic MindAR
1.2.5 feature extraction. Commit the regenerated assets and increment
`TARGET_ASSET_VERSION` in `src/ar/targetMapping.ts` when its contents change.
