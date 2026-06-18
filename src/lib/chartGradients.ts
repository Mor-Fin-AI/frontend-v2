/** Opacity stops for area fills that fade using the line stroke color only. */
export const AREA_GRADIENT_TOP_OPACITY = 0.35;
export const AREA_GRADIENT_BOTTOM_OPACITY = 0.02;

export function areaFillGradientId(prefix: string, seriesKey: string): string {
  return `${prefix}-${seriesKey}`;
}
