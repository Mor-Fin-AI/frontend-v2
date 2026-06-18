export interface SankeyNode {
  nodeId: number;
  name: string;
  color?: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface SankeyGraphData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export function toGoogleSankeyRows(
  graph: SankeyGraphData
): (string | number)[][] {
  const nodeNames = Object.fromEntries(
    graph.nodes.map((node) => [node.nodeId, node.name])
  );

  return [
    ["From", "To", "Weight"],
    ...graph.links.map((link) => [
      nodeNames[link.source],
      nodeNames[link.target],
      link.value,
    ]),
  ];
}

/** Fluent UI SankeyChart `ChartProps` payload. */
export function toFluentSankeyChartProps(
  graph: SankeyGraphData
): { SankeyChartData: { nodes: SankeyNode[]; links: SankeyLink[] } } {
  const nodeIndexById = Object.fromEntries(
    graph.nodes.map((node, index) => [node.nodeId, index])
  );

  return {
    SankeyChartData: {
      nodes: graph.nodes.map((node) => ({
        nodeId: node.nodeId,
        name: node.name,
        color: node.color,
      })),
      links: graph.links.map((link) => ({
        source: nodeIndexById[link.source] ?? link.source,
        target: nodeIndexById[link.target] ?? link.target,
        value: link.value,
      })),
    },
  };
}

export function buildSankeyOptions(isDark: boolean) {
  return {
    sankey: {
      link: {
        color: {
          fill: isDark ? "#8764B8" : "#d799ae",
          fillOpacity: 0.45,
        },
      },
      node: {
        colors: ["#22C38E", "#30ABE8", "#8764B8", "#F69E23", "#4F6BED", "#0E7878"],
        label: {
          color: isDark ? "#f3f4f6" : "#371b47",
          fontName: "Inter",
          fontSize: 12,
        },
        nodePadding: 24,
      },
    },
  };
}
