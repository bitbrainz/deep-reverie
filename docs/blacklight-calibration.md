# Blacklight calibration

The emulator is calibrated from corresponding cells in Glowtronics' [Digital File / Printed UV-Blacklight Activated Color Chart](https://www.glowtronics-store.com/wp-content/uploads/2021/10/BLACKLIGHT-Color-hart-Guide.pdf). The guide is a photographic visual reference, not a spectral measurement.

## Sampling and alignment

The single PDF page was rendered as sRGB at 144 dpi (2414 × 4574 pixels). Grid labels, rather than image-feature matching, register the three panels: a cell such as `K19` is sampled from `K19` in the digital, printed/daylight, and printed/blacklight panels. Each recorded RGB value is the per-channel median of a 15 × 15 pixel patch centered inside the cell. Median sampling rejects grid lines, print texture, and isolated sensor noise.

The calibrated data contains all 37 × 20 labeled color cells from each panel and all 33 cells in each neutral `X` ramp. Centers were measured from the grid lines:

| Panel | First/last column center | A–T row centers |
| --- | --- | --- |
| Digital | 213–2219 | 489, 527, 566, 605, 645, 686, 725, 764, 804, 844, 894, 934, 973, 1012, 1052, 1092, 1132, 1172, 1212, 1254 |
| Printed/daylight | 208–2217 | 2028, 2065, 2102, 2142, 2182, 2221, 2260, 2300, 2339, 2378, 2428, 2467, 2506, 2546, 2586, 2626, 2666, 2706, 2746, 2790 |
| Printed/blacklight | 212–2213 | 3490, 3527, 3564, 3603, 3642, 3681, 3720, 3759, 3798, 3838, 3885, 3925, 3964, 4004, 4044, 4084, 4124, 4164, 4204, 4247 |

The values and sampling metadata live in `src/components/blacklightCalibration.ts`. To reproduce them, render the source to binary PPM and run the dependency-free sampler:

```sh
pdftoppm -f 1 -singlefile -r 144 -ppm BLACKLIGHT-Color-hart-Guide.pdf /tmp/glowtronics-chart
node scripts/sample-blacklight-chart.mjs /tmp/glowtronics-chart.ppm
```

No white-balance correction is applied to the blacklight panel. Its cool blue/violet illumination is part of the target response. The daylight panel is retained alongside the digital panel so the registration and the printed-versus-digital source shift remain auditable.

## Mapping and interpolation

The chart encodes hue around 37 columns (the first and last are the same blue seam), saturation from rows A–J, value from rows K–T, and neutral value in row X. The transform:

1. interpolates adjacent hue cells circularly in linear-light RGB;
2. interpolates the measured saturation, value, and neutral curves;
3. averages the duplicated full-chroma J/K boundary;
4. joins those boundary curves with a continuous Coons patch for source colors whose saturation and value are both below 100%; and
5. compiles the result into a 25³ RGB lookup table, then trilinearly interpolates pixels through that table.

This keeps chart-cell transitions continuous, preserves luminance variation within dark and fluorescent regions, and avoids a global blue overlay. The deterministic fixture at `public/test-fixtures/blacklight-calibration.svg` includes neutrals, low-value colors, saturated hues, and smooth ramps intended to expose discontinuities.

## Limitations

Screen emulation cannot reproduce fluorescence, emitted light, substrate/ink interactions, UV lamp spectrum or power, camera exposure, or human dark adaptation. The source photos also include perspective, print texture, clipping, and local illumination falloff. The result should therefore be read as a calibrated visual approximation of this guide under its photographed conditions, not as colorimetric or spectral prediction for a physical print.
