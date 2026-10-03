import { describe, expect, it } from "vitest";
import { DREAMS } from "../dreams/data/dreams";
import {
  angleForSlot,
  calculateCylinderRadius,
  calculateRowOffsets,
  createDreamCylinderLayout,
  DEFAULT_CYLINDER_LAYOUT,
  distributeRows,
  isPlacementFrontFacing,
  placementAngleFromViewer,
} from "./dreamCylinder";
import { CYLINDER_DREAMS, DREAM_CYLINDER_IDS } from "./dreamCylinderCollection";

describe("dream cylinder layout", () => {
  it("configures the 50-dream installation as aligned 17/16/17 rows", () => {
    expect(CYLINDER_DREAMS.map(({ id }) => id)).toEqual(DREAM_CYLINDER_IDS);
    expect(createDreamCylinderLayout(CYLINDER_DREAMS).rowCounts).toEqual({
      top: 17,
      middle: 16,
      bottom: 17,
    });
  });

  it("keeps outer rows aligned and staggers the middle row by half a slot", () => {
    const layout = createDreamCylinderLayout(CYLINDER_DREAMS);
    const top = layout.placements.filter(({ row }) => row === "top");
    const middle = layout.placements.filter(({ row }) => row === "middle");
    const bottom = layout.placements.filter(({ row }) => row === "bottom");

    expect(top.map(({ angle }) => angle)).toEqual(bottom.map(({ angle }) => angle));
    expect(middle[0].angle).toBeCloseTo((360 / 17) * 0.5);
    expect(angleForSlot("middle", 4, 17)).toBeCloseTo((4.5 * 360) / 17);

    middle.forEach((placement, index) => {
      expect(placement.angle).toBeCloseTo(
        (top[index].angle + top[index + 1].angle) / 2,
      );
    });
  });

  it("recalculates balanced rows and radius when the collection changes", () => {
    expect(distributeRows(49)).toEqual({ top: 16, middle: 17, bottom: 16 });
    expect(distributeRows(51)).toEqual({ top: 17, middle: 17, bottom: 17 });

    const smaller = createDreamCylinderLayout(DREAMS.slice(0, 49));
    const larger = createDreamCylinderLayout(DREAMS.slice(0, 50));
    expect(smaller.radius).toBe(
      calculateCylinderRadius(17, DEFAULT_CYLINDER_LAYOUT.frameWidth, DEFAULT_CYLINDER_LAYOUT.horizontalGap),
    );
    expect(larger.radius).toBe(smaller.radius);

    const eighteenPerRow = createDreamCylinderLayout([...DREAMS.slice(0, 50), ...DREAMS.slice(0, 4)]);
    expect(eighteenPerRow.rowCounts).toEqual({ top: 18, middle: 18, bottom: 18 });
    expect(eighteenPerRow.radius).toBeGreaterThan(larger.radius);
  });

  it("centers the middle row and positions outer rows symmetrically", () => {
    const offsets = calculateRowOffsets(DEFAULT_CYLINDER_LAYOUT);
    const rowStep =
      DEFAULT_CYLINDER_LAYOUT.frameHeight + DEFAULT_CYLINDER_LAYOUT.rowSpacing;

    expect(offsets.middle).toBe(0);
    expect(offsets.top).toBeCloseTo(rowStep);
    expect(offsets.bottom).toBeCloseTo(-rowStep);
    expect(DEFAULT_CYLINDER_LAYOUT).not.toHaveProperty("estimatedEyeHeight");
    expect(DEFAULT_CYLINDER_LAYOUT).not.toHaveProperty("groundClearance");
  });

  it("uses a visibly elongated diamond frame", () => {
    expect(
      DEFAULT_CYLINDER_LAYOUT.frameHeight /
        DEFAULT_CYLINDER_LAYOUT.frameWidth,
    ).toBeGreaterThanOrEqual(1.35);
  });

  it("uses larger frames with tighter spacing between rows", () => {
    expect(DEFAULT_CYLINDER_LAYOUT.frameWidth).toBe(0.9);
    expect(DEFAULT_CYLINDER_LAYOUT.frameHeight).toBe(1.25);
    expect(DEFAULT_CYLINDER_LAYOUT.horizontalGap).toBe(0.1);
    expect(DEFAULT_CYLINDER_LAYOUT.rowSpacing).toBe(0.04);
    expect(DEFAULT_CYLINDER_LAYOUT.rowSpacing).toBeLessThan(
      DEFAULT_CYLINDER_LAYOUT.horizontalGap,
    );
  });

  it("maps every placement to its matching dream exactly once", () => {
    const layout = createDreamCylinderLayout(CYLINDER_DREAMS);

    expect(layout.placements.map(({ dream }) => dream.id)).toEqual(
      DREAM_CYLINDER_IDS,
    );
    expect(new Set(layout.placements.map(({ dream }) => dream.id))).toHaveLength(50);
  });

  it("only exposes placements on the viewer-facing half of the cylinder", () => {
    expect(isPlacementFrontFacing(0, 0)).toBe(true);
    expect(isPlacementFrontFacing(89, 0)).toBe(true);
    expect(isPlacementFrontFacing(90, 0)).toBe(false);
    expect(isPlacementFrontFacing(180, 0)).toBe(false);

    // A positive view rotation brings a placement from the right (-90°) forward.
    expect(placementAngleFromViewer(270, 90)).toBe(0);
    expect(isPlacementFrontFacing(270, 90)).toBe(true);
    expect(isPlacementFrontFacing(0, 90)).toBe(false);
  });
});
