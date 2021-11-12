import { kdTreeCoreDistance } from "./coreDistance";
import { buildMstUsingPrim } from "./prim";
import { MetricFunction, HierarchyNode, SingleLinkage } from "./types";
import { buildSingleLinkage } from "./linkage";

export default function kdTreePrim(
    input: Array<Array<number>>,
    minSamples: number,
    alpha: number,
    metric: MetricFunction
): SingleLinkage {
    // Transform the space - calculate mutual reachability distance(core distance)
    // using kd-tree
    const coreDistances = kdTreeCoreDistance(input, minSamples, metric);
    console.log("coreDistances: ", coreDistances);

    // Build the minimum spanning tree - using prim MST algorithm
    const mst = buildMstUsingPrim(input, alpha, metric, coreDistances);
    console.log("primMst: ", mst);

    // Build the cluster hierarchy using single linkage tree
    const singleLinkage = buildSingleLinkage(mst);
    console.log("singleLinkage: ", singleLinkage);

    return singleLinkage;
}