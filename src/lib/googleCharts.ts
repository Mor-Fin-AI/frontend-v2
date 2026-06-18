/** Google Maps API key for GeoChart (react-google-charts `mapsApiKey` prop). */
export function getGoogleMapsApiKey(): string | undefined {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : undefined;
}

export const GOOGLE_CHART_VERSION = "current" as const;

export const GOOGLE_GEO_CHART_PACKAGES = ["geochart"] as const;

export const GOOGLE_SANKEY_CHART_PACKAGES = ["sankey"] as const;
