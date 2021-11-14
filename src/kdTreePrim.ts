import { kdTreeCoreDistance } from "./coreDistance";
import { buildMstUsingPrim } from "./prim";
import { MetricFunction } from "./types";
import { buildSingleLinkage } from "./linkage";

export default function kdTreePrim(
    input: Array<Array<number>>,
    minSamples: number,
    alpha: number,
    metric: MetricFunction
) {
    // Transform the space - calculate mutual reachability distance(core distance)
    // using kd-tree
    const coreDistances = kdTreeCoreDistance(input, minSamples, metric);

    // Build the minimum spanning tree - using prim MST algorithm
    const mst = buildMstUsingPrim(input, alpha, metric, coreDistances);

    // Build the cluster hierarchy using single linkage tree
    const {sortedMst, singleLinkage} = buildSingleLinkage(mst);

    return {coreDistances, mst, sortedMst, singleLinkage};
}