import { kdTree } from "kd-tree-javascript";
import { MetricFunction } from "./types";

export function kdTreeCoreDistance(
    input: Array<Array<number>>,
    minSamples: number,
    metric: MetricFunction
) {
    const tree = new kdTree(input, metric, []);
    const coreDistances = input.map(p => tree.nearest(p, minSamples)[0][1]);

    return coreDistances;
}