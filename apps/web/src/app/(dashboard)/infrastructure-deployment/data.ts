import {
  Box24Regular,
  Globe24Regular,
  Image24Regular,
} from "@fluentui/react-icons";

export interface RegionalProgress {
  id: string;
  region: string;
  progress: number;
  status: "On Track" | "Delayed" | "Complete";
}

export interface PhotoUpdateReport {
  id: string;
  title: string;
  region: string;
  uploadedAt: string;
  photoCount: number;
  status: "Published" | "Pending Review";
}

export interface InfrastructureDeploymentMetrics {
  roadsBuiltKm: number;
  roadsTargetKm: number;
  housesBuilt: number;
  housesTarget: number;
  kerbsInstalled: number;
  drainageUnits: number;
  photoReportsTotal: number;
  photoReportsThisWeek: number;
  regionalProgress: RegionalProgress[];
  recentPhotoReports: PhotoUpdateReport[];
}

export const regionalHeatMapData = [
  {
    legend: "Roads",
    value: 82,
    data: [
      { x: "North", y: "Roads", value: 82 },
      { x: "West", y: "Roads", value: 71 },
      { x: "Central", y: "Roads", value: 58 },
      { x: "South", y: "Roads", value: 91 },
    ],
  },
  {
    legend: "Housing",
    value: 74,
    data: [
      { x: "North", y: "Housing", value: 78 },
      { x: "West", y: "Housing", value: 68 },
      { x: "Central", y: "Housing", value: 52 },
      { x: "South", y: "Housing", value: 88 },
    ],
  },
  {
    legend: "Drainage",
    value: 65,
    data: [
      { x: "North", y: "Drainage", value: 70 },
      { x: "West", y: "Drainage", value: 62 },
      { x: "Central", y: "Drainage", value: 48 },
      { x: "South", y: "Drainage", value: 80 },
    ],
  },
];

export const deploymentMilestones = [
  {
    phase: "Road Resurfacing — North",
    start: new Date("2026-02-01"),
    end: new Date("2026-04-30"),
    color: "#30ABE8",
  },
  {
    phase: "Housing Batch #12",
    start: new Date("2026-03-15"),
    end: new Date("2026-06-01"),
    color: "#22C38E",
  },
  {
    phase: "Kerbs — Central Corridor",
    start: new Date("2026-04-01"),
    end: new Date("2026-05-25"),
    color: "#8764B8",
  },
  {
    phase: "Drainage — South Coast",
    start: new Date("2026-05-01"),
    end: new Date("2026-07-15"),
    color: "#F69E23",
  },
];

export const budgetAllocationByCategory = [
  {
    name: "Roads",
    series: [
      { key: "spent", legend: "Spent", data: 4200000, color: "#30ABE8" },
      { key: "remaining", legend: "Remaining", data: 1800000, color: "#E8E8E8" },
    ],
  },
  {
    name: "Housing",
    series: [
      { key: "spent", legend: "Spent", data: 3100000, color: "#22C38E" },
      { key: "remaining", legend: "Remaining", data: 1400000, color: "#E8E8E8" },
    ],
  },
  {
    name: "Kerbs",
    series: [
      { key: "spent", legend: "Spent", data: 890000, color: "#8764B8" },
      { key: "remaining", legend: "Remaining", data: 410000, color: "#E8E8E8" },
    ],
  },
  {
    name: "Drainage",
    series: [
      { key: "spent", legend: "Spent", data: 620000, color: "#F69E23" },
      { key: "remaining", legend: "Remaining", data: 380000, color: "#E8E8E8" },
    ],
  },
];

export const infrastructureDeploymentMetrics: InfrastructureDeploymentMetrics = {
  roadsBuiltKm: 14.6,
  roadsTargetKm: 22,
  housesBuilt: 128,
  housesTarget: 180,
  kerbsInstalled: 3420,
  drainageUnits: 186,
  photoReportsTotal: 94,
  photoReportsThisWeek: 12,
  regionalProgress: [
    { id: "north", region: "Mombasa North", progress: 82, status: "On Track" },
    { id: "west", region: "Mombasa West", progress: 71, status: "On Track" },
    { id: "central", region: "Central Corridor", progress: 58, status: "Delayed" },
    { id: "south", region: "South Coast Zone", progress: 91, status: "Complete" },
  ],
  recentPhotoReports: [
    {
      id: "1",
      title: "Kerb installation — Block C",
      region: "Mombasa North",
      uploadedAt: "2h ago",
      photoCount: 8,
      status: "Published",
    },
    {
      id: "2",
      title: "Drainage channel progress",
      region: "Central Corridor",
      uploadedAt: "Yesterday",
      photoCount: 14,
      status: "Pending Review",
    },
    {
      id: "3",
      title: "House handover batch #12",
      region: "South Coast Zone",
      uploadedAt: "2 days ago",
      photoCount: 6,
      status: "Published",
    },
    {
      id: "4",
      title: "Road resurfacing milestone",
      region: "Mombasa West",
      uploadedAt: "3 days ago",
      photoCount: 11,
      status: "Published",
    },
  ],
};

export const INFRASTRUCTURE_DEPLOYMENT_ICON = Box24Regular;

export type InfrastructureMetricFormat = "number" | "text";

export interface InfrastructureDeploymentMetric {
  id: string;
  title: string;
  value: number | string;
  valuePrefix?: string;
  valueSuffix?: string;
  subtitle: string;
  format: InfrastructureMetricFormat;
  icon: typeof Box24Regular;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

export function buildInfrastructureDeploymentMetrics(
  metrics: InfrastructureDeploymentMetrics
): InfrastructureDeploymentMetric[] {
  return [
    {
      id: "roads-houses",
      title: "Roads & Houses Built",
      value: metrics.roadsBuiltKm,
      valueSuffix: " km",
      subtitle: `${metrics.housesBuilt}/${metrics.housesTarget} houses delivered`,
      format: "number",
      icon: Box24Regular,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
    {
      id: "kerbs-drainage",
      title: "Kerbs & Drainage Units",
      value: metrics.kerbsInstalled,
      subtitle: `${metrics.drainageUnits} drainage units installed`,
      format: "number",
      icon: Globe24Regular,
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
      valueColor: "text-sky-600 dark:text-sky-400",
    },
    {
      id: "photo-reports",
      title: "Photo Update Reports",
      value: metrics.photoReportsTotal,
      subtitle: `+${metrics.photoReportsThisWeek} submitted this week`,
      format: "number",
      icon: Image24Regular,
      iconBg: "bg-[color-mix(in_srgb,var(--action-green)_14%,transparent)]",
      iconColor: "text-[var(--action-green)]",
      valueColor: "text-[var(--action-green)]",
    },
  ];
}

export const infrastructureDeploymentCards = [
  {
    id: "roads-houses",
    title: "Roads & Houses Built",
    icon: Box24Regular,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "text-primary",
  },
  {
    id: "kerbs-drainage",
    title: "Kerbs & Drainage Units",
    icon: Globe24Regular,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600 dark:text-sky-400",
    valueColor: "text-sky-600 dark:text-sky-400",
  },
  {
    id: "photo-reports",
    title: "Photo Update Reports",
    icon: Image24Regular,
    iconBg: "bg-[color-mix(in_srgb,var(--action-green)_14%,transparent)]",
    iconColor: "text-[var(--action-green)]",
    valueColor: "text-[var(--action-green)]",
  },
] as const;

export function regionalStatusTone(
  status: RegionalProgress["status"]
): "success" | "warning" | "brand" {
  if (status === "Complete") return "success";
  if (status === "Delayed") return "warning";
  return "brand";
}

export function photoReportStatusTone(
  status: PhotoUpdateReport["status"]
): "success" | "warning" {
  return status === "Published" ? "success" : "warning";
}

/** Lat/lng anchors for Mombasa deployment zones on the geo map */
export const regionalGeoCoordinates: Record<
  RegionalProgress["id"],
  { lat: number; lng: number }
> = {
  north: { lat: -3.98, lng: 39.72 },
  west: { lat: -4.05, lng: 39.58 },
  central: { lat: -4.04, lng: 39.66 },
  south: { lat: -4.28, lng: 39.58 },
};

export type RegionalGeoChartRow = [number, number, string, number];

export function buildRegionalGeoMarkerData(
  regions = infrastructureDeploymentMetrics.regionalProgress
): (string | number)[][] {
  return [
    ["Lat", "Long", "Region", "Progress"],
    ...regions.map((region) => {
      const coords = regionalGeoCoordinates[region.id];
      return [coords.lat, coords.lng, region.region, region.progress];
    }),
  ];
}

/** East Africa choropleth — Kenya weighted by live deployment progress */
export function buildEastAfricaGeoData(
  regions = infrastructureDeploymentMetrics.regionalProgress
): (string | number | null)[][] {
  const kenyaProgress = Math.round(
    regions.reduce((sum, region) => sum + region.progress, 0) / regions.length
  );

  return [
    ["Country", "Deployment Progress"],
    ["Kenya", kenyaProgress],
    ["Tanzania", 38],
    ["Uganda", 32],
    ["Somalia", 18],
    ["Ethiopia", 24],
    ["South Sudan", 15],
    ["Rwanda", 41],
    ["Burundi", 22],
    ["Mozambique", 29],
    ["Madagascar", null],
  ];
}
