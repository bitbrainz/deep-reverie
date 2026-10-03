import type { Dream } from "../dreams/data/dreams";

export type CylinderRow = "top" | "middle" | "bottom";

export type CylinderLayoutConfig = {
  frameWidth: number;
  frameHeight: number;
  horizontalGap: number;
  rowSpacing: number;
  pixelsPerMeter: number;
  overviewAngle: number;
};

export type RowCounts = Record<CylinderRow, number>;

export type DreamPlacement = {
  dream: Dream;
  row: CylinderRow;
  rowIndex: number;
  angle: number;
  verticalOffset: number;
};

export type DreamCylinderLayout = {
  placements: DreamPlacement[];
  rowCounts: RowCounts;
  radius: number;
  rowOffsets: Record<CylinderRow, number>;
};

export const DEFAULT_CYLINDER_LAYOUT: CylinderLayoutConfig = {
  frameWidth: 1.06,
  frameHeight: 1.46,
  horizontalGap: 0.18,
  // Keep the staggered lattice while leaving more breathing room between rows.
  rowSpacing: -0.68,
  pixelsPerMeter: 260,
  overviewAngle: 60,
};

export const distributeRows = (dreamCount: number): RowCounts => {
  if (!Number.isInteger(dreamCount) || dreamCount < 0) {
    throw new RangeError("Dream count must be a non-negative integer.");
  }

  const alignedOuterRowCount = Math.round(dreamCount / 3);
  return {
    top: alignedOuterRowCount,
    middle: dreamCount - alignedOuterRowCount * 2,
    bottom: alignedOuterRowCount,
  };
};

export const calculateCylinderRadius = (
  largestRowCount: number,
  frameWidth: number,
  horizontalGap: number,
) => {
  if (largestRowCount <= 0) return 0;
  return (largestRowCount * (frameWidth + horizontalGap)) / (2 * Math.PI);
};

export const calculateRowOffsets = ({
  frameHeight,
  rowSpacing,
}: CylinderLayoutConfig): Record<CylinderRow, number> => {
  const rowStep = frameHeight + rowSpacing;

  return {
    bottom: -rowStep,
    middle: 0,
    top: rowStep,
  };
};

export const angleForSlot = (
  row: CylinderRow,
  rowIndex: number,
  sharedSlotCount: number,
) => {
  if (sharedSlotCount <= 0) return 0;
  const slotAngle = 360 / sharedSlotCount;
  const stagger = row === "middle" ? slotAngle / 2 : 0;
  return rowIndex * slotAngle + stagger;
};

export const createDreamCylinderLayout = (
  dreams: readonly Dream[],
  config: CylinderLayoutConfig = DEFAULT_CYLINDER_LAYOUT,
): DreamCylinderLayout => {
  const rowCounts = distributeRows(dreams.length);
  const largestRowCount = Math.max(...Object.values(rowCounts));
  const radius = calculateCylinderRadius(
    largestRowCount,
    config.frameWidth,
    config.horizontalGap,
  );
  const rowOffsets = calculateRowOffsets(config);
  const rowOrder: CylinderRow[] = ["top", "middle", "bottom"];
  let dreamIndex = 0;

  const placements = rowOrder.flatMap((row) => {
    const rowCount = rowCounts[row];
    return Array.from({ length: rowCount }, (_, rowIndex) => ({
      dream: dreams[dreamIndex++],
      row,
      rowIndex,
      angle: angleForSlot(row, rowIndex, largestRowCount),
      verticalOffset: rowOffsets[row],
    }));
  });

  return { placements, rowCounts, radius, rowOffsets };
};

export const calculateOverviewWidth = (radius: number, angle: number) =>
  2 * radius * Math.tan((angle * Math.PI) / 360);

const normalizeSignedDegrees = (degrees: number) =>
  ((degrees + 540) % 360) - 180;

export const placementAngleFromViewer = (
  placementAngle: number,
  viewHeading: number,
) => normalizeSignedDegrees(placementAngle + viewHeading);

export const isPlacementFrontFacing = (
  placementAngle: number,
  viewHeading: number,
) => Math.abs(placementAngleFromViewer(placementAngle, viewHeading)) < 90;
