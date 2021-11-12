import { kdTreeCoreDistance } from "./kdTree";
import { primMst } from "./prim";
import { MetricFunction, HierarchyNode } from "./types";

export default function kdTreePrim(
    input: Array<Array<number>>,
    minSamples: number,
    alpha: number,
    metric: MetricFunction
) {
    // Transform the space - calculate mutual reachability distance(core distance)
    // using kd-tree
    const coreDistances = kdTreeCoreDistance(input, minSamples, metric);
    console.log("coreDistances: ", coreDistances);

    // Build the minimum spanning tree - using prim MST algorithm
    const mst = primMst(input, alpha, metric, coreDistances);
    console.log("primMst: ", mst);
}