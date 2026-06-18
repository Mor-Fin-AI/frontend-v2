export type GoogleGaugeDataRow = [string, string | number];

export function buildGoogleGaugeData(
  label: string,
  value: number
): GoogleGaugeDataRow[] {
  return [
    ["Label", "Value"],
    [label, value],
  ];
}

export type GoogleGaugeOptionsInput = {
  width?: number;
  height?: number;
  min?: number;
  max?: number;
  isDark?: boolean;
  redFrom?: number;
  redTo?: number;
  yellowFrom?: number;
  yellowTo?: number;
  greenFrom?: number;
  greenTo?: number;
  minorTicks?: number;
};

/** Google Gauge options aligned with dashboard 0–100 completion-style metrics. */
export function buildGoogleGaugeOptions({
  width,
  height,
  min = 0,
  max = 100,
  isDark = false,
  greenFrom = 70,
  greenTo = 100,
  yellowFrom = 40,
  yellowTo = 70,
  redFrom = 0,
  redTo = 40,
  minorTicks = 5,
}: GoogleGaugeOptionsInput = {}) {
  return {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    min,
    max,
    greenFrom,
    greenTo,
    yellowFrom,
    yellowTo,
    redFrom,
    redTo,
    minorTicks,
    backgroundColor: isDark ? "#1e1b2e" : "transparent",
  };
}
