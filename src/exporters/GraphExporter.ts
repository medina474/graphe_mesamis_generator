import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

interface GraphLike {
    mapNodes(callback: (node: string, attributes: Record<string, unknown>) => unknown): unknown[];
    mapEdges(callback: (edge: string, attributes: Record<string, unknown>, source: string, target: string) => unknown): unknown[];
}

export class GraphExporter {
    async export(graph: GraphLike, filename: string): Promise<void> {
        mkdirSync(dirname(filename), { recursive: true });

        const payload = {
            nodes: graph.mapNodes((node: string, attributes: Record<string, unknown>) => ({
                id: node,
                ...attributes,
            })),
            edges: graph.mapEdges((edge: string, attributes: Record<string, unknown>, source: string, target: string) => ({
                id: edge,
                source,
                target,
                ...attributes,
            })),
        };

        writeFileSync(filename, JSON.stringify(payload, null, 2), "utf8");
    }
}
